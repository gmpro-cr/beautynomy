// Enhanced scrapers with anti-bot measures
import scrapeNykaa from './nykaa-enhanced.js';
import scrapeAmazon from './amazon.js'; // Amazon already works well
import scrapeFlipkart from './flipkart-enhanced.js';
import scrapePurplle from './purplle-enhanced.js';
import scrapeTira from './tira-enhanced.js';
import scrapeSephora from './sephora-enhanced.js';

/**
 * Scrape product prices from all platforms
 * @param {string} productName - Product search query
 * @returns {Promise<Array>} - Array of products from all platforms
 */
export const scrapeAllPlatforms = async (productName) => {
  console.log(`🔍 Scraping prices for: ${productName}`);

  try {
    // Run all 6 scrapers in parallel for speed
    const [nykaaResults, amazonResults, flipkartResults, purplleResults, tiraResults, sephoraResults] = await Promise.allSettled([
      scrapeNykaa(productName),
      scrapeAmazon(productName),
      scrapeFlipkart(productName),
      scrapePurplle(productName),
      scrapeTira(productName),
      scrapeSephora(productName)
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

    // Process Purplle results
    if (purplleResults.status === 'fulfilled') {
      allResults.push(...purplleResults.value);
      console.log(`✅ Purplle: Found ${purplleResults.value.length} products`);
    } else {
      console.log(`❌ Purplle: ${purplleResults.reason}`);
    }

    // Process Tira results
    if (tiraResults.status === 'fulfilled') {
      allResults.push(...tiraResults.value);
      console.log(`✅ Tira: Found ${tiraResults.value.length} products`);
    } else {
      console.log(`❌ Tira: ${tiraResults.reason}`);
    }

    // Process Sephora results
    if (sephoraResults.status === 'fulfilled') {
      allResults.push(...sephoraResults.value);
      console.log(`✅ Sephora: Found ${sephoraResults.value.length} products`);
    } else {
      console.log(`❌ Sephora: ${sephoraResults.reason}`);
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
 * @param {string} platform - Platform name (nykaa, amazon, flipkart, purplle, tira, sephora)
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
    case 'purplle':
      return await scrapePurplle(productName);
    case 'tira':
      return await scrapeTira(productName);
    case 'sephora':
      return await scrapeSephora(productName);
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
};

export default {
  scrapeAllPlatforms,
  scrapePlatform
};
