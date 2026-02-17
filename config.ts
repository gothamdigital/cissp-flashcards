/**
 * Centralized application configuration constants
 */

export const CONFIG = {
  /** Number of questions to fetch per batch */
  BATCH_SIZE: 10,

  /** Number of questions to prefetch in background */
  PREFETCH_SIZE: 3,

  /** When to trigger prefetch (questions remaining) */
  PREFETCH_THRESHOLD: 2,

  /** Session milestone interval (every N questions) */
  MILESTONE_INTERVAL: 10,

  /** Accuracy thresholds for color coding */
  ACCURACY_THRESHOLDS: {
    HIGH: 70,
    MEDIUM: 50
  }
} as const;
