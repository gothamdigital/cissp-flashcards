import { useState, useCallback, useRef, useEffect } from 'react';
import { FlashcardData, Difficulty, GeminiModel } from '../types';
import { fetchQuestionBatch } from '../services/geminiService';
import { CONFIG } from '../config';

interface UseQuestionManagerReturn {
  history: FlashcardData[];
  currentIndex: number;
  isLoading: boolean;
  error: string | null;
  loadQuestionsForDifficulty: (
    diff: Difficulty,
    selectedModel: GeminiModel,
    isInitial?: boolean,
    replace?: boolean
  ) => Promise<void>;
  handleNext: () => void;
  handlePrev: () => void;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  resetQuestions: () => void;
}

export const useQuestionManager = (
  difficulty: Difficulty,
  model: GeminiModel,
  onMilestone?: () => void
): UseQuestionManagerReturn => {
  const [history, setHistory] = useState<FlashcardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const prefetchInProgressRef = useRef<boolean>(false);

  const loadQuestionsForDifficulty = useCallback(
    async (
      diff: Difficulty,
      selectedModel: GeminiModel,
      isInitial: boolean = false,
      replace: boolean = false
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const newQuestions = await fetchQuestionBatch(CONFIG.BATCH_SIZE, diff, selectedModel);

        setHistory((prev) => {
          if (replace) {
            return newQuestions;
          }

          const existingIds = new Set(prev.map((q) => q.id));
          const uniqueNew = newQuestions.filter((q) => !existingIds.has(q.id));
          return [...prev, ...uniqueNew];
        });

        if (isInitial || replace) {
          setCurrentIndex(0);
        } else {
          setCurrentIndex((prevIndex) => (prevIndex === -1 && newQuestions.length > 0 ? 0 : prevIndex));
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage || 'Failed to load questions. The AI service might be busy or unavailable.');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleNext = useCallback(() => {
    // Check if we just finished a batch (milestone)
    if (onMilestone && (currentIndex + 1) % CONFIG.MILESTONE_INTERVAL === 0 && currentIndex >= 0) {
      onMilestone();
      return;
    }

    if (currentIndex < history.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Load more questions
      loadQuestionsForDifficulty(difficulty, model, false, false).then(() => {
        setCurrentIndex((prev) => prev + 1);
      });
    }
  }, [currentIndex, history.length, difficulty, model, loadQuestionsForDifficulty, onMilestone]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const resetQuestions = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
    setError(null);
    setIsLoading(false);
  }, []);

  // Pre-fetch more questions when nearing the end of the list
  useEffect(() => {
    const shouldPrefetch =
      history.length > 0 &&
      currentIndex >= history.length - CONFIG.PREFETCH_THRESHOLD &&
      !isLoading &&
      !error &&
      !prefetchInProgressRef.current;

    if (shouldPrefetch) {
      prefetchInProgressRef.current = true;
      fetchQuestionBatch(CONFIG.PREFETCH_SIZE, difficulty, model)
        .then((newQs) => {
          setHistory((prev) => {
            const existingIds = new Set(prev.map((q) => q.id));
            const uniqueNew = newQs.filter((q) => !existingIds.has(q.id));
            return [...prev, ...uniqueNew];
          });
        })
        .catch((err) => console.warn('Background prefetch failed', err))
        .finally(() => {
          prefetchInProgressRef.current = false;
        });
    }
  }, [currentIndex, history.length, isLoading, error, difficulty, model]);

  return {
    history,
    currentIndex,
    isLoading,
    error,
    loadQuestionsForDifficulty,
    handleNext,
    handlePrev,
    setCurrentIndex,
    resetQuestions,
  };
};
