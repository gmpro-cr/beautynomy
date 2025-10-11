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
  // FOUNDATIONS
  {
    name: "Lakme 9 to 5 Primer + Matte Powder Foundation Compact, Ivory Cream C130",
    brand: "LAKME",
    category: "Foundation",
    description: "Long-lasting matte finish foundation with built-in primer for flawless coverage",
    amazonUrl: "https://www.amazon.in/Lakme-Primer-Foundation-Compact-Natural/dp/B01B2WNFQO",
    price: 345,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400",
    rating: 4.1,
    reviews: 8542
  },
  {
    name: "L'Oreal Paris Infallible 24H Matte Cover Foundation, 120 Vanilla",
    brand: "L'OREAL PARIS",
    category: "Foundation",
    description: "Transfer-proof, full coverage foundation that lasts up to 24 hours",
    amazonUrl: "https://www.amazon.in/LOreal-Paris-Infallible-Foundation-Vanilla/dp/B07D75FK8T",
    price: 799,
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400",
    rating: 4.2,
    reviews: 5234
  },

  // KAJAL & EYE MAKEUP
  {
    name: "Maybelline New York Colossal Kajal, Black, 0.35g",
    brand: "MAYBELLINE",
    category: "Kajal",
    description: "Smudge-proof kajal with intense black color for dramatic eyes",
    amazonUrl: "https://www.amazon.in/Maybelline-Colossal-Kajal-Black-0-35g/dp/B00A3FD9KK",
    price: 155,
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400",
    rating: 4.3,
    reviews: 15234
  },
  {
    name: "Lakme Eyeconic Kajal, Deep Black, 0.35 g",
    brand: "LAKME",
    category: "Kajal",
    description: "Waterproof kajal that glides smoothly and stays put all day",
    amazonUrl: "https://www.amazon.in/Lakme-Eyeconic-Kajal-Black-35g/dp/B00N8KDZWI",
    price: 195,
    image: "https://images.unsplash.com/photo-1583241800666-7d1e6e7b94ca?w=400",
    rating: 4.4,
    reviews: 18923
  },
  {
    name: "Maybelline Hyper Curl Mascara Washable, Black, 9.2ml",
    brand: "MAYBELLINE",
    category: "Kajal",
    description: "Volumizing mascara that creates dramatic, curled lashes",
    amazonUrl: "https://www.amazon.in/Maybelline-Hypercurl-Mascara-Washable-Black/dp/B004OR1GWY",
    price: 299,
    image: "https://images.unsplash.com/photo-1631730486103-62459e518a9f?w=400",
    rating: 4.0,
    reviews: 7821
  },

  // LIPSTICKS
  {
    name: "SUGAR Cosmetics Smudge Me Not Liquid Lipstick - 01 Pink O' Clock",
    brand: "SUGAR",
    category: "Lipstick",
    description: "Transfer-proof liquid lipstick with matte finish that lasts up to 12 hours",
    amazonUrl: "https://www.amazon.in/SUGAR-Cosmetics-Smudge-Liquid-Lipstick/dp/B07BQSF7MS",
    price: 499,
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400",
    rating: 4.2,
    reviews: 6789
  },
  {
    name: "Maybelline SuperStay Matte Ink Liquid Lipstick, 15 Lover, 5ml",
    brand: "MAYBELLINE",
    category: "Lipstick",
    description: "Up to 16HR wear liquid matte lipstick with intense color payoff",
    amazonUrl: "https://www.amazon.in/Maybelline-SuperStay-Liquid-Lipstick-Lover/dp/B01MRYKM61",
    price: 599,
    image: "https://images.unsplash.com/photo-1571806509508-e1bb4e3a4f33?w=400",
    rating: 4.3,
    reviews: 9234
  },
  {
    name: "Lakme 9 to 5 Primer + Matte Lip Color, Ruby Rush M13, 3.6g",
    brand: "LAKME",
    category: "Lipstick",
    description: "Matte lip color with built-in primer for smooth, long-lasting wear",
    amazonUrl: "https://www.amazon.in/Lakme-Primer-Matte-Color-Rush/dp/B01AYCHGN8",
    price: 425,
    image: "https://images.unsplash.com/photo-1586495985969-98c2f2676e2d?w=400",
    rating: 4.1,
    reviews: 5632
  },

  // SKINCARE - CLEANSERS
  {
    name: "Cetaphil Gentle Skin Cleanser for Dry to Normal Sensitive Skin, 125ml",
    brand: "CETAPHIL",
    category: "Skincare",
    description: "Gentle, soap-free cleanser that hydrates and soothes sensitive skin",
    amazonUrl: "https://www.amazon.in/Cetaphil-Gentle-Cleanser-Sensitive-125ml/dp/B01M0F8FDL",
    price: 449,
    image: "https://images.unsplash.com/photo-1556228852-80a5c9e9e11c?w=400",
    rating: 4.5,
    reviews: 12456
  },
  {
    name: "Neutrogena Deep Clean Facial Cleanser, 50g",
    brand: "NEUTROGENA",
    category: "Skincare",
    description: "Deep cleansing face wash that removes dirt, oil and makeup",
    amazonUrl: "https://www.amazon.in/Neutrogena-Deep-Clean-Facial-Cleanser/dp/B00DTEUGJA",
    price: 199,
    image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=400",
    rating: 4.2,
    reviews: 8934
  },

  // SKINCARE - SERUMS
  {
    name: "Minimalist Vitamin C 10% Face Serum for Glowing Skin with Acetyl Glucosamine, 30ml",
    brand: "MINIMALIST",
    category: "Skincare",
    description: "Brightening serum with 10% pure Vitamin C and antioxidants for radiant skin",
    amazonUrl: "https://www.amazon.in/Minimalist-Vitamin-Glowing-Brightening-Reduction/dp/B08CHL14Y8",
    price: 699,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
    rating: 4.4,
    reviews: 23456
  },
  {
    name: "The Ordinary Niacinamide 10% + Zinc 1% Oil Control Serum, 30ml",
    brand: "THE ORDINARY",
    category: "Skincare",
    description: "High-strength vitamin and mineral serum that reduces blemishes and congestion",
    amazonUrl: "https://www.amazon.in/Ordinary-Niacinamide-Zinc-Oil-Serum/dp/B07KRRB8M5",
    price: 599,
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400",
    rating: 4.5,
    reviews: 19234
  },
  {
    name: "Plum 15% Vitamin C Face Serum with Mandarin, 30ml",
    brand: "PLUM",
    category: "Skincare",
    description: "Potent brightening serum that fades dark spots and boosts radiance",
    amazonUrl: "https://www.amazon.in/Plum-Vitamin-Serum-Mandarin-30ml/dp/B07VGJQ8P4",
    price: 795,
    image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400",
    rating: 4.3,
    reviews: 7654
  },

  // SUNSCREEN
  {
    name: "Neutrogena Ultra Sheer Dry-Touch Sunblock SPF 50+, 88ml",
    brand: "NEUTROGENA",
    category: "Sunscreen",
    description: "Non-greasy, water-resistant sunscreen with broad spectrum UVA/UVB protection",
    amazonUrl: "https://www.amazon.in/Neutrogena-Ultra-Dry-Touch-Sunblock-Avobenzone/dp/B01BU08UZU",
    price: 649,
    image: "https://images.unsplash.com/photo-1556228578-dd526cba4b4e?w=400",
    rating: 4.5,
    reviews: 18234
  },
  {
    name: "Re'equil Ultra Matte Dry Touch Sunscreen SPF 50 PA++++, 50g",
    brand: "RE'EQUIL",
    category: "Sunscreen",
    description: "Oil-free, mattifying sunscreen ideal for oily and acne-prone skin",
    amazonUrl: "https://www.amazon.in/Reequil-Ultra-Touch-Sunscreen-SPF50/dp/B07V2RYJHF",
    price: 599,
    image: "https://images.unsplash.com/photo-1617897903246-719242758050?w=400",
    rating: 4.4,
    reviews: 15678
  }
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
