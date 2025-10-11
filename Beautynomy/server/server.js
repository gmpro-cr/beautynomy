import express from 'express';
import cors from 'cors';
import { products } from './products-data.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Beautynomy API is running!',
    endpoints: {
      products: '/api/products?query=<search_term>',
      health: '/'
    },
    totalProducts: products.length,
    platforms: 5,
    platformNames: ['Nykaa', 'Amazon India', 'Flipkart', 'Purplle', 'Myntra']
  });
});

// Get all products or search products
app.get('/api/products', (req, res) => {
  try {
    const { query, category, brand } = req.query;

    let filtered = [...products];

    // Search by query (name, brand, description, category)
    if (query && query.toLowerCase() !== 'all') {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by category
    if (category && category !== 'All') {
      filtered = filtered.filter(product =>
        product.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by brand
    if (brand && brand !== 'All') {
      filtered = filtered.filter(product =>
        product.brand.toLowerCase() === brand.toLowerCase()
      );
    }

    res.json(filtered);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
  try {
    const product = products.find(p => p._id === req.params.id);
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
app.get('/api/brands', (req, res) => {
  try {
    const brands = [...new Set(products.map(p => p.brand))].sort();
    res.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available categories
app.get('/api/categories', (req, res) => {
  try {
    const categories = [...new Set(products.map(p => p.category))].sort();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get price statistics
app.get('/api/stats', (req, res) => {
  try {
    const stats = {
      totalProducts: products.length,
      totalPlatforms: 5,
      platforms: ['Nykaa', 'Amazon India', 'Flipkart', 'Purplle', 'Myntra'],
      categories: [...new Set(products.map(p => p.category))],
      brands: [...new Set(products.map(p => p.brand))],
      averageProducts: Math.floor(products.length / 5),
      priceRange: {
        min: Math.min(...products.flatMap(p => p.prices.map(pr => pr.amount))),
        max: Math.max(...products.flatMap(p => p.prices.map(pr => pr.amount)))
      }
    };
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Beautynomy API Server running on port ${PORT}`);
  console.log(`📊 Total Products: ${products.length}`);
  console.log(`🛒 E-commerce Platforms: Nykaa, Amazon, Flipkart, Purplle, Myntra`);
  console.log(`🔗 API Endpoints:`);
  console.log(`   - Health: http://localhost:${PORT}/`);
  console.log(`   - Products: http://localhost:${PORT}/api/products`);
  console.log(`   - Stats: http://localhost:${PORT}/api/stats`);
});
