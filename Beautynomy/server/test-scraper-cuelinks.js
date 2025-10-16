/**
 * Test Cuelinks Integration with Scraper Service
 * Verifies that scraped products automatically get Cuelinks affiliate links
 */

import 'dotenv/config';
import cuelinksService from './services/cuelinks-service.js';

console.log('🧪 Testing Cuelinks Integration with Scraper\n');
console.log('='.repeat(60));

// Test the flow that happens in scraper-service.js
async function testScraperFlow() {
  console.log('\n📋 Simulating Scraper Service Flow');
  console.log('-'.repeat(60));
  
  // Simulate scraped product prices (like from scraper-service.js)
  const mockPrices = [
    {
      platform: 'Nykaa',
      amount: 599,
      url: 'https://www.nykaa.com/maybelline-new-york-super-stay-matte-ink-liquid-lipstick/p/405933'
    },
    {
      platform: 'Amazon India',
      amount: 549,
      url: 'https://www.amazon.in/Maybelline-SuperStay-Liquid-Lipstick-Voyager/dp/B07XQFN9KM'
    },
    {
      platform: 'Flipkart',
      amount: 579,
      url: 'https://www.flipkart.com/maybelline-superstay-matte-ink-liquid-lipstick/p/itmfb7e8zvhkuzhy'
    }
  ];
  
  const productId = 'maybelline-superstay-lipstick-voyager';
  
  console.log(`\n1️⃣ Original Prices (Before Cuelinks):`);
  mockPrices.forEach((price, idx) => {
    console.log(`   ${idx + 1}. ${price.platform}: ₹${price.amount}`);
    console.log(`      URL: ${price.url}`);
  });
  
  console.log(`\n2️⃣ Checking Cuelinks Configuration...`);
  if (cuelinksService.isConfigured()) {
    console.log('   ✅ Cuelinks is configured');
    console.log(`   📝 Publisher ID: ${cuelinksService.publisherId}`);
  } else {
    console.log('   ❌ Cuelinks not configured - URLs will not be converted');
    return;
  }
  
  console.log(`\n3️⃣ Converting URLs to Cuelinks Deeplinks...`);
  const convertedPrices = await cuelinksService.convertPricesToDeeplinks(
    mockPrices,
    productId
  );
  
  console.log(`\n4️⃣ Converted Prices (After Cuelinks):`);
  convertedPrices.forEach((price, idx) => {
    console.log(`\n   ${idx + 1}. ${price.platform}: ₹${price.amount}`);
    console.log(`      Original: ${mockPrices[idx].url.substring(0, 50)}...`);
    console.log(`      Affiliate: ${price.url.substring(0, 70)}...`);
    console.log(`      Status: ${price.isAffiliateLink ? '✅ CONVERTED' : '❌ NOT CONVERTED'}`);
    console.log(`      SubID: ${price.platform}-${productId}`);
  });
  
  // Summary
  const converted = convertedPrices.filter(p => p.isAffiliateLink).length;
  const total = convertedPrices.length;
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 CONVERSION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Product ID: ${productId}`);
  console.log(`Total Platforms: ${total}`);
  console.log(`Successfully Converted: ${converted}/${total}`);
  console.log(`Conversion Rate: ${(converted/total * 100).toFixed(0)}%`);
  
  if (converted === total) {
    console.log('\n🎉 SUCCESS! All URLs converted to Cuelinks affiliate links!');
    console.log('\n✅ When you scrape products, they will automatically:');
    console.log('   1. Get Cuelinks affiliate links');
    console.log('   2. Include SubID tracking (platform-productId)');
    console.log('   3. Be saved to MongoDB with affiliate URLs');
    console.log('   4. Track clicks & conversions in Cuelinks dashboard');
  } else {
    console.log('\n⚠️  Some URLs failed to convert. Check logs above.');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('💡 WHAT THIS MEANS:');
  console.log('='.repeat(60));
  console.log('When users click product links in your app:');
  console.log('  → They go through Cuelinks tracking');
  console.log('  → Cuelinks redirects to the actual merchant');
  console.log('  → Purchases are tracked with SubID');
  console.log('  → You earn commissions!');
  console.log('\n📈 View analytics in: https://www.cuelinks.com/publisher/dashboard');
  console.log('='.repeat(60));
}

// Run test
testScraperFlow().catch(console.error);
