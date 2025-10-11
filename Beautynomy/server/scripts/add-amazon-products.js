/**
 * Quick Add Amazon Products to Database
 *
 * Simple script to add real Amazon products with affiliate tracking
 *
 * USAGE:
 * 1. Add Amazon product URLs to PRODUCTS array below
 * 2. Run: node scripts/add-amazon-products.js
 * 3. Copy the output and run in MongoDB
 */

import 'dotenv/config';
import { generateAffiliateLink } from '../utils/affiliate-link-generator.js';
import axios from 'axios';
import * as cheerio from 'cheerio';
import connectDB from '../config/database.js';
import Product from '../models/Product.js';

// ============================================================
// ADD YOUR AMAZON PRODUCTS HERE
// ============================================================

// ============================================================
// HOW TO ADD PRODUCTS:
// 1. Go to Amazon.in and search for a beauty product
// 2. Click on the product you want
// 3. Copy the URL from your browser's address bar
// 4. Paste it below in the format shown
// 5. The script will automatically scrape details and add your affiliate tag!
// ============================================================

const PRODUCTS = [
  // Example 1: Maybelline Foundation (You can keep or remove this)
  {
    url: "https://www.amazon.in/Maybelline-Matte-Poreless-Foundation-Natural/dp/B071VKJKVC",
    category: "Foundation",
    name: "",        // Leave empty - will auto-scrape
    brand: "",       // Leave empty - will auto-scrape
    price: 0,        // Leave 0 - will auto-scrape
    description: "", // Leave empty - will auto-scrape
    image: "",       // Leave empty - will auto-scrape
  },

  // ADD YOUR PRODUCTS HERE - Copy the template below for each product
  // Just change the URL and category, leave everything else empty!

  /*
  {
    url: "PASTE_AMAZON_URL_HERE",
    category: "Foundation", // or "Lipstick", "Kajal", "Serum", "Skincare", etc.
    name: "",
    brand: "",
    price: 0,
    description: "",
    image: "",
  },
  */
];

// ============================================================
// POPULAR PRODUCTS TO SEARCH FOR ON AMAZON.IN:
// - Maybelline Fit Me Foundation
// - Lakme 9 to 5 Foundation
// - Lakme Eyeconic Kajal
// - Maybelline Colossal Kajal
// - Sugar Smudge Me Not Lipstick
// - Maybelline SuperStay Matte Ink
// - Cetaphil Gentle Skin Cleanser
// - Neutrogena Deep Clean Face Wash
// - Minimalist Vitamin C Serum
// - Neutrogena Ultra Sheer Sunscreen
// ============================================================

// ============================================================
// DO NOT EDIT BELOW THIS LINE
// ============================================================

/**
 * Scrape product details from Amazon
 */
async function scrapeAmazonProduct(url) {
  try {
    console.log('   🔍 Scraping Amazon page...');

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);

    // Extract product name
    const name = $('#productTitle').text().trim() ||
                 $('.product-title-word-break').text().trim() ||
                 'Unknown Product';

    // Extract brand
    let brand = $('#bylineInfo').text().replace('Visit the', '').replace('Store', '').trim() ||
                $('.a-link-normal#bylineInfo').text().trim() ||
                'Unknown Brand';
    brand = brand.toUpperCase();

    // Extract price
    const priceWhole = $('.a-price-whole').first().text().replace(',', '');
    const priceOffscreen = $('.a-price .a-offscreen').first().text();
    let price = 0;
    if (priceWhole) {
      price = parseInt(priceWhole);
    } else if (priceOffscreen) {
      price = parseInt(priceOffscreen.replace(/[^0-9]/g, ''));
    }

    // Extract description
    const description = $('#feature-bullets .a-list-item').first().text().trim() ||
                       $('.a-spacing-mini .a-size-base').first().text().trim() ||
                       'No description available';

    // Extract image
    const image = $('#landingImage').attr('src') ||
                  $('.a-dynamic-image').first().attr('src') ||
                  '';

    // Extract rating
    const ratingText = $('.a-icon-star-small span').first().text() ||
                      $('.a-icon-alt').first().text();
    const rating = ratingText ? parseFloat(ratingText.match(/[\d.]+/)?.[0] || '4.0') : 4.0;

    // Extract review count
    const reviewText = $('#acrCustomerReviewText').text() || '0 ratings';
    const reviews = parseInt(reviewText.replace(/[^0-9]/g, '')) || 0;

    return {
      name: name.substring(0, 200),
      brand,
      price,
      description: description.substring(0, 500),
      image,
      rating: Math.min(rating, 5),
      reviews,
      scraped: true
    };

  } catch (error) {
    console.log('   ⚠️  Could not scrape (add manually):', error.message);
    return {
      scraped: false,
      error: error.message
    };
  }
}

/**
 * Generate next available product ID
 */
