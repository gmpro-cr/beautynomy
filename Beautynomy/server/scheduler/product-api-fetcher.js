import cron from 'node-cron';
import platformAPIService from '../services/platform-api-service.js';

/**
 * Automated Product Fetching via Platform API
 * Runs scheduled jobs to fetch new products from e-commerce platforms
 */

// Popular beauty product categories to fetch daily
const PRODUCT_CATEGORIES = [
  'lakme lipstick',
  'maybelline foundation',
  'loreal shampoo',
  'nykaa face wash',
  'plum serum',
  'sugar lipstick',
  'minimalist serum',
  'neutrogena sunscreen',
  'himalaya face cream',
  'biotique hair oil'
];

/**
 * Fetch products for a specific query
 * @param {string} query - Product search query
 */
async function fetchProductsForQuery(query) {
  try {
    console.log(`📡 Auto-fetching: ${query}`);

    const result = await platformAPIService.fetchFromAllPlatforms(query, {
      limit: 30
    });

    if (result.success) {
      console.log(`✅ Fetched ${result.products.length} products for "${query}" from ${result.platformCount} platforms`);
      return {
        success: true,
        query: query,
        count: result.products.length,
        platforms: result.platformCount
      };
    } else {
      console.log(`⚠️  No products found for "${query}"`);
      return {
        success: false,
        query: query,
        message: result.message
      };
    }

  } catch (error) {
    console.error(`❌ Error fetching "${query}":`, error.message);
    return {
      success: false,
      query: query,
      error: error.message
    };
  }
}

/**
 * Fetch products for all categories
 */
async function fetchAllCategories() {
  console.log('🚀 Starting automated product fetch...');
  console.log(`📊 Categories to fetch: ${PRODUCT_CATEGORIES.length}`);

  const results = [];

  for (const category of PRODUCT_CATEGORIES) {
    const result = await fetchProductsForQuery(category);
    results.push(result);

    // Wait 5 seconds between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  const successCount = results.filter(r => r.success).length;
  const totalProducts = results.reduce((sum, r) => sum + (r.count || 0), 0);

  console.log(`\n✅ Automated fetch complete!`);
  console.log(`   Success: ${successCount}/${PRODUCT_CATEGORIES.length} categories`);
  console.log(`   Total products: ${totalProducts}`);
  console.log(`   Time: ${new Date().toLocaleString()}\n`);

  return {
    totalCategories: PRODUCT_CATEGORIES.length,
    successCount: successCount,
    totalProducts: totalProducts,
    results: results
  };
}

/**
 * Schedule daily product updates
 * Runs every day at 3:00 AM IST
 */
export function startDailyProductFetching() {
  // Run every day at 3:00 AM (IST)
  // Cron format: minute hour day month weekday
  // '0 3 * * *' = 3:00 AM every day

  const schedule = '0 3 * * *';

  const job = cron.schedule(schedule, async () => {
    console.log('\n⏰ Daily product fetch triggered');
    await fetchAllCategories();
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });

  console.log('⏰ Daily product fetching scheduler started (3:00 AM IST)');

  return job;
}

/**
 * Schedule weekly comprehensive update
 * Runs every Sunday at 2:00 AM IST
 */
export function startWeeklyProductFetching() {
  // Run every Sunday at 2:00 AM
  // '0 2 * * 0' = 2:00 AM every Sunday

  const schedule = '0 2 * * 0';

  const job = cron.schedule(schedule, async () => {
    console.log('\n📅 Weekly comprehensive product fetch triggered');

    // Fetch more categories for weekly update
    const extendedCategories = [
      ...PRODUCT_CATEGORIES,
      'huda beauty palette',
      'charlotte tilbury foundation',
      'too faced primer',
      'urban decay eyeshadow',
      'mac lipstick',
      'estee lauder serum',
      'clinique moisturizer',
      'bobbi brown foundation',
      'lancome mascara',
      'fenty beauty highlighter'
    ];

    for (const category of extendedCategories) {
      await fetchProductsForQuery(category);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    console.log('✅ Weekly comprehensive fetch complete\n');
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });

  console.log('📅 Weekly product fetching scheduler started (Sundays 2:00 AM IST)');

  return job;
}

/**
 * Trigger manual product fetch
 * @param {Array<string>} categories - Optional array of categories to fetch
 */
export async function triggerManualFetch(categories = null) {
  console.log('🔄 Manual product fetch triggered');

  const categoriesToFetch = categories || PRODUCT_CATEGORIES;

  const results = [];
  for (const category of categoriesToFetch) {
    const result = await fetchProductsForQuery(category);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  return {
    success: true,
    categoriesProcessed: categoriesToFetch.length,
    results: results
  };
}

export default {
  startDailyProductFetching,
  startWeeklyProductFetching,
  triggerManualFetch,
  fetchAllCategories
};
