import cuelinksProductFetcher from './cuelinks-product-fetcher.js';
import Product from '../models/Product.js';
import cuelinksService from './cuelinks-service.js';

/**
 * Platform API Service
 * Fetches products from e-commerce platforms via Cuelinks API
 * This is an alternative to scraping that uses official Cuelinks APIs
 */

// Merchant mappings for different platforms
const MERCHANT_MAPPINGS = {
  nykaa: ['Nykaa', 'NYKAA', 'nykaa'],
  amazon: ['Amazon', 'Amazon.in', 'Amazon India', 'AMAZON'],
  flipkart: ['Flipkart', 'FLIPKART', 'flipkart'],
  myntra: ['Myntra', 'MYNTRA', 'myntra'],
  purplle: ['Purplle', 'PURPLLE', 'purplle'],
  tira: ['Tira', 'TIRA', 'tira', 'Tira Beauty'],
  sephora: ['Sephora', 'SEPHORA', 'sephora', 'Sephora India']
};

/**
 * Fetch products from all platforms via Cuelinks API
 * @param {string} productName - Product search query
 * @param {Object} options - Additional options
 * @returns {Promise<Array>} - Products from all platforms
 */
export const fetchFromAllPlatforms = async (productName, options = {}) => {
  console.log(`🔍 Fetching products via Cuelinks API: ${productName}`);

  if (!cuelinksProductFetcher.isConfigured()) {
    console.warn('⚠️  Cuelinks not configured. Cannot fetch from API.');
    return {
      success: false,
      message: 'Cuelinks API not configured',
      products: []
    };
  }

  try {
    // Search for beauty products across all merchants
    const offers = await cuelinksProductFetcher.searchBeautyProducts(productName, {
      limit: options.limit || 50
    });

    if (offers.length === 0) {
      return {
        success: false,
        message: 'No products found',
        products: []
      };
    }

    // Group offers by platform
    const platformGroups = groupOffersByPlatform(offers);

    // Convert to product format and save to database
    const products = await processAndSaveProducts(platformGroups, productName);

    console.log(`✅ Found ${products.length} products via Cuelinks API`);

    return {
      success: true,
      message: `Found ${products.length} products from ${Object.keys(platformGroups).length} platforms`,
      products: products,
      platformCount: Object.keys(platformGroups).length
    };

  } catch (error) {
    console.error('Error fetching from Cuelinks API:', error);
    return {
      success: false,
      message: error.message,
      products: []
    };
  }
};

/**
 * Fetch products from a specific platform
 * @param {string} platform - Platform name (nykaa, amazon, flipkart, etc.)
 * @param {string} productName - Product search query
 * @returns {Promise<Array>} - Products from the platform
 */
export const fetchFromPlatform = async (platform, productName) => {
  console.log(`🏪 Fetching from ${platform} via Cuelinks API`);

  if (!cuelinksProductFetcher.isConfigured()) {
    console.warn('⚠️  Cuelinks not configured');
    return [];
  }

  try {
    const merchantNames = MERCHANT_MAPPINGS[platform.toLowerCase()] || [platform];
    const allOffers = [];

    // Try all merchant name variations
    for (const merchantName of merchantNames) {
      try {
        const offers = await cuelinksProductFetcher.fetchFromMerchant(merchantName, productName);
        if (offers && offers.length > 0) {
          allOffers.push(...offers);
          console.log(`✅ Found ${offers.length} offers from ${merchantName}`);
          break; // Stop if we found offers
        }
      } catch (error) {
        console.log(`  Could not fetch from ${merchantName}: ${error.message}`);
      }
    }

    return allOffers;

  } catch (error) {
    console.error(`Error fetching from ${platform}:`, error);
    return [];
  }
};

/**
 * Group offers by platform/merchant
 * @param {Array} offers - Cuelinks offers
 * @returns {Object} - Offers grouped by platform
 */
function groupOffersByPlatform(offers) {
  const groups = {};

  for (const offer of offers) {
    const platform = normalizePlatformName(offer.merchant);

    if (!groups[platform]) {
      groups[platform] = [];
    }

    groups[platform].push(offer);
  }

  return groups;
}

