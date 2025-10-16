import { scrapeAllPlatforms, scrapePlatform } from '../scrapers/index.js';
import Product from '../models/Product.js';
import cuelinksService from './cuelinks-service.js';

/**
 * Scrape and update product prices from all platforms
 * @param {string} productName - Product search query
 * @returns {Promise<Object>} - Scraping results
 */
export const scrapeAndUpdateProduct = async (productName) => {
  console.log(`🔍 Starting scrape for: ${productName}`);

  try {
    // Scrape all platforms
    const scrapedResults = await scrapeAllPlatforms(productName);

    if (scrapedResults.length === 0) {
      return {
        success: false,
        message: 'No products found',
        productName
      };
    }

    // Group results by product (similar names)
    const groupedProducts = groupSimilarProducts(scrapedResults);

    // Update or create products in database
    const updatedProducts = [];
    for (const productGroup of groupedProducts) {
      const updatedProduct = await updateProductInDatabase(productGroup);
      if (updatedProduct) {
        updatedProducts.push(updatedProduct);
      }
    }

    return {
      success: true,
      message: `Found and updated ${updatedProducts.length} products`,
      products: updatedProducts,
      scrapedCount: scrapedResults.length
    };

  } catch (error) {
    console.error('Scraping service error:', error);
    return {
      success: false,
      message: error.message,
      productName
    };
  }
};

/**
 * Group similar products from different platforms
 * @param {Array} scrapedResults - Results from scrapers
 * @returns {Array} - Grouped products
 */
function groupSimilarProducts(scrapedResults) {
  const groups = [];

  for (const result of scrapedResults) {
    // Find existing group with similar name
    const existingGroup = groups.find(group =>
      areSimilarProducts(group[0].name, result.name)
    );

    if (existingGroup) {
      existingGroup.push(result);
    } else {
      groups.push([result]);
    }
  }

  return groups;
}

/**
 * Check if two product names are similar
 * @param {string} name1 - First product name
 * @param {string} name2 - Second product name
 * @returns {boolean} - True if similar
 */
function areSimilarProducts(name1, name2) {
  const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const n1 = normalize(name1);
  const n2 = normalize(name2);

  // Check if one name contains significant portion of the other
  const shorter = n1.length < n2.length ? n1 : n2;
  const longer = n1.length >= n2.length ? n1 : n2;

  // If shorter name is at least 70% contained in longer name
  return longer.includes(shorter.substring(0, Math.floor(shorter.length * 0.7)));
}

/**
 * Update or create product in database
 * @param {Array} productGroup - Group of similar products from different platforms
 * @returns {Promise<Object>} - Updated product
 */
