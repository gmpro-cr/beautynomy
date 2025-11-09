import axios from 'axios';
import * as cheerio from 'cheerio';
import {
  getRealisticHeaders,
  getRandomProxy,
  SCRAPER_API_CONFIG,
  PUPPETEER_CONFIG,
  RETRY_CONFIG,
  randomDelay,
  getRetryDelay,
  ERROR_MESSAGES,
  isBlocked
} from '../config/scraping-config.js';

/**
 * Advanced Web Scraper
 * Supports multiple scraping strategies with automatic fallback
 */

class AdvancedScraper {
  constructor(platform) {
    this.platform = platform;
    this.puppeteerBrowser = null;
  }

  /**
   * Strategy 1: Basic Cheerio scraping with advanced headers
   */
  async scrapeWithCheerio(url, options = {}) {
    const maxRetries = options.maxRetries || RETRY_CONFIG.maxRetries;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`[Cheerio] Attempt ${attempt + 1}/${maxRetries} for ${this.platform}: ${url}`);

        // Add random delay before request (human-like behavior)
        if (attempt > 0) {
          const delay = getRetryDelay(attempt);
          console.log(`[Cheerio] Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const headers = getRealisticHeaders(url);
        const proxy = getRandomProxy();

        const config = {
          headers,
          timeout: 15000,
          validateStatus: (status) => status < 500 // Don't throw on 4xx errors
        };

        // Add proxy if available
        if (proxy && options.useProxy) {
          config.proxy = {
            protocol: 'http',
            host: proxy.split(':')[0],
            port: parseInt(proxy.split(':')[1])
          };
          console.log(`[Cheerio] Using proxy: ${proxy}`);
        }

        const response = await axios.get(url, config);

        // Check if blocked
        if (isBlocked(response.data, response.status)) {
          console.log(`[Cheerio] Blocked by ${this.platform} - Status: ${response.status}`);

          if (attempt === maxRetries - 1) {
            throw new Error(ERROR_MESSAGES.BLOCKED);
          }
          continue; // Retry
        }

        // Success
        const $ = cheerio.load(response.data);
        console.log(`[Cheerio] ✅ Successfully scraped ${this.platform}`);
        return $;

      } catch (error) {
        console.error(`[Cheerio] Attempt ${attempt + 1} failed:`, error.message);

        if (attempt === maxRetries - 1) {
          throw new Error(`Cheerio scraping failed after ${maxRetries} attempts: ${error.message}`);
        }
      }
    }
  }

  /**
   * Strategy 2: Puppeteer for JavaScript-heavy sites
   */
  async scrapeWithPuppeteer(url, options = {}) {
    let browser = null;
    let page = null;

    try {
      console.log(`[Puppeteer] Scraping ${this.platform}: ${url}`);

      // Dynamic import Puppeteer (only if available)
      let puppeteer;
      try {
        puppeteer = await import('puppeteer');
      } catch (err) {
        console.log('[Puppeteer] Not available - install with: npm install puppeteer');
        throw new Error('Puppeteer not installed');
      }

      // Launch browser
      browser = await puppeteer.launch(PUPPETEER_CONFIG);
      page = await browser.newPage();

      // Set realistic headers and user agent
      const headers = getRealisticHeaders(url);
      await page.setExtraHTTPHeaders(headers);
      await page.setUserAgent(headers['User-Agent']);

      // Set viewport
      await page.setViewport(PUPPETEER_CONFIG.defaultViewport);

      // Navigate to page
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for content to load
      await randomDelay(2000, 4000);

      // Get HTML content
      const html = await page.content();

      // Check if blocked
      if (isBlocked(html, 200)) {
        console.log(`[Puppeteer] Blocked by ${this.platform}`);
        throw new Error(ERROR_MESSAGES.BLOCKED);
      }

      // Load into Cheerio for parsing
      const $ = cheerio.load(html);
      console.log(`[Puppeteer] ✅ Successfully scraped ${this.platform}`);

      return $;

    } catch (error) {
      console.error(`[Puppeteer] Error:`, error.message);
      throw error;
    } finally {
      // Clean up
      if (page) await page.close().catch(() => {});
      if (browser) await browser.close().catch(() => {});
    }
  }

  /**
   * Strategy 3: ScraperAPI (paid service)
   * Handles anti-bot, CAPTCHA, and provides residential IPs
   */
  async scrapeWithScraperAPI(url, options = {}) {
    if (!SCRAPER_API_CONFIG.enabled) {
      throw new Error('ScraperAPI not configured. Set SCRAPER_API_KEY environment variable.');
    }

    try {
      console.log(`[ScraperAPI] Scraping ${this.platform}: ${url}`);

      const params = {
        api_key: SCRAPER_API_CONFIG.apiKey,
        url: encodeURIComponent(url),
        ...SCRAPER_API_CONFIG.params
      };

      const scraperUrl = `${SCRAPER_API_CONFIG.baseUrl}?${new URLSearchParams(params)}`;

      const response = await axios.get(scraperUrl, {
        timeout: 60000 // ScraperAPI can be slower
      });

      const $ = cheerio.load(response.data);
      console.log(`[ScraperAPI] ✅ Successfully scraped ${this.platform}`);

      return $;

    } catch (error) {
      console.error(`[ScraperAPI] Error:`, error.message);
      throw new Error(`ScraperAPI failed: ${error.message}`);
    }
  }

  /**
   * Main scraping method with automatic strategy selection and fallback
   */
  async scrape(url, options = {}) {
    const strategies = options.strategies || ['cheerio', 'puppeteer', 'scraperapi'];
    const errors = [];

    for (const strategy of strategies) {
      try {
        switch (strategy) {
          case 'cheerio':
            return await this.scrapeWithCheerio(url, options);

          case 'puppeteer':
            return await this.scrapeWithPuppeteer(url, options);

          case 'scraperapi':
            return await this.scrapeWithScraperAPI(url, options);

          default:
            console.warn(`Unknown strategy: ${strategy}`);
            continue;
        }
      } catch (error) {
        console.error(`[${strategy}] Failed for ${this.platform}:`, error.message);
        errors.push({ strategy, error: error.message });

        // Continue to next strategy
        continue;
      }
    }

    // All strategies failed
    console.error(`[AdvancedScraper] All strategies failed for ${this.platform}`);
    throw new Error(
      `All scraping strategies failed for ${this.platform}. Errors: ${JSON.stringify(errors)}`
    );
  }

  /**
   * Parse products from loaded Cheerio object
   */
  parseProducts($, selectors, platformName, maxProducts = 5) {
    const products = [];

    try {
      const containers = $(selectors.productContainer);
      console.log(`[Parser] Found ${containers.length} product containers`);

      containers.slice(0, maxProducts).each((i, element) => {
        try {
          const $el = $(element);

          // Extract product data
          const name = $el.find(selectors.name).first().text().trim();
          const priceText = $el.find(selectors.price).first().text().trim();
          const link = $el.find(selectors.link).first().attr('href');
          const image = $el.find(selectors.image).first().attr('src');

          // Parse price
          const price = parseInt(priceText.replace(/[^0-9]/g, ''));

          // Validate required fields
          if (name && price && link) {
            products.push({
              platform: platformName,
              name: name.substring(0, 200),
              price: price,
              url: link.startsWith('http') ? link : `https://${this.platform}.com${link}`,
              image: image || `https://via.placeholder.com/300x300?text=${platformName}`,
              rating: 4.0,
              availability: true
            });
          }
        } catch (err) {
          console.error(`[Parser] Error parsing product ${i}:`, err.message);
        }
      });

      console.log(`[Parser] Successfully parsed ${products.length} products from ${platformName}`);
      return products;

    } catch (error) {
      console.error(`[Parser] Error parsing products:`, error.message);
      return [];
    }
  }
}

/**
 * Factory function to create scraper instance
 */
export const createScraper = (platform) => {
  return new AdvancedScraper(platform);
};

/**
 * Scrape with automatic retry and fallback
 */
export const scrapeURL = async (url, platform, selectors, options = {}) => {
  const scraper = createScraper(platform);

  try {
    const $ = await scraper.scrape(url, options);
    return scraper.parseProducts($, selectors, platform, options.maxProducts || 5);
  } catch (error) {
    console.error(`[scrapeURL] Failed to scrape ${platform}:`, error.message);
    return [];
  }
};

export default {
  createScraper,
  scrapeURL,
  AdvancedScraper
};
