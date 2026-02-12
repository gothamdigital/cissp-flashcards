import { FlashcardData, Difficulty, GeminiModel } from "../types";
import { CONFIG } from "../config";

export const fetchQuestionBatch = async (
  count: number = CONFIG.BATCH_SIZE,
  difficulty: Difficulty = Difficulty.Medium,
  model: GeminiModel = GeminiModel.Gemini25FlashLite,
  previousQuestions: string[] = []
): Promise<FlashcardData[]> => {
  try {
    const response = await fetch('/api/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ count, difficulty, model, previousQuestions }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as { error?: string };
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json() as { questions?: FlashcardData[] };
    return data.questions || [];

  } catch (error) {
    console.error("Failed to fetch questions:", error);
    throw error;
  }
};