/**
 * Rate Limiter for Location & Reverse Geocoding Requests
 * Sliding Window: 60 seconds
 * Limit: Max 5 requests per 60 seconds
 */

class LocationRateLimiter {
  private timestamps: number[] = [];
  private readonly maxRequests: number = 5;
  private readonly windowMs: number = 60 * 1000; // 60 seconds

  /**
   * Removes timestamps older than 60 seconds
   */
  private cleanup(): void {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(t => now - t < this.windowMs);
  }

  /**
   * Checks whether a new request is permitted under the rate limit
   */
  public canMakeRequest(): boolean {
    this.cleanup();
    return this.timestamps.length < this.maxRequests;
  }

  /**
   * Records a request timestamp
   */
  public recordRequest(): void {
    this.cleanup();
    this.timestamps.push(Date.now());
  }

  /**
   * Calculates remaining seconds until the oldest request expires
   */
  public getSecondsUntilReset(): number {
    this.cleanup();
    if (this.timestamps.length === 0) return 0;
    const oldest = this.timestamps[0];
    const now = Date.now();
    const elapsed = now - oldest;
    return Math.max(1, Math.ceil((this.windowMs - elapsed) / 1000));
  }

  /**
   * Returns current count of requests in active window
   */
  public getRequestCount(): number {
    this.cleanup();
    return this.timestamps.length;
  }

  /**
   * Resets rate limiter state (used for testing or explicit resets)
   */
  public reset(): void {
    this.timestamps = [];
  }
}

export const locationRateLimiter = new LocationRateLimiter();
