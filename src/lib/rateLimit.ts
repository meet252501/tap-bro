/**
 * In-Memory Sliding-Window Rate Limiter for Tap-Bro API endpoints.
 * Defends against brute-force password guessing, credential stuffing, and AI quota exhaustion.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic cleanup of stale entries to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((record, key) => {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 15 * 60 * 1000);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    });
  }, 5 * 60 * 1000);

  // Unref timer so it doesn't block process exit in tests
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
}

/**
 * Checks whether an incoming request is allowed under the rate limit.
 * @param identifier Unique key (e.g. `login:${ip}`, `validate:${email}`, `ai:${ip}`)
 * @param maxRequests Maximum allowed requests in the time window
 * @param windowSeconds Duration of the window in seconds
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): { allowed: boolean; remaining: number; resetSeconds: number } {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  let record = rateLimitStore.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(identifier, record);
  }

  // Remove timestamps outside the sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0];
    const resetSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetSeconds,
    };
  }

  record.timestamps.push(now);
  const remaining = maxRequests - record.timestamps.length;

  return {
    allowed: true,
    remaining,
    resetSeconds: windowSeconds,
  };
}

/**
 * Checks if an identifier is currently blocked due to exceeded failed attempts.
 */
export function isRateLimited(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): { limited: boolean; resetSeconds: number } {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const record = rateLimitStore.get(identifier);
  if (!record) return { limited: false, resetSeconds: windowSeconds };

  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0];
    const resetSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return { limited: true, resetSeconds };
  }
  return { limited: false, resetSeconds: windowSeconds };
}

/**
 * Records a failed authentication attempt against brute-force threshold.
 */
export function recordFailedAttempt(identifier: string): void {
  const now = Date.now();
  let record = rateLimitStore.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(identifier, record);
  }
  record.timestamps.push(now);
}

/**
 * Clears failed attempts upon successful authentication.
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Safely extracts client IP address from Next.js / Vercel proxy headers.
 */
export function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    return xff.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();
  return '127.0.0.1';
}
