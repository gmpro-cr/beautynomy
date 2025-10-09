import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// Backend analytics tracking
const analytics = {
  productViews: {},
  affiliateClicks: {},
  searchQueries: []
};

// Helper function to generate affiliate links
function generateAffiliateLink(platform, productName, productId) {
  // Replace spaces with dashes and make lowercase for URL
  const urlSlug = productName.toLowerCase().replace(/\s+/g, '-');
  
  // Simulate affiliate links with tracking parameters
  const affiliateId = 'beautynomy123'; // Your affiliate ID
  
  switch(platform) {
    case 'Nykaa':
      return `https://www.nykaa.com/search/result/?q=${encodeURIComponent(productName)}&af=${affiliateId}&pid=${productId}`;
    case 'Amazon':
      return `https://www.amazon.in/s?k=${encodeURIComponent(productName)}&tag=${affiliateId}&ref=beautynomy_${productId}`;
    case 'Flipkart':
      return `https://www.flipkart.com/search?q=${encodeURIComponent(productName)}&affid=${affiliateId}&prodid=${productId}`;
    case 'Sephora':
      return `https://www.sephora.in/search?q=${encodeURIComponent(productName)}&affiliate=${affiliateId}`;
    default:
      return `https://www.google.com/search?q=${encodeURIComponent(productName)}`;
  }
}

