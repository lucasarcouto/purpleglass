import rateLimit from "express-rate-limit";

/**
 * Rate limiter for login attempts
 * Prevents brute force attacks on user accounts
 *
 * Limit: 5 requests per 15 minutes per IP
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    error: "Too Many Requests",
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // Skip successful requests (only count failed login attempts)
  skipSuccessfulRequests: false,
});

/**
 * Rate limiter for registration
 * Prevents spam account creation
 *
 * Limit: 3 requests per hour per IP
 */
export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per window
  message: {
    error: "Too Many Requests",
    message: "Too many accounts created. Please try again in 1 hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for file uploads
 * Prevents upload spam and storage abuse
 *
 * Limit: 20 requests per hour per IP
 */
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 requests per window
  message: {
    error: "Too Many Requests",
    message: "Too many file uploads. Please try again in 1 hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API rate limiter
 * Prevents API abuse for general endpoints
 *
 * Limit: 100 requests per 15 minutes per IP
 */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: "Too Many Requests",
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
