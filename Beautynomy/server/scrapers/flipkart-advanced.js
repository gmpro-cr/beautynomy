import { scrapeURL } from '../utils/advanced-scraper.js';
import { PLATFORM_CONFIGS } from '../config/scraping-config.js';

/**
 * Advanced Flipkart Scraper
 * Uses multiple strategies to bypass anti-bot protection
 */
const scrapeFlipkart = async (productName) => {
  try {
    const searchQuery = encodeURIComponent(`${productName} beauty`);
    const searchUrl = `${PLATFORM_CONFIGS.flipkart.baseUrl}/search?q=${searchQuery}&otracker=search&marketplace=FLIPKART`;

    console.log(`🔍 Flipkart Advanced Scraper: ${productName}`);

    // Try Puppeteer first (Flipkart heavily relies on JS)
    const products = await scrapeURL(
      searchUrl,
      'Flipkart',
      PLATFORM_CONFIGS.flipkart.selectors,
      {
        strategies: ['puppeteer', 'scraperapi'],
        maxProducts: 5,
        useProxy: true
      }
    );

    if (products.length > 0) {
      console.log(`✅ Flipkart: Found ${products.length} products`);
    } else {
      console.log(`⚠️  Flipkart: No products found`);
    }

    return products;

  } catch (error) {
    console.error('❌ Flipkart scraping error:', error.message);
    return [];
  }
};

export default scrapeFlipkart;
