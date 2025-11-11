/**
 * Application Constants
 * Centralized configuration for magic numbers and limits
 */

export const SCRAPING_LIMITS = {
  MAX_BATCH_SIZE: 20,
  MAX_PRODUCTS_PER_SCRAPE: 5,
  BATCH_PROCESSING_SIZE: 5,
  HIGH_PRIORITY_BATCH_SIZE: 3,
  DELAY_BETWEEN_BATCHES_MS: 3000,
  DELAY_BETWEEN_SCRAPES_MS: 2000,
  REQUEST_TIMEOUT_MS: 15000
};

export const PRICE_TRACKING = {
  HISTORY_DAYS: 90,
  HISTORY_MAX_ENTRIES: 90
};

export const CACHE_CONFIG = {
  DEFAULT_TTL_SECONDS: 600, // 10 minutes
  PRODUCTS_TTL_SECONDS: 300, // 5 minutes
  STATS_TTL_SECONDS: 1800 // 30 minutes
};

export const RATE_LIMITS = {
  API_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  API_MAX_REQUESTS: 100,
  SCRAPE_WINDOW_MS: 60 * 60 * 1000, // 1 hour
  SCRAPE_MAX_REQUESTS: 10,
  ADMIN_WINDOW_MS: 60 * 60 * 1000, // 1 hour
  ADMIN_MAX_REQUESTS: 50
};

export const VALIDATION_RULES = {
  PRODUCT_NAME_MIN_LENGTH: 2,
  PRODUCT_NAME_MAX_LENGTH: 200,
  SEARCH_QUERY_MIN_LENGTH: 2,
  SEARCH_QUERY_MAX_LENGTH: 100,
  MAX_PRODUCTS_PER_BATCH: 20,
  ALLOWED_PRODUCT_NAME_PATTERN: /^[a-zA-Z0-9\s\-',().&]+$/
};

export const ALLOWED_ORIGINS = [
  'https://beautynomy.vercel.app',
  'https://beautynomy.onrender.com',
  'https://beautynomy-client.vercel.app',
  'https://client-76ywljz3t-gaurav-mahales-projects-cbe20bce.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

export const PLATFORMS = [
  'Nykaa',
  'Amazon India',
  'Amazon',
  'Flipkart',
  'Purplle',
  'Myntra',
  'Tira',
  'Sephora'
];

export const CATEGORIES = [
  'Foundation',
  'Concealer',
  'Primer',
  'Eyeshadow',
  'Mascara',
  'Eyeliner',
  'Lipstick',
  'Lip Gloss',
  'Blush',
  'Bronzer',
  'Highlighter',
  'Skincare',
  'Hair Care',
  'Nail Polish',
  'Serum'
];

export default {
  SCRAPING_LIMITS,
  PRICE_TRACKING,
  CACHE_CONFIG,
  RATE_LIMITS,
  VALIDATION_RULES,
  ALLOWED_ORIGINS,
  PLATFORMS,
  CATEGORIES
};
