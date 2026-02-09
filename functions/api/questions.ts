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

    const genAI = new GoogleGenAI(apiKey);
    const finalModelName = "gemini-1.5-flash"; // Using 1.5-flash for reliability and speed

    const model = genAI.getGenerativeModel({ 
      model: finalModelName,
      systemInstruction: "You are a senior CISSP certification instructor. Create high-quality, scenario-based questions that test application of knowledge, not just rote memorization.",
    });

    const prompt = `Generate ${count} unique, random CISSP practice exam questions with ${difficulty} difficulty level.
      Ensure they cover different domains randomly.
      Provide 4 multiple choice options for each question.
      Include a detailed explanation for the correct answer.`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            questions: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  id: { type: SchemaType.STRING, description: "Unique UUID for the question" },
                  domain: { type: SchemaType.STRING, description: "The specific CISSP domain this question pertains to" },
                  question: { type: SchemaType.STRING, description: "The question text" },
                  options: { 
                    type: SchemaType.ARRAY, 
                    items: { type: SchemaType.STRING },
                    description: "Array of 4 possible answers"
                  },
                  correctAnswerIndex: { 
                    type: SchemaType.NUMBER, 
                    description: "The index (0-3) of the correct answer in the options array" 
                  },
                  explanation: { type: SchemaType.STRING, description: "Detailed explanation of why the answer is correct and others are wrong" },
                  difficulty: { type: SchemaType.STRING, description: "The difficulty level of the question" }
                },
                required: ["id", "domain", "question", "options", "correctAnswerIndex", "explanation", "difficulty"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    const response = result.response;
    const text = response.text();

    if (!text) {
        throw new Error("No response from AI");
    }

    return new Response(text, {
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
