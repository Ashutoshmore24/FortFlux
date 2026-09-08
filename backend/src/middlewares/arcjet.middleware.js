import { isSpoofedBot } from "@arcjet/inspect";
import { authArcjet, reportArcjet, globalArcjet } from "../lib/arcjet.js";

/**
 * High-performance in-memory sliding window rate limiter fallback.
 * Ensures zero-downtime rate limiting if Arcjet cloud is unreachable,
 * in development/offline environments, or if API quota is exceeded.
 */
class MemoryRateLimiter {
  constructor(max, windowMs = 60000, cooldowns = [60, 300]) {
    this.max = max;
    this.windowMs = windowMs;
    this.cooldowns = cooldowns; // [1st cooldown: 60s, 2nd+ cooldown: 300s]
    this.hits = new Map();       // key -> Array of timestamps
    this.penalties = new Map();  // key -> { violationCount, lockedUntil, banDuration, lastViolationAt }

    // Clean up expired entries every minute
    const interval = setInterval(() => this.prune(), 60000);
    if (interval.unref) interval.unref();
  }

  prune() {
    const now = Date.now();
    for (const [key, timestamps] of this.hits.entries()) {
      const valid = timestamps.filter((t) => now - t < this.windowMs);
      if (valid.length === 0) {
        this.hits.delete(key);
      } else {
        this.hits.set(key, valid);
      }
    }
    for (const [key, penalty] of this.penalties.entries()) {
      if (now > penalty.lockedUntil && now - penalty.lastViolationAt > 30 * 60 * 1000) {
        this.penalties.delete(key);
      }
    }
  }

  check(key) {
    const now = Date.now();

    // 1. Check if client is currently in an active cooldown lockout
    const penalty = this.penalties.get(key);
    if (penalty && now < penalty.lockedUntil) {
      const remainingSec = Math.max(1, Math.ceil((penalty.lockedUntil - now) / 1000));
      return {
        allowed: false,
        limit: this.max,
        remaining: 0,
        resetSec: remainingSec,
        violationCount: penalty.violationCount,
        banDuration: penalty.banDuration,
        isLocked: true,
      };
    }

    // 2. Evaluate sliding window
    const timestamps = (this.hits.get(key) || []).filter((t) => now - t < this.windowMs);

    if (timestamps.length >= this.max) {
      // Escalating violation penalty calculation
      // If previous violation was within 30 minutes, increment violationCount; else start at 1
      let violationCount = 1;
      if (penalty && (now - penalty.lastViolationAt < 30 * 60 * 1000)) {
        violationCount = penalty.violationCount + 1;
      }

      // 1st time: 60s (1 min); 2nd+ times: 300s (5 min)
      const banDurationSec = violationCount === 1 ? this.cooldowns[0] : this.cooldowns[1];
      const lockedUntil = now + banDurationSec * 1000;

      this.penalties.set(key, {
        violationCount,
        banDuration: banDurationSec,
        lockedUntil,
        lastViolationAt: now,
      });

      // Clear hits so fresh window starts after lockout ends
      this.hits.delete(key);

      return {
        allowed: false,
        limit: this.max,
        remaining: 0,
        resetSec: banDurationSec,
        violationCount,
        banDuration: banDurationSec,
        isLocked: true,
      };
    }

    // 3. Allowed request within limit
    timestamps.push(now);
    this.hits.set(key, timestamps);

    const oldest = timestamps[0];
    const resetMs = oldest + this.windowMs - now;
    const resetSec = Math.max(1, Math.ceil(resetMs / 1000));

    return {
      allowed: true,
      limit: this.max,
      remaining: Math.max(0, this.max - timestamps.length),
      resetSec,
      violationCount: penalty ? penalty.violationCount : 0,
      banDuration: 0,
      isLocked: false,
    };
  }

  // Helper to reset a key (useful in tests)
  reset(key) {
    if (key) {
      this.hits.delete(key);
      this.penalties.delete(key);
    } else {
      this.hits.clear();
      this.penalties.clear();
    }
  }
}

/**
 * Factory to build a rate limiting Express middleware with Arcjet + Resilient In-Memory Fallback.
 */
