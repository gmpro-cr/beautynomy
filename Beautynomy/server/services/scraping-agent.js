import Product from '../models/Product.js';
import ScrapingQueue from './scraping-queue.js';
import priceTracker from './price-tracker.js';
import { scrapeAndUpdateProduct } from './scraper-service.js';
import * as cache from '../utils/cache.js';

/**
 * Autonomous Scraping Agent
 * Continuously monitors and updates product prices across all platforms
 */

class ScrapingAgent {
  constructor(options = {}) {
    this.queue = new ScrapingQueue({
      maxConcurrent: options.maxConcurrent || 3
    });

    this.isRunning = false;
    this.intervalId = null;
    this.config = {
      pollingInterval: options.pollingInterval || 60000, // 1 minute
      highPriorityInterval: options.highPriorityInterval || 3600000, // 1 hour
      lowPriorityInterval: options.lowPriorityInterval || 86400000, // 24 hours
      batchSize: options.batchSize || 10
    };

    this.stats = {
      startTime: null,
      totalScraped: 0,
      successfulScrapes: 0,
      failedScrapes: 0,
      priceChangesDetected: 0,
      lastScrapedAt: null,
      uptime: 0
    };

    console.log('🤖 Scraping Agent initialized');
  }

  /**
   * Start the scraping agent
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️  Agent already running');
      return;
    }

    this.isRunning = true;
    this.stats.startTime = new Date();

    console.log('🚀 Scraping Agent started');

    // Initial population of queue
    await this.populateQueue();

    // Start processing loop
    this.processLoop();

    // Schedule periodic queue population
    this.intervalId = setInterval(async () => {
      await this.populateQueue();
    }, this.config.pollingInterval);
  }

  /**
   * Stop the scraping agent
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️  Agent not running');
      return;
    }

    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('🛑 Scraping Agent stopped');
  }

  /**
   * Populate queue with products that need scraping
   */
  async populateQueue() {
    try {
      console.log('📋 Populating scraping queue...');

      const products = await Product.find({})
        .select('_id name updatedAt rating reviewCount')
        .lean();

      const now = Date.now();
      let added = 0;

      for (const product of products) {
        // Skip if already in queue
        if (this.queue.hasJob(product.name)) {
          continue;
        }

        // Calculate priority based on:
        // 1. Time since last update
        // 2. Product popularity (rating * review count)
        // 3. Random factor for variety

        const lastUpdate = new Date(product.updatedAt).getTime();
        const timeSinceUpdate = now - lastUpdate;
        const popularity = (product.rating || 1) * Math.log10((product.reviewCount || 1) + 1);

        let priority = 5; // Base priority

        // High priority: Not updated in last hour
        if (timeSinceUpdate > this.config.highPriorityInterval) {
          priority = 8 + Math.min(2, Math.floor(popularity));
        }
        // Medium priority: Not updated in last 6 hours
        else if (timeSinceUpdate > this.config.highPriorityInterval / 6) {
          priority = 5 + Math.min(2, Math.floor(popularity / 2));
        }
        // Low priority: Recently updated
        else {
          priority = 3;
        }

        // Add job to queue
        this.queue.enqueue({
          type: 'scrape_product',
          productName: product.name,
          productId: product._id,
          priority,
          data: {
            lastUpdate: product.updatedAt,
            popularity
          }
        });

        added++;

        // Limit batch size
        if (added >= this.config.batchSize) {
          break;
        }
      }

      console.log(`✅ Added ${added} products to scraping queue`);

    } catch (error) {
      console.error('Error populating queue:', error);
    }
  }

  /**
   * Main processing loop
   */
  async processLoop() {
    while (this.isRunning) {
      try {
        // Get next job from queue
        const job = this.queue.dequeue();

        if (job) {
          // Process job asynchronously
          this.processJob(job).catch(error => {
            console.error(`Error processing job ${job.id}:`, error);
            this.queue.fail(job.id, error);
          });
        }

        // Wait before checking queue again
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error('Error in process loop:', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  /**
   * Process a single scraping job
   */
  async processJob(job) {
    try {
      console.log(`🔄 Processing: ${job.productName}`);

      // Scrape product
      const result = await scrapeAndUpdateProduct(job.productName);

      if (result.success) {
        this.stats.successfulScrapes++;

        // Analyze price changes
        if (result.products && result.products.length > 0) {
          for (const product of result.products) {
            const analysis = await priceTracker.analyzePriceChange(
              product._id,
              product.prices
            );

            if (analysis && analysis.hasSignificantChange) {
              this.stats.priceChangesDetected++;
            }
          }
        }

        // Invalidate cache
        cache.invalidateByPattern('cache:*/api/products*');

        // Mark job as complete
        this.queue.complete(job.id, result);

      } else {
        throw new Error(result.message || 'Scraping failed');
      }

      this.stats.totalScraped++;
      this.stats.lastScrapedAt = new Date();

    } catch (error) {
      this.stats.failedScrapes++;
      this.queue.fail(job.id, error);
    }
  }

  /**
   * Add product to scraping queue manually
   */
  scrapeProduct(productName, priority = 5) {
    return this.queue.enqueue({
      type: 'scrape_product',
      productName,
      priority
    });
  }

  /**
   * Get agent status
   */
  getStatus() {
    const uptime = this.stats.startTime
      ? Date.now() - this.stats.startTime.getTime()
      : 0;

    return {
      isRunning: this.isRunning,
      uptime: Math.floor(uptime / 1000), // seconds
      uptimeFormatted: this.formatUptime(uptime),
      stats: {
        ...this.stats,
        successRate: this.stats.totalScraped > 0
          ? ((this.stats.successfulScrapes / this.stats.totalScraped) * 100).toFixed(2) + '%'
          : '0%'
      },
      queue: this.queue.getStats(),
      priceTracker: priceTracker.getStats(),
      config: this.config
    };
  }

  /**
   * Format uptime in human-readable format
   */
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Get detailed statistics
   */
  getDetailedStats() {
    return {
      agent: this.getStatus(),
      queue: this.queue.getJobs(),
      recentNotifications: priceTracker.getNotifications().slice(-10)
    };
  }

  /**
   * Pause agent
   */
  pause() {
    this.queue.pause();
    console.log('⏸️  Scraping Agent paused');
  }

  /**
   * Resume agent
   */
  resume() {
    this.queue.resume();
    console.log('▶️  Scraping Agent resumed');
  }

  /**
   * Clear queue
   */
  clearQueue() {
    this.queue.clear();
    console.log('🧹 Queue cleared');
  }
}

// Create singleton instance
const scrapingAgent = new ScrapingAgent({
  maxConcurrent: 3,
  pollingInterval: 60000, // Check for new products every minute
  highPriorityInterval: 3600000, // 1 hour
  lowPriorityInterval: 86400000, // 24 hours
  batchSize: 10
});

export default scrapingAgent;
