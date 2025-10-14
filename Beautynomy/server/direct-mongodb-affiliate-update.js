/**
 * Direct MongoDB update for affiliate links
 * Uses MongoDB update operations instead of Mongoose save
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import affiliateUtils from './utils/affiliate-links.js';

dotenv.config();

async function updateAffiliateLinks() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    console.log('═════════════════════════════════════════════════════════');
    console.log('   Direct MongoDB Affiliate Links Update');
    console.log('═════════════════════════════════════════════════════════\n');

    await client.connect();
    console.log('✓ Connected to MongoDB\n');

    const db = client.db();
    const collection = db.collection('products');

    // Get all products
    const products = await collection.find({}).toArray();
    console.log(`📦 Found ${products.length} products\n`);

    console.log('🔄 Updating affiliate links...\n');

    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      if (!product.prices || !Array.isArray(product.prices)) {
        continue;
      }

      const updatedPrices = product.prices.map(price => {
        if (!price.url) return price;

        // Generate affiliate link
        const affiliateUrl = affiliateUtils.generateAffiliateLink(price.url, {
          trackingParams: {
            source: 'beautynomy',
            campaign: 'product_comparison',
            medium: 'web'
          }
        });

        if (affiliateUrl !== price.url) {
          console.log(`✓ ${product.brand} - ${price.platform}`);
          return { ...price, url: affiliateUrl };
        }

        return price;
      });

      // Update the product directly
      await collection.updateOne(
        { _id: product._id },
        { $set: { prices: updatedPrices } }
      );

      updatedCount++;
    }

    console.log(`\n📊 Updated ${updatedCount} products\n`);

    // Validate
    console.log('🔍 Validating affiliate links...\n');

    const allProducts = await collection.find({}).toArray();
    const stats = {
      totalLinks: 0,
      withAffiliateParams: 0,
      byPlatform: {}
    };

    allProducts.forEach(product => {
      if (!product.prices) return;

      product.prices.forEach(price => {
        if (!price.url) return;

        stats.totalLinks++;

        if (affiliateUtils.hasAffiliateParams(price.url)) {
          stats.withAffiliateParams++;
        }

        const platform = price.platform || 'Unknown';
        if (!stats.byPlatform[platform]) {
          stats.byPlatform[platform] = { total: 0, withAffiliate: 0 };
        }
        stats.byPlatform[platform].total++;
        if (affiliateUtils.hasAffiliateParams(price.url)) {
          stats.byPlatform[platform].withAffiliate++;
        }
      });
    });

    console.log('📊 Final Status:');
    console.log(`   Total links: ${stats.totalLinks}`);
    console.log(`   ✓ With affiliate params: ${stats.withAffiliateParams} (${((stats.withAffiliateParams/stats.totalLinks)*100).toFixed(1)}%)`);
    console.log(`   ✗ Without affiliate params: ${stats.totalLinks - stats.withAffiliateParams}\n`);

    console.log('📊 By Platform:');
    Object.entries(stats.byPlatform)
      .sort((a, b) => b[1].withAffiliate - a[1].withAffiliate)
      .forEach(([platform, data]) => {
        const percentage = data.total > 0 ? ((data.withAffiliate / data.total) * 100).toFixed(1) : 0;
        console.log(`   ${platform}: ${data.withAffiliate}/${data.total} (${percentage}%)`);
      });

    console.log('\n═════════════════════════════════════════════════════════');
    console.log('   ✓ Update completed successfully!');
    console.log('═════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('✓ MongoDB connection closed\n');
  }
}

updateAffiliateLinks();
