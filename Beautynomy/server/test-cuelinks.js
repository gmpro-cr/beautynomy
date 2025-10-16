/**
 * Cuelinks Integration Test Script
 * Tests all Cuelinks functionality
 */

import 'dotenv/config';
import cuelinksService from './services/cuelinks-service.js';

const TEST_URLS = [
  'https://www.nykaa.com/maybelline-new-york-super-stay-matte-ink-liquid-lipstick/p/405933',
  'https://www.amazon.in/dp/B07XQFN9KM',
  'https://www.flipkart.com/maybelline-superstay-matte-ink-liquid-lipstick/p/itmfb7e8zvhkuzhy'
];

console.log('🧪 Cuelinks Integration Test Suite\n');
console.log('=' .repeat(60));

// Test 1: Configuration Check
async function testConfiguration() {
  console.log('\n📋 Test 1: Configuration Check');
  console.log('-'.repeat(60));
  
  const stats = cuelinksService.getStats();
  console.log('Configuration:', JSON.stringify(stats, null, 2));
  
  if (stats.configured) {
    console.log('✅ Cuelinks is properly configured');
    return true;
  } else {
    console.log('❌ Cuelinks is NOT configured');
    console.log('⚠️  Please set CUELINKS_API_KEY and CUELINKS_PUBLISHER_ID in .env');
    return false;
  }
}

// Test 2: Single Deeplink Generation
async function testSingleDeeplink() {
  console.log('\n🔗 Test 2: Single Deeplink Generation');
  console.log('-'.repeat(60));
  
  try {
    const testUrl = TEST_URLS[0];
    console.log(`Original URL: ${testUrl}`);
    
    const deeplink = await cuelinksService.generateDeeplink(testUrl, 'test-001');
    
    console.log(`Deeplink: ${deeplink}`);
    
    if (deeplink !== testUrl) {
      console.log('✅ Deeplink generated successfully');
      return true;
    } else {
      console.log('⚠️  Deeplink same as original (may indicate API issue)');
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

// Test 3: Bulk Deeplink Generation
async function testBulkDeeplinks() {
  console.log('\n📦 Test 3: Bulk Deeplink Generation');
  console.log('-'.repeat(60));
  
  try {
    const products = TEST_URLS.map((url, idx) => ({
      id: `product-${idx + 1}`,
      name: `Test Product ${idx + 1}`,
      url: url
    }));
    
    console.log(`Converting ${products.length} URLs...`);
    
    const converted = await cuelinksService.generateBulkDeeplinks(products, 'test-platform');
    
    console.log('\nResults:');
    converted.forEach((product, idx) => {
      console.log(`\n${idx + 1}. ${product.name}`);
      console.log(`   Original: ${product.originalUrl}`);
      console.log(`   Deeplink: ${product.url}`);
      console.log(`   Converted: ${product.isAffiliateLink ? '✅' : '❌'}`);
    });
    
    const successCount = converted.filter(p => p.isAffiliateLink).length;
    console.log(`\n✅ Successfully converted ${successCount}/${products.length} URLs`);
    
    return successCount > 0;
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

// Test 4: Price Array Conversion
async function testPriceConversion() {
  console.log('\n💰 Test 4: Price Array Conversion');
  console.log('-'.repeat(60));
  
  try {
    const prices = [
      { platform: 'Nykaa', amount: 599, url: TEST_URLS[0] },
      { platform: 'Amazon', amount: 549, url: TEST_URLS[1] },
      { platform: 'Flipkart', amount: 579, url: TEST_URLS[2] }
    ];
    
    console.log('Converting prices for product: test-lipstick-001');
    
    const converted = await cuelinksService.convertPricesToDeeplinks(prices, 'test-lipstick-001');
    
    console.log('\nResults:');
    converted.forEach((price, idx) => {
      console.log(`\n${idx + 1}. ${price.platform} - ₹${price.amount}`);
      console.log(`   URL: ${price.url}`);
      console.log(`   Affiliate: ${price.isAffiliateLink ? '✅' : '❌'}`);
    });
    
    const successCount = converted.filter(p => p.isAffiliateLink).length;
    console.log(`\n✅ Successfully converted ${successCount}/${prices.length} prices`);
    
    return successCount > 0;
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

// Test 5: Get Merchants
async function testGetMerchants() {
  console.log('\n🏪 Test 5: Get Merchants');
  console.log('-'.repeat(60));
  
  try {
    console.log('Fetching merchants from Cuelinks...');
    
    const merchants = await cuelinksService.getMerchants();
    
    if (merchants.length > 0) {
      console.log(`\n✅ Found ${merchants.length} merchants`);
      console.log('\nFirst 5 merchants:');
      merchants.slice(0, 5).forEach((merchant, idx) => {
        console.log(`${idx + 1}. ${merchant.name || merchant.advertiser_name || 'Unknown'}`);
      });
      return true;
    } else {
      console.log('⚠️  No merchants returned (may need account activation)');
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

// Test 6: Search Products
async function testSearchProducts() {
  console.log('\n🔍 Test 6: Search Products');
  console.log('-'.repeat(60));
  
  try {
    const searchQuery = 'lipstick';
    console.log(`Searching for: "${searchQuery}"`);
    
    const products = await cuelinksService.searchProducts(searchQuery);
    
    if (products.length > 0) {
      console.log(`\n✅ Found ${products.length} products`);
      console.log('\nFirst 3 results:');
      products.slice(0, 3).forEach((product, idx) => {
        console.log(`\n${idx + 1}. ${product.name}`);
        console.log(`   Merchant: ${product.merchant}`);
        console.log(`   Category: ${product.category}`);
        console.log(`   Discount: ${product.discount}`);
      });
      return true;
    } else {
      console.log('⚠️  No products found');
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  const results = {
    configuration: false,
    singleDeeplink: false,
    bulkDeeplinks: false,
    priceConversion: false,
    getMerchants: false,
    searchProducts: false
  };
  
  try {
    // Test 1: Configuration (required for other tests)
    results.configuration = await testConfiguration();
    
    if (!results.configuration) {
      console.log('\n⚠️  Skipping remaining tests (Cuelinks not configured)');
      console.log('\nTo configure Cuelinks:');
      console.log('1. Sign up at https://www.cuelinks.com');
      console.log('2. Get your API Key and Publisher ID');
      console.log('3. Add to server/.env:');
      console.log('   CUELINKS_API_KEY=your_api_key');
      console.log('   CUELINKS_PUBLISHER_ID=your_publisher_id');
      return;
    }
    
    // Test 2-6: Run if configured
    results.singleDeeplink = await testSingleDeeplink();
    results.bulkDeeplinks = await testBulkDeeplinks();
    results.priceConversion = await testPriceConversion();
    results.getMerchants = await testGetMerchants();
    results.searchProducts = await testSearchProducts();
    
  } catch (error) {
    console.error('\n❌ Test suite error:', error);
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const tests = Object.entries(results);
  const passed = tests.filter(([_, result]) => result).length;
  const total = tests.length;
  
  tests.forEach(([name, result]) => {
    const status = result ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${name}`);
  });
  
  console.log('\n' + '-'.repeat(60));
  console.log(`Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Cuelinks is ready to use.');
  } else if (passed > 0) {
    console.log('⚠️  Some tests failed. Check configuration and API limits.');
  } else {
    console.log('❌ All tests failed. Please check your Cuelinks credentials.');
  }
  
  console.log('='.repeat(60));
}

// Execute tests
runAllTests().catch(console.error);
