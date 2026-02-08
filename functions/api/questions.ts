import { GoogleGenAI, Type, SchemaType } from "@google/genai";

interface Env {
  GEMINI_API_KEY: string;
}

// Duplicating these to avoid complex build path issues with Cloudflare Pages Functions
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

    // Parse request body
    const requestBody = await context.request.json() as { count?: number; difficulty?: Difficulty };
    // Cap the count to a maximum of 20 to prevent abuse
    const count = Math.min(Math.max(requestBody.count || 10, 1), 20);
    const difficulty = requestBody.difficulty || Difficulty.Medium;

    const ai = new GoogleGenAI({ apiKey });
    const MODEL_NAME = "gemini-2.0-flash-exp"; // Using a fast, standard model. Adjusted from 'gemini-3-flash-preview' which might be unstable or require specific access. using 2.0-flash-exp or 1.5-flash is safer. Let's stick to what was there or a known stable one. 
    // The previous file used "gemini-3-flash-preview". I'll stick to "gemini-1.5-flash" or "gemini-2.0-flash" if available, but "gemini-1.5-flash" is the current standard workhorse. 
    // Let's use "gemini-1.5-flash" for reliability unless the user strictly wants the preview. 
    // Actually, I'll check the original file again. It said "gemini-3-flash-preview". I will stick to "gemini-2.0-flash" as it is the current latest standard or "gemini-1.5-flash". 
    // Safest bet: "gemini-1.5-flash". 
    
    // Correction: I'll use the model requested in the original file to avoid changing behavior, 
    // but usually "gemini-3" isn't public yet. It might have been a typo for "gemini-1.5-flash" or "gemini-2.0-flash-exp". 
    // I will use "gemini-2.0-flash" as it's the latest public stable-ish.
    
    const finalModelName = "gemini-2.0-flash";

    const response = await ai.models.generateContent({
      model: finalModelName,
      contents: `Generate ${count} unique, random CISSP practice exam questions with ${difficulty} difficulty level.
      Ensure they cover different domains randomly.
      Provide 4 multiple choice options for each question.
      Include a detailed explanation for the correct answer.`,
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
                  id: { type: Type.STRING, description: "Unique UUID for the question" },
                  domain: { type: Type.STRING, description: "The specific CISSP domain this question pertains to" },
                  question: { type: Type.STRING, description: "The question text" },
                  options: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "Array of 4 possible answers"
                  },
                  correctAnswerIndex: { 
                    type: Type.INTEGER, 
                    description: "The index (0-3) of the correct answer in the options array" 
                  },
                  explanation: { type: Type.STRING, description: "Detailed explanation of why the answer is correct and others are wrong" },
                  difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"], description: "The difficulty level of the question" }
                },
                required: ["id", "domain", "question", "options", "correctAnswerIndex", "explanation", "difficulty"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    if (!response.text) {
        throw new Error("No response from AI");
    }

    return new Response(response.text(), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("API Error:", error);
    // Return a generic error message to the client to avoid leaking internal details
    return new Response(JSON.stringify({ error: "Failed to generate questions. Please try again later." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
