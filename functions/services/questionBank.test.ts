import { describe, it, expect, vi } from 'vitest';
import { queryBankedQuestions, type QuestionRow } from './questionBank';

interface RecordedCall {
  sql: string;
  args: unknown[];
}

function makeRow(topic: string, id: string): QuestionRow {
  return {
    id,
    domain: 'Security Operations',
    sub_topic: topic,
    difficulty: 'Medium',
    question: `Question ${id}`,
    options: '["A","B","C","D"]',
    correct_answer_index: 0,
    explanation: 'Explanation',
    quality_score: 1,
    times_served: 0,
    times_answered: 0,
    correct_count: 0,
    correct_rate: 0,
  };
}

function makeDb(firstResults: Array<QuestionRow | null>, calls: RecordedCall[]) {
  let index = 0;

  return {
    prepare: vi.fn((sql: string) => ({
      bind: (...args: unknown[]) => {
        calls.push({ sql, args });
        return {
          first: vi.fn(async () => firstResults[index++] ?? null),
        };
      },
    })),
  } as unknown as D1Database;
}

describe('queryBankedQuestions', () => {
  it('queries one row per assigned topic and excludes previous question texts', async () => {
    const calls: RecordedCall[] = [];
    const db = makeDb([makeRow('Topic A', 'a1'), makeRow('Topic B', 'b1')], calls);

    const rows = await queryBankedQuestions(
      db,
      'Medium',
      ['Topic A', 'Topic B'],
      10,
      ['Previously seen question']
    );

    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.sub_topic)).toEqual(['Topic A', 'Topic B']);
    expect(calls).toHaveLength(2);
    expect(calls[0]?.sql).toContain('sub_topic = ?');
    expect(calls[0]?.sql).toContain('question NOT IN (?)');
    expect(calls[0]?.args).toEqual(['Medium', 'Topic A', 'Previously seen question']);
    expect(calls[1]?.args).toEqual(['Medium', 'Topic B', 'Previously seen question']);
  });

  it('limits topic queries to requested count', async () => {
    const calls: RecordedCall[] = [];
    const db = makeDb([makeRow('Topic A', 'a1'), makeRow('Topic B', 'b1')], calls);

    const rows = await queryBankedQuestions(
      db,
      'Medium',
      ['Topic A', 'Topic B', 'Topic C'],
      2
    );

    expect(rows).toHaveLength(2);
    expect(calls).toHaveLength(2);
  });
});