async function updateProductInDatabase(productGroup) {
  try {
    // Use the first product as base
    const baseProduct = productGroup[0];

    // Extract brand from product name (usually first word or first few words)
    const brand = extractBrand(baseProduct.name);

    // Calculate average rating
    const avgRating = productGroup.reduce((sum, p) => sum + (p.rating || 0), 0) / productGroup.length;

    // Build prices array
    let prices = productGroup.map(p => ({
      platform: p.platform,
      amount: p.price,
      url: p.url
    }));

    // Convert URLs to Cuelinks deeplinks if configured
    if (cuelinksService.isConfigured()) {
      console.log('🔗 Converting URLs to Cuelinks deeplinks...');
      prices = await cuelinksService.convertPricesToDeeplinks(prices, productId);
    }

    // Find lowest price
    const lowestPrice = Math.min(...prices.map(p => p.amount));

    // Create product ID from normalized name
    const productId = normalizeProductName(baseProduct.name);

    // Check if product exists
    let product = await Product.findById(productId);

    if (product) {
      // Update existing product
      const oldLowestPrice = Math.min(...product.prices.map(p => p.amount));
      const priceChange = ((lowestPrice - oldLowestPrice) / oldLowestPrice * 100).toFixed(1);

      // Add to price history
      const avgPrice = prices.reduce((sum, p) => sum + p.amount, 0) / prices.length;
      product.priceHistory.push({
        date: new Date(),
        prices: prices.map(p => ({
          platform: p.platform,
          amount: p.amount
        })),
        lowestPrice: lowestPrice,
        averagePrice: avgPrice
      });

      // Keep only last 90 days of history (approximately)
      if (product.priceHistory.length > 90) {
        product.priceHistory = product.priceHistory.slice(-90);
      }

      product.prices = prices;
      product.rating = avgRating;
      product.priceChange = parseFloat(priceChange);
      product.image = baseProduct.image || product.image;

      await product.save();
      console.log(`✅ Updated product: ${product.name}`);
    } else {
      // Create new product
      const avgPrice = prices.reduce((sum, p) => sum + p.amount, 0) / prices.length;

      product = await Product.create({
        _id: productId,
        name: baseProduct.name,
        brand: brand,
        category: 'Skincare', // Default category, can be improved with ML/AI
        description: `${baseProduct.name} available on multiple platforms`,
        image: baseProduct.image || 'https://via.placeholder.com/300x300?text=No+Image',
        rating: avgRating,
        reviewCount: 0,
        priceChange: 0,
        prices: prices,
        priceHistory: [{
          date: new Date(),
          prices: prices.map(p => ({
            platform: p.platform,
            amount: p.amount
          })),
          lowestPrice: lowestPrice,
          averagePrice: avgPrice
        }]
      });
      console.log(`✅ Created new product: ${product.name}`);
    }

    return product;

  } catch (error) {
    console.error('Error updating product in database:', error);
    return null;
  }
}

/**
 * Extract brand name from product name
 * @param {string} productName - Full product name
 * @returns {string} - Extracted brand
 */
function extractBrand(productName) {
  // Common brand patterns
  const brands = [
    'NYKAA', 'LAKME', 'MAYBELLINE', 'LOREAL', 'MAC', 'HUDA', 'SUGAR',
    'PLUM', 'BIOTIQUE', 'HIMALAYA', 'NIVEA', 'GARNIER', 'POND', 'OLAY',
    'NEUTROGENA', 'CETAPHIL', 'DOVE', 'VASELINE', 'BOBBI BROWN', 'ESTEE LAUDER',
    'CLINIQUE', 'LANCOME', 'KIKO', 'NYX', 'URBAN DECAY', 'ANASTASIA',
    'FENTY', 'CHARLOTTE TILBURY', 'TOO FACED', 'TARTE'
  ];

  const upperName = productName.toUpperCase();

  for (const brand of brands) {
    if (upperName.includes(brand)) {
      return brand;
    }
  }

  // Default: use first word as brand
  const firstWord = productName.split(' ')[0].toUpperCase();
  return firstWord;
}

/**
 * Normalize product name for ID generation
 * @param {string} name - Product name
 * @returns {string} - Normalized ID
 */
function normalizeProductName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100); // Limit length
}

/**
 * Scrape multiple products in batch
 * @param {Array<string>} productNames - Array of product names to scrape
 * @returns {Promise<Array>} - Results for all products
 */
export const batchScrapeProducts = async (productNames) => {
  console.log(`📦 Starting batch scrape for ${productNames.length} products`);

  const results = [];

  // Process in batches of 3 to avoid overwhelming the scrapers
  const batchSize = 3;
  for (let i = 0; i < productNames.length; i += batchSize) {
    const batch = productNames.slice(i, i + batchSize);

    const batchResults = await Promise.allSettled(
      batch.map(name => scrapeAndUpdateProduct(name))
    );

    results.push(...batchResults.map((result, idx) => ({
      productName: batch[idx],
      success: result.status === 'fulfilled' && result.value.success,
      data: result.status === 'fulfilled' ? result.value : { error: result.reason }
    })));

    // Wait 2 seconds between batches to be respectful to servers
    if (i + batchSize < productNames.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return results;
};

export default {
  scrapeAndUpdateProduct,
  batchScrapeProducts
};
