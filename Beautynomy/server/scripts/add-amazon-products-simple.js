/**
 * Simple Amazon Product Adder - Manual Entry
 *
 * Since Amazon blocks scrapers, this script lets you manually enter
 * product details and automatically adds your affiliate tracking.
 *
 * USAGE:
 * 1. Find product on Amazon India
 * 2. Copy the details below
 * 3. Run: node scripts/add-amazon-products-simple.js
 */

import 'dotenv/config';
import { generateAffiliateLink } from '../utils/affiliate-link-generator.js';
import connectDB from '../config/database.js';
import Product from '../models/Product.js';

// ============================================================
// ADD YOUR PRODUCTS HERE - Just fill in the details!
// ============================================================

const PRODUCTS = [
  {
    name: "Maybelline New York Fit Me Matte + Poreless Foundation, 220 Natural Beige",
    brand: "MAYBELLINE",
    category: "Foundation",
    description: "Lightweight foundation that refines pores and controls shine for a natural, seamless finish",
    amazonUrl: "https://www.amazon.in/Maybelline-Matte-Poreless-Foundation-Natural/dp/B071VKJKVC",
    price: 399,
    image: "https://images.unsplash.com/photo-1631214524020-7e18db3a8b39?w=400",
    rating: 4.3,
    reviews: 12847
  },

  // ADD MORE PRODUCTS HERE - Just copy the template above
  /*
  {
    name: "Product Full Name from Amazon",
    brand: "BRAND NAME",
    category: "Foundation", // or "Lipstick", "Kajal", "Serum", "Skincare", etc.
    description: "Copy from Amazon product description",
    amazonUrl: "https://www.amazon.in/product-url",
    price: 0,  // Price in rupees
    image: "https://images.unsplash.com/photo-...",  // Or leave as placeholder
    rating: 4.0,
    reviews: 0
  },
  */
];

/**
 * Get next available product ID
 */
async function getNextProductId() {
  try {
    // Get all products and find max ID
    const products = await Product.find({}, { _id: 1 });

    if (products.length === 0) {
      return '1';
    }

    // Convert IDs to numbers, find max, add 1
    const maxId = Math.max(...products.map(p => parseInt(p._id) || 0));
    return String(maxId + 1);
  } catch (error) {
    console.log('   ⚠️  Could not determine last ID, using safe ID: 1000');
    return '1000';
  }
}

/**
 * Process and add products
 */
async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║       Add Amazon Products - Simple Manual Entry           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (PRODUCTS.length === 0) {
    console.log('⚠️  No products to add!\n');
    console.log('Please add product details to the PRODUCTS array in this file.\n');
    return;
  }

  try {
    // Connect to database
    console.log('🔌 Connecting to MongoDB...\n');
    await connectDB();
    console.log('✅ Connected!\n');
    console.log('─'.repeat(80));

    let added = 0;
    let skipped = 0;
    let errors = 0;

    // Get starting ID
    let currentId = await getNextProductId();

    for (let i = 0; i < PRODUCTS.length; i++) {
      const prod = PRODUCTS[i];
      console.log(`\n[${i + 1}/${PRODUCTS.length}] ${prod.name}`);
      console.log('─'.repeat(80));

      // Check if already exists
      const exists = await Product.findOne({ name: prod.name });
      if (exists) {
        console.log('⏭️  Skipped: Product already exists in database');
        skipped++;
        continue;
      }

      // Generate affiliate URL
      const affiliateUrl = generateAffiliateLink(prod.amazonUrl, 'Amazon');
      console.log(`✅ Affiliate link: ${affiliateUrl.substring(0, 60)}...`);

      // Create product document
      const product = {
        _id: currentId,
        name: prod.name,
        brand: prod.brand.toUpperCase(),
        category: prod.category,
        description: prod.description,
        image: prod.image || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
        prices: [
          {
            platform: 'Amazon',
            amount: prod.price,
            url: affiliateUrl
          }
        ],
        rating: prod.rating || 4.0,
        reviewCount: prod.reviews || 0,
        priceChange: 0,
        priceHistory: []
      };

      try {
        await Product.create(product);
        console.log(`✅ Added successfully! (ID: ${currentId})`);
        console.log(`   💰 Price: ₹${prod.price}`);
        console.log(`   ⭐ Rating: ${prod.rating} (${prod.reviews} reviews)`);
        added++;

        // Increment ID for next product
        currentId = String(parseInt(currentId) + 1);
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        errors++;
      }
    }

    console.log('\n' + '─'.repeat(80));
    console.log('\n📊 Summary:');
    console.log(`   ✅ Added: ${added}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📦 Total processed: ${PRODUCTS.length}\n`);

    if (added > 0) {
      console.log('🎉 Success! Check your website to see the new products!');
      console.log('🔗 Your affiliate links are ready and will track commissions.\n');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

// Run it!
main();
