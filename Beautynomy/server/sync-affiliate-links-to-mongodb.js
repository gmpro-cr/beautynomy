/**
 * Sync affiliate links from products-data.js to MongoDB
 * Run this script to update all product URLs in MongoDB with affiliate tracking
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { products } from './products-data.js';
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
}, { collection: 'products' });

const Product = mongoose.model('Product', productSchema);

async function syncAffiliateLinks() {
  try {
    console.log('═════════════════════════════════════════════════════════');
    console.log('   MongoDB Affiliate Links Sync');
    console.log('═════════════════════════════════════════════════════════\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Get all products from MongoDB
    console.log('📦 Fetching products from MongoDB...');
    const mongoProducts = await Product.find({});
    console.log(`✓ Found ${mongoProducts.length} products in MongoDB\n`);

    console.log('🔄 Processing affiliate links...\n');

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Update each product
    for (const mongoProduct of mongoProducts) {
      try {
        // Find matching product in products-data.js by name and brand
        const dataProduct = products.find(p =>
          p.name === mongoProduct.name && p.brand === mongoProduct.brand
        );

        if (!dataProduct) {
          console.warn(`⚠️  No match found for: ${mongoProduct.name}`);
          skippedCount++;
          continue;
        }

        // Update prices with affiliate links
        let productUpdated = false;
        for (let i = 0; i < mongoProduct.prices.length; i++) {
          const mongoPrice = mongoProduct.prices[i];

          // Find matching platform in data product
          const dataPrice = dataProduct.prices?.find(p =>
            p.platform === mongoPrice.platform
          );

          if (dataPrice && dataPrice.url) {
            // Check if URLs are different
            if (mongoPrice.url !== dataPrice.url) {
              mongoProduct.prices[i].url = dataPrice.url;
              productUpdated = true;
              console.log(`✓ Updated: ${mongoProduct.name} - ${mongoPrice.platform}`);
            }
          }
        }

        if (productUpdated) {
          await mongoProduct.save();
          updatedCount++;
        } else {
          skippedCount++;
        }

      } catch (error) {
        console.error(`❌ Error updating ${mongoProduct.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Sync Summary:');
    console.log(`   ✓ Updated: ${updatedCount} products`);
    console.log(`   ⊝ Skipped: ${skippedCount} products`);
    console.log(`   ✗ Errors: ${errorCount} products\n`);

    // Validate affiliate links in MongoDB
    console.log('🔍 Validating affiliate links in MongoDB...\n');

    const allProducts = await Product.find({});
    const stats = {
      totalLinks: 0,
      withAffiliateParams: 0,
      byPlatform: {
        'Nykaa': { total: 0, withAffiliate: 0 },
        'Amazon': { total: 0, withAffiliate: 0 },
        'Amazon India': { total: 0, withAffiliate: 0 },
        'Flipkart': { total: 0, withAffiliate: 0 },
        'Purplle': { total: 0, withAffiliate: 0 },
        'Myntra': { total: 0, withAffiliate: 0 }
      }
    };

    allProducts.forEach(product => {
      if (!product.prices) return;

      product.prices.forEach(price => {
        if (!price.url) return;

        stats.totalLinks++;

        const hasAffiliate = affiliateUtils.hasAffiliateParams(price.url);
        if (hasAffiliate) {
          stats.withAffiliateParams++;
        }

        // Track by platform
        if (stats.byPlatform[price.platform]) {
          stats.byPlatform[price.platform].total++;
          if (hasAffiliate) {
            stats.byPlatform[price.platform].withAffiliate++;
          }
        }
      });
    });

    console.log('📊 MongoDB Affiliate Links Status:');
    console.log(`   Total links: ${stats.totalLinks}`);
    console.log(`   ✓ With affiliate params: ${stats.withAffiliateParams}`);
    console.log(`   ✗ Without affiliate params: ${stats.totalLinks - stats.withAffiliateParams}\n`);

    console.log('📊 By Platform:');
    Object.entries(stats.byPlatform).forEach(([platform, data]) => {
      const percentage = data.total > 0 ? ((data.withAffiliate / data.total) * 100).toFixed(1) : 0;
      console.log(`   ${platform}: ${data.withAffiliate}/${data.total} (${percentage}%)`);
    });

    console.log('\n═════════════════════════════════════════════════════════');
    console.log('   ✓ Sync completed successfully!');
    console.log('═════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('✓ MongoDB connection closed\n');
  }
}

// Run the sync
syncAffiliateLinks();