/**
 * Normalize platform/merchant name
 * @param {string} merchantName - Merchant name from Cuelinks
 * @returns {string} - Normalized platform name
 */
function normalizePlatformName(merchantName) {
  const lowerName = merchantName.toLowerCase();

  // Check each platform mapping
  for (const [platform, variations] of Object.entries(MERCHANT_MAPPINGS)) {
    for (const variation of variations) {
      if (lowerName.includes(variation.toLowerCase())) {
        // Return capitalized platform name
        return platform.charAt(0).toUpperCase() + platform.slice(1);
      }
    }
  }

  // Default: capitalize first letter
  return merchantName.charAt(0).toUpperCase() + merchantName.slice(1);
}

/**
 * Process offers and save as products
 * @param {Object} platformGroups - Offers grouped by platform
 * @param {string} searchQuery - Original search query
 * @returns {Promise<Array>} - Saved products
 */
async function processAndSaveProducts(platformGroups, searchQuery) {
  const savedProducts = [];

  // Group similar products across platforms
  const productGroups = groupSimilarOffers(platformGroups);

  for (const group of productGroups) {
    try {
      const product = await createOrUpdateProduct(group, searchQuery);
      if (product) {
        savedProducts.push(product);
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  }

  return savedProducts;
}

/**
 * Group similar offers across platforms
 * @param {Object} platformGroups - Offers grouped by platform
 * @returns {Array} - Groups of similar offers
 */
function groupSimilarOffers(platformGroups) {
  const allOffers = [];

  // Flatten all offers with platform info
  for (const [platform, offers] of Object.entries(platformGroups)) {
    for (const offer of offers) {
      allOffers.push({
        ...offer,
        platform: platform
      });
    }
  }

  // Group by similarity
  const groups = [];

  for (const offer of allOffers) {
    const existingGroup = groups.find(g =>
      areSimilarProducts(g[0].name, offer.name)
    );

    if (existingGroup) {
      existingGroup.push(offer);
    } else {
      groups.push([offer]);
    }
  }

  return groups;
}

/**
 * Check if two product names are similar
 * @param {string} name1 - First name
 * @param {string} name2 - Second name
 * @returns {boolean} - True if similar
 */
function areSimilarProducts(name1, name2) {
  const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const n1 = normalize(name1);
  const n2 = normalize(name2);

  const shorter = n1.length < n2.length ? n1 : n2;
  const longer = n1.length >= n2.length ? n1 : n2;

  // If 70% of shorter name is in longer name
  return longer.includes(shorter.substring(0, Math.floor(shorter.length * 0.7)));
}

/**
 * Create or update product in database
 * @param {Array} offerGroup - Group of similar offers
 * @param {string} searchQuery - Search query for fallback
 * @returns {Promise<Object>} - Product
 */
async function createOrUpdateProduct(offerGroup, searchQuery) {
  try {
    const baseOffer = offerGroup[0];

    // Extract brand
    const brand = extractBrand(baseOffer.name);

    // Build prices array with Cuelinks deeplinks (already included in offers)
    const prices = offerGroup.map(offer => {
      // Try multiple price fields from Cuelinks API response
      const price = offer.discountedPrice || offer.originalPrice || offer.price || offer.sale_price || offer.mrp || 0;

      return {
        platform: offer.platform,
        amount: parseFloat(price) || 0,
        url: offer.affiliateUrl || offer.url || offer.deeplink || offer.productUrl, // Cuelinks affiliate URL
        rating: offer.rating || 0,
        reviews: offer.reviews || offer.reviewCount || 0
      };
    }).filter(p => p.amount > 0);

    if (prices.length === 0) {
      console.warn('No valid prices found for product');
      return null;
    }

    // Find lowest price
    const lowestPrice = Math.min(...prices.map(p => p.amount));
    const avgPrice = prices.reduce((sum, p) => sum + p.amount, 0) / prices.length;

    // Create product ID
    const productId = normalizeProductName(baseOffer.name);

    // Check if product exists
    let product = await Product.findById(productId);

    if (product) {
      // Update existing product
      const oldLowestPrice = Math.min(...product.prices.map(p => p.amount));
      const priceChange = ((lowestPrice - oldLowestPrice) / oldLowestPrice * 100).toFixed(1);

      product.prices = prices;
      product.priceChange = parseFloat(priceChange);
      product.image = baseOffer.image || baseOffer.imageUrl || baseOffer.thumbnail || product.image;

      // Add to price history
      product.priceHistory.push({
        date: new Date(),
        prices: prices.map(p => ({ platform: p.platform, amount: p.amount })),
        lowestPrice: lowestPrice,
        averagePrice: avgPrice
      });

      // Keep last 90 entries
      if (product.priceHistory.length > 90) {
        product.priceHistory = product.priceHistory.slice(-90);
      }

      await product.save();
      console.log(`✅ Updated product: ${product.name}`);

    } else {
      // Create new product
      product = await Product.create({
        _id: productId,
        name: baseOffer.name,
        brand: brand,
        category: baseOffer.category || 'Beauty',
        description: baseOffer.description || `${baseOffer.name} available on multiple platforms`,
        image: baseOffer.image || baseOffer.imageUrl || baseOffer.thumbnail || 'https://via.placeholder.com/300x300?text=No+Image',
        rating: baseOffer.rating || 0,
        reviewCount: baseOffer.reviews || baseOffer.reviewCount || 0,
        priceChange: 0,
        prices: prices,
        priceHistory: [{
          date: new Date(),
          prices: prices.map(p => ({ platform: p.platform, amount: p.amount })),
          lowestPrice: lowestPrice,
          averagePrice: avgPrice
        }]
      });
      console.log(`✅ Created new product: ${product.name}`);
    }

    return product;

  } catch (error) {
    console.error('Error creating/updating product:', error);
    return null;
  }
}

/**
 * Extract brand from product name
 * @param {string} productName - Product name
 * @returns {string} - Brand name
 */
function extractBrand(productName) {
  const brands = [
    'NYKAA', 'LAKME', 'MAYBELLINE', 'LOREAL', 'L\'OREAL', 'MAC', 'HUDA', 'SUGAR',
    'PLUM', 'BIOTIQUE', 'HIMALAYA', 'NIVEA', 'GARNIER', 'POND', 'PONDS', 'OLAY',
    'NEUTROGENA', 'CETAPHIL', 'DOVE', 'VASELINE', 'BOBBI BROWN', 'ESTEE LAUDER',
    'CLINIQUE', 'LANCOME', 'KIKO', 'NYX', 'URBAN DECAY', 'ANASTASIA',
    'FENTY', 'CHARLOTTE TILBURY', 'TOO FACED', 'TARTE', 'BENEFIT',
    'THE ORDINARY', 'MINIMALIST', 'WOW', 'MAMAEARTH', 'KHADI', 'FOREST ESSENTIALS'
  ];

  const upperName = productName.toUpperCase();

  for (const brand of brands) {
    if (upperName.includes(brand)) {
      return brand;
    }
  }

  // Default: first word
  return productName.split(' ')[0].toUpperCase();
}

/**
 * Normalize product name for ID
 * @param {string} name - Product name
 * @returns {string} - Normalized ID
 */
function normalizeProductName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

/**
 * Get statistics about API fetching
 * @returns {Object} - Statistics
 */
export async function getAPIStats() {
  try {
    const stats = {
      configured: cuelinksProductFetcher.isConfigured(),
      supportedPlatforms: Object.keys(MERCHANT_MAPPINGS),
      platformCount: Object.keys(MERCHANT_MAPPINGS).length
    };

    return stats;
  } catch (error) {
    console.error('Error getting API stats:', error);
    return { error: error.message };
  }
}

export default {
  fetchFromAllPlatforms,
  fetchFromPlatform,
  getAPIStats
};
