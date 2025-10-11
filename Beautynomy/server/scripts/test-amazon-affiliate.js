/**
 * Test Amazon Affiliate Link Generator
 *
 * This demonstrates how your Amazon affiliate tracking works
 */

import { generateAffiliateLink, getConfigStatus } from '../utils/affiliate-link-generator.js';

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║       Amazon Affiliate Link Generator - Test               ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Check configuration
console.log('📋 Configuration Status:');
const config = getConfigStatus();
console.log(`   Amazon: ${config.amazon ? '✅ Enabled' : '❌ Disabled'}`);
console.log(`   Tag: beautynomy25-21\n`);

// Test URLs
const testProducts = [
  {
    name: "Maybelline Fit Me Foundation",
    url: "https://www.amazon.in/Maybelline-Matte-Poreless-Foundation-Natural/dp/B071VKJKVC"
  },
  {
    name: "Lakme Eyeconic Kajal",
    url: "https://www.amazon.in/Lakme-Eyeconic-Kajal-Black-35g/dp/B00N8KDZWI"
  },
  {
    name: "L'Oreal Paris Revitalift Serum",
    url: "https://www.amazon.in/LOreal-Paris-Revitalift-Serum-30ml/dp/B01M0E5JXQ"
  }
];

console.log('🔗 Testing Affiliate Link Generation:\n');
console.log('─'.repeat(80));

testProducts.forEach((product, index) => {
  console.log(`\n${index + 1}. ${product.name}`);
  console.log(`   Original URL:`);
  console.log(`   ${product.url}`);

  const affiliateUrl = generateAffiliateLink(product.url, 'Amazon');

  console.log(`\n   Affiliate URL:`);
  console.log(`   ${affiliateUrl}`);
  console.log(`\n   ✅ Amazon will track this as coming from beautynomy25-21`);
});

console.log('\n' + '─'.repeat(80));
console.log('\n✨ How to use these links:\n');
console.log('1. Copy any affiliate URL above');
console.log('2. Open it in your browser');
console.log('3. The URL will have ?tag=beautynomy25-21');
console.log('4. If someone buys, you earn commission!\n');

console.log('📊 Commission rates on Amazon:');
console.log('   • Beauty Products: 4-8%');
console.log('   • Luxury Beauty: 10%');
console.log('   • Cookie duration: 24 hours\n');

console.log('🎯 Next Steps:');
console.log('   1. Find real product URLs on Amazon');
console.log('   2. Run them through generateAffiliateLink()');
console.log('   3. Store in database');
console.log('   4. Start earning! 💰\n');
