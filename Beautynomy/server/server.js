import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import Product from './models/Product.js';
import { checkConnection as checkSupabaseConnection } from './config/supabase.js';
import { scrapeAndUpdateProduct, batchScrapeProducts } from './services/scraper-service.js';
import { startPriceUpdateScheduler, triggerManualUpdate } from './scheduler/price-updater.js';
import { startDailyProductFetching, startWeeklyProductFetching, triggerManualFetch } from './scheduler/product-api-fetcher.js';
import cuelinksService from './services/cuelinks-service.js';
import cuelinksProductFetcher from './services/cuelinks-product-fetcher.js';
import platformAPIService from './services/platform-api-service.js';

// Import scraping agent
import scrapingAgent from './services/scraping-agent.js';
import priceTracker from './services/price-tracker.js';

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
// Temporary: Allow all origins for debugging
app.use(cors({
  origin: true, // Allow all origins temporarily
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

// Start autonomous scraping agent
if (process.env.ENABLE_SCRAPING_AGENT !== 'false') {
  scrapingAgent.start();
  console.log('🤖 Autonomous Scraping Agent started');
}

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
      // MongoDB regex search - case insensitive partial match
      const searchRegex = new RegExp(escapeRegex(query), 'i');
      filter.$or = [
        { name: searchRegex },
        { brand: searchRegex },
        { description: searchRegex }
      ];
    }

    // Filter by category - exact match
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Filter by brand - exact match
    if (brand && brand !== 'All') {
      filter.brand = brand;
    }

    const products = await Product.find(filter);
    res.json(products);
  })
);

// Get product by ID
app.get('/api/products/:id', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
}));

// Get available brands
app.get('/api/brands', asyncHandler(async (req, res) => {
  const brands = await Product.distinct('brand');
  res.json(brands.sort());
}));

// Get available categories
app.get('/api/categories', asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  res.json(categories.sort());
}));

// Get price statistics
app.get('/api/stats', asyncHandler(async (req, res) => {
  const totalProducts = await Product.countDocuments();
  const categories = await Product.distinct('category');
  const brands = await Product.distinct('brand');

  // Get all products with prices for price range calculation
  const products = await Product.find({}).limit(10000);
  const allPrices = products.flatMap(p => p.prices || []).map(pr => pr.amount);

  const stats = {
    totalProducts: totalProducts || products.length,
    totalPlatforms: 5,
    platforms: ['Nykaa', 'Amazon India', 'Flipkart', 'Purplle', 'Myntra'],
    categories: categories.sort(),
    brands: brands.sort(),
    averageProducts: Math.floor((dbStats.totalProducts || products.length) / 5),
    priceRange: {
      min: allPrices.length > 0 ? Math.min(...allPrices) : 0,
      max: allPrices.length > 0 ? Math.max(...allPrices) : 0
    }
  };
  res.json(stats);
}));

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

// ==================== SCRAPING AGENT API ENDPOINTS ====================

/**
 * Get scraping agent status
 * GET /api/agent/status
 */
app.get('/api/agent/status',
  asyncHandler(async (req, res) => {
    const status = scrapingAgent.getStatus();
    res.json({
      success: true,
      agent: status
    });
  })
);

/**
 * Get detailed agent statistics
 * GET /api/agent/stats
 */
app.get('/api/agent/stats',
  authenticateAdmin,
  asyncHandler(async (req, res) => {
    const stats = scrapingAgent.getDetailedStats();
    res.json({
      success: true,
      ...stats
    });
  })
);

/**
 * Start scraping agent
 * POST /api/agent/start
 */
app.post('/api/agent/start',
  adminLimiter,
  authenticateAdmin,
  asyncHandler(async (req, res) => {
    await scrapingAgent.start();
    res.json({
      success: true,
      message: 'Scraping agent started',
      status: scrapingAgent.getStatus()
    });
  })
);

/**
 * Stop scraping agent
 * POST /api/agent/stop
 */
app.post('/api/agent/stop',
  adminLimiter,
  authenticateAdmin,
  asyncHandler(async (req, res) => {
    scrapingAgent.stop();
    res.json({
      success: true,
      message: 'Scraping agent stopped',
      status: scrapingAgent.getStatus()
    });
  })
);

/**
 * Pause scraping agent
 * POST /api/agent/pause
 */
app.post('/api/agent/pause',
  adminLimiter,
  authenticateAdmin,
  asyncHandler(async (req, res) => {
    scrapingAgent.pause();
    res.json({
      success: true,
      message: 'Scraping agent paused'
    });
  })
);

/**
 * Resume scraping agent
 * POST /api/agent/resume
 */
app.post('/api/agent/resume',
  adminLimiter,
  authenticateAdmin,
  asyncHandler(async (req, res) => {
    scrapingAgent.resume();
    res.json({
      success: true,
      message: 'Scraping agent resumed'
    });
  })
);

/**
 * Add product to scraping queue
 * POST /api/agent/queue/add
 * Body: { productName: string, priority?: number }
 */
app.post('/api/agent/queue/add',
  adminLimiter,
  authenticateAdmin,
  asyncHandler(async (req, res) => {
    const { productName, priority } = req.body;

    if (!productName) {
      return res.status(400).json({
        success: false,
        error: 'productName is required'
      });
    }

    const jobId = scrapingAgent.scrapeProduct(productName, priority || 5);

    res.json({
      success: true,
      message: 'Product added to scraping queue',
      jobId
    });
  })
);

/**
 * Clear scraping queue
 * POST /api/agent/queue/clear
 */
app.post('/api/agent/queue/clear',
  adminLimiter,
  authenticateAdmin,
  asyncHandler(async (req, res) => {
    scrapingAgent.clearQueue();
    res.json({
      success: true,
      message: 'Scraping queue cleared'
    });
  })
);

// ==================== PRICE TRACKER API ENDPOINTS ====================

/**
 * Get price change notifications
 * GET /api/price-tracker/notifications
 */
app.get('/api/price-tracker/notifications',
  asyncHandler(async (req, res) => {
    const unreadOnly = req.query.unreadOnly === 'true';
    const notifications = priceTracker.getNotifications(unreadOnly);

    res.json({
      success: true,
      count: notifications.length,
      notifications
    });
  })
);

/**
 * Mark notification as read
 * POST /api/price-tracker/notifications/:id/read
 */
app.post('/api/price-tracker/notifications/:id/read',
  asyncHandler(async (req, res) => {
    priceTracker.markAsRead(req.params.id);
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  })
);

/**
 * Clear all notifications
 * POST /api/price-tracker/notifications/clear
 */
app.post('/api/price-tracker/notifications/clear',
  adminLimiter,
  authenticateAdmin,
  asyncHandler(async (req, res) => {
    priceTracker.clearNotifications();
    res.json({
      success: true,
      message: 'All notifications cleared'
    });
  })
);

/**
 * Get price trends for a product
 * GET /api/price-tracker/trends/:productId
 */
app.get('/api/price-tracker/trends/:productId',
  asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const days = parseInt(req.query.days) || 30;

    const trends = await priceTracker.calculateTrends(productId, days);

    if (trends) {
      res.json({
        success: true,
        trends
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Product not found or insufficient data'
      });
    }
  })
);

/**
 * Get best time to buy recommendation
 * GET /api/price-tracker/best-time/:productId
 */
app.get('/api/price-tracker/best-time/:productId',
  asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const recommendation = await priceTracker.getBestTimeToBuy(productId);

    if (recommendation) {
      res.json({
        success: true,
        recommendation
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Product not found or insufficient data'
      });
    }
  })
);

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
