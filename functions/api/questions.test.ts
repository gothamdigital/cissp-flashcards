import { describe, it, expect } from 'vitest';
import { mergeUniqueQuestions } from './questions';

function makeQuestion(id: string, topic = 't1') {
  return {
    id,
    domain: 'Security Operations',
    subTopic: topic,
    question: `Question ${id}`,
    options: ['A', 'B', 'C', 'D'],
    correctAnswerIndex: 0,
    explanation: 'Explanation',
    difficulty: 'Medium',
  };
}

describe('mergeUniqueQuestions', () => {
  it('caps merged output at requested count', () => {
    const banked = [makeQuestion('b1'), makeQuestion('b2')];
    const generated = [makeQuestion('g1'), makeQuestion('g2')];

    const merged = mergeUniqueQuestions(banked, generated, 3);

    expect(merged).toHaveLength(3);
    expect(merged.map((q) => q.id)).toEqual(['b1', 'b2', 'g1']);
  });

  it('deduplicates by question ID across banked and generated sources', () => {
    const banked = [makeQuestion('q1'), makeQuestion('q2')];
    const generated = [makeQuestion('q2'), makeQuestion('q3')];

    const merged = mergeUniqueQuestions(banked, generated, 10);

    expect(merged.map((q) => q.id)).toEqual(['q1', 'q2', 'q3']);
  });
});
