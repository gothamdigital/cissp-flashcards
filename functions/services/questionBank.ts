/// <reference types="@cloudflare/workers-types" />

export interface QuestionRow {
  id: string;
  domain: string;
  sub_topic: string;
  difficulty: string;
  question: string;
  options: string; // JSON string
  correct_answer_index: number;
  explanation: string;
  quality_score: number;
  times_served: number;
  times_answered: number;
  correct_count: number;
  correct_rate: number;
}

export interface FlashcardShape {
  id: string;
  domain: string;
  subTopic: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: string;
}

/** Convert a DB row to the FlashcardData shape the frontend expects */
export function toFlashcardData(row: QuestionRow): FlashcardShape {
  return {
    id: row.id,
    domain: row.domain,
    subTopic: row.sub_topic,
    question: row.question,
    options: JSON.parse(row.options) as string[],
    correctAnswerIndex: row.correct_answer_index,
    explanation: row.explanation,
    difficulty: row.difficulty,
  };
}

/**
 * Query banked questions matching difficulty + target topics.
 * Prefers least-served questions for variety, with randomization.
 */
export async function queryBankedQuestions(
  db: D1Database,
  difficulty: string,
  topics: string[],
  count: number,
  excludedQuestionTexts: string[] = []
): Promise<QuestionRow[]> {
  if (topics.length === 0 || count <= 0) return [];

  // One question per assigned sub-topic keeps batch size predictable.
  const uniqueTopics = [...new Set(topics)].slice(0, count);
  const questionPlaceholders =
    excludedQuestionTexts.length > 0
      ? ` AND question NOT IN (${excludedQuestionTexts.map(() => "?").join(", ")})`
      : "";

  const rows = await Promise.all(
    uniqueTopics.map(async (topic) => {
      const stmt = db.prepare(
        `SELECT * FROM questions
         WHERE difficulty = ?
           AND sub_topic = ?
           AND quality_score >= 0.3${questionPlaceholders}
         ORDER BY times_served ASC, RANDOM()
         LIMIT 1`
      );

      return stmt
        .bind(difficulty, topic, ...excludedQuestionTexts)
        .first<QuestionRow>();
    })
  );

  return rows.filter((row): row is QuestionRow => !!row);
}

/**
 * Save new questions to the bank. Uses INSERT OR IGNORE for dedup by content hash.
 */
export async function saveQuestions(
  db: D1Database,
  questions: FlashcardShape[]
): Promise<void> {
  if (questions.length === 0) return;

  const stmts = questions.map((q) =>
    db
      .prepare(
        `INSERT OR IGNORE INTO questions
         (id, domain, sub_topic, difficulty, question, options, correct_answer_index, explanation)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        q.id,
        q.domain,
        q.subTopic || "",
        q.difficulty,
        q.question,
        JSON.stringify(q.options),
        q.correctAnswerIndex,
        q.explanation
      )
  );

  await db.batch(stmts);
}

/**
 * Increment times_served for a batch of question IDs.
 */
export async function incrementServed(
  db: D1Database,
  ids: string[]
): Promise<void> {
  if (ids.length === 0) return;

  const stmts = ids.map((id) =>
    db
      .prepare(
        `UPDATE questions SET times_served = times_served + 1, updated_at = datetime('now') WHERE id = ?`
      )
      .bind(id)
  );

  await db.batch(stmts);
}

/**
 * Record user feedback (correct/incorrect) and update quality metrics.
 */
export async function recordFeedback(
  db: D1Database,
  questionId: string,
  isCorrect: boolean
): Promise<void> {
  // Atomic update: increment counters and recompute correct_rate
  const correctIncrement = isCorrect ? 1 : 0;

  await db
    .prepare(
      `UPDATE questions
       SET times_answered = times_answered + 1,
           correct_count = correct_count + ?,
           correct_rate = CAST((correct_count + ?) AS REAL) / (times_answered + 1),
           updated_at = datetime('now')
       WHERE id = ?`
    )
    .bind(correctIncrement, correctIncrement, questionId)
    .run();

  // Apply quality scoring heuristic after enough data
  await applyQualityScore(db, questionId);
}

/**
 * Quality scoring heuristic:
 * - correct_rate > 90% on Easy/Medium after 5+ answers → lower score (bad distractors)
 * - correct_rate < 20% on Easy after 5+ answers → lower score (misleading)
 * - correct_rate 40-70% → boost score (well-calibrated)
 */
async function applyQualityScore(
  db: D1Database,
  questionId: string
): Promise<void> {
  const row = await db
    .prepare(
      `SELECT difficulty, times_answered, correct_rate, quality_score FROM questions WHERE id = ?`
    )
    .bind(questionId)
    .first<Pick<QuestionRow, "difficulty" | "times_answered" | "correct_rate" | "quality_score">>();

  if (!row || row.times_answered < 5) return;

  let newScore = row.quality_score;

  if (row.correct_rate > 0.9 && (row.difficulty === "Easy" || row.difficulty === "Medium")) {
    // Too easy — bad distractors
    newScore = Math.max(0.1, newScore - 0.05);
  } else if (row.correct_rate < 0.2 && row.difficulty === "Easy") {
    // Too hard for Easy — likely misleading
    newScore = Math.max(0.1, newScore - 0.05);
  } else if (row.correct_rate >= 0.4 && row.correct_rate <= 0.7) {
    // Well-calibrated
    newScore = Math.min(2.0, newScore + 0.02);
  }

  if (newScore !== row.quality_score) {
    await db
      .prepare(`UPDATE questions SET quality_score = ?, updated_at = datetime('now') WHERE id = ?`)
      .bind(newScore, questionId)
      .run();
  }
}
