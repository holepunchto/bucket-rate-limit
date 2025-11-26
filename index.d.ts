export = BucketRateLimiter;
declare class BucketRateLimiter {
  /**
   * Token bucket rate limiter.
   *
   * @param {object} options
   * @param {number} options.capacity - Max tokens (burst capacity)
   * @param {number} options.intervalMs - Time interval in milliseconds to refill 1 token
   */
  constructor({
    capacity,
    intervalMs,
  }?: {
    capacity: number;
    intervalMs: number;
  });
  capacity: number;
  intervalMs: number;
  destroyed: boolean;
  tokens: number;
  /**
   * Wait until a token is available.
   *
   * @param {object} [options] - Options for the execution.
   * @param {Promise<void>} [options.abortSignalPromise] - Promise that rejects when the execution should be aborted.
   * @returns {Promise<void>}
   */
  wait({
    abortSignalPromise,
  }?: {
    abortSignalPromise?: Promise<void>;
  }): Promise<void>;
  destroy(): void;
}
