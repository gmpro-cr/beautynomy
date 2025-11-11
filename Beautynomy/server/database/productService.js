import supabase from '../config/supabase.js';

/**
 * Product Service for Supabase
 * Provides database operations for products, prices, and price history
 */

class ProductService {
  /**
   * Find product by ID with all related data
   */
  async findById(productId) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError) throw productError;
    if (!product) return null;

    // Fetch prices
    const { data: prices, error: pricesError } = await supabase
      .from('prices')
      .select('*')
      .eq('product_id', productId);

    if (pricesError) throw pricesError;

    // Fetch price history (last 90 days)
    const { data: priceHistory, error: historyError } = await supabase
      .from('price_history')
      .select(`
        *,
        price_history_details (
          platform,
          amount
        )
      `)
      .eq('product_id', productId)
      .order('date', { ascending: false })
      .limit(90);

    if (historyError) throw historyError;

    // Format to match Mongoose structure
    return {
      _id: product.id,
      id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      description: product.description,
      image: product.image,
      rating: product.rating ? parseFloat(product.rating) : null,
      reviewCount: product.review_count || 0,
      priceChange: product.price_change ? parseFloat(product.price_change) : null,
      prices: prices.map(p => ({
        platform: p.platform,
        amount: parseFloat(p.amount),
        url: p.url
      })),
      priceHistory: priceHistory.map(h => ({
        date: h.date,
        lowestPrice: parseFloat(h.lowest_price),
        averagePrice: parseFloat(h.average_price),
        prices: h.price_history_details.map(d => ({
          platform: d.platform,
          amount: parseFloat(d.amount)
        }))
      })),
      createdAt: product.created_at,
      updatedAt: product.updated_at
    };
  }

  /**
   * Find products with filters
   */
  async find(filter = {}, options = {}) {
    if (!supabase) throw new Error('Supabase not configured');

    let query = supabase.from('products').select('*', { count: 'exact' });

    // Apply filters
    if (filter.name) {
      query = query.ilike('name', `%${filter.name}%`);
    }

    if (filter.brand) {
      query = query.eq('brand', filter.brand);
    }

    if (filter.category) {
      query = query.eq('category', filter.category);
    }

    // Search across multiple fields
    if (filter.$or) {
      // Text search
      const searchTerm = filter.$or[0]?.name?.$regex;
      if (searchTerm) {
        query = query.or(
          `name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
        );
      }
    }

    // Sorting
    if (options.sort) {
      const sortField = Object.keys(options.sort)[0];
      const sortOrder = options.sort[sortField] === 1 ? 'asc' : 'desc';
      query = query.order(sortField, { ascending: sortOrder === 'asc' });
    }

    // Pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.skip) {
      query = query.range(options.skip, options.skip + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    // Fetch prices for all products
    const productIds = data.map(p => p.id);
    const { data: allPrices, error: pricesError } = await supabase
      .from('prices')
      .select('*')
      .in('product_id', productIds);

    if (pricesError) throw pricesError;

    // Group prices by product
    const pricesByProduct = allPrices.reduce((acc, price) => {
      if (!acc[price.product_id]) acc[price.product_id] = [];
      acc[price.product_id].push({
        platform: price.platform,
        amount: parseFloat(price.amount),
        url: price.url
      });
      return acc;
    }, {});

    // Format results
    const products = data.map(p => ({
      _id: p.id,
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      description: p.description,
      image: p.image,
      rating: p.rating ? parseFloat(p.rating) : null,
      reviewCount: p.review_count || 0,
      priceChange: p.price_change ? parseFloat(p.price_change) : null,
      prices: pricesByProduct[p.id] || [],
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }));

    return { products, count };
  }

  /**
   * Create or update product
   */
  async upsert(productData) {
    if (!supabase) throw new Error('Supabase not configured');

    const productId = productData._id || productData.id;
    const { prices, priceHistory, ...productFields } = productData;

    // Prepare product data
    const dbProduct = {
      id: productId,
      name: productFields.name,
      brand: productFields.brand,
      category: productFields.category,
      description: productFields.description,
      image: productFields.image,
      rating: productFields.rating,
      review_count: productFields.reviewCount || 0,
      price_change: productFields.priceChange
    };

    // Upsert product
    const { data: product, error: productError } = await supabase
      .from('products')
      .upsert(dbProduct, { onConflict: 'id' })
      .select()
      .single();

    if (productError) throw productError;

    // Upsert prices
    if (prices && prices.length > 0) {
      const dbPrices = prices.map(p => ({
        product_id: productId,
        platform: p.platform,
        amount: p.amount,
        url: p.url || p.link
      }));

      // Delete existing prices first
      await supabase.from('prices').delete().eq('product_id', productId);

      // Insert new prices
      const { error: pricesError } = await supabase
        .from('prices')
        .insert(dbPrices);

      if (pricesError) throw pricesError;
    }

    return this.findById(productId);
  }

  /**
   * Update product fields
   */
  async update(productId, updates) {
    if (!supabase) throw new Error('Supabase not configured');

    const { prices, priceHistory, ...productFields } = updates;

    // Convert field names
    const dbUpdates = {};
    if (productFields.name) dbUpdates.name = productFields.name;
    if (productFields.brand) dbUpdates.brand = productFields.brand;
    if (productFields.category) dbUpdates.category = productFields.category;
    if (productFields.description) dbUpdates.description = productFields.description;
    if (productFields.image) dbUpdates.image = productFields.image;
    if (productFields.rating !== undefined) dbUpdates.rating = productFields.rating;
    if (productFields.reviewCount !== undefined) dbUpdates.review_count = productFields.reviewCount;
    if (productFields.priceChange !== undefined) dbUpdates.price_change = productFields.priceChange;

    const { error } = await supabase
      .from('products')
      .update(dbUpdates)
      .eq('id', productId);

    if (error) throw error;

    // Update prices if provided
    if (prices) {
      await supabase.from('prices').delete().eq('product_id', productId);

      const dbPrices = prices.map(p => ({
        product_id: productId,
        platform: p.platform,
        amount: p.amount,
        url: p.url || p.link
      }));

      const { error: pricesError } = await supabase
        .from('prices')
        .insert(dbPrices);

      if (pricesError) throw pricesError;
    }

    return this.findById(productId);
  }

  /**
   * Add price history entry
   */
  async addPriceHistory(productId, historyData) {
    if (!supabase) throw new Error('Supabase not configured');

    const { prices, lowestPrice, averagePrice } = historyData;

    // Insert price history entry
    const { data: history, error: historyError } = await supabase
      .from('price_history')
      .insert({
        product_id: productId,
        lowest_price: lowestPrice,
        average_price: averagePrice,
        date: new Date()
      })
      .select()
      .single();

    if (historyError) throw historyError;

    // Insert price details
    if (prices && prices.length > 0) {
      const dbPriceDetails = prices.map(p => ({
        history_id: history.id,
        platform: p.platform,
        amount: p.amount
      }));

      const { error: detailsError } = await supabase
        .from('price_history_details')
        .insert(dbPriceDetails);

      if (detailsError) throw detailsError;
    }

    return history;
  }

  /**
   * Get all unique brands
   */
  async getBrands() {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('products')
      .select('brand')
      .order('brand');

    if (error) throw error;

    const brands = [...new Set(data.map(p => p.brand))].filter(Boolean);
    return brands;
  }

  /**
   * Get all unique categories
   */
  async getCategories() {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('products')
      .select('category')
      .order('category');

    if (error) throw error;

    const categories = [...new Set(data.map(p => p.category))].filter(Boolean);
    return categories;
  }

  /**
   * Get product statistics
   */
  async getStats() {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .rpc('get_product_statistics');

    if (error) {
      // Fallback if RPC doesn't exist
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      const brands = await this.getBrands();
      const categories = await this.getCategories();

      return {
        totalProducts: count || 0,
        totalBrands: brands.length,
        totalCategories: categories.length
      };
    }

    return data;
  }

  /**
   * Delete product
   */
  async delete(productId) {
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;

    return { success: true };
  }
}

export default new ProductService();
