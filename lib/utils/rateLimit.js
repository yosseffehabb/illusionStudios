// lib/utils/rateLimit.js

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or Upstash
 */
const rateLimitMap = new Map();

/**
 * Check if request is within rate limit
 * @param {string} identifier - Unique identifier (IP, phone, etc)
 * @param {number} limit - Max requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Object} { allowed, remaining, resetTime }
 */
export function rateLimit(identifier, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const key = String(identifier);

  const record = rateLimitMap.get(key) || {
    count: 0,
    resetTime: now + windowMs,
  };

  // Reset if window expired
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }

  record.count++;
  rateLimitMap.set(key, record);

  // Cleanup old entries periodically (prevent memory leak)
  if (rateLimitMap.size > 10000) {
    cleanupOldEntries(now, windowMs);
  }

  return {
    allowed: record.count <= limit,
    remaining: Math.max(0, limit - record.count),
    resetTime: record.resetTime,
    retryAfter: Math.ceil((record.resetTime - now) / 1000), // seconds
  };
}

/**
 * Cleanup expired rate limit entries
 */
function cleanupOldEntries(now, windowMs) {
  const cutoff = now - windowMs;
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < cutoff) {
      rateLimitMap.delete(key);
    }
  }
}

/**
 * Reset rate limit for specific identifier (useful for testing)
 */
export function resetRateLimit(identifier) {
  rateLimitMap.delete(String(identifier));
}

/**
 * Clear all rate limits (useful for testing)
 */
export function clearAllRateLimits() {
  rateLimitMap.clear();
}