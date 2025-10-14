/**
 * Script to update all product URLs with proper affiliate links
 * Run this script to automatically add affiliate tracking to all products
 */

import { products } from './products-data.js';
import affiliateUtils from './utils/affiliate-links.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Update all product links with affiliate parameters
 */
function updateProductAffiliateLinks() {
  console.log('🔄 Starting affiliate link update...');
  console.log(`📦 Total products to process: ${products.length}\n`);

  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  const updatedProducts = products.map((product, index) => {
    try {
      if (!product.prices || !Array.isArray(product.prices)) {
        console.warn(`⚠️  Product ${index + 1} (${product.name}) has no prices array`);
        skippedCount++;
        return product;
      }

      // Update each price URL with affiliate link
      const updatedPrices = product.prices.map(price => {
        if (!price.url) {
          console.warn(`⚠️  Missing URL for ${product.name} on ${price.platform}`);
          return price;
        }

        // Check if already has affiliate params
        if (affiliateUtils.hasAffiliateParams(price.url)) {
          console.log(`✓ Already has affiliate: ${product.name} - ${price.platform}`);
          skippedCount++;
          return price;
        }

        // Generate affiliate link
        const affiliateUrl = affiliateUtils.generateAffiliateLink(price.url, {
          trackingParams: {
            source: 'beautynomy',
            campaign: 'product_comparison',
            medium: 'web'
          }
        });

        if (affiliateUrl !== price.url) {
          console.log(`✓ Updated: ${product.name} - ${price.platform}`);
          updatedCount++;
        }

        return {
          ...price,
          url: affiliateUrl
        };
      });

      return {
        ...product,
        prices: updatedPrices
      };
    } catch (error) {
      console.error(`❌ Error processing product ${index + 1}:`, error.message);
      errorCount++;
      return product;
    }
  });

  console.log('\n📊 Update Summary:');
  console.log(`   ✓ Updated: ${updatedCount} links`);
  console.log(`   ⊝ Skipped: ${skippedCount} links (already have affiliate params)`);
  console.log(`   ✗ Errors: ${errorCount} products\n`);

  return updatedProducts;
}

/**
 * Generate the updated products-data.js file content
 */
function generateProductsFileContent(updatedProducts) {
  const header = `// Comprehensive Beauty Products Database
// Top 5 Indian E-commerce Platforms: Nykaa, Amazon India, Flipkart, Purplle, Myntra
// 204 Products across all Beauty Categories
// Note: Duplicates removed on 2025-10-11
// Affiliate links updated on ${new Date().toISOString().split('T')[0]}

export const products = `;

  const productsJson = JSON.stringify(updatedProducts, null, 2);
  return header + productsJson + ';\n';
}

/**
 * Save updated products to file
 */
function saveUpdatedProducts(updatedProducts) {
  try {
    const filePath = path.join(__dirname, 'products-data.js');
    const backupPath = path.join(__dirname, 'products-data-backup.js');

    // Create backup of original file
    if (fs.existsSync(filePath)) {
      console.log('📋 Creating backup of original file...');
      fs.copyFileSync(filePath, backupPath);
      console.log(`✓ Backup saved: ${backupPath}\n`);
    }

    // Write updated products
    console.log('💾 Saving updated products...');
    const fileContent = generateProductsFileContent(updatedProducts);
    fs.writeFileSync(filePath, fileContent, 'utf8');
    console.log(`✓ Products saved: ${filePath}\n`);

    return true;
  } catch (error) {
    console.error('❌ Error saving file:', error.message);
    return false;
  }
}

/**
 * Validate affiliate links
 */
function validateAffiliateLinks(products) {
  console.log('🔍 Validating affiliate links...\n');

  const stats = {
    total: 0,
    withAffiliateParams: 0,
    withoutAffiliateParams: 0,
    byPlatform: {
      Nykaa: { total: 0, withAffiliate: 0 },
      Amazon: { total: 0, withAffiliate: 0 },
      Flipkart: { total: 0, withAffiliate: 0 },
      Purplle: { total: 0, withAffiliate: 0 },
      Myntra: { total: 0, withAffiliate: 0 }
    }
  };

  products.forEach(product => {
    if (!product.prices) return;

    product.prices.forEach(price => {
      if (!price.url) return;

      stats.total++;

      const hasAffiliate = affiliateUtils.hasAffiliateParams(price.url);
      if (hasAffiliate) {
        stats.withAffiliateParams++;
      } else {
        stats.withoutAffiliateParams++;
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

  console.log('📊 Validation Results:');
  console.log(`   Total links: ${stats.total}`);
  console.log(`   ✓ With affiliate params: ${stats.withAffiliateParams}`);
  console.log(`   ✗ Without affiliate params: ${stats.withoutAffiliateParams}\n`);

  console.log('📊 By Platform:');
  Object.entries(stats.byPlatform).forEach(([platform, data]) => {
    const percentage = data.total > 0 ? ((data.withAffiliate / data.total) * 100).toFixed(1) : 0;
    console.log(`   ${platform}: ${data.withAffiliate}/${data.total} (${percentage}%)`);
  });

  return stats;
}

/**
 * Main execution
 */
function main() {
  console.log('═════════════════════════════════════════════════════════');
  console.log('   Beautynomy Affiliate Link Updater');
  console.log('═════════════════════════════════════════════════════════\n');

  // Validate current state
  console.log('📝 Current State:\n');
  validateAffiliateLinks(products);

  console.log('\n═════════════════════════════════════════════════════════\n');

  // Update affiliate links
  const updatedProducts = updateProductAffiliateLinks();

  console.log('═════════════════════════════════════════════════════════\n');

  // Save updated products
  const saved = saveUpdatedProducts(updatedProducts);

  if (saved) {
    console.log('═════════════════════════════════════════════════════════');
    console.log('   ✓ Affiliate links updated successfully!');
    console.log('═════════════════════════════════════════════════════════\n');

    // Validate updated state
    console.log('📝 Updated State:\n');
    validateAffiliateLinks(updatedProducts);

    console.log('\n✓ Done! All product links now include affiliate tracking.\n');
    console.log('💡 Note: Make sure to sign up for affiliate programs:');
    console.log('   - Flipkart: https://affiliate.flipkart.com/');
    console.log('   - Amazon: https://affiliate-program.amazon.in/');
    console.log('   - Nykaa: Check their affiliate program page');
    console.log('   - See FLIPKART-AFFILIATE-SETUP.md for detailed guide\n');
  } else {
    console.log('\n❌ Failed to save updated products.');
    console.log('   The original file remains unchanged.\n');
    process.exit(1);
  }
}

// Run the script
main();
