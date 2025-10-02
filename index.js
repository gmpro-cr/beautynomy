import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const products = [
  {
    id: 1,
    name: "Radiant Glow Foundation",
    brand: "LuxeBeauty",
    category: "Face",
    prices: [
      { platform: "Nykaa", price: 2499, link: "https://www.nykaa.com" },
      { platform: "Amazon", price: 2299, link: "https://www.amazon.in" }
    ]
  }
];

app.get('/api/products', (req, res) => res.json(products));
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

app.listen(PORT, () => console.log(`Server on ${PORT}`));
