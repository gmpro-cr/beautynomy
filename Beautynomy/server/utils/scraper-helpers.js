/**
 * Scraper Helper Utilities
 *
 * Provides anti-bot measures, request helpers, and utilities for web scraping
 */

import axios from 'axios';

/**
 * User agents pool for rotation
 * Mix of Chrome, Firefox, Safari on different OS
 */
const USER_AGENTS = [
  // Chrome on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',

  // Chrome on Mac
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',

  // Firefox on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:119.0) Gecko/20100101 Firefox/119.0',

  // Firefox on Mac
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0',

  // Safari on Mac
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',

  // Edge on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
];

/**
 * Get random user agent from pool
 */
export const getRandomUserAgent = () => {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
};

/**
 * Get comprehensive headers for HTTP requests
 * Mimics real browser behavior
 */
export const getBrowserHeaders = (referer = null, platform = 'generic') => {
  const headers = {
    'User-Agent': getRandomUserAgent(),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
    'DNT': '1', // Do Not Track
  };

  // Add referer if provided
  if (referer) {
    headers['Referer'] = referer;
    headers['Sec-Fetch-Site'] = 'same-origin';
  }

  // Platform-specific headers
  if (platform === 'amazon') {
    headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
    headers['Referer'] = referer || 'https://www.amazon.in/';
  } else if (platform === 'flipkart') {
    headers['Referer'] = referer || 'https://www.flipkart.com/';
    headers['X-Requested-With'] = 'XMLHttpRequest';
  } else if (platform === 'nykaa') {
    headers['Referer'] = referer || 'https://www.nykaa.com/';
  }

  return headers;
};

/**
 * Make HTTP request with retries and anti-bot measures
 */
