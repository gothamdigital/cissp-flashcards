import { useState, useMemo, useCallback } from 'react';
import { UserAnswer } from '../types';

export interface DomainStats {
  total: number;
  correct: number;
}

export interface Stats {
  total: number;
  correct: number;
  accuracy: number;
  byDomain: Record<string, DomainStats>;
}

interface UseAnswerTrackingReturn {
  userAnswers: Record<string, UserAnswer>;
  handleAnswer: (questionId: string, domain: string, optionIndex: number, isCorrect: boolean) => void;
  stats: Stats;
  resetAnswers: () => void;
}

export const useAnswerTracking = (): UseAnswerTrackingReturn => {
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>({});

  const handleAnswer = useCallback(
    (questionId: string, domain: string, optionIndex: number, isCorrect: boolean) => {
      setUserAnswers((prev) => {
        // Only record the first answer (prevent changing answers)
        if (prev[questionId]) {
          return prev;
        }

        return {
          ...prev,
          [questionId]: {
            questionId,
            domain,
            selectedOptionIndex: optionIndex,
            isCorrect,
            timestamp: Date.now(),
          },
        };
      });
    },
    []
  );

  const stats = useMemo(() => {
    const answerList: UserAnswer[] = Object.values(userAnswers);
    const total = answerList.length;
    const correct = answerList.filter((a) => a.isCorrect).length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    // Group by domain
    const byDomain: Record<string, DomainStats> = {};

    answerList.forEach((a) => {
      if (!byDomain[a.domain]) {
        byDomain[a.domain] = { total: 0, correct: 0 };
      }
      const domainStats = byDomain[a.domain];
      if (domainStats) {
        domainStats.total += 1;
        if (a.isCorrect) {
          domainStats.correct += 1;
        }
      }
    });

    return { total, correct, accuracy, byDomain };
  }, [userAnswers]);

  const resetAnswers = useCallback(() => {
    setUserAnswers({});
  }, []);

  return {
    userAnswers,
    handleAnswer,
    stats,
    resetAnswers,
  };
};
