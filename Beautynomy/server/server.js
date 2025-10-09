import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Enhanced products database with review counts and price history
const products = [
  // FOUNDATIONS
  {
    _id: '1',
    name: 'Maybelline Fit Me Matte+Poreless Foundation',
    brand: 'MAYBELLINE',
    category: 'Foundation',
    description: 'Lightweight foundation that matches skin tone and texture. Refines pores and controls shine for a natural, seamless finish.',
    image: 'https://images.unsplash.com/photo-1631214524020-7e18db3a8b39?w=400',
    rating: 4.4,
    reviewCount: 2847,
    priceChange: -5, // Price dropped by 5%
    prices: [
      { platform: 'Nykaa', amount: 459, url: 'https://www.nykaa.com' },
      { platform: 'Amazon', amount: 399, url: 'https://www.amazon.in' },
      { platform: 'Flipkart', amount: 425, url: 'https://www.flipkart.com' }
    ]
  },
  {
    _id: '2',
    name: 'Lakme 9 to 5 Naturale Foundation',
    brand: 'LAKME',
    category: 'Foundation',
    description: 'All-day matte foundation with SPF 20. Lightweight and buildable coverage for a natural, flawless finish.',
    image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400',
    rating: 4.3,
    reviewCount: 1923,
    prices: [
      { platform: 'Nykaa', amount: 375, url: 'https://www.nykaa.com' },
      { platform: 'Amazon', amount: 325, url: 'https://www.amazon.in' },
      { platform: 'Flipkart', amount: 350, url: 'https://www.flipkart.com' }
    ]
  },
  {
    _id: '3',
    name: "L'Oreal Paris Infallible 24H Fresh Wear Foundation",
    brand: 'L\'OREAL PARIS',
    category: 'Foundation',
    description: 'Transfer-resistant, breathable foundation. Full coverage with natural finish that lasts 24 hours without feeling heavy.',
    image: 'https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=400',
    rating: 4.5,
    reviewCount: 3156,
    priceChange: 3, // Price increased by 3%
    prices: [
      { platform: 'Nykaa', amount: 1149, url: 'https://www.nykaa.com' },
      { platform: 'Amazon', amount: 1049, url: 'https://www.amazon.in' },
      { platform: 'Flipkart', amount: 1099, url: 'https://www.flipkart.com' }
    ]
  },
  {
    _id: '4',
    name: 'Sugar Cosmetics Ace of Face Foundation Stick',
    brand: 'SUGAR COSMETICS',
    category: 'Foundation',
    description: 'Portable foundation stick with buildable coverage. Long-lasting formula with matte finish, perfect for on-the-go touch-ups.',
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=400',
    rating: 4.4,
    reviewCount: 1567,
    prices: [
      { platform: 'Nykaa', amount: 999, url: 'https://www.nykaa.com' },
      { platform: 'Amazon', amount: 949, url: 'https://www.amazon.in' },
      { platform: 'Flipkart', amount: 975, url: 'https://www.flipkart.com' }
    ]
  },

  // LIPSTICKS
  {
    _id: '5',
    name: 'Maybelline SuperStay Matte Ink Liquid Lipstick',
    brand: 'MAYBELLINE',
    category: 'Lipstick',
    description: 'Up to 16HR wear liquid matte lipstick. Intense color with comfortable, no-budge formula that stays put all day.',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
    rating: 4.6,
    reviewCount: 4892,
    priceChange: -8,
    prices: [
      { platform: 'Nykaa', amount: 599, url: 'https://www.nykaa.com' },
      { platform: 'Amazon', amount: 549, url: 'https://www.amazon.in' },
      { platform: 'Flipkart', amount: 575, url: 'https://www.flipkart.com' }
    ]
  },
  {
    _id: '6',
    name: 'Lakme 9 to 5 Primer + Matte Lip Color',
    brand: 'LAKME',
    category: 'Lipstick',
    description: 'Priming lipstick with intense color payoff. Matte finish with long-lasting formula that keeps lips moisturized.',
    image: 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=400',
    rating: 4.4,
    reviewCount: 2341,
    prices: [
      { platform: 'Nykaa', amount: 425, url: 'https://www.nykaa.com' },
      { platform: 'Amazon', amount: 375, url: 'https://www.amazon.in' },
      { platform: 'Flipkart', amount: 399, url: 'https://www.flipkart.com' }
    ]
  },
  {
    _id: '7',
    name: 'Nykaa Matte To Last! Liquid Lipstick',
    brand: 'NYKAA',
    category: 'Lipstick',
    description: 'Long-lasting liquid lipstick with intense matte finish. Smudge-proof and transfer-resistant formula for all-day wear.',
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=400',
    rating: 4.3,
    reviewCount: 1876,
    prices: [
      { platform: 'Nykaa', amount: 349, url: 'https://www.nykaa.com' },
      { platform: 'Amazon', amount: 299, url: 'https://www.amazon.in' },
      { platform: 'Flipkart', amount: 325, url: 'https://www.flipkart.com' }
    ]
  },
  {
    _id: '8',
    name: 'Sugar Cosmetics Smudge Me Not Liquid Lipstick',
    brand: 'SUGAR COSMETICS',
    category: 'Lipstick',
    description: 'Transfer-proof liquid lipstick with rich matte finish. Lightweight and comfortable wear that lasts through meals.',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
    rating: 4.5,
    reviewCount: 3298,
    priceChange: -10,
    prices: [
      { platform: 'Nykaa', amount: 599, url: 'https://www.nykaa.com' },
      { platform: 'Amazon', amount: 549, url: 'https://www.amazon.in' },
      { platform: 'Flipkart', amount: 575, url: 'https://www.flipkart.com' }
    ]
  },
  {
    _id: '9',
    name: 'MAC Retro Matte Lipstick',
    brand: 'MAC',
    category: 'Lipstick',
    description: 'Vivid, full-coverage matte lipstick with no-shine finish. Highly pigmented formula with iconic MAC quality.',
    image: 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=400',
    rating: 4.7,
    reviewCount: 5234,
    prices: [
      { platform: 'Nykaa', amount: 1900, url: 'https://www.nykaa.com' },
      { platform: 'Amazon', amount: 1850, url: 'https://www.amazon.in' },
      { platform: 'Flipkart', amount: 1875, url: 'https://www.flipkart.com' }
    ]
  },
  {
    _id: '10',
    name: 'Colorbar Velvet Matte Lipstick',
    brand: 'COLORBAR',
    category: 'Lipstick',
    description: 'Smooth, creamy texture with rich matte finish. Enriched with vitamin E and jojoba oil for soft, supple lips.',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
    rating: 4.3,
    reviewCount: 1654,
    prices: [
      { platform: 'Nykaa', amount: 650, url: 'https://www.nykaa.com' },
      { platform: 'Amazon', amount: 599, url: 'https://www.amazon.in' },
      { platform: 'Flipkart', amount: 625, url: 'https://www.flipkart.com' }
    ]
  },

  // SERUMS
  {
    _id: '11',
    name: 'Minimalist 10% Vitamin C Face Serum',
    brand: 'MINIMALIST',
    category: 'Serum',
    description: 'Pure L-Ascorbic Acid with Acetyl Glucosamine. Brightens skin and reduces hyperpigmentation for an even complexion.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
    rating: 4.7,
    reviewCount: 6789,
    priceChange: -12,
    prices: [
      { platform: 'Nykaa', amount: 699, url: 'https://www.nykaa.com' },
      { platform: 'Amazon', amount: 649, url: 'https://www.amazon.in' },
      { platform: 'Flipkart', amount: 675, url: 'https://www.flipkart.com' }
    ]
  },
  {
    _id: '12',
    name: 'Plum 15% Vitamin C Face Serum',
    brand: 'PLUM',
    category: 'Serum',
    description: 'Ethyl Ascorbic Acid with Kakadu Plum. Brightens, reduces dark spots, and fights signs of aging for radiant skin.',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400',
    rating: 4.3,
    reviewCount: 3456,
    prices: [
      { platform: 'Nykaa', amount: 795, url: 'https://www.nykaa.com' },
      { platform: 'Amazon', amount: 745, url: 'https://www.amazon.in' },
      { platform: 'Flipkart', amount: 775, url: 'https://www.flipkart.com' }
    ]
  },
  {
    _id: '13',
    name: 'The Ordinary Niacinamide 10% + Zinc 1%',
    brand: 'THE ORDINARY',
    category: 'Serum',
    description: 'High-strength vitamin and mineral blemish formula. Balances sebum production and minimizes pores for clearer skin.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
    rating: 4.8,
    reviewCount: 8932,
    prices: [
      { platform: 'Nykaa', amount: 599, url: 'https://www.nykaa.com' },
      { platform: 'Amazon', amount: 549, url: 'https://www.amazon.in' },
      { platform: 'Flipkart', amount: 575, url: 'https://www.flipkart.com' }
    ]
  },
  {
    _id: '14',
    name: 'Dot & Key Vitamin C + E Super Bright Serum',
    brand: 'DOT & KEY',
    category: 'Serum',
    description: 'Powerful antioxidant serum with 20% vitamin C. Brightens and evens skin tone while fighting free radical damage.',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400',
    rating: 4.6,
    reviewCount: 4567,
    prices: [
      { platform: 'Nykaa', amount: 895, url: 'https://www.nykaa.com' },
      { platform: 'Amazon', amount: 825, url: 'https://www.amazon.in' },
      { platform: 'Flipkart', amount: 865, url: 'https://www.flipkart.com' }
    ]
  },

  // SKINCARE
  {
    _id: '15',
    name: 'Cetaphil Gentle Skin Cleanser',
    brand: 'CETAPHIL',
    category: 'Skincare',
    description: 'Mild, non-irritating formula. Cleanses without drying, suitable for sensitive skin and all skin types.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    rating: 4.7,
    reviewCount: 7234,
    prices: [
      { platform: 'Nykaa', amount: 799, url: 'https://www.nykaa.com' },
      { platform: 'Amazon', amount: 749, url: 'https://www.amazon.in' },
      { platform: 'Flipkart', amount: 775, url: 'https://www.flipkart.com' }
    ]
  },
  {
    _id: '16',
    name: 'The Ordinary Hyaluronic Acid 2% + B5',
    brand: 'THE ORDINARY',
    category: 'Serum',
    description: 'Hydration support formula with multiple molecular weights of hyaluronic acid. Plumps and hydrates skin deeply.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
    rating: 4.8,
    reviewCount: 9234,
    priceChange: -7,
    prices: [
      { platform: 'Nykaa', amount: 699, url: 'https://www.nykaa.com' },
      { platform: 'Amazon', amount: 649, url: 'https://www.amazon.in' },
      { platform: 'Flipkart', amount: 675, url: 'https://www.flipkart.com' }
    ]
  },
  {
    _id: '17',
    name: 'Neutrogena Hydro Boost Water Gel',
    brand: 'NEUTROGENA',
    category: 'Skincare',
    description: 'Oil-free face moisturizer with hyaluronic acid. Absorbs quickly for supple, hydrated skin with a refreshing gel texture.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    rating: 4.5,
    reviewCount: 5678,
    prices: [
      { platform: 'Nykaa', amount: 899, url: 'https://www.nykaa.com' },
      { platform: 'Amazon', amount: 849, url: 'https://www.amazon.in' },
      { platform: 'Flipkart', amount: 875, url: 'https://www.flipkart.com' }
    ]
  },
  {
    _id: '18',
    name: 'Clinique Moisture Surge 72-Hour Hydrator',
    brand: 'CLINIQUE',
    category: 'Skincare',
    description: 'Auto-replenishing hydration gel-cream. Maintains 72 hours of non-stop moisture for plump, healthy-looking skin.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    rating: 4.8,
    reviewCount: 4321,
    prices: [
      { platform: 'Nykaa', amount: 3450, url: 'https://www.nykaa.com' },
      { platform: 'Amazon', amount: 3350, url: 'https://www.amazon.in' },
      { platform: 'Flipkart', amount: 3400, url: 'https://www.flipkart.com' }
    ]
  },

  // MASCARA
  {
    _id: '19',
    name: 'Maybelline Lash Sensational Sky High Mascara',
    brand: 'MAYBELLINE',
    category: 'Mascara',
    description: 'Volumizing and lengthening mascara with bamboo extract. Delivers limitless length and full volume for sky-high lashes.',
    image: 'https://images.unsplash.com/photo-1631214524020-7e18db3a8b39?w=400',
    rating: 4.6,
    reviewCount: 5432,
    priceChange: -6,
    prices: [
      { platform: 'Nykaa', amount: 699, url: 'https://www.nykaa.com' },
      { platform: 'Amazon', amount: 649, url: 'https://www.amazon.in' },
      { platform: 'Flipkart', amount: 675, url: 'https://www.flipkart.com' }
    ]
  },
  {
    _id: '20',
    name: 'Lakme Absolute Flutter Secrets Mascara',
    brand: 'LAKME',
    category: 'Mascara',
    description: 'Dramatic volume and curl mascara. Unique hourglass brush coats every lash for fuller, fluttery lashes.',
    image: 'https://images.unsplash.com/photo-1631214524020-7e18db3a8b39?w=400',
    rating: 4.3,
    reviewCount: 2876,
    prices: [
      { platform: 'Nykaa', amount: 495, url: 'https://www.nykaa.com' },
      { platform: 'Amazon', amount: 445, url: 'https://www.amazon.in' },
      { platform: 'Flipkart', amount: 475, url: 'https://www.flipkart.com' }
    ]
  },

  // BLUSH
  {
    _id: '21',
    name: 'Nykaa Get Cheeky! Blush Duo',
    brand: 'NYKAA',
    category: 'Blush',
    description: 'Dual-shade blush palette for customizable color. Blendable formula with a natural, healthy flush.',
    image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400',
    rating: 4.4,
    reviewCount: 1987,
    prices: [
      { platform: 'Nykaa', amount: 499, url: 'https://www.nykaa.com' },
      { platform: 'Amazon', amount: 449, url: 'https://www.amazon.in' },
      { platform: 'Flipkart', amount: 475, url: 'https://www.flipkart.com' }
    ]
  },
  {
    _id: '22',
    name: 'Sugar Cosmetics Contour De Force Face Palette',
    brand: 'SUGAR COSMETICS',
    category: 'Blush',
    description: 'Multi-use face palette with blush, bronzer, and highlighter. Professional-grade formula for sculpted, radiant look.',
    image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400',
    rating: 4.6,
    reviewCount: 3456,
    prices: [
      { platform: 'Nykaa', amount: 899, url: 'https://www.nykaa.com' },
      { platform: 'Amazon', amount: 849, url: 'https://www.amazon.in' },
      { platform: 'Flipkart', amount: 875, url: 'https://www.flipkart.com' }
    ]
  },
  {
    _id: '23',
    name: 'Maybelline Fit Me Blush',
    brand: 'MAYBELLINE',
    category: 'Blush',
    description: 'Buildable powder blush with a natural finish. Lightweight formula blends seamlessly for a healthy glow.',
    image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400',
    rating: 4.4,
    reviewCount: 2234,
    prices: [
      { platform: 'Nykaa', amount: 349, url: 'https://www.nykaa.com' },
      { platform: 'Amazon', amount: 299, url: 'https://www.amazon.in' },
      { platform: 'Flipkart', amount: 325, url: 'https://www.flipkart.com' }
    ]
  },
  {
    _id: '24',
    name: 'Lakme Absolute Face Stylist Blush Duos',
    brand: 'LAKME',
    category: 'Blush',
    description: 'Dual-tone blush for dimension and depth. Silky texture with long-lasting, buildable color.',
    image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400',
    rating: 4.3,
    reviewCount: 1876,
    prices: [
      { platform: 'Nykaa', amount: 475, url: 'https://www.nykaa.com' },
      { platform: 'Amazon', amount: 425, url: 'https://www.amazon.in' },
      { platform: 'Flipkart', amount: 450, url: 'https://www.flipkart.com' }
    ]
  },

  // Additional premium products
  {
    _id: '25',
    name: 'Estee Lauder Double Wear Foundation',
    brand: 'ESTEE LAUDER',
    category: 'Foundation',
    description: 'Flawless, natural matte finish foundation. 24-hour staying power with medium to full buildable coverage.',
    image: 'https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=400',
    rating: 4.8,
    reviewCount: 6789,
    prices: [
      { platform: 'Nykaa', amount: 3850, url: 'https://www.nykaa.com' },
      { platform: 'Amazon', amount: 3750, url: 'https://www.amazon.in' },
      { platform: 'Flipkart', amount: 3800, url: 'https://www.flipkart.com' }
    ]
  },
  {
    _id: '26',
    name: 'Charlotte Tilbury Pillow Talk Lipstick',
    brand: 'CHARLOTTE TILBURY',
    category: 'Lipstick',
    description: 'Award-winning matte lipstick in universally flattering nude-pink. Enriched with orchid extract for cushiony lips.',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
    rating: 4.9,
    reviewCount: 8765,
    prices: [
      { platform: 'Nykaa', amount: 2750, url: 'https://www.nykaa.com' },
      { platform: 'Amazon', amount: 2700, url: 'https://www.amazon.in' },
      { platform: 'Flipkart', amount: 2725, url: 'https://www.flipkart.com' }
    ]
  },
  {
    _id: '27',
    name: 'Drunk Elephant C-Firma Vitamin C Serum',
    brand: 'DRUNK ELEPHANT',
    category: 'Serum',
    description: 'Potent vitamin C day serum with 15% L-Ascorbic Acid. Firms, brightens, and evens skin tone for radiant complexion.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
    rating: 4.7,
    reviewCount: 4532,
    prices: [
      { platform: 'Nykaa', amount: 8750, url: 'https://www.nykaa.com' },
      { platform: 'Amazon', amount: 8650, url: 'https://www.amazon.in' },
      { platform: 'Flipkart', amount: 8700, url: 'https://www.flipkart.com' }
    ]
  },
  {
    _id: '28',
    name: 'Benefit Hoola Matte Bronzer',
    brand: 'BENEFIT',
    category: 'Blush',
    description: 'Natural-looking matte bronzer. Buildable, foolproof formula for warm, sun-kissed glow without shimmer.',
    image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400',
    rating: 4.7,
    reviewCount: 5678,
    prices: [
      { platform: 'Nykaa', amount: 2850, url: 'https://www.nykaa.com' },
      { platform: 'Amazon', amount: 2750, url: 'https://www.amazon.in' },
      { platform: 'Flipkart', amount: 2800, url: 'https://www.flipkart.com' }
    ]
  },
  {
    _id: '29',
    name: 'Too Faced Better Than Sex Mascara',
    brand: 'TOO FACED',
    category: 'Mascara',
    description: 'Hourglass-shaped brush delivers dramatic volume and length. Intense black pigment for show-stopping lashes.',
    image: 'https://images.unsplash.com/photo-1631214524020-7e18db3a8b39?w=400',
    rating: 4.8,
    reviewCount: 7891,
    priceChange: -9,
    prices: [
      { platform: 'Nykaa', amount: 2350, url: 'https://www.nykaa.com' },
      { platform: 'Amazon', amount: 2250, url: 'https://www.amazon.in' },
      { platform: 'Flipkart', amount: 2300, url: 'https://www.flipkart.com' }
    ]
  },
  {
    _id: '30',
    name: 'La Roche-Posay Effaclar Duo+ Moisturizer',
    brand: 'LA ROCHE-POSAY',
    category: 'Skincare',
    description: 'Anti-acne moisturizer with niacinamide and salicylic acid. Targets blemishes while hydrating for clearer skin.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    rating: 4.6,
    reviewCount: 3987,
    prices: [
      { platform: 'Nykaa', amount: 1650, url: 'https://www.nykaa.com' },
      { platform: 'Amazon', amount: 1550, url: 'https://www.amazon.in' },
      { platform: 'Flipkart', amount: 1600, url: 'https://www.flipkart.com' }
    ]
  }
];

// API endpoint
app.get('/api/products', (req, res) => {
  try {
    const query = req.query.query?.toLowerCase() || '';
    
    let filteredProducts = products;
    
    if (query && query !== 'all') {
      filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }
    
    res.json(filteredProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Beautynomy API is running!',
    endpoints: {
      products: '/api/products?query=<search_term>'
    },
    totalProducts: products.length
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Beautynomy API running on port ${PORT}`);
  console.log(`📦 Loaded ${products.length} products`);
});
