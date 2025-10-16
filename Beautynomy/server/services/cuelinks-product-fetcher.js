import axios from 'axios';
import cuelinksService from './cuelinks-service.js';

/**
 * Cuelinks Product Fetcher Service
 * Fetches product details and offers from e-commerce sites via Cuelinks API
 */

class CuelinksProductFetcher {
  constructor() {
    this.apiKey = process.env.CUELINKS_API_KEY;
    this.publisherId = process.env.CUELINKS_PUBLISHER_ID;
    this.baseURL = 'https://www.cuelinks.com/api';
  }

  /**
   * Check if service is configured
   */
  isConfigured() {
    return !!(this.apiKey && this.publisherId);
  }

  /**
   * Fetch product offers from Cuelinks
   * @param {Object} filters - Search filters
   * @returns {Promise<Array>} - Product offers
   */
  async fetchOffers(filters = {}) {
    if (!this.isConfigured()) {
      console.warn('Cuelinks not configured');
      return [];
    }

    try {
      const params = {
        page: filters.page || 1,
        per_page: filters.perPage || 20,
        ...filters
      };

      const response = await axios.get(`${this.baseURL}/v2/offers.json`, {
        params,
        headers: {
          'Authorization': `Token token="${this.apiKey}"`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      if (response.data && response.data.offers) {
        return this.normalizeOffers(response.data.offers);
      }

      return [];
    } catch (error) {
      console.error('Error fetching Cuelinks offers:', error.message);
      return [];
    }
  }

  /**
   * Search for beauty/cosmetics products
   * @param {string} query - Search term
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} - Product results
   */
  async searchBeautyProducts(query, options = {}) {
    console.log(`🔍 Searching Cuelinks for beauty products: "${query}"`);

    const filters = {
      search_term: query,
      category: options.category || 'Beauty',
      page: options.page || 1,
      per_page: options.limit || 50
    };

    if (options.merchant) {
      filters.advertiser_name = options.merchant;
    }

    const offers = await this.fetchOffers(filters);
    
    console.log(`✅ Found ${offers.length} beauty product offers`);
    return offers;
  }

  /**
   * Fetch products from specific merchant
   * @param {string} merchantName - Merchant name (e.g., "Nykaa", "Amazon")
   * @param {string} query - Search term
   * @returns {Promise<Array>} - Products from merchant
   */
  async fetchFromMerchant(merchantName, query = '') {
    console.log(`🏪 Fetching products from ${merchantName}`);

    const filters = {
      advertiser_name: merchantName,
      page: 1,
      per_page: 50
    };

    if (query) {
      filters.search_term = query;
    }

    return await this.fetchOffers(filters);
  }

  /**
   * Get trending beauty products
   * @param {number} limit - Number of products
   * @returns {Promise<Array>} - Trending products
   */
  async getTrendingBeautyProducts(limit = 20) {
    console.log(`📈 Fetching trending beauty products`);

    const filters = {
      category: 'Beauty',
      sort_by: 'popularity',
      page: 1,
      per_page: limit
    };

    return await this.fetchOffers(filters);
  }

  /**
   * Fetch products by category
   * @param {string} category - Category name
   * @param {number} limit - Number of products
   * @returns {Promise<Array>} - Category products
   */
  async fetchByCategory(category, limit = 30) {
    console.log(`📂 Fetching products from category: ${category}`);

    const beautyCategories = {
      'lipstick': 'Lipstick',
      'foundation': 'Foundation',
      'mascara': 'Mascara',
      'skincare': 'Skincare',
      'perfume': 'Perfume',
      'nail-polish': 'Nail Polish'
    };

    const categoryName = beautyCategories[category.toLowerCase()] || category;

    const filters = {
      category: categoryName,
      page: 1,
      per_page: limit
    };

    return await this.fetchOffers(filters);
  }

  /**
   * Normalize Cuelinks offers to Beautynomy product format
   * @param {Array} offers - Raw offers from Cuelinks
   * @returns {Array} - Normalized products
   */
  normalizeOffers(offers) {
    return offers.map(offer => {
      // Generate deeplink for the offer
      const deeplink = `https://linksredirect.com/?pub_id=${this.publisherId}&url=${encodeURIComponent(offer.url || offer.tracking_url)}`;

      return {
        // Cuelinks data
        cuelinksId: offer.id,
        name: offer.title || offer.name || 'Unknown Product',
        description: offer.description || '',
        merchant: offer.advertiser_name || offer.merchant || 'Unknown',
        category: this.mapCategory(offer.category),
        
        // Product details
        image: offer.image_url || offer.thumbnail || 'https://via.placeholder.com/300x300?text=No+Image',
        
        // Pricing
        originalPrice: offer.price || offer.mrp || null,
        discountedPrice: offer.sale_price || offer.offer_price || null,
        discount: offer.discount_percentage || offer.discount || null,
        currency: offer.currency || 'INR',
        
        // Links
        productUrl: offer.url || offer.product_url,
        affiliateUrl: deeplink,
        trackingUrl: offer.tracking_url,
        
        // Offer details
        offerText: offer.offer_text || offer.deal_text,
        validUntil: offer.end_date || offer.valid_until,
        
        // Meta
        brand: this.extractBrand(offer.title || offer.name),
        inStock: offer.in_stock !== false,
        source: 'cuelinks',
        fetchedAt: new Date().toISOString()
      };
    });
  }

  /**
   * Map Cuelinks category to Beautynomy category
   */
  mapCategory(cuelinksCategory) {
    const categoryMap = {
      'beauty': 'Skincare',
      'cosmetics': 'Face',
      'lipstick': 'Lips',
      'lip gloss': 'Lips',
      'foundation': 'Face',
      'concealer': 'Face',
      'mascara': 'Eyes',
      'eyeshadow': 'Eyes',
      'eyeliner': 'Eyes',
      'perfume': 'Fragrance',
      'skincare': 'Skincare',
      'face wash': 'Skincare',
      'moisturizer': 'Skincare',
      'serum': 'Skincare'
    };

    const category = (cuelinksCategory || '').toLowerCase();
    return categoryMap[category] || 'Skincare';
  }

  /**
   * Extract brand from product name
   */
  extractBrand(productName) {
    if (!productName) return 'Unknown';

    const brands = [
      'NYKAA', 'LAKME', 'MAYBELLINE', 'LOREAL', 'MAC', 'HUDA', 'SUGAR',
      'PLUM', 'BIOTIQUE', 'HIMALAYA', 'NIVEA', 'GARNIER', 'POND', 'OLAY',
      'NEUTROGENA', 'CETAPHIL', 'DOVE', 'VASELINE', 'BOBBI BROWN', 'ESTEE LAUDER',
      'CLINIQUE', 'LANCOME', 'KIKO', 'NYX', 'URBAN DECAY', 'ANASTASIA',
      'FENTY', 'CHARLOTTE TILBURY', 'TOO FACED', 'TARTE', 'SEPHORA',
      'WOW', 'MCAFFEINE', 'SWISS BEAUTY', 'COLORBAR', 'FACES CANADA'
    ];

    const upperName = productName.toUpperCase();

    for (const brand of brands) {
      if (upperName.includes(brand)) {
        return brand;
      }
    }

    // Default: use first word
    return productName.split(' ')[0].toUpperCase();
  }

  /**
   * Import Cuelinks products to Beautynomy database
   * @param {Array} cuelinksProducts - Products from Cuelinks
   * @param {Model} ProductModel - Mongoose Product model
   * @returns {Promise<Object>} - Import results
   */
  async importToDatabase(cuelinksProducts, ProductModel) {
    const results = {
      total: cuelinksProducts.length,
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };

    for (const product of cuelinksProducts) {
      try {
        // Create product ID from name
        const productId = this.generateProductId(product.name, product.merchant);

        // Check if product exists
        let dbProduct = await ProductModel.findById(productId);

        // Prepare product data
        const productData = {
          _id: productId,
          name: product.name,
          brand: product.brand,
          category: product.category,
          description: product.description,
          image: product.image,
          rating: 4.0, // Default rating
          reviewCount: 0,
          prices: [{
            platform: product.merchant,
            amount: product.discountedPrice || product.originalPrice || 0,
            url: product.affiliateUrl
          }],
          // Store Cuelinks metadata
          cuelinksData: {
            offerId: product.cuelinksId,
            offerText: product.offerText,
            validUntil: product.validUntil,
            discount: product.discount
          }
        };

        if (dbProduct) {
          // Update existing product
          Object.assign(dbProduct, productData);
          await dbProduct.save();
          results.updated++;
          console.log(`✅ Updated: ${product.name}`);
        } else {
          // Create new product
          await ProductModel.create(productData);
          results.imported++;
          console.log(`✅ Imported: ${product.name}`);
        }

      } catch (error) {
        results.errors.push({
          product: product.name,
          error: error.message
        });
        results.skipped++;
        console.error(`❌ Error importing ${product.name}:`, error.message);
      }
    }

    return results;
  }

  /**
   * Generate product ID from name and merchant
   */
  generateProductId(name, merchant) {
    const normalized = `${merchant}-${name}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100);
    return normalized;
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      configured: this.isConfigured(),
      publisherId: this.publisherId || 'Not set',
      supportedMerchants: [
        'Nykaa', 'Amazon India', 'Flipkart', 'Purplle', 'Myntra',
        'Sephora', 'WOW Skin Science', 'Plum', 'Swiss Beauty'
      ],
      categories: [
        'Beauty', 'Skincare', 'Makeup', 'Fragrance',
        'Hair Care', 'Personal Care'
      ]
    };
  }
}

// Export singleton
const cuelinksProductFetcher = new CuelinksProductFetcher();
export default cuelinksProductFetcher;
