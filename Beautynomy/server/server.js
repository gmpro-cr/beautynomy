import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import Product from './models/Product.js';
import { scrapeAndUpdateProduct, batchScrapeProducts } from './services/scraper-service.js';
import { startPriceUpdateScheduler, triggerManualUpdate } from './scheduler/price-updater.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Start automated price update scheduler
startPriceUpdateScheduler();

// Health check endpoint
app.get('/', async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    res.json({
      message: 'Beautynomy API is running with MongoDB!',
      endpoints: {
        products: '/api/products?query=<search_term>',
        health: '/'
      },
      totalProducts: productCount,
      platforms: 5,
      platformNames: ['Nykaa', 'Amazon India', 'Flipkart', 'Purplle', 'Myntra'],
      database: 'MongoDB'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Database error',
      message: error.message
    });
  }
});

// Get all products or search products
app.get('/api/products', async (req, res) => {
  try {
    const { query, category, brand } = req.query;

    let filter = {};

    // Search by query (name, brand, description, category)
    if (query && query.toLowerCase() !== 'all') {
      filter.$text = { $search: query };
    }

    // Filter by category
    if (category && category !== 'All') {
      filter.category = new RegExp(`^${category}$`, 'i');
    }

    // Filter by brand
    if (brand && brand !== 'All') {
      filter.brand = new RegExp(`^${brand}$`, 'i');
    }

    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available brands
app.get('/api/brands', async (req, res) => {
  try {
    const brands = await Product.distinct('brand');
    res.json(brands.sort());
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories.sort());
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get price statistics
app.get('/api/stats', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const categories = await Product.distinct('category');
    const brands = await Product.distinct('brand');

    // Get price range
    const priceAggregation = await Product.aggregate([
      { $unwind: '$prices' },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$prices.amount' },
          maxPrice: { $max: '$prices.amount' }
        }
      }
    ]);

    const stats = {
      totalProducts,
      totalPlatforms: 5,
      platforms: ['Nykaa', 'Amazon India', 'Flipkart', 'Purplle', 'Myntra'],
      categories: categories.sort(),
      brands: brands.sort(),
      averageProducts: Math.floor(totalProducts / 5),
      priceRange: {
        min: priceAggregation[0]?.minPrice || 0,
        max: priceAggregation[0]?.maxPrice || 0
      }
    };
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Scrape and update product prices
app.post('/api/scrape', async (req, res) => {
  try {
    const { productName } = req.body;

    if (!productName) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    console.log(`🔍 Received scrape request for: ${productName}`);
    const result = await scrapeAndUpdateProduct(productName);

    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Batch scrape multiple products
app.post('/api/scrape/batch', async (req, res) => {
  try {
    const { productNames } = req.body;

    if (!productNames || !Array.isArray(productNames) || productNames.length === 0) {
      return res.status(400).json({ error: 'Product names array is required' });
    }

    if (productNames.length > 20) {
      return res.status(400).json({ error: 'Maximum 20 products allowed per batch' });
    }

    console.log(`📦 Received batch scrape request for ${productNames.length} products`);
    const results = await batchScrapeProducts(productNames);

    res.json({
      success: true,
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    });
  } catch (error) {
    console.error('Batch scraping error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Trigger manual price update
app.post('/api/update-prices', async (req, res) => {
  try {
    const { productIds } = req.body;

    console.log('🔄 Manual price update triggered');
    const result = await triggerManualUpdate(productIds || []);

    res.json(result);
  } catch (error) {
    console.error('Manual update error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Beautynomy API Server running on port ${PORT}`);
  console.log(`🗄️  Database: MongoDB (connected)`);
  console.log(`🛒 E-commerce Platforms: Nykaa, Amazon, Flipkart, Purplle, Myntra`);
  console.log(`🔗 API Endpoints:`);
  console.log(`   - Health: http://localhost:${PORT}/`);
  console.log(`   - Products: http://localhost:${PORT}/api/products`);
  console.log(`   - Stats: http://localhost:${PORT}/api/stats`);
});
