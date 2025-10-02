import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mock products data
const mockProducts = [
  {
    id: 1,
    name: "Radiant Glow Foundation",
    brand: "LuxeBeauty",
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f3e5f5' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='48' fill='%239c27b0'%3EFoundation%3C/text%3E%3C/svg%3E",
    description: "Long-lasting, buildable coverage with SPF 30",
    category: "Face",
    prices: [
      { platform: "Nykaa", price: 2499, link: "https://www.nykaa.com/?affiliate=beautynomy", rating: 4.5, reviews: 1250 },
      { platform: "Amazon", price: 2299, link: "https://www.amazon.in/?tag=beautynomy-21", rating: 4.3, reviews: 890 },
      { platform: "Flipkart", price: 2399, link: "https://www.flipkart.com/?affid=beautynomy", rating: 4.4, reviews: 567 }
    ]
  },
  {
    id: 2,
    name: "Velvet Matte Lipstick",
    brand: "GlamourPro",
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23fce4ec' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='48' fill='%23e91e63'%3ELipstick%3C/text%3E%3C/svg%3E",
    description: "Rich, creamy formula with all-day wear",
    category: "Lips",
    prices: [
      { platform: "Nykaa", price: 899, link: "https://www.nykaa.com/?affiliate=beautynomy", rating: 4.7, reviews: 2100 },
      { platform: "Amazon", price: 849, link: "https://www.amazon.in/?tag=beautynomy-21", rating: 4.6, reviews: 1450 },
      { platform: "Flipkart", price: 879, link: "https://www.flipkart.com/?affid=beautynomy", rating: 4.5, reviews: 980 }
    ]
  },
  {
    id: 3,
    name: "Hydrating Face Serum",
    brand: "PureGlow",
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23e8f5e9' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='48' fill='%234caf50'%3ESerum%3C/text%3E%3C/svg%3E",
    description: "Vitamin C enriched brightening serum",
    category: "Skincare",
    prices: [
      { platform: "Nykaa", price: 1799, link: "https://www.nykaa.com/?affiliate=beautynomy", rating: 4.8, reviews: 3200 },
      { platform: "Amazon", price: 1699, link: "https://www.amazon.in/?tag=beautynomy-21", rating: 4.7, reviews: 2800 },
      { platform: "Flipkart", price: 1749, link: "https://www.flipkart.com/?affid=beautynomy", rating: 4.6, reviews: 1900 }
    ]
  }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Beautynomy API is running' });
});

app.get('/api/products', (req, res) => {
  const { query, category, brand } = req.query;
  let filtered = mockProducts;
  
  if (query) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.brand.toLowerCase().includes(query.toLowerCase())
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