// Product data with proper affiliate links
const products = [
  // FOUNDATIONS
  {
    id: 1,
    name: "Maybelline Fit Me Matte+Poreless Foundation",
    brand: "Maybelline",
    category: "Face",
    description: "Lightweight foundation that matches skin tone and texture. Refines pores and controls shine.",
    image: "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", amount: 459, link: "", rating: 4.4, reviews: 23400 },
      { platform: "Amazon", amount: 399, link: "", rating: 4.3, reviews: 31200 },
      { platform: "Flipkart", amount: 425, link: "", rating: 4.2, reviews: 18900 }
    ]
  },
  {
    id: 2,
    name: "Lakme 9 to 5 Naturale Foundation",
    brand: "Lakme",
    category: "Face",
    description: "All-day matte foundation with SPF 20. Lightweight and buildable coverage for natural finish.",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", amount: 375, link: "", rating: 4.3, reviews: 18700 },
      { platform: "Amazon", amount: 325, link: "", rating: 4.2, reviews: 21500 },
      { platform: "Flipkart", amount: 350, link: "", rating: 4.1, reviews: 14200 }
    ]
  },
  {
    id: 3,
    name: "L'Oreal Paris Infallible 24H Fresh Wear Foundation",
    brand: "L'Oreal Paris",
    category: "Face",
    description: "Transfer-resistant, breathable foundation. Full coverage with natural finish that lasts 24 hours.",
    image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", amount: 1149, link: "", rating: 4.5, reviews: 15600 },
      { platform: "Amazon", amount: 1049, link: "", rating: 4.4, reviews: 19200 },
      { platform: "Flipkart", amount: 1099, link: "", rating: 4.3, reviews: 12800 }
    ]
  },
  {
    id: 4,
    name: "Sugar Cosmetics Ace of Face Foundation Stick",
    brand: "Sugar Cosmetics",
    category: "Face",
    description: "Portable foundation stick with buildable coverage. Long-lasting formula with matte finish.",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", amount: 999, link: "", rating: 4.4, reviews: 9800 },
      { platform: "Amazon", amount: 949, link: "", rating: 4.3, reviews: 7600 },
      { platform: "Flipkart", amount: 975, link: "", rating: 4.2, reviews: 5900 }
    ]
  },

  // LIPSTICKS
  {
    id: 5,
    name: "Maybelline SuperStay Matte Ink Liquid Lipstick",
    brand: "Maybelline",
    category: "Lips",
    description: "Up to 16HR wear liquid matte lipstick. Intense color with comfortable no-budge formula.",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", amount: 599, link: "", rating: 4.6, reviews: 32100 },
      { platform: "Amazon", amount: 549, link: "", rating: 4.5, reviews: 38900 },
      { platform: "Flipkart", amount: 575, link: "", rating: 4.4, reviews: 27600 }
    ]
  },
  {
    id: 6,
    name: "Lakme 9 to 5 Primer + Matte Lip Color",
    brand: "Lakme",
    category: "Lips",
    description: "Priming lipstick with intense color payoff. Matte finish with long-lasting formula.",
    image: "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", amount: 425, link: "", rating: 4.4, reviews: 19800 },
      { platform: "Amazon", amount: 375, link: "", rating: 4.3, reviews: 24500 },
      { platform: "Flipkart", amount: 399, link: "", rating: 4.2, reviews: 16700 }
    ]
  },
  {
    id: 7,
    name: "Nykaa Matte To Last! Liquid Lipstick",
    brand: "Nykaa",
    category: "Lips",
    description: "Long-lasting liquid lipstick with intense matte finish. Smudge-proof and transfer-resistant.",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", amount: 349, link: "", rating: 4.3, reviews: 14200 },
      { platform: "Amazon", amount: 299, link: "", rating: 4.2, reviews: 11800 },
      { platform: "Flipkart", amount: 325, link: "", rating: 4.1, reviews: 8900 }
    ]
  },
  {
    id: 8,
    name: "Sugar Cosmetics Smudge Me Not Liquid Lipstick",
    brand: "Sugar Cosmetics",
    category: "Lips",
    description: "Transfer-proof liquid lipstick with rich matte finish. Lightweight and comfortable wear.",
    image: "https://images.unsplash.com/photo-1634108597344-fea6c9e937e2?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", amount: 599, link: "", rating: 4.5, reviews: 14500 },
      { platform: "Amazon", amount: 549, link: "", rating: 4.4, reviews: 11200 },
      { platform: "Flipkart", amount: 575, link: "", rating: 4.3, reviews: 8700 }
    ]
  },
  {
    id: 9,
    name: "MAC Retro Matte Lipstick",
    brand: "MAC",
    category: "Lips",
    description: "Vivid, full-coverage matte lipstick with no-shine finish. Highly pigmented formula.",
    image: "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", amount: 1900, link: "", rating: 4.7, reviews: 8950 },
      { platform: "Amazon", amount: 1850, link: "", rating: 4.6, reviews: 6200 },
      { platform: "Flipkart", amount: 1875, link: "", rating: 4.5, reviews: 4100 }
    ]
  },
  {
    id: 10,
    name: "Colorbar Velvet Matte Lipstick",
    brand: "Colorbar",
    category: "Lips",
    description: "Smooth, creamy texture with rich matte finish. Enriched with vitamin E and jojoba oil.",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", amount: 650, link: "", rating: 4.3, reviews: 10200 },
      { platform: "Amazon", amount: 599, link: "", rating: 4.2, reviews: 8100 },
      { platform: "Flipkart", amount: 625, link: "", rating: 4.1, reviews: 5900 }
    ]
  },

  // SERUMS
  {
    id: 11,
    name: "Minimalist 10% Vitamin C Face Serum",
    brand: "Minimalist",
    category: "Skincare",
    description: "Pure L-Ascorbic Acid with Acetyl Glucosamine. Brightens skin and reduces hyperpigmentation.",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", amount: 699, link: "", rating: 4.8, reviews: 42100 },
      { platform: "Amazon", amount: 649, link: "", rating: 4.7, reviews: 38500 },
      { platform: "Flipkart", amount: 675, link: "", rating: 4.6, reviews: 28900 }
    ]
  },
  {
    id: 12,
    name: "Plum 15% Vitamin C Face Serum",
    brand: "Plum",
    category: "Skincare",
    description: "Ethyl Ascorbic Acid with Kakadu Plum. Brightens, reduces dark spots, and fights aging.",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", amount: 795, link: "", rating: 4.6, reviews: 28700 },
      { platform: "Amazon", amount: 745, link: "", rating: 4.5, reviews: 32100 },
      { platform: "Flipkart", amount: 775, link: "", rating: 4.4, reviews: 21800 }
    ]
  },
  {
    id: 13,
    name: "The Ordinary Niacinamide 10% + Zinc 1%",
    brand: "The Ordinary",
    category: "Skincare",
    description: "High-strength vitamin and mineral blemish formula. Balances sebum and minimizes pores.",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", amount: 599, link: "", rating: 4.7, reviews: 35400 },
      { platform: "Amazon", amount: 549, link: "", rating: 4.6, reviews: 41200 },
      { platform: "Flipkart", amount: 575, link: "", rating: 4.5, reviews: 26800 }
    ]
  },
  {
    id: 14,
    name: "Dot & Key Vitamin C + E Super Bright Serum",
    brand: "Dot & Key",
    category: "Skincare",
    description: "Powerful antioxidant serum with 20% vitamin C. Brightens and evens skin tone.",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", amount: 895, link: "", rating: 4.5, reviews: 18900 },
      { platform: "Amazon", amount: 825, link: "", rating: 4.4, reviews: 21600 },
      { platform: "Flipkart", amount: 865, link: "", rating: 4.3, reviews: 14200 }
    ]
  },

  // FACE WASH
  {
    id: 15,
    name: "Cetaphil Gentle Skin Cleanser",
    brand: "Cetaphil",
    category: "Skincare",
    description: "Mild, non-irritating formula. Cleanses without drying, suitable for sensitive skin.",
    image: "https://images.unsplash.com/photo-1585128903994-92ae24d70e59?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", amount: 799, link: "", rating: 4.7, reviews: 38900 },
      { platform: "Amazon", amount: 749, link: "", rating: 4.6, reviews: 42100 },
      { platform: "Flipkart", amount: 775, link: "", rating: 4.5, reviews: 31200 }
    ]
  }
];

