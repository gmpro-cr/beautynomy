import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import Product from './models/Product.js';
import { scrapeAndUpdateProduct, batchScrapeProducts } from './services/scraper-service.js';
import { startPriceUpdateScheduler, triggerManualUpdate } from './scheduler/price-updater.js';
import cuelinksService from './services/cuelinks-service.js';
import cuelinksProductFetcher from './services/cuelinks-product-fetcher.js';

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

// Cuelinks API endpoints

// Get Cuelinks configuration status
app.get('/api/cuelinks/status', (req, res) => {
  try {
    const stats = cuelinksService.getStats();
    res.json({
      message: 'Cuelinks integration status',
      ...stats
    });
  } catch (error) {
    console.error('Error fetching Cuelinks status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate Cuelinks deeplink for a single URL
app.post('/api/cuelinks/deeplink', async (req, res) => {
  try {
    const { url, subId } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!cuelinksService.isConfigured()) {
      return res.status(503).json({ 
        error: 'Cuelinks not configured',
        message: 'Please set CUELINKS_API_KEY and CUELINKS_PUBLISHER_ID in environment variables'
      });
    }

    const deeplink = await cuelinksService.generateDeeplink(url, subId);

    res.json({
      success: true,
      originalUrl: url,
      deeplink: deeplink,
      isConverted: deeplink !== url
    });
  } catch (error) {
    console.error('Deeplink generation error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get available merchants from Cuelinks
app.get('/api/cuelinks/merchants', async (req, res) => {
  try {
    if (!cuelinksService.isConfigured()) {
      return res.status(503).json({ 
        error: 'Cuelinks not configured',
        message: 'Please set CUELINKS_API_KEY and CUELINKS_PUBLISHER_ID in environment variables'
      });
    }

    const merchants = await cuelinksService.getMerchants();

    res.json({
      success: true,
      count: merchants.length,
      merchants: merchants
    });
  } catch (error) {
    console.error('Error fetching merchants:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Search products/offers via Cuelinks
app.get('/api/cuelinks/search', async (req, res) => {
  try {
    const { query, category, merchant } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    if (!cuelinksService.isConfigured()) {
      return res.status(503).json({ 
        error: 'Cuelinks not configured',
        message: 'Please set CUELINKS_API_KEY and CUELINKS_PUBLISHER_ID in environment variables'
      });
    }

    const filters = {};
    if (category) filters.category = category;
    if (merchant) filters.merchant = merchant;

    const products = await cuelinksService.searchProducts(query, filters);

    res.json({
      success: true,
      query: query,
      count: products.length,
      products: products
    });
  } catch (error) {
    console.error('Product search error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Convert existing product URLs to Cuelinks deeplinks
app.post('/api/cuelinks/convert-product', async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    if (!cuelinksService.isConfigured()) {
      return res.status(503).json({ 
        error: 'Cuelinks not configured',
        message: 'Please set CUELINKS_API_KEY and CUELINKS_PUBLISHER_ID in environment variables'
      });
    }

    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Convert all price URLs to Cuelinks deeplinks
    const convertedPrices = await cuelinksService.convertPricesToDeeplinks(product.prices, productId);
    
    // Update product with new URLs
    product.prices = convertedPrices;
    await product.save();

    res.json({
      success: true,
      message: 'Product URLs converted to Cuelinks deeplinks',
      product: product
    });
  } catch (error) {
    console.error('Product conversion error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Fetch product offers from Cuelinks
app.get('/api/cuelinks/fetch-products', async (req, res) => {
  try {
    const { query, category, merchant, limit } = req.query;

    if (!cuelinksProductFetcher.isConfigured()) {
      return res.status(503).json({ 
        error: 'Cuelinks not configured',
        message: 'Please set CUELINKS_API_KEY and CUELINKS_PUBLISHER_ID in environment variables'
      });
    }

    let products = [];

    if (query) {
      // Search for specific products
      products = await cuelinksProductFetcher.searchBeautyProducts(query, {
        category,
        merchant,
        limit: parseInt(limit) || 20
      });
    } else if (category) {
      // Fetch by category
      products = await cuelinksProductFetcher.fetchByCategory(category, parseInt(limit) || 30);
    } else {
      // Get trending products
      products = await cuelinksProductFetcher.getTrendingBeautyProducts(parseInt(limit) || 20);
    }

    res.json({
      success: true,
      count: products.length,
      query: query || 'trending',
      products: products
    });
  } catch (error) {
    console.error('Product fetch error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Import Cuelinks products to database
app.post('/api/cuelinks/import-products', async (req, res) => {
  try {
    const { query, category, merchant, limit, autoImport } = req.body;

    if (!cuelinksProductFetcher.isConfigured()) {
      return res.status(503).json({ 
        error: 'Cuelinks not configured',
        message: 'Please set CUELINKS_API_KEY and CUELINKS_PUBLISHER_ID in environment variables'
      });
    }

    // Fetch products from Cuelinks
    let products = [];
    
    if (query) {
      products = await cuelinksProductFetcher.searchBeautyProducts(query, {
        category,
        merchant,
        limit: parseInt(limit) || 50
      });
    } else if (category) {
      products = await cuelinksProductFetcher.fetchByCategory(category, parseInt(limit) || 50);
    } else {
      products = await cuelinksProductFetcher.getTrendingBeautyProducts(parseInt(limit) || 50);
    }

    if (products.length === 0) {
      return res.json({
        success: false,
        message: 'No products found from Cuelinks',
        imported: 0
      });
    }

    // Import to database
    const results = await cuelinksProductFetcher.importToDatabase(products, Product);

    res.json({
      success: true,
      message: `Imported ${results.imported} products, updated ${results.updated}, skipped ${results.skipped}`,
      results: results,
      products: autoImport ? undefined : products.slice(0, 10) // Show first 10 for preview
    });
  } catch (error) {
    console.error('Product import error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get Cuelinks product fetcher stats
app.get('/api/cuelinks/fetcher-stats', (req, res) => {
  try {
    const stats = cuelinksProductFetcher.getStats();
    res.json({
      message: 'Cuelinks product fetcher statistics',
      ...stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server - bind to 0.0.0.0 for cloud platforms like Render
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Beautynomy API Server running on port ${PORT}`);
  console.log(`🗄️  Database: MongoDB (connected)`);
  console.log(`🛒 E-commerce Platforms: Nykaa, Amazon, Flipkart, Purplle, Myntra`);
  console.log(`🔗 API Endpoints:`);
  console.log(`   - Health: http://localhost:${PORT}/`);
  console.log(`   - Products: http://localhost:${PORT}/api/products`);
  console.log(`   - Stats: http://localhost:${PORT}/api/stats`);
});
