/**
 * Timeout in milliseconds for async tasks (generation polling, file processing).
 * Tasks older than this are treated as stale.
 */
export const ASYNC_TASK_TIMEOUT = 600_000;

/**
 * Shared business configuration shape stored in edge config.
 * Extended per deployment target (see `@azzar/edge-config`).
 */
export interface BusinessEdgeConfigData {
  /**
   * Default AI provider used when none is configured.
   */
  default_provider?: string;
}
