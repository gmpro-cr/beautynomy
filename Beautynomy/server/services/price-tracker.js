import Product from '../models/Product.js';

/**
 * Price Tracker Service
 * Detects price changes, calculates trends, and triggers alerts
 */

class PriceTracker {
  constructor() {
    this.priceDropThreshold = 10; // Notify if price drops by 10% or more
    this.notifications = [];
  }

  /**
   * Analyze price change for a product
   */
  async analyzePriceChange(productId, newPrices) {
    try {
      const product = await Product.findById(productId);
      if (!product) return null;

      const oldPrices = product.prices;
      const changes = [];

      // Compare each platform's price
      for (const newPrice of newPrices) {
        const oldPrice = oldPrices.find(p => p.platform === newPrice.platform);

        if (oldPrice) {
          const priceDiff = newPrice.amount - oldPrice.amount;
          const percentChange = ((priceDiff / oldPrice.amount) * 100).toFixed(2);

          if (priceDiff !== 0) {
            changes.push({
              platform: newPrice.platform,
              oldPrice: oldPrice.amount,
              newPrice: newPrice.amount,
              difference: priceDiff,
              percentChange: parseFloat(percentChange),
              type: priceDiff < 0 ? 'drop' : 'increase'
            });

            // Log significant changes
            if (Math.abs(percentChange) >= 5) {
              console.log(
                `💰 ${newPrice.platform} price ${priceDiff < 0 ? 'dropped' : 'increased'} by ${Math.abs(percentChange)}%: ` +
                `₹${oldPrice.amount} → ₹${newPrice.amount} (${product.name})`
              );
            }
          }
        } else {
          // New platform added
          changes.push({
            platform: newPrice.platform,
            oldPrice: null,
            newPrice: newPrice.amount,
            difference: newPrice.amount,
            percentChange: null,
            type: 'new'
          });
        }
      }

      // Check for price drops worth notifying
      const significantDrops = changes.filter(
        c => c.type === 'drop' && Math.abs(c.percentChange) >= this.priceDropThreshold
      );

      if (significantDrops.length > 0) {
        await this.createPriceDropNotification(product, significantDrops);
      }

      return {
        productId,
        productName: product.name,
        changes,
        hasSignificantChange: changes.some(c => Math.abs(c.percentChange) >= 5)
      };

    } catch (error) {
      console.error('Error analyzing price change:', error);
      return null;
    }
  }

  /**
   * Create price drop notification
   */
  async createPriceDropNotification(product, drops) {
    const notification = {
      id: `notif_${Date.now()}`,
      type: 'price_drop',
      productId: product._id,
      productName: product.name,
      drops: drops,
      createdAt: new Date(),
      read: false
    };

    this.notifications.push(notification);

    // Keep only last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications.shift();
    }

    console.log(
      `🔔 Price Drop Alert: ${product.name} - ` +
      `${drops.map(d => `${d.platform}: ${d.percentChange}%`).join(', ')}`
    );

    return notification;
  }

  /**
   * Calculate price trends over time
   */
  async calculateTrends(productId, days = 30) {
    try {
      const product = await Product.findById(productId);
      if (!product || !product.priceHistory) return null;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const relevantHistory = product.priceHistory.filter(
        h => new Date(h.date) >= cutoffDate
      );

      if (relevantHistory.length < 2) {
        return {
          trend: 'stable',
          message: 'Not enough data for trend analysis'
        };
      }

      // Calculate trend
      const firstPrice = relevantHistory[0].lowestPrice;
      const lastPrice = relevantHistory[relevantHistory.length - 1].lowestPrice;
      const percentChange = ((lastPrice - firstPrice) / firstPrice * 100).toFixed(2);

      let trend;
      if (percentChange <= -5) {
        trend = 'decreasing';
      } else if (percentChange >= 5) {
        trend = 'increasing';
      } else {
        trend = 'stable';
      }

      // Calculate volatility
      const prices = relevantHistory.map(h => h.lowestPrice);
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
      const variance = prices.reduce((sum, price) => sum + Math.pow(price - avg, 2), 0) / prices.length;
      const volatility = Math.sqrt(variance) / avg * 100;

      return {
        productId,
        productName: product.name,
        period: `${days} days`,
        trend,
        percentChange: parseFloat(percentChange),
        firstPrice,
        lastPrice,
        averagePrice: Math.round(avg),
        volatility: volatility.toFixed(2),
        dataPoints: relevantHistory.length
      };

    } catch (error) {
      console.error('Error calculating trends:', error);
      return null;
    }
  }

  /**
   * Get best time to buy based on price history
   */
  async getBestTimeToBuy(productId) {
    try {
      const product = await Product.findById(productId);
      if (!product || !product.priceHistory) return null;

      const last30Days = product.priceHistory.slice(-30);
      if (last30Days.length < 7) {
        return {
          recommendation: 'Not enough data',
          confidence: 'low'
        };
      }

      const currentPrice = product.prices.reduce(
        (min, p) => Math.min(min, p.amount),
        Infinity
      );

      const prices = last30Days.map(h => h.lowestPrice);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      let recommendation, confidence;

      if (currentPrice <= minPrice * 1.05) {
        // Within 5% of historical minimum
        recommendation = 'Excellent time to buy! Price is at historic low.';
        confidence = 'high';
      } else if (currentPrice <= avgPrice * 0.95) {
        // 5% below average
        recommendation = 'Good time to buy. Price is below average.';
        confidence = 'medium';
      } else if (currentPrice >= avgPrice * 1.1) {
        // 10% above average
        recommendation = 'Wait for a better deal. Price is above average.';
        confidence = 'medium';
      } else {
        recommendation = 'Fair price. Consider buying if needed urgently.';
        confidence = 'low';
      }

      return {
        productId,
        productName: product.name,
        currentPrice,
        averagePrice: Math.round(avgPrice),
        minPrice,
        maxPrice,
        recommendation,
        confidence,
        savings: currentPrice < avgPrice ? Math.round(avgPrice - currentPrice) : 0
      };

    } catch (error) {
      console.error('Error analyzing best time to buy:', error);
      return null;
    }
  }

  /**
   * Get all unread notifications
   */
  getNotifications(unreadOnly = false) {
    if (unreadOnly) {
      return this.notifications.filter(n => !n.read);
    }
    return this.notifications;
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  /**
   * Clear all notifications
   */
  clearNotifications() {
    this.notifications = [];
    console.log('🧹 All notifications cleared');
  }

  /**
   * Get price tracker statistics
   */
  getStats() {
    return {
      totalNotifications: this.notifications.length,
      unreadNotifications: this.notifications.filter(n => !n.read).length,
      priceDropThreshold: this.priceDropThreshold
    };
  }
}

// Singleton instance
const priceTracker = new PriceTracker();
export default priceTracker;
