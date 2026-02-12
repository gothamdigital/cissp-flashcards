/// <reference types="@cloudflare/workers-types" />
import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Type } from "@google/genai";

// Configuration constants
const CONFIG = {
  BATCH_SIZE: 10,
  MAX_QUESTIONS_PER_REQUEST: 20,
  MIN_QUESTIONS_PER_REQUEST: 1,
  MAX_PREVIOUS_QUESTIONS: 50
} as const;

interface Env {
  GEMINI_API_KEY: string;
}

enum Difficulty {
  Easy = "Easy",
  Medium = "Medium",
  Hard = "Hard"
}

/** Generate a deterministic short ID from question text using Web Crypto API */
async function hashQuestion(text: string): Promise<string> {
  const data = new TextEncoder().encode(text.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer).slice(0, 8));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const apiKey = context.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Server configuration error: Missing API Key" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const requestBody = await context.request.json() as {
      count?: number;
      difficulty?: Difficulty;
      model?: string;
      previousQuestions?: string[];
    };
    const count = Math.min(
      Math.max(requestBody.count || CONFIG.BATCH_SIZE, CONFIG.MIN_QUESTIONS_PER_REQUEST),
      CONFIG.MAX_QUESTIONS_PER_REQUEST
    );
    const difficulty = requestBody.difficulty || Difficulty.Medium;
    const model = requestBody.model || "gemini-2.5-flash-lite";
    const previousQuestions = (requestBody.previousQuestions || []).slice(-CONFIG.MAX_PREVIOUS_QUESTIONS);

    const domains = [
      "Security and Risk Management",
      "Asset Security",
      "Security Architecture and Engineering",
      "Communication and Network Security",
      "Identity and Access Management (IAM)",
      "Security Assessment and Testing",
      "Security Operations",
      "Software Development Security"
    ];

    const difficultyRubric = {
      [Difficulty.Easy]: "Focus on fundamental concepts, definitions, and basic security principles. Questions should test 'Knowledge' and 'Comprehension'.",
      [Difficulty.Medium]: "Focus on the application of security controls. Use scenarios that require 'Application' and 'Analysis'.",
      [Difficulty.Hard]: "Focus on strategic judgment and complex decision-making. Questions should test 'Evaluation' and 'Synthesis', often requiring the user to choose the 'BEST', 'MOST', or 'FIRST' action among several plausible options."
    };

    // Use the @google/genai (V1) SDK style
    const client = new GoogleGenAI({ apiKey });
    
    const avoidSection = previousQuestions.length > 0
      ? `\n\n      CRITICAL — Do NOT repeat or rephrase any of these previously asked questions. Each new question must cover a DIFFERENT topic, scenario, and concept:\n${previousQuestions.map((q, i) => `      ${i + 1}. ${q}`).join("\n")}`
      : "";

    const prompt = `Generate ${count} unique, high-quality CISSP practice exam questions.

      Difficulty Level: ${difficulty} (${difficultyRubric[difficulty]})

      Requirements:
      1. Domains: Randomly select from: ${domains.join(", ")}.
      2. Format: Scenario-based. Each question must provide a realistic professional context.
      3. Options: Provide 4 plausible multiple-choice options.
      4. Distractors: Distractors should be technically accurate security concepts but incorrect for the specific scenario or less effective than the correct answer.
      5. Explanation: Provide a comprehensive explanation that clarifies why the correct answer is superior and briefly explains why other distractors are incorrect or less ideal in this context.
      6. Variety: Each question MUST cover a distinctly different topic and scenario. Avoid repeating the same security concepts across questions.${avoidSection}`;

    const response = await client.models.generateContent({
      model: model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are a world-class CISSP certification instructor and subject matter expert. Your goal is to prepare candidates for the actual (ISC)² exam by focusing on the 'Manager's Perspective'—prioritizing risk management, business continuity, and the protection of organizational assets. Avoid questions that only require rote memorization; instead, focus on the application of the CISSP Common Body of Knowledge (CBK) in real-world environments.",
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
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswerIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  difficulty: { type: Type.STRING }
                },
                required: ["id", "domain", "question", "options", "correctAnswerIndex", "explanation", "difficulty"]
              }
            }
          },
          required: ["questions"]
        },
        // CISSP content often triggers safety filters (mentions of attacks/exploits).
        // Setting to BLOCK_NONE to ensure questions are generated.
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY, threshold: HarmBlockThreshold.BLOCK_NONE }
        ]
      }
    });

    // Robust check for candidates to avoid "undefined" errors
    if (!response.candidates || response.candidates.length === 0) {
      console.error("No candidates returned. Prompt feedback:", response.promptFeedback);
      throw new Error("The AI service declined to generate questions. This usually happens due to safety filters.");
    }

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("The AI returned an empty response.");
    }

    // Replace Gemini-generated IDs with deterministic content-based hashes
    const parsed = JSON.parse(text) as { questions: Array<{ id: string; question: string }> };
    if (parsed.questions) {
      await Promise.all(
        parsed.questions.map(async (q) => {
          q.id = await hashQuestion(q.question);
        })
      );
    }

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("API Error:", error.message || error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to generate questions. Please try again later." 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
