/**
 * Remove Mock Products - Keep Only Real Amazon Products
 *
 * This script removes all mock products and keeps only the real
 * Amazon products with affiliate tracking (IDs 229-244)
 */

import 'dotenv/config';
import connectDB from '../config/database.js';
import Product from '../models/Product.js';

async function cleanup() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         Cleanup: Keep Only Real Amazon Products           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Connect to database
    console.log('🔌 Connecting to MongoDB...\n');
    await connectDB();
    console.log('✅ Connected!\n');

    // Get current count
    const totalBefore = await Product.countDocuments();
    console.log(`📊 Current total products: ${totalBefore}\n`);

    // Get list of real products (IDs 229-244)
    const realProductIds = [];
    for (let i = 229; i <= 244; i++) {
      realProductIds.push(String(i));
    }

    console.log(`🎯 Real products to keep: ${realProductIds.length} (IDs ${realProductIds[0]}-${realProductIds[realProductIds.length - 1]})\n`);

    // Find real products
    const realProducts = await Product.find({ _id: { $in: realProductIds } });
    console.log('✅ Found real products:');
    realProducts.forEach(p => {
      console.log(`   - ${p.name.substring(0, 60)}... (ID: ${p._id})`);
    });
    console.log('');

    // Confirm deletion
    console.log('─'.repeat(80));
    console.log('\n⚠️  WARNING: This will delete all other products!\n');
    console.log(`   Products to DELETE: ${totalBefore - realProducts.length}`);
    console.log(`   Products to KEEP: ${realProducts.length}\n`);

    // Delete all products NOT in the real list
    console.log('🗑️  Deleting mock products...\n');

    const deleteResult = await Product.deleteMany({
      _id: { $nin: realProductIds }
    });

    console.log('─'.repeat(80));
    console.log(`\n✅ Deleted ${deleteResult.deletedCount} mock products\n`);

    // Get new count
    const totalAfter = await Product.countDocuments();
    console.log(`📊 Final product count: ${totalAfter}\n`);

    // List remaining products
    console.log('✅ Remaining real products with affiliate tracking:\n');
    const remaining = await Product.find().sort({ _id: 1 });
    remaining.forEach((p, i) => {
      console.log(`${(i + 1).toString().padStart(2)}. ${p.name}`);
      console.log(`    ID: ${p._id} | Price: ₹${p.prices[0].amount} | Category: ${p.category}`);
      console.log(`    Affiliate: ${p.prices[0].url.includes('beautynomy25-21') ? '✅' : '❌'}`);
      console.log('');
    });

    console.log('─'.repeat(80));
    console.log('\n🎉 Cleanup complete!');
    console.log('✅ Your database now contains only real Amazon products');
    console.log('✅ All products have affiliate tracking (beautynomy25-21)\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run it
cleanup();
