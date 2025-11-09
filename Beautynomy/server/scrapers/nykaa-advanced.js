import { scrapeURL } from '../utils/advanced-scraper.js';
import { PLATFORM_CONFIGS } from '../config/scraping-config.js';

/**
 * Advanced Nykaa Scraper
 * Uses multiple strategies to bypass anti-bot protection
 */
const scrapeNykaa = async (productName) => {
  try {
    const searchQuery = encodeURIComponent(`${productName} beauty makeup`);
    const searchUrl = `${PLATFORM_CONFIGS.nykaa.baseUrl}/search/result/?q=${searchQuery}`;

    console.log(`🔍 Nykaa Advanced Scraper: ${productName}`);

    // Try multiple strategies in order: Puppeteer → ScraperAPI → Cheerio
    const products = await scrapeURL(
      searchUrl,
      'Nykaa',
      PLATFORM_CONFIGS.nykaa.selectors,
      {
        strategies: ['puppeteer', 'scraperapi', 'cheerio'],
        maxProducts: 5,
        useProxy: true
      }
    );

    if (products.length > 0) {
      console.log(`✅ Nykaa: Found ${products.length} products`);
    } else {
      console.log(`⚠️  Nykaa: No products found`);
    }

    return products;

  } catch (error) {
    console.error('❌ Nykaa scraping error:', error.message);
    return [];
  }
};

export default scrapeNykaa;
