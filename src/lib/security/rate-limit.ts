/**
 * In-memory sliding window rate limiter.
 * Designed for edge/serverless or standard Node.js server environments.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Periodic cleanup of stale entries every 5 minutes to prevent memory leak
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStale(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, record] of rateLimitMap.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
    if (record.timestamps.length === 0) {
      rateLimitMap.delete(key);
    }
  }
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

/**
 * Checks and increments the rate limit for a given identifier (e.g. IP address).
 * @param identifier Client IP or API key identifier
 * @param limit Max requests per window (default: 30)
 * @param windowMs Time window in milliseconds (default: 60,000 ms / 1 minute)
 */
export function checkRateLimit(
  identifier: string,
  limit = 30,
  windowMs = 60 * 1000
): RateLimitResult {
  cleanupStale(windowMs);

  const now = Date.now();
  const record = rateLimitMap.get(identifier) || { timestamps: [] };

  // Remove timestamps outside window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const resetMs = Math.max(0, windowMs - (now - oldest));
    return {
      success: false,
      limit,
      remaining: 0,
      resetMs,
    };
  }

  record.timestamps.push(now);
  rateLimitMap.set(identifier, record);

  const remaining = Math.max(0, limit - record.timestamps.length);
  const resetMs = windowMs;

  return {
    success: true,
    limit,
    remaining,
    resetMs,
  };
}