async function getNextProductId() {
  try {
    const lastProduct = await Product.findOne().sort({ _id: -1 }).limit(1);
    if (lastProduct && lastProduct._id) {
      const lastId = parseInt(lastProduct._id);
      return String(lastId + 1);
    }
    return '1';
  } catch (error) {
    // If error, start from a high number to avoid conflicts
    return String(Date.now());
  }
}

/**
 * Process all products
 */
async function processProducts() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║          Add Real Amazon Products - Quick Tool            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (PRODUCTS.length === 0) {
    console.log('⚠️  No products found!');
    console.log('\nPlease add Amazon product URLs to the PRODUCTS array in this file.\n');
    return;
  }

  console.log(`📦 Processing ${PRODUCTS.length} product(s)...\n`);
  console.log('─'.repeat(80));

  const results = [];
  let currentId = null;

  for (let i = 0; i < PRODUCTS.length; i++) {
    const productData = PRODUCTS[i];
    console.log(`\n[${i + 1}/${PRODUCTS.length}] Processing product...`);
    console.log(`   URL: ${productData.url}`);

    // Generate affiliate link
    const affiliateUrl = generateAffiliateLink(productData.url, 'Amazon');
    console.log(`   ✅ Affiliate tracking added (beautynomy25-21)`);

    // Try to scrape if data is missing
    let scrapedData = {};
    if (!productData.name || !productData.brand || productData.price === 0) {
      scrapedData = await scrapeAmazonProduct(productData.url);

      if (scrapedData.scraped) {
        console.log(`   ✅ Scraped: ${scrapedData.name.substring(0, 50)}...`);
        console.log(`   💰 Price: ₹${scrapedData.price}`);
      } else {
        console.log(`   ⚠️  Scraping failed - will use defaults or manual data`);
      }
    }

    // Get next ID for this product
    if (!currentId) {
      currentId = await getNextProductId();
    } else {
      currentId = String(parseInt(currentId) + 1);
    }

    // Merge manual data with scraped data
    const finalProduct = {
      _id: currentId,
      name: productData.name || scrapedData.name || 'Amazon Product',
      brand: (productData.brand || scrapedData.brand || 'AMAZON').toUpperCase(),
      category: productData.category || 'Beauty',
      description: productData.description || scrapedData.description || 'Premium beauty product available on Amazon',
      image: productData.image || scrapedData.image || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
      prices: [
        {
          platform: 'Amazon',
          amount: productData.price || scrapedData.price || 299,
          url: affiliateUrl
        }
      ],
      rating: scrapedData.rating || 4.0,
      reviewCount: scrapedData.reviews || 0,
      priceChange: 0,
      priceHistory: []
    };

    results.push(finalProduct);

    // Small delay to avoid rate limiting
    if (i < PRODUCTS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return results;
}

/**
 * Save to database
 */
async function saveToDatabase(products) {
  console.log('\n\n💾 Saving to MongoDB...\n');
  console.log('─'.repeat(80));

  try {
    await connectDB();

    let added = 0;
    let skipped = 0;

    for (const product of products) {
      try {
        // Check if product already exists (by name)
        const exists = await Product.findOne({ name: product.name });

        if (exists) {
          console.log(`⏭️  Skipped: ${product.name} (already exists)`);
          skipped++;
        } else {
          await Product.create(product);
          console.log(`✅ Added: ${product.name}`);
          added++;
        }
      } catch (error) {
        console.log(`❌ Error adding ${product.name}:`, error.message);
      }
    }

    console.log('\n' + '─'.repeat(80));
    console.log(`\n✅ Complete!`);
    console.log(`   Added: ${added}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${products.length}\n`);

  } catch (error) {
    console.error('Database error:', error.message);
  }
}

/**
 * Generate MongoDB commands (alternative to direct save)
 */
function generateMongoCommands(products) {
  console.log('\n\n📝 MongoDB Insert Commands:\n');
  console.log('─'.repeat(80));
  console.log('// Copy and paste into MongoDB shell if you prefer manual insert\n');

  products.forEach((product, index) => {
    console.log(`// Product ${index + 1}: ${product.name}`);
    console.log('db.products.insertOne(');
    console.log(JSON.stringify(product, null, 2));
    console.log(');\n');
  });
}

/**
 * Main execution
 */
async function main() {
  try {
    const products = await processProducts();

    if (!products || products.length === 0) {
      return;
    }

    // Show summary
    console.log('\n\n📊 Summary:\n');
    console.log('─'.repeat(80));
    products.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   Brand: ${p.brand}`);
      console.log(`   Price: ₹${p.prices[0].amount}`);
      console.log(`   Category: ${p.category}`);
      console.log(`   Affiliate URL: ${p.prices[0].url.substring(0, 60)}...`);
      console.log('');
    });

    // Ask user how to proceed
    console.log('─'.repeat(80));
    console.log('\n❓ What would you like to do?\n');
    console.log('1. Save directly to MongoDB (requires connection)');
    console.log('2. Show MongoDB insert commands (copy/paste)');
    console.log('3. Both\n');

    // For now, do both
    await saveToDatabase(products);
    // generateMongoCommands(products);

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
