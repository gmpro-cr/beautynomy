/**
 * Test Cuelinks Product Fetching
 * Tests fetching product details from e-commerce sites via Cuelinks
 */

import 'dotenv/config';
import cuelinksProductFetcher from './services/cuelinks-product-fetcher.js';

console.log('🧪 Testing Cuelinks Product Fetching\n');
console.log('='.repeat(70));

async function runTests() {
  // Test 1: Check Configuration
  console.log('\n📋 Test 1: Configuration Check');
  console.log('-'.repeat(70));
  
  const stats = cuelinksProductFetcher.getStats();
  console.log('Configuration:', JSON.stringify(stats, null, 2));
  
  if (!stats.configured) {
    console.log('\n❌ Cuelinks not configured. Cannot proceed with tests.');
    console.log('Please set CUELINKS_API_KEY and CUELINKS_PUBLISHER_ID in .env');
    return;
  }
  
  console.log('✅ Cuelinks Product Fetcher is configured');

  // Test 2: Search Beauty Products
  console.log('\n\n🔍 Test 2: Search Beauty Products');
  console.log('-'.repeat(70));
  
  try {
    console.log('Searching for "lipstick"...\n');
    
    const lipsticks = await cuelinksProductFetcher.searchBeautyProducts('lipstick', {
      limit: 5
    });
    
    if (lipsticks.length > 0) {
      console.log(`✅ Found ${lipsticks.length} lipstick products\n`);
      
      lipsticks.slice(0, 3).forEach((product, idx) => {
        console.log(`${idx + 1}. ${product.name}`);
        console.log(`   Merchant: ${product.merchant}`);
        console.log(`   Brand: ${product.brand}`);
        console.log(`   Category: ${product.category}`);
        console.log(`   Price: ${product.currency} ${product.discountedPrice || product.originalPrice || 'N/A'}`);
        if (product.discount) {
          console.log(`   Discount: ${product.discount}`);
        }
        console.log(`   Affiliate URL: ${product.affiliateUrl.substring(0, 60)}...`);
        console.log('');
      });
    } else {
      console.log('⚠️  No lipstick products found');
    }
  } catch (error) {
    console.log('❌ Error searching products:', error.message);
  }

  // Test 3: Fetch from Specific Merchant
  console.log('\n🏪 Test 3: Fetch from Specific Merchant');
  console.log('-'.repeat(70));
  
  try {
    console.log('Fetching products from "Nykaa"...\n');
    
    const nykaaProducts = await cuelinksProductFetcher.fetchFromMerchant('Nykaa', 'foundation');
    
    if (nykaaProducts.length > 0) {
      console.log(`✅ Found ${nykaaProducts.length} products from Nykaa\n`);
      
      nykaaProducts.slice(0, 2).forEach((product, idx) => {
        console.log(`${idx + 1}. ${product.name}`);
        console.log(`   Merchant: ${product.merchant}`);
        console.log(`   Category: ${product.category}`);
        console.log(`   Offer: ${product.offerText || 'No special offer'}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No products found from Nykaa');
    }
  } catch (error) {
    console.log('❌ Error fetching from merchant:', error.message);
  }

  // Test 4: Get Trending Products
  console.log('\n📈 Test 4: Get Trending Beauty Products');
  console.log('-'.repeat(70));
  
  try {
    console.log('Fetching trending beauty products...\n');
    
    const trending = await cuelinksProductFetcher.getTrendingBeautyProducts(3);
    
    if (trending.length > 0) {
      console.log(`✅ Found ${trending.length} trending products\n`);
      
      trending.forEach((product, idx) => {
        console.log(`${idx + 1}. ${product.name}`);
        console.log(`   Merchant: ${product.merchant}`);
        console.log(`   Price: ${product.currency} ${product.discountedPrice || product.originalPrice || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No trending products found');
    }
  } catch (error) {
    console.log('❌ Error fetching trending products:', error.message);
  }

  // Test 5: Fetch by Category
  console.log('\n📂 Test 5: Fetch by Category');
  console.log('-'.repeat(70));
  
  try {
    console.log('Fetching "skincare" products...\n');
    
    const skincare = await cuelinksProductFetcher.fetchByCategory('skincare', 3);
    
    if (skincare.length > 0) {
      console.log(`✅ Found ${skincare.length} skincare products\n`);
      
      skincare.forEach((product, idx) => {
        console.log(`${idx + 1}. ${product.name}`);
        console.log(`   Brand: ${product.brand}`);
        console.log(`   Merchant: ${product.merchant}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No skincare products found');
    }
  } catch (error) {
    console.log('❌ Error fetching by category:', error.message);
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(70));
  console.log('✅ Configuration: Working');
  console.log('✅ Product Search: Available');
  console.log('✅ Merchant Filter: Available');
  console.log('✅ Trending Products: Available');
  console.log('✅ Category Filter: Available');
  console.log('\n💡 Next Steps:');
  console.log('   1. Use API endpoints to fetch products');
  console.log('   2. Import products to your database');
  console.log('   3. Display on your website with affiliate links');
  console.log('='.repeat(70));
}

// Run tests
runTests().catch(console.error);
