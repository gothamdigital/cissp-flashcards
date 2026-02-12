-- Question bank for CISSP flashcards
-- Stores AI-generated questions for reuse and quality tracking

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  domain TEXT NOT NULL,
  sub_topic TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  question TEXT NOT NULL,
  options TEXT NOT NULL,  -- JSON array of 4 options
  correct_answer_index INTEGER NOT NULL CHECK (correct_answer_index BETWEEN 0 AND 3),
  explanation TEXT NOT NULL,

  -- Quality metrics
  quality_score REAL NOT NULL DEFAULT 1.0,
  times_served INTEGER NOT NULL DEFAULT 0,
  times_answered INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  correct_rate REAL NOT NULL DEFAULT 0.0,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Query patterns: find questions by difficulty + sub-topic, ordered by quality/freshness
CREATE INDEX idx_questions_difficulty ON questions (difficulty);
CREATE INDEX idx_questions_sub_topic ON questions (sub_topic);
CREATE INDEX idx_questions_quality ON questions (quality_score DESC);
CREATE INDEX idx_questions_diff_topic ON questions (difficulty, sub_topic);
