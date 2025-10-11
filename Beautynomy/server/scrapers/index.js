import scrapeNykaa from './nykaa.js';
import scrapeAmazon from './amazon.js';
import scrapeFlipkart from './flipkart.js';

/**
 * Scrape product prices from all platforms
 * @param {string} productName - Product search query
 * @returns {Promise<Array>} - Array of products from all platforms
 */
export const scrapeAllPlatforms = async (productName) => {
  console.log(`🔍 Scraping prices for: ${productName}`);

  try {
    // Run all scrapers in parallel for speed
    const [nykaaResults, amazonResults, flipkartResults] = await Promise.allSettled([
      scrapeNykaa(productName),
      scrapeAmazon(productName),
      scrapeFlipkart(productName)
    ]);

    const allResults = [];

    // Process Nykaa results
    if (nykaaResults.status === 'fulfilled') {
      allResults.push(...nykaaResults.value);
      console.log(`✅ Nykaa: Found ${nykaaResults.value.length} products`);
    } else {
      console.log(`❌ Nykaa: ${nykaaResults.reason}`);
    }

    // Process Amazon results
    if (amazonResults.status === 'fulfilled') {
      allResults.push(...amazonResults.value);
      console.log(`✅ Amazon: Found ${amazonResults.value.length} products`);
    } else {
      console.log(`❌ Amazon: ${amazonResults.reason}`);
    }

    // Process Flipkart results
    if (flipkartResults.status === 'fulfilled') {
      allResults.push(...flipkartResults.value);
      console.log(`✅ Flipkart: Found ${flipkartResults.value.length} products`);
    } else {
      console.log(`❌ Flipkart: ${flipkartResults.reason}`);
    }

    console.log(`📊 Total products found: ${allResults.length}`);
    return allResults;

  } catch (error) {
    console.error('Scraping error:', error);
    return [];
  }
};

/**
 * Scrape specific platform
 * @param {string} platform - Platform name (nykaa, amazon, flipkart)
 * @param {string} productName - Product search query
 * @returns {Promise<Array>} - Array of products from the platform
 */
export const scrapePlatform = async (platform, productName) => {
  const platformLower = platform.toLowerCase();

  switch (platformLower) {
    case 'nykaa':
      return await scrapeNykaa(productName);
    case 'amazon':
      return await scrapeAmazon(productName);
    case 'flipkart':
      return await scrapeFlipkart(productName);
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
};

export default {
  scrapeAllPlatforms,
  scrapePlatform
};
