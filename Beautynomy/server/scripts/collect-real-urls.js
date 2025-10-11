/**
 * Real Product URL Collector
 *
 * This script helps you organize and validate real product URLs
 * before adding them to your database.
 *
 * USAGE:
 * 1. Manually collect URLs from e-commerce sites
 * 2. Add them to the REAL_PRODUCTS array below
 * 3. Run: node scripts/collect-real-urls.js
 * 4. Script will validate and format them for database import
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

// Add your collected URLs here
// Template: Copy and fill this for each product
const REAL_PRODUCTS = [
  {
    name: "Maybelline Fit Me Matte+Poreless Foundation - Natural Beige 220",
    brand: "MAYBELLINE",
    category: "Foundation",
    description: "Lightweight foundation that matches skin tone and texture. Refines pores and controls shine.",
    urls: {
      amazon: "https://www.amazon.in/Maybelline-Matte-Poreless-Foundation-Natural/dp/B071VKJKVC",
      flipkart: "https://www.flipkart.com/maybelline-fit-me-matte-poreless-liquid-tube-foundation/p/itm123456",
      nykaa: "https://www.nykaa.com/maybelline-new-york-fit-me-matte-poreless-foundation/p/231482",
      purplle: "https://www.purplle.com/product/maybelline-fit-me-foundation",
      myntra: "https://www.myntra.com/foundation/maybelline/product-id"
    },
    image: "https://m.media-amazon.com/images/I/51xyz.jpg" // Amazon image URL
  },

  // Add more products here as you collect them
  /*
  {
    name: "Lakme 9 to 5 Naturale Foundation",
    brand: "LAKME",
    category: "Foundation",
    description: "All-day matte foundation with SPF 20",
    urls: {
      amazon: "",
      flipkart: "",
      nykaa: "",
      purplle: "",
      myntra: ""
    },
    image: ""
  }
  */
];

/**
 * Validate if URL is accessible and returns 200 status
 */
async function validateURL(url, platform) {
  if (!url || url === '') {
    return { valid: false, reason: 'Empty URL' };
  }

  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    if (response.status === 200) {
      return { valid: true, status: response.status };
    } else {
      return { valid: false, reason: `HTTP ${response.status}` };
    }
  } catch (error) {
    return {
      valid: false,
      reason: error.response ? `HTTP ${error.response.status}` : error.message
    };
  }
}

/**
 * Try to scrape price from URL (if accessible)
 */
async function scrapePrice(url, platform) {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    let price = null;

    // Platform-specific price selectors
    if (platform === 'amazon') {
      const priceText = $('.a-price-whole').first().text() ||
                       $('.a-price .a-offscreen').first().text();
      price = parseInt(priceText.replace(/[^0-9]/g, ''));
    } else if (platform === 'flipkart') {
      const priceText = $('._30jeq3').first().text();
      price = parseInt(priceText.replace(/[^0-9]/g, ''));
    } else if (platform === 'nykaa') {
      const priceText = $('.css-111z9ua').first().text();
      price = parseInt(priceText.replace(/[^0-9]/g, ''));
    }

    return price;
  } catch (error) {
    return null;
  }
}

/**
 * Process and validate all products
 */