export const createRateLimitMiddleware = ({
  arcjetInstance = null,
  max = 60,
  windowSec = 60,
  cooldowns = [60, 300], // [1st violation: 60s, 2nd+ violations: 300s]
  name = "RateLimit",
}) => {
  const memoryLimiter = new MemoryRateLimiter(max, windowSec * 1000, cooldowns);

  return async (req, res, next) => {
    // 1. Resolve client identifier (IPv4/IPv6 or forwarded header)
    const clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      "127.0.0.1";

    // 2. Primary Layer: High-performance In-Memory Sliding Window Rate Limiter
    const memResult = memoryLimiter.check(clientIp);

    res.setHeader("X-RateLimit-Limit", String(memResult.limit));
    res.setHeader("X-RateLimit-Remaining", String(memResult.remaining));
    res.setHeader("X-RateLimit-Reset", String(memResult.resetSec));

    if (!memResult.allowed) {
      res.setHeader("Retry-After", String(memResult.resetSec));

      const message =
        memResult.isLocked && memResult.resetSec < memResult.banDuration
          ? `Rate limit active. Please try again after ${memResult.resetSec} seconds.`
          : memResult.violationCount === 1
          ? "Rate limit exceeded. Please try again after 1 minute."
          : "Rate limit exceeded. Repeated rapid requests detected. Please try again after 5 minutes.";

      return res.status(429).json({
        success: false,
        message,
        retryAfter: memResult.resetSec,
        violationCount: memResult.violationCount,
        banDuration: memResult.banDuration,
      });
    }

    // 3. Ensure User-Agent header is populated to prevent Arcjet bot-detection errors
    if (!req.headers["user-agent"]) {
      req.headers["user-agent"] = "FortFluxClient/1.0";
    }

    // 4. Secondary Cloud Security Layer: Arcjet Bot Detection, Shield, and Security Policy
    if (arcjetInstance) {
      try {
        const decision = await arcjetInstance.protect(req);

        // Security Policy or Cloud Rate Limit Denials
        if (decision.isDenied()) {
          if (decision.reason?.isRateLimit?.()) {
            const resetSec = Math.max(1, Math.ceil(decision.reason.reset || windowSec));
            res.setHeader("Retry-After", String(resetSec));
            res.setHeader("X-RateLimit-Remaining", "0");
            res.setHeader("X-RateLimit-Reset", String(resetSec));

            return res.status(429).json({
              success: false,
              message: `Too many requests. Rate limit exceeded. Please try again in ${resetSec} seconds.`,
              retryAfter: resetSec,
            });
          }

          if (decision.reason?.isBot?.()) {
            return res.status(403).json({
              success: false,
              message: "Bot access denied.",
            });
          }

          return res.status(403).json({
            success: false,
            message: "Access denied by security policy.",
          });
        }

        // Spoofed bot detection
        if (decision.results?.some(isSpoofedBot)) {
          return res.status(403).json({
            success: false,
            error: "Spoofed bot detected",
            message: "Malicious bot activity detected.",
          });
        }
      } catch (error) {
        // Silently allow request to proceed since local rate limit already passed
        // and Arcjet network issues should not break legitimate user traffic
      }
    }

    next();
  };
};

/**
 * Strict Authentication rate limiter: 5 requests per minute
 * Protects login, signup, and OAuth against brute-force attacks
 */
export const authRateLimiter = createRateLimitMiddleware({
  arcjetInstance: authArcjet,
  max: 5,
  windowSec: 60,
  name: "AuthRateLimit",
});

/**
 * Evidence/Report submission rate limiter: 10 requests per minute
 * Protects file upload bandwidth and Cloudinary resource usage
 */
export const reportRateLimiter = createRateLimitMiddleware({
  arcjetInstance: reportArcjet,
  max: 10,
  windowSec: 60,
  name: "ReportRateLimit",
});

/**
 * Global baseline API rate limiter: 100 requests per minute
 * Protects server from flooding and DoS
 */
export const globalRateLimiter = createRateLimitMiddleware({
  arcjetInstance: globalArcjet,
  max: 100,
  windowSec: 60,
  name: "GlobalRateLimit",
});

// Backward compatibility alias
export const arcjetProtection = authRateLimiter;