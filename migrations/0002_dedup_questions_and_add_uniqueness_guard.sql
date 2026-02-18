-- Deduplicate questions by normalized text + difficulty and keep the best row.
-- Ranking preference:
-- 1) higher quality_score
-- 2) more answer history
-- 3) lower times_served (fresher)
-- 4) most recently updated
-- 5) stable tiebreaker by rowid
WITH ranked AS (
  SELECT
    rowid,
    ROW_NUMBER() OVER (
      PARTITION BY difficulty, lower(trim(question))
      ORDER BY
        quality_score DESC,
        times_answered DESC,
        times_served ASC,
        updated_at DESC,
        rowid ASC
    ) AS rn
  FROM questions
)
DELETE FROM questions
WHERE rowid IN (
  SELECT rowid
  FROM ranked
  WHERE rn > 1
);

-- Prevent future duplicates by normalized question text per difficulty level.
CREATE UNIQUE INDEX IF NOT EXISTS idx_questions_unique_diff_normq
ON questions (difficulty, lower(trim(question)));