async function processProducts() {
  console.log('\n🔍 Processing Real Product URLs...\n');
  console.log(`Total products to process: ${REAL_PRODUCTS.length}\n`);

  const results = [];

  for (let i = 0; i < REAL_PRODUCTS.length; i++) {
    const product = REAL_PRODUCTS[i];
    console.log(`\n[${i + 1}/${REAL_PRODUCTS.length}] Processing: ${product.name}`);
    console.log('─'.repeat(80));

    const productResult = {
      ...product,
      prices: [],
      validation: {}
    };

    // Process each platform URL
    for (const [platform, url] of Object.entries(product.urls)) {
      if (!url || url === '') {
        console.log(`  ${platform.padEnd(12)}: ⚠️  No URL provided`);
        productResult.validation[platform] = { valid: false, reason: 'No URL' };
        continue;
      }

      console.log(`  ${platform.padEnd(12)}: Checking...`);

      // Validate URL
      const validation = await validateURL(url, platform);
      productResult.validation[platform] = validation;

      if (validation.valid) {
        console.log(`  ${platform.padEnd(12)}: ✅ Valid`);

        // Try to scrape price
        console.log(`  ${platform.padEnd(12)}: 💰 Fetching price...`);
        const price = await scrapePrice(url, platform);

        productResult.prices.push({
          platform: platform.charAt(0).toUpperCase() + platform.slice(1),
          amount: price || 0, // 0 if couldn't scrape
          url: url,
          rating: 4.0, // Default - update manually
          reviews: 0    // Default - update manually
        });

        if (price) {
          console.log(`  ${platform.padEnd(12)}: 💰 Price: ₹${price}`);
        } else {
          console.log(`  ${platform.padEnd(12)}: ⚠️  Could not fetch price`);
        }
      } else {
        console.log(`  ${platform.padEnd(12)}: ❌ ${validation.reason}`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    results.push(productResult);
  }

  return results;
}

/**
 * Generate MongoDB insert commands
 */
function generateMongoCommands(results) {
  console.log('\n\n📝 MongoDB Insert Commands:\n');
  console.log('─'.repeat(80));
  console.log('// Copy and paste this into your MongoDB shell or import script\n');

  results.forEach((product, index) => {
    if (product.prices.length > 0) {
      console.log(`// Product ${index + 1}: ${product.name}`);
      console.log('db.products.insertOne(');
      console.log(JSON.stringify({
        name: product.name,
        brand: product.brand,
        category: product.category,
        description: product.description,
        image: product.image,
        prices: product.prices,
        rating: 4.0,
        reviewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }, null, 2));
      console.log(');\n');
    }
  });
}

/**
 * Generate summary report
 */
function generateSummary(results) {
  console.log('\n\n📊 Summary Report:\n');
  console.log('─'.repeat(80));

  let totalProducts = results.length;
  let productsWithUrls = results.filter(p => p.prices.length > 0).length;
  let totalUrls = results.reduce((sum, p) => sum + p.prices.length, 0);
  let urlsWithPrices = results.reduce((sum, p) =>
    sum + p.prices.filter(pr => pr.amount > 0).length, 0
  );

  console.log(`Total Products:           ${totalProducts}`);
  console.log(`Products with URLs:       ${productsWithUrls}`);
  console.log(`Total Valid URLs:         ${totalUrls}`);
  console.log(`URLs with scraped prices: ${urlsWithPrices}`);
  console.log(`\nSuccess Rate:             ${((productsWithUrls / totalProducts) * 100).toFixed(1)}%`);

  // Platform breakdown
  console.log('\n📊 By Platform:');
  const platforms = ['amazon', 'flipkart', 'nykaa', 'purplle', 'myntra'];
  platforms.forEach(platform => {
    const count = results.reduce((sum, p) => {
      const hasUrl = p.validation[platform]?.valid;
      return sum + (hasUrl ? 1 : 0);
    }, 0);
    console.log(`  ${platform.padEnd(12)}: ${count} products`);
  });

  console.log('\n');
}

/**
 * Main execution
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        Real Product URL Collector & Validator              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  if (REAL_PRODUCTS.length === 0) {
    console.log('\n⚠️  No products found!');
    console.log('\nPlease add product URLs to the REAL_PRODUCTS array in this file.');
    console.log('See the template at the top of the file.\n');
    return;
  }

  try {
    const results = await processProducts();
    generateSummary(results);
    generateMongoCommands(results);

    console.log('\n✅ Done! You can now:');
    console.log('  1. Copy the MongoDB commands above');
    console.log('  2. Run them in your MongoDB shell');
    console.log('  3. Or save to a file and import\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

// Run the script
main();
