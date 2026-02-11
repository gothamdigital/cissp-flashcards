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

  /** Maximum questions allowed per API request */
  MAX_QUESTIONS_PER_REQUEST: 20,

  /** Minimum questions allowed per API request */
  MIN_QUESTIONS_PER_REQUEST: 1,

  /** Development server port */
  DEV_SERVER_PORT: 3000,

  /** API request timeout (ms) */
  API_TIMEOUT: 30000,

  /** Retry attempts for failed API requests */
  API_RETRY_ATTEMPTS: 3,

  /** Base delay for exponential backoff (ms) */
  RETRY_BASE_DELAY: 1000,

  /** Session milestone interval (every N questions) */
  MILESTONE_INTERVAL: 10,

  /** Accuracy thresholds for color coding */
  ACCURACY_THRESHOLDS: {
    HIGH: 70,
    MEDIUM: 50
  }
} as const;
