/// <reference types="@cloudflare/workers-types" />
import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Type } from "@google/genai";
import { selectUncoveredTopics, type TopicAssignment } from "../../taxonomy";
import {
  queryBankedQuestions,
  saveQuestions,
  incrementServed,
  toFlashcardData,
  type FlashcardShape,
} from "../services/questionBank";

// Configuration constants
const CONFIG = {
  BATCH_SIZE: 10,
  MAX_QUESTIONS_PER_REQUEST: 20,
  MIN_QUESTIONS_PER_REQUEST: 1,
  MAX_PREVIOUS_QUESTIONS: 20,
} as const;

interface Env {
  GEMINI_API_KEY: string;
  DB?: D1Database;
}

enum Difficulty {
  Easy = "Easy",
  Medium = "Medium",
  Hard = "Hard",
}

/** Generate a deterministic short ID from question text using Web Crypto API */
async function hashQuestion(text: string): Promise<string> {
  const data = new TextEncoder().encode(text.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer).slice(0, 8));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Generate questions via Gemini for the given topic assignments */
async function generateViaGemini(
  apiKey: string,
  model: string,
  difficulty: Difficulty,
  topicAssignments: TopicAssignment[],
  previousQuestions: string[]
): Promise<FlashcardShape[]> {
  const count = topicAssignments.length;

  const difficultyRubric = {
    [Difficulty.Easy]:
      "Focus on fundamental concepts, definitions, and basic security principles. Questions should test 'Knowledge' and 'Comprehension'.",
    [Difficulty.Medium]:
      "Focus on the application of security controls. Use scenarios that require 'Application' and 'Analysis'.",
    [Difficulty.Hard]:
      "Focus on strategic judgment and complex decision-making. Questions should test 'Evaluation' and 'Synthesis', often requiring the user to choose the 'BEST', 'MOST', or 'FIRST' action among several plausible options.",
  };

  const topicSlots = topicAssignments
    .map((t, i) => `  Question ${i + 1}: Domain "${t.domain}" — Sub-topic "${t.topic}"`)
    .join("\n");

  const avoidSection =
    previousQuestions.length > 0
      ? `\n\nDo NOT repeat or closely rephrase any of these recent questions:\n${previousQuestions.map((q, i) => `  ${i + 1}. ${q}`).join("\n")}`
      : "";

  const prompt = `Generate exactly ${count} unique CISSP practice exam questions.

Difficulty Level: ${difficulty} (${difficultyRubric[difficulty]})

Each question MUST target the assigned sub-topic below. The "subTopic" field in your response must exactly match the assigned sub-topic string.

${topicSlots}

Requirements:
1. Format: Scenario-based. Each question must provide a realistic professional context.
2. Options: Provide 4 plausible multiple-choice options.
3. Distractors: Distractors should be technically accurate security concepts but incorrect for the specific scenario or less effective than the correct answer.
4. Explanation: Clarify why the correct answer is superior and briefly explain why other options are incorrect or less ideal.
5. Each question must cover the assigned sub-topic with a unique angle — no two questions should ask the same thing.${avoidSection}`;

  const client = new GoogleGenAI({ apiKey });

  const response = await client.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      systemInstruction:
        "You are a world-class CISSP certification instructor and subject matter expert. Your goal is to prepare candidates for the actual (ISC)² exam by focusing on the 'Manager's Perspective'—prioritizing risk management, business continuity, and the protection of organizational assets. Avoid questions that only require rote memorization; instead, focus on the application of the CISSP Common Body of Knowledge (CBK) in real-world environments.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                domain: { type: Type.STRING },
                subTopic: { type: Type.STRING },
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswerIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
                difficulty: { type: Type.STRING },
              },
              required: [
                "id", "domain", "subTopic", "question", "options",
                "correctAnswerIndex", "explanation", "difficulty",
              ],
            },
          },
        },
        required: ["questions"],
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    },
  });

  if (!response.candidates || response.candidates.length === 0) {
    console.error("No candidates returned. Prompt feedback:", response.promptFeedback);
    throw new Error("The AI service declined to generate questions. This usually happens due to safety filters.");
  }

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("The AI returned an empty response.");
  }

  const parsed = JSON.parse(text) as { questions: FlashcardShape[] };
  if (!parsed.questions) return [];

  // Replace Gemini-generated IDs with deterministic content-based hashes
  await Promise.all(
    parsed.questions.map(async (q) => {
      q.id = await hashQuestion(q.question);
    })
  );

  return parsed.questions;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const apiKey = context.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error: Missing API Key" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const requestBody = (await context.request.json()) as {
      count?: number;
      difficulty?: string;
      model?: string;
      previousQuestions?: unknown;
      coveredTopics?: unknown;
    };

    // Validate difficulty against known enum values
    const VALID_DIFFICULTIES = new Set<string>(Object.values(Difficulty));
    const VALID_MODELS = new Set(["gemini-3-flash-preview", "gemini-2.5-flash-lite"]);

    if (requestBody.difficulty && !VALID_DIFFICULTIES.has(requestBody.difficulty)) {
      return new Response(
        JSON.stringify({ error: "Invalid difficulty level" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (requestBody.model && !VALID_MODELS.has(requestBody.model)) {
      return new Response(
        JSON.stringify({ error: "Invalid model selection" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const count = Math.min(
      Math.max(requestBody.count || CONFIG.BATCH_SIZE, CONFIG.MIN_QUESTIONS_PER_REQUEST),
      CONFIG.MAX_QUESTIONS_PER_REQUEST
    );
    const difficulty = (requestBody.difficulty as Difficulty) || Difficulty.Medium;
    const model = requestBody.model || "gemini-2.5-flash-lite";
    const previousQuestions = (Array.isArray(requestBody.previousQuestions) ? requestBody.previousQuestions : [])
      .filter((q: unknown): q is string => typeof q === "string")
      .slice(-CONFIG.MAX_PREVIOUS_QUESTIONS);
    const coveredTopics = (Array.isArray(requestBody.coveredTopics) ? requestBody.coveredTopics : [])
      .filter((t: unknown): t is string => typeof t === "string")
      .slice(0, 200);

    // Select specific sub-topics for this batch
    const topicAssignments = selectUncoveredTopics(count, coveredTopics);
    const targetTopics = topicAssignments.map((t) => t.topic);

    const db = context.env.DB;
    let bankedQuestions: FlashcardShape[] = [];
    let remainingAssignments = topicAssignments;

    // Phase 2: Try D1 question bank first (graceful degradation if unavailable)
    if (db) {
      try {
        const rows = await queryBankedQuestions(db, difficulty, targetTopics, count);
        bankedQuestions = rows.map(toFlashcardData);

        // Determine which topics are already covered by banked questions
        const bankedTopics = new Set(bankedQuestions.map((q) => q.subTopic));
        remainingAssignments = topicAssignments.filter((t) => !bankedTopics.has(t.topic));
      } catch (err) {
        console.warn("D1 query failed, falling back to pure Gemini generation:", err);
        bankedQuestions = [];
        remainingAssignments = topicAssignments;
      }
    }

    // Generate any remaining questions via Gemini
    let generatedQuestions: FlashcardShape[] = [];
    if (remainingAssignments.length > 0) {
      generatedQuestions = await generateViaGemini(
        apiKey, model, difficulty, remainingAssignments, previousQuestions
      );

      // Save newly generated questions to D1 (fire-and-forget)
      if (db && generatedQuestions.length > 0) {
        saveQuestions(db, generatedQuestions).catch((err) =>
          console.warn("Failed to save questions to D1:", err)
        );
      }
    }

    // Merge banked + generated
    const allQuestions = [...bankedQuestions, ...generatedQuestions];

    // Increment times_served for all returned questions (fire-and-forget)
    if (db && allQuestions.length > 0) {
      incrementServed(db, allQuestions.map((q) => q.id)).catch((err) =>
        console.warn("Failed to increment served count:", err)
      );
    }

    return new Response(JSON.stringify({ questions: allQuestions }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("API Error:", error instanceof Error ? error.message : error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate questions. Please try again later.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