export const makeRequest = async (url, options = {}) => {
  const {
    method = 'GET',
    headers = {},
    timeout = 15000,
    maxRetries = 3,
    retryDelay = 2000,
    platform = 'generic'
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🌐 Request attempt ${attempt}/${maxRetries}: ${url.substring(0, 80)}...`);

      // Add random delay between retries (looks more human)
      if (attempt > 1) {
        const delay = retryDelay + Math.random() * 1000; // Add random 0-1s
        await sleep(delay);
      }

      const response = await axios({
        method,
        url,
        headers: {
          ...getBrowserHeaders(null, platform),
          ...headers // Allow custom headers to override
        },
        timeout,
        maxRedirects: 5,
        validateStatus: (status) => status < 500, // Don't throw on 4xx errors
      });

      // Check for successful response
      if (response.status === 200) {
        console.log(`✅ Request successful (${response.data.length} bytes)`);
        return response.data;
      }

      // Handle specific error codes
      if (response.status === 403) {
        console.log(`⚠️  403 Forbidden - anti-bot detected (attempt ${attempt})`);
        lastError = new Error(`403 Forbidden - Blocked by anti-bot (${url})`);

        // Wait longer on 403
        if (attempt < maxRetries) {
          await sleep(retryDelay * 2);
        }
        continue;
      }

      if (response.status === 429) {
        console.log(`⚠️  429 Rate Limited (attempt ${attempt})`);
        lastError = new Error(`429 Rate Limited (${url})`);

        // Wait even longer on rate limit
        if (attempt < maxRetries) {
          await sleep(retryDelay * 3);
        }
        continue;
      }

      if (response.status === 404) {
        console.log(`❌ 404 Not Found`);
        throw new Error(`404 Not Found (${url})`);
      }

      // Other non-200 status
      lastError = new Error(`HTTP ${response.status} (${url})`);

    } catch (error) {
      lastError = error;

      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        console.log(`⏱️  Timeout (attempt ${attempt})`);
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`🚫 Connection refused (attempt ${attempt})`);
      } else {
        console.log(`❌ Error: ${error.message} (attempt ${attempt})`);
      }

      // Don't retry on certain errors
      if (error.response?.status === 404) {
        throw error;
      }
    }
  }

  // All retries failed
  console.log(`❌ All ${maxRetries} attempts failed for: ${url.substring(0, 80)}...`);
  throw lastError || new Error(`Failed after ${maxRetries} attempts`);
};

/**
 * Sleep/delay function
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Add random delay between requests (anti-bot measure)
 * Simulates human browsing behavior
 */
export const randomDelay = async (min = 1000, max = 3000) => {
  const delay = min + Math.random() * (max - min);
  console.log(`⏳ Waiting ${(delay / 1000).toFixed(1)}s before next request...`);
  await sleep(delay);
};

/**
 * Extract price from various text formats
 * Handles: ₹1,299 / Rs 1299 / 1,299.00 / $12.99
 */
export const extractPrice = (priceText) => {
  if (!priceText) return null;

  // Remove currency symbols and whitespace
  const cleaned = priceText
    .replace(/[₹$Rs,\s]/g, '')
    .trim();

  // Extract first number (handles cases like "₹299 - ₹499")
  const match = cleaned.match(/[\d.]+/);
  if (!match) return null;

  const price = parseFloat(match[0]);
  return isNaN(price) ? null : Math.round(price);
};

/**
 * Extract rating from text
 * Handles: "4.5 out of 5" / "4.5 stars" / "4.5" / "★★★★☆"
 */
export const extractRating = (ratingText) => {
  if (!ratingText) return 4.0;

  // Extract first decimal number
  const match = ratingText.match(/[\d.]+/);
  if (!match) return 4.0;

  const rating = parseFloat(match[0]);
  return isNaN(rating) ? 4.0 : Math.min(Math.max(rating, 0), 5);
};

/**
 * Normalize URL (add domain if relative)
 */
export const normalizeUrl = (url, baseDomain) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) return `${baseDomain}${url}`;
  return `${baseDomain}/${url}`;
};

/**
 * Check if response is blocked/captcha page
 */
export const isBlocked = (html) => {
  const blockedKeywords = [
    'captcha',
    'security check',
    'access denied',
    'blocked',
    'robot',
    'automation',
    'unusual traffic',
    'verify you are human',
    'cloudflare',
    'ddos protection'
  ];

  const lowerHtml = html.toLowerCase();
  return blockedKeywords.some(keyword => lowerHtml.includes(keyword));
};

/**
 * Validate product data
 */
export const isValidProduct = (product) => {
  return !!(
    product &&
    product.name &&
    product.name.trim().length > 0 &&
    product.price &&
    product.price > 0 &&
    product.url &&
    product.url.length > 0
  );
};

/**
 * Clean product name
 * Remove extra whitespace, special characters
 */
export const cleanProductName = (name) => {
  return name
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\x20-\x7E]/g, '') // Remove non-ASCII characters
    .trim()
    .substring(0, 200); // Limit length
};

/**
 * Request queue to avoid overwhelming servers
 */
class RequestQueue {
  constructor(concurrency = 3, delayMs = 1000) {
    this.concurrency = concurrency;
    this.delayMs = delayMs;
    this.queue = [];
    this.running = 0;
    this.lastRequestTime = 0;
  }

  async add(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    // Ensure minimum delay between requests
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.delayMs) {
      await sleep(this.delayMs - timeSinceLastRequest);
    }

    this.running++;
    this.lastRequestTime = Date.now();

    const { fn, resolve, reject } = this.queue.shift();

    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process(); // Process next item
    }
  }
}

// Export singleton queue
export const requestQueue = new RequestQueue(2, 1500); // Max 2 concurrent, 1.5s delay

export default {
  getRandomUserAgent,
  getBrowserHeaders,
  makeRequest,
  sleep,
  randomDelay,
  extractPrice,
  extractRating,
  normalizeUrl,
  isBlocked,
  isValidProduct,
  cleanProductName,
  requestQueue
};
