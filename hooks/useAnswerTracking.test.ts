import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAnswerTracking } from './useAnswerTracking';

describe('useAnswerTracking', () => {
  it('returns empty state initially', () => {
    const { result } = renderHook(() => useAnswerTracking());

    expect(result.current.userAnswers).toEqual({});
    expect(result.current.stats).toEqual({
      total: 0,
      correct: 0,
      accuracy: 0,
      byDomain: {},
    });
  });

  it('records an answer correctly', () => {
    const { result } = renderHook(() => useAnswerTracking());

    act(() => {
      result.current.handleAnswer('q1', 'Security Operations', 2, true);
    });

    expect(result.current.userAnswers['q1']).toMatchObject({
      questionId: 'q1',
      domain: 'Security Operations',
      selectedOptionIndex: 2,
      isCorrect: true,
    });
    expect(result.current.userAnswers['q1']?.timestamp).toBeTypeOf('number');
  });

  it('prevents overwriting existing answers', () => {
    const { result } = renderHook(() => useAnswerTracking());

    act(() => {
      result.current.handleAnswer('q1', 'Asset Security', 1, false);
    });

    const firstAnswer = result.current.userAnswers['q1'];

    act(() => {
      result.current.handleAnswer('q1', 'Asset Security', 3, true);
    });

    expect(result.current.userAnswers['q1']).toBe(firstAnswer);
    expect(result.current.userAnswers['q1']?.selectedOptionIndex).toBe(1);
    expect(result.current.userAnswers['q1']?.isCorrect).toBe(false);
  });

  it('computes accuracy correctly', () => {
    const { result } = renderHook(() => useAnswerTracking());

    act(() => {
      result.current.handleAnswer('q1', 'Domain A', 0, true);
      result.current.handleAnswer('q2', 'Domain A', 1, true);
      result.current.handleAnswer('q3', 'Domain A', 2, false);
    });

    expect(result.current.stats.total).toBe(3);
    expect(result.current.stats.correct).toBe(2);
    expect(result.current.stats.accuracy).toBe(67); // Math.round(2/3 * 100)
  });

  it('computes per-domain stats', () => {
    const { result } = renderHook(() => useAnswerTracking());

    act(() => {
      result.current.handleAnswer('q1', 'Security Operations', 0, true);
      result.current.handleAnswer('q2', 'Security Operations', 1, false);
      result.current.handleAnswer('q3', 'Asset Security', 2, true);
    });

    expect(result.current.stats.byDomain['Security Operations']).toEqual({
      total: 2,
      correct: 1,
    });
    expect(result.current.stats.byDomain['Asset Security']).toEqual({
      total: 1,
      correct: 1,
    });
  });

  it('returns accuracy 0 with no answers', () => {
    const { result } = renderHook(() => useAnswerTracking());

    expect(result.current.stats.accuracy).toBe(0);
    expect(result.current.stats.total).toBe(0);
  });

  it('resets all answers', () => {
    const { result } = renderHook(() => useAnswerTracking());

    act(() => {
      result.current.handleAnswer('q1', 'Domain A', 0, true);
      result.current.handleAnswer('q2', 'Domain B', 1, false);
    });

    expect(result.current.stats.total).toBe(2);

    act(() => {
      result.current.resetAnswers();
    });

    expect(result.current.userAnswers).toEqual({});
    expect(result.current.stats.total).toBe(0);
    expect(result.current.stats.accuracy).toBe(0);
    expect(result.current.stats.byDomain).toEqual({});
  });
});
