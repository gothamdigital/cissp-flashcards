import { GoogleGenAI, Type } from "@google/genai";

interface Env {
  GEMINI_API_KEY: string;
}

enum Difficulty {
  Easy = "Easy",
  Medium = "Medium",
  Hard = "Hard"
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

    const requestBody = await context.request.json() as { count?: number; difficulty?: Difficulty; model?: string };
    const count = Math.min(Math.max(requestBody.count || 10, 1), 20);
    const difficulty = requestBody.difficulty || Difficulty.Medium;
    const model = requestBody.model || "gemini-2.5-flash-lite";

    // Use the @google/genai (V1) SDK style
    const client = new GoogleGenAI({ apiKey });
    
    const prompt = `Generate ${count} unique, random CISSP practice exam questions with ${difficulty} difficulty level.
      Ensure they cover different domains randomly.
      Provide 4 multiple choice options for each question.
      Include a detailed explanation for the correct answer.`;

    const response = await client.models.generateContent({
      model: model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are a senior CISSP certification instructor. Create high-quality, scenario-based questions that test application of knowledge, not just rote memorization.",
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
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_CIVIC_INTEGRITY", threshold: "BLOCK_NONE" }
        ]
      }
    });

    // Robust check for candidates to avoid "undefined" errors
    if (!response.candidates || response.candidates.length === 0) {
      console.error("No candidates returned. Prompt feedback:", response.promptFeedback);
      throw new Error("The AI service declined to generate questions. This usually happens due to safety filters.");
    }

    const text = response.candidates[0].content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("The AI returned an empty response.");
    }

    return new Response(text, {
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
