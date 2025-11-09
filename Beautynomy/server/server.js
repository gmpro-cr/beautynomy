import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import Product from './models/Product.js';
import { scrapeAndUpdateProduct, batchScrapeProducts } from './services/scraper-service.js';
import { startPriceUpdateScheduler, triggerManualUpdate } from './scheduler/price-updater.js';
import { startDailyProductFetching, startWeeklyProductFetching, triggerManualFetch } from './scheduler/product-api-fetcher.js';
import cuelinksService from './services/cuelinks-service.js';
import cuelinksProductFetcher from './services/cuelinks-product-fetcher.js';
import platformAPIService from './services/platform-api-service.js';

// Import middleware
import { apiLimiter, scrapeLimiter, adminLimiter } from './middleware/rateLimiter.js';
import { authenticateAdmin } from './middleware/auth.js';
import { errorHandler, notFoundHandler, asyncHandler } from './middleware/errorHandler.js';
import { validate, schemas, escapeRegex, sanitizeInputs } from './middleware/validation.js';
import * as cache from './utils/cache.js';
import { ALLOWED_ORIGINS, CACHE_CONFIG, SCRAPING_LIMITS } from './config/constants.js';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration with whitelist
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️  Blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-api-key', 'Authorization']
}));

app.use(express.json());
app.use(sanitizeInputs);

// Connect to MongoDB
connectDB();

// Start automated price update scheduler
startPriceUpdateScheduler();

// Start automated product fetching (daily and weekly)
startDailyProductFetching();
startWeeklyProductFetching();

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

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Get all products or search products
app.get('/api/products',
  validate(schemas.productQuery, 'query'),
  cache.cacheMiddleware(CACHE_CONFIG.PRODUCTS_TTL_SECONDS),
  asyncHandler(async (req, res) => {
    const { query, category, brand } = req.query;

    let filter = {};

    // Search by query (name, brand, description, category)
    if (query && query.toLowerCase() !== 'all') {
      // Try text search first
      try {
        filter.$text = { $search: query };
      } catch (error) {
        // Fallback to regex search if text index not available
        const escapedQuery = escapeRegex(query);
        filter.$or = [
          { name: new RegExp(escapedQuery, 'i') },
          { brand: new RegExp(escapedQuery, 'i') },
          { description: new RegExp(escapedQuery, 'i') }
        ];
      }
    }

    // Filter by category (fixed NoSQL injection)
    if (category && category !== 'All') {
      filter.category = new RegExp(`^${escapeRegex(category)}$`, 'i');
    }

    // Filter by brand (fixed NoSQL injection)
    if (brand && brand !== 'All') {
      filter.brand = new RegExp(`^${escapeRegex(brand)}$`, 'i');
    }

    const products = await Product.find(filter);
    res.json(products);
  })
);

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
app.post('/api/scrape',
  scrapeLimiter,
  authenticateAdmin,
  validate(schemas.scrapeProduct),
  asyncHandler(async (req, res) => {
    const { productName } = req.body;

    console.log(`🔍 Received scrape request for: ${productName}`);

    // Invalidate product cache
    cache.invalidateByPattern('cache:*/api/products*');

    const result = await scrapeAndUpdateProduct(productName);

    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  })
);

// Batch scrape multiple products
app.post('/api/scrape/batch',
  scrapeLimiter,
  authenticateAdmin,
  validate(schemas.batchScrape),
  asyncHandler(async (req, res) => {
    const { productNames } = req.body;

    console.log(`📦 Received batch scrape request for ${productNames.length} products`);

    // Invalidate product cache
    cache.invalidateByPattern('cache:*/api/products*');

    const results = await batchScrapeProducts(productNames);

    res.json({
      success: true,
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    });
  })
);

// Trigger manual price update
app.post('/api/update-prices',
  adminLimiter,
  authenticateAdmin,
  validate(schemas.updatePrices),
  asyncHandler(async (req, res) => {
    const { productIds } = req.body;

    console.log('🔄 Manual price update triggered');

    // Invalidate product cache
    cache.invalidateByPattern('cache:*/api/products*');

    const result = await triggerManualUpdate(productIds || []);

    res.json(result);
  })
);

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
app.post('/api/cuelinks/convert-product',
  adminLimiter,
  authenticateAdmin,
  validate(schemas.productId),
  asyncHandler(async (req, res) => {
    const { productId } = req.body;

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

    // Invalidate cache for this product
    cache.invalidateByPattern('cache:*/api/products*');

    res.json({
      success: true,
      message: 'Product URLs converted to Cuelinks deeplinks',
      product: product
    });
  })
);

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

// ==================== PLATFORM API ROUTES (Cuelinks-based) ====================

/**
 * Fetch products from all platforms via Cuelinks API
 * This is an alternative to scraping that uses official Cuelinks merchant APIs
 * GET /api/platforms/fetch?query=<product_name>&limit=<number>
 */
