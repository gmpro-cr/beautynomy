/**
 * Apply affiliate links directly to MongoDB products
 * This updates existing URLs by adding affiliate parameters
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import affiliateUtils from './utils/affiliate-links.js';

dotenv.config();

// MongoDB Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  brand: String,
  category: String,
  description: String,
  image: String,
  rating: Number,
  reviewCount: Number,
  priceChange: Number,
  prices: [{
    platform: String,
    amount: Number,
    url: String
  }]
}, { collection: 'products', strict: false });

const Product = mongoose.model('Product', productSchema);

async function applyAffiliateLinks() {
  try {
    console.log('═════════════════════════════════════════════════════════');
    console.log('   Apply Affiliate Links to MongoDB');
    console.log('═════════════════════════════════════════════════════════\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Get all products
    console.log('📦 Fetching products from MongoDB...');
    const products = await Product.find({});
    console.log(`✓ Found ${products.length} products\n`);

    console.log('🔄 Applying affiliate links...\n');

    let updatedProductCount = 0;
    let updatedLinkCount = 0;
    let skippedLinkCount = 0;
    let errorCount = 0;

    // Update each product
    for (const product of products) {
      try {
        if (!product.prices || !Array.isArray(product.prices)) {
          continue;
        }

        let productModified = false;

        for (let i = 0; i < product.prices.length; i++) {
          const price = product.prices[i];

          if (!price.url) {
            continue;
          }

          // Check if already has affiliate params
          if (affiliateUtils.hasAffiliateParams(price.url)) {
            skippedLinkCount++;
            continue;
          }

          // Generate affiliate link
          const affiliateUrl = affiliateUtils.generateAffiliateLink(price.url, {
            trackingParams: {
              source: 'beautynomy',
              campaign: 'product_comparison',
              medium: 'web'
            }
          });

          // Update if changed
          if (affiliateUrl !== price.url) {
            product.prices[i].url = affiliateUrl;
            productModified = true;
            updatedLinkCount++;
            console.log(`✓ ${product.brand} - ${price.platform}`);
          } else {
            skippedLinkCount++;
          }
        }

        // Save if modified
        if (productModified) {
          await product.save();
          updatedProductCount++;
        }

      } catch (error) {
        console.error(`❌ Error: ${product.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Update Summary:');
    console.log(`   ✓ Products updated: ${updatedProductCount}`);
    console.log(`   ✓ Links updated: ${updatedLinkCount}`);
    console.log(`   ⊝ Links skipped: ${skippedLinkCount}`);
    console.log(`   ✗ Errors: ${errorCount}\n`);

    // Validate
    console.log('🔍 Validating affiliate links...\n');

    const allProducts = await Product.find({});
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

        // Track by platform
        if (!stats.byPlatform[price.platform]) {
          stats.byPlatform[price.platform] = { total: 0, withAffiliate: 0 };
        }
        stats.byPlatform[price.platform].total++;
        if (affiliateUtils.hasAffiliateParams(price.url)) {
          stats.byPlatform[price.platform].withAffiliate++;
        }
      });
    });

    console.log('📊 Final Status:');
    console.log(`   Total links: ${stats.totalLinks}`);
    console.log(`   ✓ With affiliate params: ${stats.withAffiliateParams} (${((stats.withAffiliateParams/stats.totalLinks)*100).toFixed(1)}%)`);
    console.log(`   ✗ Without affiliate params: ${stats.totalLinks - stats.withAffiliateParams}\n`);

    console.log('📊 By Platform:');
    Object.entries(stats.byPlatform).forEach(([platform, data]) => {
      const percentage = data.total > 0 ? ((data.withAffiliate / data.total) * 100).toFixed(1) : 0;
      console.log(`   ${platform}: ${data.withAffiliate}/${data.total} (${percentage}%)`);
    });

    console.log('\n═════════════════════════════════════════════════════════');
    console.log('   ✓ Affiliate links applied successfully!');
    console.log('═════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('✓ MongoDB connection closed\n');
  }
}

// Run
applyAffiliateLinks();
