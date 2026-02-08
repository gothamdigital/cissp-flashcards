import { FlashcardData, Difficulty } from "../types";

export const fetchQuestionBatch = async (count: number = 10, difficulty: Difficulty = Difficulty.Medium): Promise<FlashcardData[]> => {
  try {
    const response = await fetch('/api/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ count, difficulty }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.questions || [];

  } catch (error) {
    console.error("Failed to fetch questions:", error);
    throw error;
  }
};