app.get('/api/platforms/fetch', async (req, res) => {
  try {
    const { query, limit } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    console.log(`🔍 API fetch request for: ${query}`);

    const result = await platformAPIService.fetchFromAllPlatforms(query, {
      limit: parseInt(limit) || 50
    });

    res.json(result);
  } catch (error) {
    console.error('Platform API fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Fetch products from a specific platform via Cuelinks API
 * GET /api/platforms/:platform/fetch?query=<product_name>
 * Supported platforms: nykaa, amazon, flipkart, myntra, purplle, tira, sephora
 */
app.get('/api/platforms/:platform/fetch', async (req, res) => {
  try {
    const { platform } = req.params;
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    console.log(`🏪 API fetch from ${platform} for: ${query}`);

    const offers = await platformAPIService.fetchFromPlatform(platform, query);

    res.json({
      success: offers.length > 0,
      platform: platform,
      query: query,
      count: offers.length,
      offers: offers
    });
  } catch (error) {
    console.error(`Platform API fetch error for ${req.params.platform}:`, error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Get supported platforms and API stats
 * GET /api/platforms/stats
 */
app.get('/api/platforms/stats', async (req, res) => {
  try {
    const stats = await platformAPIService.getAPIStats();
    res.json({
      message: 'Platform API statistics',
      ...stats
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Trigger manual product fetch via cron job
 * POST /api/cron/fetch-products
 * Body: { categories: string[] } (optional)
 */
app.post('/api/cron/fetch-products',
  adminLimiter,
  authenticateAdmin,
  asyncHandler(async (req, res) => {
    const { categories } = req.body;

    console.log('📡 Manual product fetch triggered via API');

    // Invalidate product cache
    cache.invalidateByPattern('cache:*/api/products*');

    const result = await triggerManualFetch(categories);

    res.json({
      success: true,
      message: 'Product fetch completed',
      ...result
    });
  })
);

/**
 * Hybrid fetch - Try API first, fallback to scraping
 * POST /api/products/fetch-hybrid
 * Body: { productName: string, useAPI: boolean, useScraping: boolean }
 */
app.post('/api/products/fetch-hybrid', async (req, res) => {
  try {
    const { productName, useAPI = true, useScraping = false } = req.body;

    if (!productName) {
      return res.status(400).json({ error: 'productName is required' });
    }

    console.log(`🔄 Hybrid fetch for: ${productName} (API: ${useAPI}, Scraping: ${useScraping})`);

    let result = { success: false, products: [], source: null };

    // Try API first if enabled
    if (useAPI) {
      console.log('📡 Trying Cuelinks API...');
      const apiResult = await platformAPIService.fetchFromAllPlatforms(productName);

      if (apiResult.success && apiResult.products.length > 0) {
        result = {
          success: true,
          products: apiResult.products,
          source: 'cuelinks_api',
          platformCount: apiResult.platformCount,
          message: apiResult.message
        };

        console.log(`✅ API fetch successful: ${apiResult.products.length} products`);
      } else {
        console.log('❌ API fetch returned no results');
      }
    }

    // Fallback to scraping if API failed and scraping is enabled
    if (!result.success && useScraping) {
      console.log('🔍 Falling back to scraping...');
      const scrapeResult = await scrapeAndUpdateProduct(productName);

      if (scrapeResult.success) {
        result = {
          success: true,
          products: scrapeResult.products,
          source: 'scraping',
          scrapedCount: scrapeResult.scrapedCount,
          message: scrapeResult.message
        };

        console.log(`✅ Scraping successful: ${scrapeResult.products.length} products`);
      }
    }

    // Return result
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json({
        success: false,
        message: 'No products found via API or scraping',
        productName: productName
      });
    }

  } catch (error) {
    console.error('Hybrid fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// DataYuge service has been discontinued - endpoints removed

// 404 Handler - Must be after all routes
app.use(notFoundHandler);

// Error Handler - Must be last
app.use(errorHandler);

// Start server - bind to 0.0.0.0 for cloud platforms like Render
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Beautynomy API Server running on port ${PORT}`);
  console.log(`🗄️  Database: MongoDB (connected)`);
  console.log(`🛒 E-commerce Platforms: Nykaa, Amazon, Flipkart, Purplle, Myntra`);
  console.log(`🔗 API Endpoints:`);
  console.log(`   - Health: http://localhost:${PORT}/`);
  console.log(`   - Products: http://localhost:${PORT}/api/products`);
  console.log(`   - Stats: http://localhost:${PORT}/api/stats`);
  console.log(`\n🔒 Security Features:`);
  console.log(`   - Rate Limiting: ✅ Enabled`);
  console.log(`   - Admin Auth: ${process.env.ADMIN_API_KEY ? '✅ Configured' : '⚠️  Not configured'}`);
  console.log(`   - CORS Whitelist: ✅ Enabled`);
  console.log(`   - Input Validation: ✅ Enabled`);
  console.log(`   - Caching: ✅ Enabled`);
});
