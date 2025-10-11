import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Product from '../models/Product.js';
import { products } from '../products-data.js';

// Load environment variables
dotenv.config();

const migrateData = async () => {
  try {
    console.log('🚀 Starting data migration...\n');

    // Connect to MongoDB
    await connectDB();

    // Check if products already exist
    const existingCount = await Product.countDocuments();

    if (existingCount > 0) {
      console.log(`⚠️  Database already has ${existingCount} products.`);
      console.log('Do you want to:');
      console.log('  1. Skip migration (keep existing data)');
      console.log('  2. Clear and reimport all products\n');
      console.log('To clear and reimport, run: node scripts/migrate-data.js --force\n');

      if (!process.argv.includes('--force')) {
        console.log('Migration cancelled. Use --force flag to overwrite.');
        process.exit(0);
      }

      console.log('🗑️  Clearing existing products...');
      await Product.deleteMany({});
      console.log(`✅ Deleted ${existingCount} products\n`);
    }

    console.log(`📊 Importing ${products.length} products from products-data.js...`);

    // Insert all products
    const result = await Product.insertMany(products);

    console.log(`\n✅ SUCCESS! Migrated ${result.length} products to MongoDB\n`);

    // Display some statistics
    const stats = {
      totalProducts: await Product.countDocuments(),
      categories: await Product.distinct('category'),
      brands: await Product.distinct('brand'),
      avgRating: await Product.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ])
    };

    console.log('📊 Database Statistics:');
    console.log(`   Total Products: ${stats.totalProducts}`);
    console.log(`   Categories: ${stats.categories.length}`);
    console.log(`   Brands: ${stats.brands.length}`);
    console.log(`   Average Rating: ${stats.avgRating[0]?.avgRating.toFixed(2) || 'N/A'}\n`);

    console.log('🎉 Migration complete!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

// Run migration
migrateData();