// Generate affiliate links for all products
products.forEach(product => {
  product.prices.forEach(priceObj => {
    priceObj.link = generateAffiliateLink(priceObj.platform, product.name, product.id);
  });
});

// BACKEND OPERATIONS

// Root endpoint
app.get('/', (req, res) => res.json({ 
  message: 'Beautynomy API - Beauty Product Price Comparison',
  totalProducts: products.length,
  categories: ['Face', 'Lips', 'Eyes', 'Skincare', 'Nails'],
  analytics: {
    totalProductViews: Object.values(analytics.productViews).reduce((a, b) => a + b, 0),
    totalAffiliateClicks: Object.values(analytics.affiliateClicks).reduce((a, b) => a + b, 0),
    totalSearches: analytics.searchQueries.length
  }
}));

// Health check endpoint
app.get('/api/health', (req, res) => res.json({ 
  status: 'OK', 
  products: products.length,
  timestamp: new Date().toISOString()
}));

// Get all products or search/filter
app.get('/api/products', (req, res) => {
  const { query, category, brand } = req.query;
  let filtered = products;
  
  // Track search queries
  if (query) {
    analytics.searchQueries.push({
      query,
      timestamp: new Date().toISOString()
    });
    
    const searchTerm = query.toLowerCase();
    filtered = products.filter(p => 
      p.name.toLowerCase().includes(searchTerm) ||
      p.brand.toLowerCase().includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm)
    );
  }
  
  if (category && category !== 'All') {
    filtered = filtered.filter(p => p.category === category);
  }
  
  if (brand && brand !== 'All') {
    filtered = filtered.filter(p => p.brand === brand);
  }
  
  res.json(filtered);
});

// Get single product by ID
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  // Track product views
  if (!analytics.productViews[product.id]) {
    analytics.productViews[product.id] = 0;
  }
  analytics.productViews[product.id]++;
  
  res.json(product);
});

// Track affiliate link clicks
app.post('/api/track/click', (req, res) => {
  const { productId, platform } = req.body;
  
  if (!productId || !platform) {
    return res.status(400).json({ error: 'Missing productId or platform' });
  }
  
  const key = `${productId}-${platform}`;
  if (!analytics.affiliateClicks[key]) {
    analytics.affiliateClicks[key] = 0;
  }
  analytics.affiliateClicks[key]++;
  
  res.json({ success: true, message: 'Click tracked' });
});

// Get analytics data
app.get('/api/analytics', (req, res) => {
  const topProducts = Object.entries(analytics.productViews)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id, views]) => ({
      product: products.find(p => p.id === parseInt(id)),
      views
    }));
  
  const topSearches = analytics.searchQueries
    .slice(-20)
    .reverse();
  
  res.json({
    totalProductViews: Object.values(analytics.productViews).reduce((a, b) => a + b, 0),
    totalAffiliateClicks: Object.values(analytics.affiliateClicks).reduce((a, b) => a + b, 0),
    totalSearches: analytics.searchQueries.length,
    topProducts,
    recentSearches: topSearches
  });
});

// Get trending products (most viewed)
app.get('/api/trending', (req, res) => {
  const trending = Object.entries(analytics.productViews)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id]) => products.find(p => p.id === parseInt(id)))
    .filter(Boolean);
  
  // If no views yet, return random products
  if (trending.length === 0) {
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return res.json(shuffled.slice(0, 8));
  }
  
  res.json(trending);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✨ Beautynomy Server running on port ${PORT}`);
  console.log(`📊 Analytics tracking enabled`);
  console.log(`🔗 Affiliate links generated for ${products.length} products`);
});
