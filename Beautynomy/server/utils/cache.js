import NodeCache from 'node-cache';
import { CACHE_CONFIG } from '../config/constants.js';

/**
 * Cache Utility
 * Provides in-memory caching for API responses
 */

// Initialize cache with default TTL
const cache = new NodeCache({
  stdTTL: CACHE_CONFIG.DEFAULT_TTL_SECONDS,
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false, // Don't clone objects (better performance)
  deleteOnExpire: true
});

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {any|null} - Cached value or null if not found
 */
export const get = (key) => {
  try {
    const value = cache.get(key);
    if (value !== undefined) {
      console.log(`✅ Cache HIT: ${key}`);
      return value;
    }
    console.log(`❌ Cache MISS: ${key}`);
    return null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

/**
 * Set value in cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds (optional)
 * @returns {boolean} - Success status
 */
export const set = (key, value, ttl = null) => {
  try {
    const result = ttl
      ? cache.set(key, value, ttl)
      : cache.set(key, value);

    if (result) {
      console.log(`💾 Cache SET: ${key} (TTL: ${ttl || CACHE_CONFIG.DEFAULT_TTL_SECONDS}s)`);
    }
    return result;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
};

/**
 * Delete value from cache
 * @param {string} key - Cache key
 * @returns {number} - Number of deleted entries
 */
export const del = (key) => {
  try {
    const count = cache.del(key);
    if (count > 0) {
      console.log(`🗑️  Cache DELETE: ${key}`);
    }
    return count;
  } catch (error) {
    console.error('Cache delete error:', error);
    return 0;
  }
};

/**
 * Clear all cache
 */
export const flush = () => {
  try {
    cache.flushAll();
    console.log('🧹 Cache FLUSHED');
    return true;
  } catch (error) {
    console.error('Cache flush error:', error);
    return false;
  }
};

/**
 * Get cache statistics
 */
export const stats = () => {
  return cache.getStats();
};

/**
 * Check if key exists in cache
 * @param {string} key - Cache key
 * @returns {boolean}
 */
export const has = (key) => {
  return cache.has(key);
};

/**
 * Get cache keys matching pattern
 * @param {string} pattern - Pattern to match (supports wildcards)
 * @returns {Array<string>} - Matching keys
 */
export const keys = (pattern = '') => {
  const allKeys = cache.keys();
  if (!pattern) return allKeys;

  const regex = new RegExp(pattern.replace(/\*/g, '.*'));
  return allKeys.filter(key => regex.test(key));
};

/**
 * Cache middleware for Express
 * Caches GET requests automatically
 * @param {number} ttl - Time to live in seconds
 * @returns {Function} - Express middleware
 */
export const cacheMiddleware = (ttl = CACHE_CONFIG.DEFAULT_TTL_SECONDS) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key from URL and query params
    const key = `cache:${req.originalUrl || req.url}`;

    // Try to get from cache
    const cachedResponse = get(key);
    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    // Store original res.json function
    const originalJson = res.json.bind(res);

    // Override res.json to cache the response
    res.json = (body) => {
      // Only cache successful responses
      if (res.statusCode === 200) {
        set(key, body, ttl);
      }
      return originalJson(body);
    };

    next();
  };
};

/**
 * Invalidate cache by pattern
 * Useful for clearing related cache entries
 * @param {string} pattern - Pattern to match
 * @returns {number} - Number of deleted entries
 */
export const invalidateByPattern = (pattern) => {
  const matchingKeys = keys(pattern);
  let count = 0;

  matchingKeys.forEach(key => {
    count += del(key);
  });

  console.log(`🗑️  Invalidated ${count} cache entries matching: ${pattern}`);
  return count;
};

export default {
  get,
  set,
  del,
  flush,
  stats,
  has,
  keys,
  cacheMiddleware,
  invalidateByPattern
};
