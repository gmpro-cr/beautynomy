import cron from 'node-cron';
import Product from '../models/Product.js';
import { scrapeAndUpdateProduct } from '../services/scraper-service.js';

/**
 * Scheduled job to update product prices daily
 * Runs every day at 3 AM
 */
export const startPriceUpdateScheduler = () => {
  console.log('📅 Price update scheduler initialized');

  // Run every day at 3 AM
  // Cron format: minute hour day-of-month month day-of-week
  // '0 3 * * *' = At 3:00 AM every day
  cron.schedule('0 3 * * *', async () => {
    console.log('🔄 Starting scheduled price update...');
    await updateAllProductPrices();
  });

  // Also run every 6 hours as a backup
  // '0 */6 * * *' = Every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('🔄 Running 6-hourly price check...');
    await updateHighPriorityProducts();
  });

  console.log('✅ Scheduled jobs:');
  console.log('   - Daily full price update: 3:00 AM');
  console.log('   - High-priority updates: Every 6 hours');
};

/**
 * Update prices for all products in database
 */
async function updateAllProductPrices() {
  try {
    const products = await Product.find({}).select('name _id');
    console.log(`📊 Found ${products.length} products to update`);

    let successCount = 0;
    let failCount = 0;

    // Process in batches of 5 to avoid overwhelming the servers
    const batchSize = 5;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);

      const results = await Promise.allSettled(
        batch.map(product => scrapeAndUpdateProduct(product.name))
      );

      results.forEach((result, idx) => {
        if (result.status === 'fulfilled' && result.value.success) {
          successCount++;
          console.log(`✅ Updated: ${batch[idx].name}`);
        } else {
          failCount++;
          console.log(`❌ Failed: ${batch[idx].name}`);
        }
      });

      // Wait 3 seconds between batches
      if (i + batchSize < products.length) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    console.log(`✅ Price update complete: ${successCount} successful, ${failCount} failed`);
    return { successCount, failCount, total: products.length };

  } catch (error) {
    console.error('❌ Error in scheduled price update:', error);
    return { error: error.message };
  }
}

/**
 * Update only high-priority products (popular items, recent searches)
 */
async function updateHighPriorityProducts() {
  try {
    // Get products with highest ratings and review counts
    const highPriorityProducts = await Product.find({})
      .sort({ rating: -1, reviewCount: -1 })
      .limit(30)
      .select('name _id');

    console.log(`🔥 Updating ${highPriorityProducts.length} high-priority products`);

    let successCount = 0;
    let failCount = 0;

    // Process in batches of 3
    const batchSize = 3;
    for (let i = 0; i < highPriorityProducts.length; i += batchSize) {
      const batch = highPriorityProducts.slice(i, i + batchSize);

      const results = await Promise.allSettled(
        batch.map(product => scrapeAndUpdateProduct(product.name))
      );

      results.forEach((result, idx) => {
        if (result.status === 'fulfilled' && result.value.success) {
          successCount++;
        } else {
          failCount++;
        }
      });

      // Wait 2 seconds between batches
      if (i + batchSize < highPriorityProducts.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`✅ High-priority update: ${successCount} successful, ${failCount} failed`);
    return { successCount, failCount, total: highPriorityProducts.length };

  } catch (error) {
    console.error('❌ Error in high-priority update:', error);
    return { error: error.message };
  }
}

/**
 * Manual trigger for price updates (can be called via API)
 */
export const triggerManualUpdate = async (productIds = []) => {
  try {
    let products;

    if (productIds.length > 0) {
      // Update specific products
      products = await Product.find({ _id: { $in: productIds } }).select('name _id');
    } else {
      // Update all products
      products = await Product.find({}).select('name _id');
    }

    console.log(`🔄 Manual update triggered for ${products.length} products`);
    return await updateProducts(products);

  } catch (error) {
    console.error('Error in manual update:', error);
    throw error;
  }
};

/**
 * Helper function to update a list of products
 */
async function updateProducts(products) {
  let successCount = 0;
  let failCount = 0;

  const batchSize = 3;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);

    const results = await Promise.allSettled(
      batch.map(product => scrapeAndUpdateProduct(product.name))
    );

    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.success) {
        successCount++;
      } else {
        failCount++;
      }
    });

    if (i + batchSize < products.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return {
    success: true,
    successCount,
    failCount,
    total: products.length
  };
}

export default {
  startPriceUpdateScheduler,
  triggerManualUpdate
};
