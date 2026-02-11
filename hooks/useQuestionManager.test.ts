import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useQuestionManager } from './useQuestionManager';
import { Difficulty, GeminiModel, FlashcardData } from '../types';

vi.mock('../services/geminiService', () => ({
  fetchQuestionBatch: vi.fn(),
}));

import { fetchQuestionBatch } from '../services/geminiService';

const mockFetch = vi.mocked(fetchQuestionBatch);

function makeQuestion(id: string, overrides?: Partial<FlashcardData>): FlashcardData {
  return {
    id,
    domain: 'Security Operations',
    question: `Question ${id}`,
    options: ['A', 'B', 'C', 'D'],
    correctAnswerIndex: 0,
    explanation: 'Explanation',
    difficulty: Difficulty.Medium,
    ...overrides,
  };
}

function makeQuestions(count: number): FlashcardData[] {
  return Array.from({ length: count }, (_, i) => makeQuestion(`q${i}`));
}

const defaultDifficulty = Difficulty.Medium;
const defaultModel = GeminiModel.Gemini25FlashLite;

describe('useQuestionManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock returns empty array (handles background prefetch calls safely)
    mockFetch.mockResolvedValue([]);
  });

  it('returns initial state', () => {
    const { result } = renderHook(() =>
      useQuestionManager(defaultDifficulty, defaultModel)
    );

    expect(result.current.history).toEqual([]);
    expect(result.current.currentIndex).toBe(-1);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('loads questions and sets index to 0 on initial load', async () => {
    const questions = makeQuestions(5);
    mockFetch.mockResolvedValue(questions);

    const { result } = renderHook(() =>
      useQuestionManager(defaultDifficulty, defaultModel)
    );

    await act(async () => {
      await result.current.loadQuestionsForDifficulty(
        defaultDifficulty,
        defaultModel,
        true
      );
    });

    expect(result.current.history).toEqual(questions);
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isLoading).toBe(false);
  });

  it('replaces history when replace=true', async () => {
    const batch1 = makeQuestions(5);
    const batch2 = [makeQuestion('new1'), makeQuestion('new2'), makeQuestion('new3')];
    mockFetch.mockResolvedValueOnce(batch1);

    const { result } = renderHook(() =>
      useQuestionManager(defaultDifficulty, defaultModel)
    );

    await act(async () => {
      await result.current.loadQuestionsForDifficulty(
        defaultDifficulty,
        defaultModel,
        true
      );
    });

    expect(result.current.history).toEqual(batch1);

    mockFetch.mockResolvedValueOnce(batch2);

    await act(async () => {
      await result.current.loadQuestionsForDifficulty(
        defaultDifficulty,
        defaultModel,
        false,
        true
      );
    });

    expect(result.current.history).toEqual(batch2);
    expect(result.current.currentIndex).toBe(0);
  });

  it('deduplicates questions by ID', async () => {
    const batch1 = makeQuestions(5);
    const batch2 = [makeQuestion('q3'), makeQuestion('q4'), makeQuestion('new1')];
    mockFetch.mockResolvedValueOnce(batch1);

    const { result } = renderHook(() =>
      useQuestionManager(defaultDifficulty, defaultModel)
    );

    await act(async () => {
      await result.current.loadQuestionsForDifficulty(
        defaultDifficulty,
        defaultModel,
        true
      );
    });

    expect(result.current.history).toHaveLength(5);

    mockFetch.mockResolvedValueOnce(batch2);

    await act(async () => {
      await result.current.loadQuestionsForDifficulty(
        defaultDifficulty,
        defaultModel
      );
    });

    // q3 and q4 already exist, only new1 is added
    expect(result.current.history).toHaveLength(6);
    const ids = result.current.history.map((q) => q.id);
    expect(ids).toEqual(['q0', 'q1', 'q2', 'q3', 'q4', 'new1']);
  });

  it('handleNext increments index', async () => {
    const questions = makeQuestions(5);
    mockFetch.mockResolvedValue(questions);

    const { result } = renderHook(() =>
      useQuestionManager(defaultDifficulty, defaultModel)
    );

    await act(async () => {
      await result.current.loadQuestionsForDifficulty(
        defaultDifficulty,
        defaultModel,
        true
      );
    });

    expect(result.current.currentIndex).toBe(0);

    act(() => {
      result.current.handleNext();
    });

    expect(result.current.currentIndex).toBe(1);
  });

  it('handlePrev decrements index and is no-op at 0', async () => {
    const questions = makeQuestions(5);
    mockFetch.mockResolvedValue(questions);

    const { result } = renderHook(() =>
      useQuestionManager(defaultDifficulty, defaultModel)
    );

    await act(async () => {
      await result.current.loadQuestionsForDifficulty(
        defaultDifficulty,
        defaultModel,
        true
      );
    });

    // Navigate forward
    act(() => {
      result.current.handleNext();
    });
    expect(result.current.currentIndex).toBe(1);

    // Navigate back
    act(() => {
      result.current.handlePrev();
    });
    expect(result.current.currentIndex).toBe(0);

    // Should be no-op at 0
    act(() => {
      result.current.handlePrev();
    });
    expect(result.current.currentIndex).toBe(0);
  });

  it('triggers milestone callback at interval boundaries', async () => {
    // MILESTONE_INTERVAL = 10, milestone triggers when (currentIndex + 1) % 10 === 0
    // That's at index 9 (the 10th question)
    const questions = makeQuestions(12);
    mockFetch.mockResolvedValue(questions);
    const onMilestone = vi.fn();

    const { result } = renderHook(() =>
      useQuestionManager(defaultDifficulty, defaultModel, onMilestone)
    );

    await act(async () => {
      await result.current.loadQuestionsForDifficulty(
        defaultDifficulty,
        defaultModel,
        true
      );
    });

    // Navigate to index 9 (9 handleNext calls from index 0)
    for (let i = 0; i < 9; i++) {
      act(() => {
        result.current.handleNext();
      });
    }

    expect(result.current.currentIndex).toBe(9);
    expect(onMilestone).not.toHaveBeenCalled();

    // handleNext at index 9 should trigger milestone and NOT advance
    act(() => {
      result.current.handleNext();
    });

    expect(onMilestone).toHaveBeenCalledOnce();
    expect(result.current.currentIndex).toBe(9);
  });

  it('resetQuestions clears all state', async () => {
    const questions = makeQuestions(5);
    mockFetch.mockResolvedValue(questions);

    const { result } = renderHook(() =>
      useQuestionManager(defaultDifficulty, defaultModel)
    );

    await act(async () => {
      await result.current.loadQuestionsForDifficulty(
        defaultDifficulty,
        defaultModel,
        true
      );
    });

    expect(result.current.history).toHaveLength(5);
    expect(result.current.currentIndex).toBe(0);

    act(() => {
      result.current.resetQuestions();
    });

    expect(result.current.history).toEqual([]);
    expect(result.current.currentIndex).toBe(-1);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});
