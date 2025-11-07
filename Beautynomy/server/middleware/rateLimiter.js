import rateLimit from 'express-rate-limit';
import { RATE_LIMITS } from '../config/constants.js';

/**
 * General API rate limiter
 * Applies to all /api/* endpoints
 */
export const apiLimiter = rateLimit({
  windowMs: RATE_LIMITS.API_WINDOW_MS,
  max: RATE_LIMITS.API_MAX_REQUESTS,
  message: {
    error: 'Too many requests from this IP',
    message: 'Please try again later',
    retryAfter: Math.ceil(RATE_LIMITS.API_WINDOW_MS / 60000) + ' minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests for rate limiting (only count failed ones)
  skipSuccessfulRequests: false,
  // Skip failed requests
  skipFailedRequests: false
});

/**
 * Strict rate limiter for scraping endpoints
 * Prevents abuse of expensive scraping operations
 */
export const scrapeLimiter = rateLimit({
  windowMs: RATE_LIMITS.SCRAPE_WINDOW_MS,
  max: RATE_LIMITS.SCRAPE_MAX_REQUESTS,
  message: {
    error: 'Scraping rate limit exceeded',
    message: 'Too many scrape requests. Please try again in 1 hour.',
    hint: 'Consider using our existing product database instead of scraping.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // More strict - count all attempts
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

/**
 * Admin endpoints rate limiter
 * For administrative operations like bulk updates
 */
export const adminLimiter = rateLimit({
  windowMs: RATE_LIMITS.ADMIN_WINDOW_MS,
  max: RATE_LIMITS.ADMIN_MAX_REQUESTS,
  message: {
    error: 'Admin rate limit exceeded',
    message: 'Too many admin requests. Please try again in 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export default {
  apiLimiter,
  scrapeLimiter,
  adminLimiter
};
