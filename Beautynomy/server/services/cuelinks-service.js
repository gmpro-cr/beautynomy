import axios from 'axios';

/**
 * Cuelinks Service for Affiliate Link Management
 * Handles deeplink generation and product data fetching via Cuelinks API
 */

class CuelinksService {
  constructor() {
    this.apiKey = process.env.CUELINKS_API_KEY;
    this.publisherId = process.env.CUELINKS_PUBLISHER_ID;
    this.baseURL = 'https://www.cuelinks.com/api';
    
    // Validate configuration
    if (!this.apiKey) {
      console.warn('⚠️  CUELINKS_API_KEY not configured. Cuelinks features will be disabled.');
    }
  }

  /**
   * Check if Cuelinks is properly configured
   * @returns {boolean}
   */
  isConfigured() {
    return !!(this.apiKey && this.publisherId);
  }

  /**
   * Generate Cuelinks deeplink from a product URL
   * @param {string} productUrl - Original product URL
   * @param {string} subId - Optional sub-tracking ID
   * @returns {Promise<string>} - Cuelinks affiliate URL
   */
  async generateDeeplink(productUrl, subId = '') {
    if (!this.isConfigured()) {
      console.warn('Cuelinks not configured, returning original URL');
      return productUrl;
    }

    try {
      // Try direct Cuelinks link conversion format
      // Format: https://linksredirect.com/?pub_id=PUBLISHER_ID&url=ENCODED_URL&subId=SUB_ID
      const encodedUrl = encodeURIComponent(productUrl);
      const deeplink = `https://linksredirect.com/?pub_id=${this.publisherId}&url=${encodedUrl}${subId ? '&subId=' + subId : ''}`;
      
      console.log(`✅ Generated Cuelinks deeplink for: ${productUrl}`);
      return deeplink;
    } catch (error) {
      console.error('Cuelinks deeplink generation error:', error.message);
      return productUrl; // Fallback to original URL
    }
  }

  /**
   * Generate deeplinks for multiple product URLs
   * @param {Array<Object>} products - Array of product objects with url property
   * @param {string} platform - Platform name for sub-tracking
   * @returns {Promise<Array>} - Products with Cuelinks URLs
   */
  async generateBulkDeeplinks(products, platform = '') {
    if (!this.isConfigured()) {
      return products;
    }

    const results = [];

    // Process in batches to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);

      const batchPromises = batch.map(async (product) => {
        const subId = platform ? `${platform}-${product.id || ''}` : '';
        const deeplink = await this.generateDeeplink(product.url, subId);
        
        return {
          ...product,
          originalUrl: product.url,
          url: deeplink,
          isAffiliateLink: deeplink !== product.url
        };
      });

      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults.map(r => r.status === 'fulfilled' ? r.value : null).filter(Boolean));

      // Small delay between batches
      if (i + batchSize < products.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return results;
  }

  /**
   * Convert product prices array to use Cuelinks deeplinks
   * @param {Array<Object>} prices - Array of price objects with platform and url
   * @param {string} productId - Product ID for sub-tracking
   * @returns {Promise<Array>} - Prices with Cuelinks URLs
   */
  async convertPricesToDeeplinks(prices, productId = '') {
    if (!this.isConfigured()) {
      return prices;
    }

    const convertedPrices = await Promise.all(
      prices.map(async (price) => {
        const subId = `${price.platform}-${productId}`;
        const deeplink = await this.generateDeeplink(price.url, subId);
        
        return {
          ...price,
          url: deeplink,
          isAffiliateLink: deeplink !== price.url
        };
      })
    );

    return convertedPrices;
  }

  /**
   * Fetch merchant/advertiser information from Cuelinks
   * @returns {Promise<Array>} - List of available merchants
   */
  async getMerchants() {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      const response = await axios.get(`${this.baseURL}/campaigns.json`, {
        headers: {
          'Authorization': `Token token="${this.apiKey}"`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data && response.data.campaigns) {
        return response.data.campaigns;
      }

      return [];
    } catch (error) {
      console.error('Error fetching Cuelinks merchants:', error.message);
      return [];
    }
  }

  /**
   * Search for products/offers from Cuelinks merchants
   * @param {string} query - Search query
   * @param {Object} filters - Optional filters (category, merchant, etc.)
   * @returns {Promise<Array>} - Search results
   */
  async searchProducts(query, filters = {}) {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      const params = {
        search_term: query,
        ...filters
      };

      const response = await axios.get(`${this.baseURL}/offers.json`, {
        params,
        headers: {
          'Authorization': `Token token="${this.apiKey}"`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data && response.data.offers) {
        return response.data.offers.map(offer => ({
          id: offer.id,
          name: offer.title,
          description: offer.description,
          merchant: offer.advertiser_name,
          url: offer.url,
          category: offer.category,
          discount: offer.discount,
          imageUrl: offer.image_url,
          validUntil: offer.valid_until
        }));
      }

      return [];
    } catch (error) {
      console.error('Error searching Cuelinks products:', error.message);
      return [];
    }
  }

  /**
   * Get statistics about Cuelinks integration
   * @returns {Object} - Statistics
   */
  getStats() {
    return {
      configured: this.isConfigured(),
      apiKey: this.apiKey ? '***' + this.apiKey.slice(-4) : 'Not set',
      publisherId: this.publisherId || 'Not set',
      baseURL: this.baseURL
    };
  }
}

// Export singleton instance
const cuelinksService = new CuelinksService();
export default cuelinksService;
