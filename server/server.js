import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const mockProducts = [
  // ... your products here ...
];

// Homepage route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Beautynomy API! 🌸',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      search: '/api/products?query=lipstick'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Beautynomy API is running!' });
});

app.get('/api/products', (req, res) => {
  const { query, category, brand } = req.query;
  let filtered = [...mockProducts];
  
  if (query) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.brand.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
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
  console.log(`🚀 Beautynomy Server running on port ${PORT}`);
});
