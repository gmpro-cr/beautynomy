import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Comprehensive products database - Top 5 Indian E-commerce Platforms
// Platforms: Nykaa, Amazon India, Flipkart, Purplle, Myntra
const products = [
  // ============ FOUNDATIONS ============
  {
    _id: '1',
    name: 'Maybelline Fit Me Matte+Poreless Foundation',
    brand: 'MAYBELLINE',
    category: 'Foundation',
    description: 'Lightweight foundation that matches skin tone and texture. Refines pores and controls shine for a natural, seamless finish.',
    image: 'https://images.unsplash.com/photo-1631214524020-7e18db3a8b39?w=400',
    rating: 4.4,
    reviewCount: 2847,
    priceChange: -5,
    prices: [
      { platform: 'Nykaa', amount: 459, url: 'https://www.nykaa.com/maybelline-fit-me-foundation' },
      { platform: 'Amazon', amount: 399, url: 'https://www.amazon.in/Maybelline-Foundation' },
      { platform: 'Flipkart', amount: 425, url: 'https://www.flipkart.com/maybelline-foundation' },
      { platform: 'Purplle', amount: 440, url: 'https://www.purplle.com/maybelline-foundation' },
      { platform: 'Myntra', amount: 450, url: 'https://www.myntra.com/maybelline-foundation' }
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
      { platform: 'Nykaa', amount: 375, url: 'https://www.nykaa.com/lakme-foundation' },
      { platform: 'Amazon', amount: 325, url: 'https://www.amazon.in/Lakme-Foundation' },
      { platform: 'Flipkart', amount: 350, url: 'https://www.flipkart.com/lakme-foundation' },
      { platform: 'Purplle', amount: 365, url: 'https://www.purplle.com/lakme-foundation' },
      { platform: 'Myntra', amount: 370, url: 'https://www.myntra.com/lakme-foundation' }
    ]
  },
  {
    _id: '3',
    name: "L'Oreal Paris Infallible 24H Fresh Wear Foundation",
    brand: "L'OREAL PARIS",
    category: 'Foundation',
    description: 'Transfer-resistant, breathable foundation. Full coverage with natural finish that lasts 24 hours without feeling heavy.',
    image: 'https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=400',
    rating: 4.5,
    reviewCount: 3156,
    priceChange: 3,
    prices: [
      { platform: 'Nykaa', amount: 1149, url: 'https://www.nykaa.com/loreal-foundation' },
      { platform: 'Amazon', amount: 1049, url: 'https://www.amazon.in/LOreal-Foundation' },
      { platform: 'Flipkart', amount: 1099, url: 'https://www.flipkart.com/loreal-foundation' },
      { platform: 'Purplle', amount: 1125, url: 'https://www.purplle.com/loreal-foundation' },
      { platform: 'Myntra', amount: 1140, url: 'https://www.myntra.com/loreal-foundation' }
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
      { platform: 'Nykaa', amount: 999, url: 'https://www.nykaa.com/sugar-foundation' },
      { platform: 'Amazon', amount: 949, url: 'https://www.amazon.in/Sugar-Foundation' },
      { platform: 'Flipkart', amount: 975, url: 'https://www.flipkart.com/sugar-foundation' },
      { platform: 'Purplle', amount: 989, url: 'https://www.purplle.com/sugar-foundation' },
      { platform: 'Myntra', amount: 999, url: 'https://www.myntra.com/sugar-foundation' }
    ]
  },
  {
    _id: '5',
    name: 'Estee Lauder Double Wear Stay-in-Place Foundation',
    brand: 'ESTEE LAUDER',
    category: 'Foundation',
    description: 'Iconic long-wear foundation with 24-hour staying power. Oil-free formula that won\'t smudge or come off on clothes.',
    image: 'https://images.unsplash.com/photo-1509869175650-a1d97972541a?w=400',
    rating: 4.7,
    reviewCount: 5234,
    priceChange: -10,
    prices: [
      { platform: 'Nykaa', amount: 3950, url: 'https://www.nykaa.com/estee-lauder-foundation' },
      { platform: 'Amazon', amount: 3550, url: 'https://www.amazon.in/Estee-Lauder-Foundation' },
      { platform: 'Flipkart', amount: 3800, url: 'https://www.flipkart.com/estee-lauder-foundation' },
      { platform: 'Purplle', amount: 3899, url: 'https://www.purplle.com/estee-lauder-foundation' },
      { platform: 'Myntra', amount: 3950, url: 'https://www.myntra.com/estee-lauder-foundation' }
    ]
  },

  // ============ LIPSTICKS ============
  {
    _id: '6',
    name: 'Maybelline SuperStay Matte Ink Liquid Lipstick',
    brand: 'MAYBELLINE',
    category: 'Lipstick',
    description: 'Up to 16HR wear liquid matte lipstick. Intense color with comfortable, no-budge formula that stays put all day.',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
    rating: 4.6,
    reviewCount: 4892,
    priceChange: -8,
    prices: [
      { platform: 'Nykaa', amount: 599, url: 'https://www.nykaa.com/maybelline-lipstick' },
      { platform: 'Amazon', amount: 549, url: 'https://www.amazon.in/Maybelline-Lipstick' },
      { platform: 'Flipkart', amount: 575, url: 'https://www.flipkart.com/maybelline-lipstick' },
      { platform: 'Purplle', amount: 589, url: 'https://www.purplle.com/maybelline-lipstick' },
      { platform: 'Myntra', amount: 599, url: 'https://www.myntra.com/maybelline-lipstick' }
    ]
  },
  {
    _id: '7',
    name: 'Lakme 9 to 5 Primer + Matte Lip Color',
    brand: 'LAKME',
    category: 'Lipstick',
    description: 'Priming lipstick with intense color payoff. Matte finish with long-lasting formula that keeps lips moisturized.',
    image: 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=400',
    rating: 4.4,
    reviewCount: 2341,
    prices: [
      { platform: 'Nykaa', amount: 425, url: 'https://www.nykaa.com/lakme-lipstick' },
      { platform: 'Amazon', amount: 375, url: 'https://www.amazon.in/Lakme-Lipstick' },
      { platform: 'Flipkart', amount: 399, url: 'https://www.flipkart.com/lakme-lipstick' },
      { platform: 'Purplle', amount: 410, url: 'https://www.purplle.com/lakme-lipstick' },
      { platform: 'Myntra', amount: 425, url: 'https://www.myntra.com/lakme-lipstick' }
    ]
  },
  {
    _id: '8',
    name: 'Sugar Cosmetics Smudge Me Not Liquid Lipstick',
    brand: 'SUGAR COSMETICS',
    category: 'Lipstick',
    description: 'Transfer-proof liquid lipstick with rich matte finish. Lightweight formula that glides smoothly and stays all day.',
    image: 'https://images.unsplash.com/photo-1610701076259-0e91f6e29bb8?w=400',
    rating: 4.5,
    reviewCount: 3456,
    priceChange: -5,
    prices: [
      { platform: 'Nykaa', amount: 599, url: 'https://www.nykaa.com/sugar-lipstick' },
      { platform: 'Amazon', amount: 569, url: 'https://www.amazon.in/Sugar-Lipstick' },
      { platform: 'Flipkart', amount: 585, url: 'https://www.flipkart.com/sugar-lipstick' },
      { platform: 'Purplle', amount: 579, url: 'https://www.purplle.com/sugar-lipstick' },
      { platform: 'Myntra', amount: 599, url: 'https://www.myntra.com/sugar-lipstick' }
    ]
  },
  {
    _id: '9',
    name: 'MAC Retro Matte Lipstick',
    brand: 'MAC',
    category: 'Lipstick',
    description: 'Iconic matte lipstick with vivid color and no-shine finish. Intense pigment in a comfortable, matte formula.',
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=400',
    rating: 4.8,
    reviewCount: 6789,
    prices: [
      { platform: 'Nykaa', amount: 1900, url: 'https://www.nykaa.com/mac-lipstick' },
      { platform: 'Amazon', amount: 1850, url: 'https://www.amazon.in/MAC-Lipstick' },
      { platform: 'Flipkart', amount: 1875, url: 'https://www.flipkart.com/mac-lipstick' },
      { platform: 'Purplle', amount: 1890, url: 'https://www.purplle.com/mac-lipstick' },
      { platform: 'Myntra', amount: 1900, url: 'https://www.myntra.com/mac-lipstick' }
    ]
  },
  {
    _id: '10',
    name: 'Nykaa So Matte Lipstick',
    brand: 'NYKAA COSMETICS',
    category: 'Lipstick',
    description: 'Highly pigmented matte lipstick with rich color. Comfortable formula that doesn\'t dry out lips.',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
    rating: 4.3,
    reviewCount: 1876,
    prices: [
      { platform: 'Nykaa', amount: 349, url: 'https://www.nykaa.com/nykaa-lipstick' },
      { platform: 'Amazon', amount: 329, url: 'https://www.amazon.in/Nykaa-Lipstick' },
      { platform: 'Flipkart', amount: 340, url: 'https://www.flipkart.com/nykaa-lipstick' },
      { platform: 'Purplle', amount: 345, url: 'https://www.purplle.com/nykaa-lipstick' },
      { platform: 'Myntra', amount: 349, url: 'https://www.myntra.com/nykaa-lipstick' }
    ]
  },

  // ============ SERUMS ============
  {
    _id: '11',
    name: 'The Ordinary Niacinamide 10% + Zinc 1% Serum',
    brand: 'THE ORDINARY',
    category: 'Serum',
    description: 'High-strength vitamin and mineral blemish formula. Reduces appearance of blemishes and balances visible sebum activity.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
    rating: 4.6,
    reviewCount: 8934,
    priceChange: -12,
    prices: [
      { platform: 'Nykaa', amount: 599, url: 'https://www.nykaa.com/ordinary-niacinamide' },
      { platform: 'Amazon', amount: 525, url: 'https://www.amazon.in/Ordinary-Niacinamide' },
      { platform: 'Flipkart', amount: 565, url: 'https://www.flipkart.com/ordinary-niacinamide' },
      { platform: 'Purplle', amount: 589, url: 'https://www.purplle.com/ordinary-niacinamide' },
      { platform: 'Myntra', amount: 599, url: 'https://www.myntra.com/ordinary-niacinamide' }
    ]
  },
  {
    _id: '12',
    name: 'Minimalist 10% Vitamin C Face Serum',
    brand: 'MINIMALIST',
    category: 'Serum',
    description: 'Stable vitamin C serum with 10% Ethyl Ascorbic Acid. Brightens skin, reduces dark spots, and boosts collagen.',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400',
    rating: 4.5,
    reviewCount: 5678,
    priceChange: -7,
    prices: [
      { platform: 'Nykaa', amount: 699, url: 'https://www.nykaa.com/minimalist-vitamin-c' },
      { platform: 'Amazon', amount: 649, url: 'https://www.amazon.in/Minimalist-Vitamin-C' },
      { platform: 'Flipkart', amount: 675, url: 'https://www.flipkart.com/minimalist-vitamin-c' },
      { platform: 'Purplle', amount: 689, url: 'https://www.purplle.com/minimalist-vitamin-c' },
      { platform: 'Myntra', amount: 699, url: 'https://www.myntra.com/minimalist-vitamin-c' }
    ]
  },
  {
    _id: '13',
    name: 'Plum 15% Vitamin C Face Serum',
    brand: 'PLUM',
    category: 'Serum',
    description: 'Powerful brightening serum with 15% Ethyl Ascorbic Acid and Kakadu Plum. Visibly brightens and evens skin tone.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
    rating: 4.4,
    reviewCount: 3421,
    prices: [
      { platform: 'Nykaa', amount: 895, url: 'https://www.nykaa.com/plum-vitamin-c' },
      { platform: 'Amazon', amount: 849, url: 'https://www.amazon.in/Plum-Vitamin-C' },
      { platform: 'Flipkart', amount: 875, url: 'https://www.flipkart.com/plum-vitamin-c' },
      { platform: 'Purplle', amount: 889, url: 'https://www.purplle.com/plum-vitamin-c' },
      { platform: 'Myntra', amount: 895, url: 'https://www.myntra.com/plum-vitamin-c' }
    ]
  },
  {
    _id: '14',
    name: 'Dot & Key Vitamin C+E Super Bright Serum',
    brand: 'DOT & KEY',
    category: 'Serum',
    description: '20% Vitamin C with Vitamin E and Ferulic Acid. Triple-action formula for brighter, smoother, and firmer skin.',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400',
    rating: 4.5,
    reviewCount: 2987,
    priceChange: 5,
    prices: [
      { platform: 'Nykaa', amount: 1095, url: 'https://www.nykaa.com/dotkey-vitamin-c' },
      { platform: 'Amazon', amount: 1045, url: 'https://www.amazon.in/DotKey-Vitamin-C' },
      { platform: 'Flipkart', amount: 1075, url: 'https://www.flipkart.com/dotkey-vitamin-c' },
      { platform: 'Purplle', amount: 1089, url: 'https://www.purplle.com/dotkey-vitamin-c' },
      { platform: 'Myntra', amount: 1095, url: 'https://www.myntra.com/dotkey-vitamin-c' }
    ]
  },
  {
    _id: '15',
    name: 'Pilgrim Vitamin C Serum',
    brand: 'PILGRIM',
    category: 'Serum',
    description: 'Korean Vitamin C serum with Kakadu Plum. Brightens complexion and reduces signs of aging with natural ingredients.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
    rating: 4.3,
    reviewCount: 2456,
    prices: [
      { platform: 'Nykaa', amount: 599, url: 'https://www.nykaa.com/pilgrim-vitamin-c' },
      { platform: 'Amazon', amount: 549, url: 'https://www.amazon.in/Pilgrim-Vitamin-C' },
      { platform: 'Flipkart', amount: 575, url: 'https://www.flipkart.com/pilgrim-vitamin-c' },
      { platform: 'Purplle', amount: 589, url: 'https://www.purplle.com/pilgrim-vitamin-c' },
      { platform: 'Myntra', amount: 599, url: 'https://www.myntra.com/pilgrim-vitamin-c' }
    ]
  },

  // ============ MASCARAS ============
  {
    _id: '16',
    name: 'Maybelline Lash Sensational Sky High Mascara',
    brand: 'MAYBELLINE',
    category: 'Mascara',
    description: 'Buildable lengthening mascara with bamboo extract and fibers. Creates limitless length and full volume.',
    image: 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=400',
    rating: 4.7,
    reviewCount: 6543,
    priceChange: -15,
    prices: [
      { platform: 'Nykaa', amount: 599, url: 'https://www.nykaa.com/maybelline-mascara' },
      { platform: 'Amazon', amount: 509, url: 'https://www.amazon.in/Maybelline-Mascara' },
      { platform: 'Flipkart', amount: 549, url: 'https://www.flipkart.com/maybelline-mascara' },
      { platform: 'Purplle', amount: 579, url: 'https://www.purplle.com/maybelline-mascara' },
      { platform: 'Myntra', amount: 599, url: 'https://www.myntra.com/maybelline-mascara' }
    ]
  },
  {
    _id: '17',
    name: 'Lakme Absolute Flutter Secrets Mascara',
    brand: 'LAKME',
    category: 'Mascara',
    description: 'Dramatic curl and volume mascara with unique helix brush. Creates bold, flutter-worthy lashes that last all day.',
    image: 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=400',
    rating: 4.4,
    reviewCount: 2876,
    prices: [
      { platform: 'Nykaa', amount: 450, url: 'https://www.nykaa.com/lakme-mascara' },
      { platform: 'Amazon', amount: 399, url: 'https://www.amazon.in/Lakme-Mascara' },
      { platform: 'Flipkart', amount: 425, url: 'https://www.flipkart.com/lakme-mascara' },
      { platform: 'Purplle', amount: 440, url: 'https://www.purplle.com/lakme-mascara' },
      { platform: 'Myntra', amount: 450, url: 'https://www.myntra.com/lakme-mascara' }
    ]
  },
  {
    _id: '18',
    name: "L'Oreal Paris Volume Million Lashes Mascara",
    brand: "L'OREAL PARIS",
    category: 'Mascara',
    description: 'Excess wiper removes clumps for a volumized lash look. In-built volumizing brush for defined, separated lashes.',
    image: 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=400',
    rating: 4.6,
    reviewCount: 4321,
    prices: [
      { platform: 'Nykaa', amount: 850, url: 'https://www.nykaa.com/loreal-mascara' },
      { platform: 'Amazon', amount: 799, url: 'https://www.amazon.in/LOreal-Mascara' },
      { platform: 'Flipkart', amount: 825, url: 'https://www.flipkart.com/loreal-mascara' },
      { platform: 'Purplle', amount: 840, url: 'https://www.purplle.com/loreal-mascara' },
      { platform: 'Myntra', amount: 850, url: 'https://www.myntra.com/loreal-mascara' }
    ]
  },
  {
    _id: '19',
    name: 'Insight Lash & Brow Growth Serum',
    brand: 'INSIGHT COSMETICS',
    category: 'Mascara',
    description: 'Nourishing serum for longer, thicker lashes and brows. Contains peptides and biotin for natural growth.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
    rating: 4.3,
    reviewCount: 1543,
    prices: [
      { platform: 'Nykaa', amount: 399, url: 'https://www.nykaa.com/insight-lash-serum' },
      { platform: 'Amazon', amount: 349, url: 'https://www.amazon.in/Insight-Lash-Serum' },
      { platform: 'Flipkart', amount: 375, url: 'https://www.flipkart.com/insight-lash-serum' },
      { platform: 'Purplle', amount: 389, url: 'https://www.purplle.com/insight-lash-serum' },
      { platform: 'Myntra', amount: 399, url: 'https://www.myntra.com/insight-lash-serum' }
    ]
  },
  {
    _id: '20',
    name: 'Swiss Beauty Waterproof Mascara',
    brand: 'SWISS BEAUTY',
    category: 'Mascara',
    description: 'Smudge-proof, waterproof mascara for intense volume. Long-lasting formula that stays put in all conditions.',
    image: 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=400',
    rating: 4.2,
    reviewCount: 987,
    prices: [
      { platform: 'Nykaa', amount: 299, url: 'https://www.nykaa.com/swiss-beauty-mascara' },
      { platform: 'Amazon', amount: 249, url: 'https://www.amazon.in/Swiss-Beauty-Mascara' },
      { platform: 'Flipkart', amount: 275, url: 'https://www.flipkart.com/swiss-beauty-mascara' },
      { platform: 'Purplle', amount: 289, url: 'https://www.purplle.com/swiss-beauty-mascara' },
      { platform: 'Myntra', amount: 299, url: 'https://www.myntra.com/swiss-beauty-mascara' }
    ]
  },

  // ============ BLUSH ============
  {
    _id: '21',
    name: 'Maybelline Fit Me Blush',
    brand: 'MAYBELLINE',
    category: 'Blush',
    description: 'Lightweight powder blush with natural-looking color. Blends seamlessly for a fresh, healthy glow.',
    image: 'https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=400',
    rating: 4.4,
    reviewCount: 3456,
    prices: [
      { platform: 'Nykaa', amount: 399, url: 'https://www.nykaa.com/maybelline-blush' },
      { platform: 'Amazon', amount: 349, url: 'https://www.amazon.in/Maybelline-Blush' },
      { platform: 'Flipkart', amount: 375, url: 'https://www.flipkart.com/maybelline-blush' },
      { platform: 'Purplle', amount: 389, url: 'https://www.purplle.com/maybelline-blush' },
      { platform: 'Myntra', amount: 399, url: 'https://www.myntra.com/maybelline-blush' }
    ]
  },
  {
    _id: '22',
    name: 'Lakme 9 to 5 Primer + Blush Stick',
    brand: 'LAKME',
    category: 'Blush',
    description: 'Dual-function primer and blush stick. Creamy formula glides on easily and stays all day for a natural flush.',
    image: 'https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=400',
    rating: 4.3,
    reviewCount: 2134,
    priceChange: -6,
    prices: [
      { platform: 'Nykaa', amount: 475, url: 'https://www.nykaa.com/lakme-blush' },
      { platform: 'Amazon', amount: 425, url: 'https://www.amazon.in/Lakme-Blush' },
      { platform: 'Flipkart', amount: 450, url: 'https://www.flipkart.com/lakme-blush' },
      { platform: 'Purplle', amount: 465, url: 'https://www.purplle.com/lakme-blush' },
      { platform: 'Myntra', amount: 475, url: 'https://www.myntra.com/lakme-blush' }
    ]
  },
  {
    _id: '23',
    name: 'Sugar Cosmetics Contour De Force Face Palette',
    brand: 'SUGAR COSMETICS',
    category: 'Blush',
    description: 'All-in-one face palette with blush, bronzer, and highlighter. Buildable formula for natural or dramatic looks.',
    image: 'https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=400',
    rating: 4.5,
    reviewCount: 2987,
    prices: [
      { platform: 'Nykaa', amount: 1299, url: 'https://www.nykaa.com/sugar-palette' },
      { platform: 'Amazon', amount: 1249, url: 'https://www.amazon.in/Sugar-Palette' },
      { platform: 'Flipkart', amount: 1275, url: 'https://www.flipkart.com/sugar-palette' },
      { platform: 'Purplle', amount: 1289, url: 'https://www.purplle.com/sugar-palette' },
      { platform: 'Myntra', amount: 1299, url: 'https://www.myntra.com/sugar-palette' }
    ]
  },
  {
    _id: '24',
    name: 'Nykaa Get Cheeky Blush Duo',
    brand: 'NYKAA COSMETICS',
    category: 'Blush',
    description: 'Highly pigmented powder blush with two complementary shades. Silky texture that blends beautifully.',
    image: 'https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=400',
    rating: 4.2,
    reviewCount: 1654,
    prices: [
      { platform: 'Nykaa', amount: 499, url: 'https://www.nykaa.com/nykaa-blush' },
      { platform: 'Amazon', amount: 449, url: 'https://www.amazon.in/Nykaa-Blush' },
      { platform: 'Flipkart', amount: 475, url: 'https://www.flipkart.com/nykaa-blush' },
      { platform: 'Purplle', amount: 489, url: 'https://www.purplle.com/nykaa-blush' },
      { platform: 'Myntra', amount: 499, url: 'https://www.myntra.com/nykaa-blush' }
    ]
  },
  {
    _id: '25',
    name: 'Colorbar Cheek Illusion Blush',
    brand: 'COLORBAR',
    category: 'Blush',
    description: 'Long-lasting powder blush with buildable color. Enriched with Vitamin E for nourished, glowing cheeks.',
    image: 'https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=400',
    rating: 4.1,
    reviewCount: 876,
    prices: [
      { platform: 'Nykaa', amount: 450, url: 'https://www.nykaa.com/colorbar-blush' },
      { platform: 'Amazon', amount: 399, url: 'https://www.amazon.in/Colorbar-Blush' },
      { platform: 'Flipkart', amount: 425, url: 'https://www.flipkart.com/colorbar-blush' },
      { platform: 'Purplle', amount: 440, url: 'https://www.purplle.com/colorbar-blush' },
      { platform: 'Myntra', amount: 450, url: 'https://www.myntra.com/colorbar-blush' }
    ]
  },

  // ============ SKINCARE ============
  {
    _id: '26',
    name: 'Cetaphil Gentle Skin Cleanser',
    brand: 'CETAPHIL',
    category: 'Skincare',
    description: 'Mild, soap-free formula cleanses without irritation. Designed for sensitive skin, won\'t strip natural oils.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    rating: 4.6,
    reviewCount: 12543,
    priceChange: -10,
    prices: [
      { platform: 'Nykaa', amount: 899, url: 'https://www.nykaa.com/cetaphil-cleanser' },
      { platform: 'Amazon', amount: 809, url: 'https://www.amazon.in/Cetaphil-Cleanser' },
      { platform: 'Flipkart', amount: 850, url: 'https://www.flipkart.com/cetaphil-cleanser' },
      { platform: 'Purplle', amount: 879, url: 'https://www.purplle.com/cetaphil-cleanser' },
      { platform: 'Myntra', amount: 899, url: 'https://www.myntra.com/cetaphil-cleanser' }
    ]
  },
  {
    _id: '27',
    name: 'Neutrogena Hydro Boost Water Gel',
    brand: 'NEUTROGENA',
    category: 'Skincare',
    description: 'Oil-free hydrating gel with hyaluronic acid. Absorbs quickly to quench extra-dry skin and keep it hydrated.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
    rating: 4.5,
    reviewCount: 8976,
    prices: [
      { platform: 'Nykaa', amount: 999, url: 'https://www.nykaa.com/neutrogena-gel' },
      { platform: 'Amazon', amount: 949, url: 'https://www.amazon.in/Neutrogena-Gel' },
      { platform: 'Flipkart', amount: 975, url: 'https://www.flipkart.com/neutrogena-gel' },
      { platform: 'Purplle', amount: 989, url: 'https://www.purplle.com/neutrogena-gel' },
      { platform: 'Myntra', amount: 999, url: 'https://www.myntra.com/neutrogena-gel' }
    ]
  },
  {
    _id: '28',
    name: 'Plum Green Tea Alcohol-Free Toner',
    brand: 'PLUM',
    category: 'Skincare',
    description: 'Refreshing toner with glycolic acid and green tea. Unclogs pores, controls oil, and improves skin texture.',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400',
    rating: 4.4,
    reviewCount: 5432,
    priceChange: -8,
    prices: [
      { platform: 'Nykaa', amount: 495, url: 'https://www.nykaa.com/plum-toner' },
      { platform: 'Amazon', amount: 455, url: 'https://www.amazon.in/Plum-Toner' },
      { platform: 'Flipkart', amount: 475, url: 'https://www.flipkart.com/plum-toner' },
      { platform: 'Purplle', amount: 485, url: 'https://www.purplle.com/plum-toner' },
      { platform: 'Myntra', amount: 495, url: 'https://www.myntra.com/plum-toner' }
    ]
  },
  {
    _id: '29',
    name: 'Mamaearth Ubtan Face Wash',
    brand: 'MAMAEARTH',
    category: 'Skincare',
    description: 'Natural face wash with turmeric and saffron. Removes tan, brightens skin, and gives natural glow.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    rating: 4.3,
    reviewCount: 6789,
    prices: [
      { platform: 'Nykaa', amount: 349, url: 'https://www.nykaa.com/mamaearth-facewash' },
      { platform: 'Amazon', amount: 299, url: 'https://www.amazon.in/Mamaearth-Facewash' },
      { platform: 'Flipkart', amount: 325, url: 'https://www.flipkart.com/mamaearth-facewash' },
      { platform: 'Purplle', amount: 339, url: 'https://www.purplle.com/mamaearth-facewash' },
      { platform: 'Myntra', amount: 349, url: 'https://www.myntra.com/mamaearth-facewash' }
    ]
  },
  {
    _id: '30',
    name: 'WOW Skin Science Vitamin C Face Wash',
    brand: 'WOW SKIN SCIENCE',
    category: 'Skincare',
    description: 'Brightening face wash with Vitamin C and Mulberry extract. Deep cleanses and evens out skin tone.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    rating: 4.2,
    reviewCount: 4321,
    prices: [
      { platform: 'Nykaa', amount: 399, url: 'https://www.nykaa.com/wow-facewash' },
      { platform: 'Amazon', amount: 349, url: 'https://www.amazon.in/WOW-Facewash' },
      { platform: 'Flipkart', amount: 375, url: 'https://www.flipkart.com/wow-facewash' },
      { platform: 'Purplle', amount: 389, url: 'https://www.purplle.com/wow-facewash' },
      { platform: 'Myntra', amount: 399, url: 'https://www.myntra.com/wow-facewash' }
    ]
  },

  // ============ MORE FOUNDATIONS ============
  {
    _id: '31',
    name: 'NYX Professional Makeup Total Control Drop Foundation',
    brand: 'NYX PROFESSIONAL MAKEUP',
    category: 'Foundation',
    description: 'Customizable liquid foundation with buildable coverage. Mix and match drops for your perfect shade and finish.',
    image: 'https://images.unsplash.com/photo-1631214524020-7e18db3a8b39?w=400',
    rating: 4.5,
    reviewCount: 2345,
    prices: [
      { platform: 'Nykaa', amount: 950, url: 'https://www.nykaa.com/nyx-foundation' },
      { platform: 'Amazon', amount: 899, url: 'https://www.amazon.in/NYX-Foundation' },
      { platform: 'Flipkart', amount: 925, url: 'https://www.flipkart.com/nyx-foundation' },
      { platform: 'Purplle', amount: 940, url: 'https://www.purplle.com/nyx-foundation' },
      { platform: 'Myntra', amount: 950, url: 'https://www.myntra.com/nyx-foundation' }
    ]
  },
  {
    _id: '32',
    name: 'Colorbar Perfect Match Foundation',
    brand: 'COLORBAR',
    category: 'Foundation',
    description: 'Long-wearing foundation with buildable coverage. Enriched with Vitamin E for a flawless, radiant finish.',
    image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400',
    rating: 4.2,
    reviewCount: 1234,
    prices: [
      { platform: 'Nykaa', amount: 699, url: 'https://www.nykaa.com/colorbar-foundation' },
      { platform: 'Amazon', amount: 649, url: 'https://www.amazon.in/Colorbar-Foundation' },
      { platform: 'Flipkart', amount: 675, url: 'https://www.flipkart.com/colorbar-foundation' },
      { platform: 'Purplle', amount: 689, url: 'https://www.purplle.com/colorbar-foundation' },
      { platform: 'Myntra', amount: 699, url: 'https://www.myntra.com/colorbar-foundation' }
    ]
  },

  // ============ MORE LIPSTICKS ============
  {
    _id: '33',
    name: "L'Oreal Paris Color Riche Matte Lipstick",
    brand: "L'OREAL PARIS",
    category: 'Lipstick',
    description: 'Luxurious matte lipstick with rich, bold color. Comfortable formula with Argan Oil for soft, smooth lips.',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
    rating: 4.5,
    reviewCount: 3876,
    prices: [
      { platform: 'Nykaa', amount: 799, url: 'https://www.nykaa.com/loreal-lipstick' },
      { platform: 'Amazon', amount: 749, url: 'https://www.amazon.in/LOreal-Lipstick' },
      { platform: 'Flipkart', amount: 775, url: 'https://www.flipkart.com/loreal-lipstick' },
      { platform: 'Purplle', amount: 789, url: 'https://www.purplle.com/loreal-lipstick' },
      { platform: 'Myntra', amount: 799, url: 'https://www.myntra.com/loreal-lipstick' }
    ]
  },
  {
    _id: '34',
    name: 'Colorbar Velvet Matte Lipstick',
    brand: 'COLORBAR',
    category: 'Lipstick',
    description: 'Creamy matte lipstick with intense color payoff. Enriched with Vitamin E and Jojoba Oil for nourished lips.',
    image: 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=400',
    rating: 4.3,
    reviewCount: 1876,
    prices: [
      { platform: 'Nykaa', amount: 525, url: 'https://www.nykaa.com/colorbar-lipstick' },
      { platform: 'Amazon', amount: 475, url: 'https://www.amazon.in/Colorbar-Lipstick' },
      { platform: 'Flipkart', amount: 500, url: 'https://www.flipkart.com/colorbar-lipstick' },
      { platform: 'Purplle', amount: 515, url: 'https://www.purplle.com/colorbar-lipstick' },
      { platform: 'Myntra', amount: 525, url: 'https://www.myntra.com/colorbar-lipstick' }
    ]
  },

  // ============ MORE SKINCARE ============
  {
    _id: '35',
    name: 'Biotique Bio Morning Nectar Face Lotion',
    brand: 'BIOTIQUE',
    category: 'Skincare',
    description: 'Lightweight moisturizer with SPF 30 UVA/UVB sunscreen. Protects and nourishes with pure honey, wheat germ.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
    rating: 4.3,
    reviewCount: 5678,
    prices: [
      { platform: 'Nykaa', amount: 365, url: 'https://www.nykaa.com/biotique-lotion' },
      { platform: 'Amazon', amount: 315, url: 'https://www.amazon.in/Biotique-Lotion' },
      { platform: 'Flipkart', amount: 340, url: 'https://www.flipkart.com/biotique-lotion' },
      { platform: 'Purplle', amount: 355, url: 'https://www.purplle.com/biotique-lotion' },
      { platform: 'Myntra', amount: 365, url: 'https://www.myntra.com/biotique-lotion' }
    ]
  },
  {
    _id: '36',
    name: 'Himalaya Herbals Purifying Neem Face Wash',
    brand: 'HIMALAYA',
    category: 'Skincare',
    description: 'Gentle face wash with neem and turmeric. Controls acne and pimples, leaving skin clear and refreshed.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    rating: 4.4,
    reviewCount: 8765,
    prices: [
      { platform: 'Nykaa', amount: 175, url: 'https://www.nykaa.com/himalaya-facewash' },
      { platform: 'Amazon', amount: 145, url: 'https://www.amazon.in/Himalaya-Facewash' },
      { platform: 'Flipkart', amount: 160, url: 'https://www.flipkart.com/himalaya-facewash' },
      { platform: 'Purplle', amount: 169, url: 'https://www.purplle.com/himalaya-facewash' },
      { platform: 'Myntra', amount: 175, url: 'https://www.myntra.com/himalaya-facewash' }
    ]
  },
  {
    _id: '37',
    name: 'The Derma Co 2% Salicylic Acid Face Serum',
    brand: 'THE DERMA CO',
    category: 'Skincare',
    description: 'Acne-fighting serum with 2% Salicylic Acid and Hyaluronic Acid. Unclogs pores and prevents breakouts.',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400',
    rating: 4.4,
    reviewCount: 4567,
    priceChange: -9,
    prices: [
      { platform: 'Nykaa', amount: 599, url: 'https://www.nykaa.com/dermaco-serum' },
      { platform: 'Amazon', amount: 545, url: 'https://www.amazon.in/DermaCo-Serum' },
      { platform: 'Flipkart', amount: 575, url: 'https://www.flipkart.com/dermaco-serum' },
      { platform: 'Purplle', amount: 589, url: 'https://www.purplle.com/dermaco-serum' },
      { platform: 'Myntra', amount: 599, url: 'https://www.myntra.com/dermaco-serum' }
    ]
  },
  {
    _id: '38',
    name: 'Garnier Skin Naturals Micellar Cleansing Water',
    brand: 'GARNIER',
    category: 'Skincare',
    description: 'All-in-one makeup remover and cleanser. Gently removes makeup and impurities without harsh rubbing.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    rating: 4.5,
    reviewCount: 7654,
    prices: [
      { platform: 'Nykaa', amount: 425, url: 'https://www.nykaa.com/garnier-micellar' },
      { platform: 'Amazon', amount: 375, url: 'https://www.amazon.in/Garnier-Micellar' },
      { platform: 'Flipkart', amount: 400, url: 'https://www.flipkart.com/garnier-micellar' },
      { platform: 'Purplle', amount: 415, url: 'https://www.purplle.com/garnier-micellar' },
      { platform: 'Myntra', amount: 425, url: 'https://www.myntra.com/garnier-micellar' }
    ]
  },
  {
    _id: '39',
    name: 'St. Botanica Retinol Face Serum',
    brand: 'ST. BOTANICA',
    category: 'Skincare',
    description: 'Anti-aging serum with 2.5% Retinol and Hyaluronic Acid. Reduces wrinkles, fine lines, and dark spots.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
    rating: 4.3,
    reviewCount: 3210,
    prices: [
      { platform: 'Nykaa', amount: 1095, url: 'https://www.nykaa.com/stbotanica-retinol' },
      { platform: 'Amazon', amount: 1045, url: 'https://www.amazon.in/StBotanica-Retinol' },
      { platform: 'Flipkart', amount: 1075, url: 'https://www.flipkart.com/stbotanica-retinol' },
      { platform: 'Purplle', amount: 1089, url: 'https://www.purplle.com/stbotanica-retinol' },
      { platform: 'Myntra', amount: 1095, url: 'https://www.myntra.com/stbotanica-retinol' }
    ]
  },
  {
    _id: '40',
    name: 'Lotus Herbals Safe Sun UV Screen Matte Gel SPF 50',
    brand: 'LOTUS HERBALS',
    category: 'Skincare',
    description: 'Non-greasy sunscreen with PA+++ protection. Oil-free, matte finish formula perfect for oily and acne-prone skin.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    rating: 4.4,
    reviewCount: 4890,
    priceChange: -7,
    prices: [
      { platform: 'Nykaa', amount: 395, url: 'https://www.nykaa.com/lotus-sunscreen' },
      { platform: 'Amazon', amount: 345, url: 'https://www.amazon.in/Lotus-Sunscreen' },
      { platform: 'Flipkart', amount: 375, url: 'https://www.flipkart.com/lotus-sunscreen' },
      { platform: 'Purplle', amount: 385, url: 'https://www.purplle.com/lotus-sunscreen' },
      { platform: 'Myntra', amount: 395, url: 'https://www.myntra.com/lotus-sunscreen' }
    ]
  }
];

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
