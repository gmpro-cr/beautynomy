import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const products = [
  // FOUNDATIONS
  {
    id: 1,
    name: "Lakme 9 to 5 Primer + Matte Powder Foundation Compact",
    brand: "Lakme",
    category: "Face",
    description: "Transfer-proof, oil-control formula with SPF 32. Provides 16-hour coverage with a natural matte finish.",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 599, link: "https://www.nykaa.com", rating: 4.3, reviews: 15420 },
      { platform: "Amazon", price: 549, link: "https://www.amazon.in", rating: 4.2, reviews: 8950 },
      { platform: "Flipkart", price: 579, link: "https://www.flipkart.com", rating: 4.1, reviews: 5630 }
    ]
  },
  {
    id: 2,
    name: "Maybelline Fit Me Matte + Poreless Liquid Foundation",
    brand: "Maybelline",
    category: "Face",
    description: "Oil-free foundation with micro-powders for natural matte finish. Refines pores and controls shine.",
    image: "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 499, link: "https://www.nykaa.com", rating: 4.5, reviews: 22100 },
      { platform: "Amazon", price: 449, link: "https://www.amazon.in", rating: 4.4, reviews: 18500 },
      { platform: "Flipkart", price: 475, link: "https://www.flipkart.com", rating: 4.3, reviews: 12300 }
    ]
  },
  {
    id: 3,
    name: "L'Oreal Paris Infallible 24H Fresh Wear Foundation",
    brand: "L'Oreal Paris",
    category: "Face",
    description: "Lightweight, breathable formula with 24-hour long wear. Transfer-proof and sweat-resistant.",
    image: "https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 1099, link: "https://www.nykaa.com", rating: 4.6, reviews: 18900 },
      { platform: "Amazon", price: 999, link: "https://www.amazon.in", rating: 4.5, reviews: 15200 },
      { platform: "Flipkart", price: 1049, link: "https://www.flipkart.com", rating: 4.4, reviews: 11800 }
    ]
  },
  {
    id: 4,
    name: "Sugar Cosmetics Ace Of Face Foundation Stick",
    brand: "Sugar Cosmetics",
    category: "Face",
    description: "Creamy stick foundation with buildable coverage. Enriched with Vitamin E and SPF 15.",
    image: "https://images.unsplash.com/photo-1617897903246-719242758050?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 799, link: "https://www.nykaa.com", rating: 4.4, reviews: 9850 },
      { platform: "Amazon", price: 749, link: "https://www.amazon.in", rating: 4.3, reviews: 7200 },
      { platform: "Flipkart", price: 775, link: "https://www.flipkart.com", rating: 4.2, reviews: 5100 }
    ]
  },
  {
    id: 5,
    name: "Revlon ColorStay Makeup Foundation",
    brand: "Revlon",
    category: "Face",
    description: "24-hour wear foundation for combination to oily skin. Flawless matte finish that stays put.",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 1250, link: "https://www.nykaa.com", rating: 4.5, reviews: 12800 },
      { platform: "Amazon", price: 1199, link: "https://www.amazon.in", rating: 4.4, reviews: 10500 },
      { platform: "Flipkart", price: 1225, link: "https://www.flipkart.com", rating: 4.3, reviews: 8200 }
    ]
  },

  // LIPSTICKS
  {
    id: 6,
    name: "Maybelline SuperStay Matte Ink Liquid Lipstick",
    brand: "Maybelline",
    category: "Lips",
    description: "16-hour wear liquid lipstick with intense matte color. Transfer-proof and highly pigmented.",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 649, link: "https://www.nykaa.com", rating: 4.6, reviews: 31200 },
      { platform: "Amazon", price: 599, link: "https://www.amazon.in", rating: 4.5, reviews: 28900 },
      { platform: "Flipkart", price: 625, link: "https://www.flipkart.com", rating: 4.4, reviews: 19800 }
    ]
  },
  {
    id: 7,
    name: "Lakme Absolute Matte Ultimate Lip Color",
    brand: "Lakme",
    category: "Lips",
    description: "Rich matte finish with vitamin E. Non-drying formula with long-lasting color.",
    image: "https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 450, link: "https://www.nykaa.com", rating: 4.4, reviews: 18750 },
      { platform: "Amazon", price: 399, link: "https://www.amazon.in", rating: 4.3, reviews: 14200 },
      { platform: "Flipkart", price: 425, link: "https://www.flipkart.com", rating: 4.2, reviews: 9850 }
    ]
  },
  {
    id: 8,
    name: "Sugar Cosmetics Smudge Me Not Liquid Lipstick",
    brand: "Sugar Cosmetics",
    category: "Lips",
    description: "Transfer-proof liquid lipstick with 12-hour stay. Lightweight and comfortable wear.",
    image: "https://images.unsplash.com/photo-1634108597344-fea6c9e937e2?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 599, link: "https://www.nykaa.com", rating: 4.5, reviews: 14500 },
      { platform: "Amazon", price: 549, link: "https://www.amazon.in", rating: 4.4, reviews: 11200 },
      { platform: "Flipkart", price: 575, link: "https://www.flipkart.com", rating: 4.3, reviews: 8700 }
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
      { platform: "Nykaa", price: 1900, link: "https://www.nykaa.com", rating: 4.7, reviews: 8950 },
      { platform: "Amazon", price: 1850, link: "https://www.amazon.in", rating: 4.6, reviews: 6200 },
      { platform: "Flipkart", price: 1875, link: "https://www.flipkart.com", rating: 4.5, reviews: 4100 }
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
      { platform: "Nykaa", price: 650, link: "https://www.nykaa.com", rating: 4.3, reviews: 10200 },
      { platform: "Amazon", price: 599, link: "https://www.amazon.in", rating: 4.2, reviews: 8100 },
      { platform: "Flipkart", price: 625, link: "https://www.flipkart.com", rating: 4.1, reviews: 5900 }
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
      { platform: "Nykaa", price: 699, link: "https://www.nykaa.com", rating: 4.8, reviews: 42100 },
      { platform: "Amazon", price: 649, link: "https://www.amazon.in", rating: 4.7, reviews: 38500 },
      { platform: "Flipkart", price: 675, link: "https://www.flipkart.com", rating: 4.6, reviews: 28900 }
    ]
  },
  {
    id: 12,
    name: "Plum 15% Vitamin C Face Serum",
    brand: "Plum",
    category: "Skincare",
    description: "Ethyl Ascorbic Acid with Kakadu Plum. Brightens, reduces dark spots, and fights aging.",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 899, link: "https://www.nykaa.com", rating: 4.7, reviews: 25600 },
      { platform: "Amazon", price: 849, link: "https://www.amazon.in", rating: 4.6, reviews: 21400 },
      { platform: "Flipkart", price: 875, link: "https://www.flipkart.com", rating: 4.5, reviews: 16300 }
    ]
  },
  {
    id: 13,
    name: "The Ordinary Niacinamide 10% + Zinc 1%",
    brand: "The Ordinary",
    category: "Skincare",
    description: "Reduces appearance of blemishes and congestion. Balances visible sebum activity.",
    image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 599, link: "https://www.nykaa.com", rating: 4.6, reviews: 35800 },
      { platform: "Amazon", price: 549, link: "https://www.amazon.in", rating: 4.5, reviews: 31200 },
      { platform: "Flipkart", price: 575, link: "https://www.flipkart.com", rating: 4.4, reviews: 24500 }
    ]
  },
  {
    id: 14,
    name: "Dot & Key Vitamin C + E Super Bright Serum",
    brand: "Dot & Key",
    category: "Skincare",
    description: "20% Vitamin C with Hyaluronic Acid. Brightens and hydrates for glowing skin.",
    image: "https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 799, link: "https://www.nykaa.com", rating: 4.5, reviews: 18900 },
      { platform: "Amazon", price: 749, link: "https://www.amazon.in", rating: 4.4, reviews: 15600 },
      { platform: "Flipkart", price: 775, link: "https://www.flipkart.com", rating: 4.3, reviews: 11200 }
    ]
  },
  {
    id: 15,
    name: "The Derma Co 10% Niacinamide Serum",
    brand: "The Derma Co",
    category: "Skincare",
    description: "Pore-minimizing serum with niacinamide. Controls oil and improves skin texture.",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 595, link: "https://www.nykaa.com", rating: 4.4, reviews: 22400 },
      { platform: "Amazon", price: 545, link: "https://www.amazon.in", rating: 4.3, reviews: 19800 },
      { platform: "Flipkart", price: 570, link: "https://www.flipkart.com", rating: 4.2, reviews: 14600 }
    ]
  },

  // FACE WASH
  {
    id: 16,
    name: "Himalaya Purifying Neem Face Wash",
    brand: "Himalaya",
    category: "Skincare",
    description: "Soap-free herbal formulation. Deep cleanses and prevents pimples with neem and turmeric.",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 165, link: "https://www.nykaa.com", rating: 4.4, reviews: 67800 },
      { platform: "Amazon", price: 145, link: "https://www.amazon.in", rating: 4.3, reviews: 89500 },
      { platform: "Flipkart", price: 155, link: "https://www.flipkart.com", rating: 4.2, reviews: 54200 }
    ]
  },
  {
    id: 17,
    name: "Cetaphil Gentle Skin Cleanser",
    brand: "Cetaphil",
    category: "Skincare",
    description: "Mild, non-irritating formula. Cleanses without drying, suitable for sensitive skin.",
    image: "https://images.unsplash.com/photo-1585128903994-92ae24d70e59?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 799, link: "https://www.nykaa.com", rating: 4.7, reviews: 38900 },
      { platform: "Amazon", price: 749, link: "https://www.amazon.in", rating: 4.6, reviews: 42100 },
      { platform: "Flipkart", price: 775, link: "https://www.flipkart.com", rating: 4.5, reviews: 31200 }
    ]
  },
  {
    id: 18,
    name: "Neutrogena Deep Clean Facial Cleanser",
    brand: "Neutrogena",
    category: "Skincare",
    description: "Oil-free formula removes 99% of dirt and impurities. Beta hydroxy acid prevents breakouts.",
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 275, link: "https://www.nykaa.com", rating: 4.5, reviews: 28700 },
      { platform: "Amazon", price: 245, link: "https://www.amazon.in", rating: 4.4, reviews: 32100 },
      { platform: "Flipkart", price: 260, link: "https://www.flipkart.com", rating: 4.3, reviews: 19500 }
    ]
  },
  {
    id: 19,
    name: "Plum Green Tea Pore Cleansing Face Wash",
    brand: "Plum",
    category: "Skincare",
    description: "SLS-free face wash with glycolic acid. Unclogs pores and controls excess oil.",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 375, link: "https://www.nykaa.com", rating: 4.4, reviews: 18200 },
      { platform: "Amazon", price: 325, link: "https://www.amazon.in", rating: 4.3, reviews: 15800 },
      { platform: "Flipkart", price: 350, link: "https://www.flipkart.com", rating: 4.2, reviews: 12100 }
    ]
  },

  // MASCARA & EYE PRODUCTS
  {
    id: 20,
    name: "Maybelline Lash Sensational Sky High Mascara",
    brand: "Maybelline",
    category: "Eyes",
    description: "Volumizing and lengthening mascara with bamboo extract. Flex tower brush for max impact.",
    image: "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 799, link: "https://www.nykaa.com", rating: 4.5, reviews: 19800 },
      { platform: "Amazon", price: 749, link: "https://www.amazon.in", rating: 4.4, reviews: 16200 },
      { platform: "Flipkart", price: 775, link: "https://www.flipkart.com", rating: 4.3, reviews: 11500 }
    ]
  },
  {
    id: 21,
    name: "Lakme Eyeconic Kajal Twin Pack",
    brand: "Lakme",
    category: "Eyes",
    description: "22-hour stay, smudge-proof kajal. Deep black finish with vitamin E.",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 199, link: "https://www.nykaa.com", rating: 4.6, reviews: 48900 },
      { platform: "Amazon", price: 175, link: "https://www.amazon.in", rating: 4.5, reviews: 52300 },
      { platform: "Flipkart", price: 189, link: "https://www.flipkart.com", rating: 4.4, reviews: 35600 }
    ]
  },
  {
    id: 22,
    name: "Sugar Cosmetics Wingman Waterproof Microliner",
    brand: "Sugar Cosmetics",
    category: "Eyes",
    description: "Ultra-fine tip for precise lines. Waterproof, smudge-proof, 24-hour wear.",
    image: "https://images.unsplash.com/photo-1583241800698-9a6b8a7b1e0f?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 399, link: "https://www.nykaa.com", rating: 4.4, reviews: 12800 },
      { platform: "Amazon", price: 349, link: "https://www.amazon.in", rating: 4.3, reviews: 9600 },
      { platform: "Flipkart", price: 375, link: "https://www.flipkart.com", rating: 4.2, reviews: 7200 }
    ]
  },
  {
    id: 23,
    name: "L'Oreal Paris Telescopic Mascara",
    brand: "L'Oreal Paris",
    category: "Eyes",
    description: "Ultra-precise brush for maximum length. Clump-free formula with intense color.",
    image: "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 875, link: "https://www.nykaa.com", rating: 4.5, reviews: 14500 },
      { platform: "Amazon", price: 825, link: "https://www.amazon.in", rating: 4.4, reviews: 12100 },
      { platform: "Flipkart", price: 850, link: "https://www.flipkart.com", rating: 4.3, reviews: 9200 }
    ]
  },

  // HIGHLIGHTERS & BLUSH
  {
    id: 24,
    name: "Sugar Cosmetics Contour De Force Highlighter",
    brand: "Sugar Cosmetics",
    category: "Face",
    description: "Shimmer highlighter with buildable glow. Enriched with Vitamin E for smooth application.",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 599, link: "https://www.nykaa.com", rating: 4.5, reviews: 12800 },
      { platform: "Amazon", price: 549, link: "https://www.amazon.in", rating: 4.4, reviews: 9600 },
      { platform: "Flipkart", price: 575, link: "https://www.flipkart.com", rating: 4.3, reviews: 7200 }
    ]
  },
  {
    id: 25,
    name: "Maybelline Fit Me Blush",
    brand: "Maybelline",
    category: "Face",
    description: "Lightweight powder blush with natural finish. Fits your skin tone perfectly.",
    image: "https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 399, link: "https://www.nykaa.com", rating: 4.3, reviews: 15200 },
      { platform: "Amazon", price: 349, link: "https://www.amazon.in", rating: 4.2, reviews: 12500 },
      { platform: "Flipkart", price: 375, link: "https://www.flipkart.com", rating: 4.1, reviews: 8900 }
    ]
  },
  {
    id: 26,
    name: "Lakme Absolute Illuminating Shimmer Brick",
    brand: "Lakme",
    category: "Face",
    description: "Multi-colored shimmer brick for customizable glow. Can be used as highlighter or blush.",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 1100, link: "https://www.nykaa.com", rating: 4.4, reviews: 8700 },
      { platform: "Amazon", price: 1049, link: "https://www.amazon.in", rating: 4.3, reviews: 7200 },
      { platform: "Flipkart", price: 1075, link: "https://www.flipkart.com", rating: 4.2, reviews: 5400 }
    ]
  },

  // SUNSCREEN
  {
    id: 27,
    name: "Neutrogena Ultra Sheer Dry-Touch Sunblock SPF 50+",
    brand: "Neutrogena",
    category: "Skincare",
    description: "Non-greasy, lightweight sunscreen with Helioplex technology. Water-resistant and fast absorbing.",
    image: "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 899, link: "https://www.nykaa.com", rating: 4.6, reviews: 22100 },
      { platform: "Amazon", price: 849, link: "https://www.amazon.in", rating: 4.5, reviews: 28500 },
      { platform: "Flipkart", price: 875, link: "https://www.flipkart.com", rating: 4.4, reviews: 18200 }
    ]
  },
  {
    id: 28,
    name: "Minimalist SPF 50 PA++++ Sunscreen",
    brand: "Minimalist",
    category: "Skincare",
    description: "Multi-spectrum sunscreen with UVA & UVB protection. Non-comedogenic, lightweight formula.",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 449, link: "https://www.nykaa.com", rating: 4.5, reviews: 18700 },
      { platform: "Amazon", price: 399, link: "https://www.amazon.in", rating: 4.4, reviews: 16200 },
      { platform: "Flipkart", price: 425, link: "https://www.flipkart.com", rating: 4.3, reviews: 12100 }
    ]
  },
  {
    id: 29,
    name: "Lakme Sun Expert SPF 50 PA+++ Sunscreen Lotion",
    brand: "Lakme",
    category: "Skincare",
    description: "Broad spectrum protection with cucumber extract. Non-sticky, non-greasy formula.",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 325, link: "https://www.nykaa.com", rating: 4.3, reviews: 24500 },
      { platform: "Amazon", price: 275, link: "https://www.amazon.in", rating: 4.2, reviews: 28900 },
      { platform: "Flipkart", price: 300, link: "https://www.flipkart.com", rating: 4.1, reviews: 19200 }
    ]
  },

  // EYESHADOW PALETTES
  {
    id: 30,
    name: "Maybelline The Nudes Eyeshadow Palette",
    brand: "Maybelline",
    category: "Eyes",
    description: "12-shade nude eyeshadow palette with matte and shimmer finishes. Highly pigmented.",
    image: "https://images.unsplash.com/photo-1583241800698-9a6b8a7b1e0f?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 999, link: "https://www.nykaa.com", rating: 4.4, reviews: 14200 },
      { platform: "Amazon", price: 949, link: "https://www.amazon.in", rating: 4.3, reviews: 11800 },
      { platform: "Flipkart", price: 975, link: "https://www.flipkart.com", rating: 4.2, reviews: 8500 }
    ]
  },
  {
    id: 31,
    name: "Sugar Cosmetics Blend The Rules Eyeshadow Palette",
    brand: "Sugar Cosmetics",
    category: "Eyes",
    description: "15-shade palette with warm and cool tones. Blendable formula with long-lasting color.",
    image: "https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 1199, link: "https://www.nykaa.com", rating: 4.5, reviews: 9800 },
      { platform: "Amazon", price: 1149, link: "https://www.amazon.in", rating: 4.4, reviews: 7600 },
      { platform: "Flipkart", price: 1175, link: "https://www.flipkart.com", rating: 4.3, reviews: 5200 }
    ]
  },
  {
    id: 32,
    name: "Colorbar Spotlight Eyeshadow Palette",
    brand: "Colorbar",
    category: "Eyes",
    description: "9-shade palette with buttery texture. Perfect for creating day to night looks.",
    image: "https://images.unsplash.com/photo-1583241800698-9a6b8a7b1e0f?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 850, link: "https://www.nykaa.com", rating: 4.2, reviews: 6800 },
      { platform: "Amazon", price: 799, link: "https://www.amazon.in", rating: 4.1, reviews: 5500 },
      { platform: "Flipkart", price: 825, link: "https://www.flipkart.com", rating: 4.0, reviews: 4100 }
    ]
  },

  // NAIL POLISH
  {
    id: 33,
    name: "Lakme True Wear Color Crush Nail Enamel",
    brand: "Lakme",
    category: "Nails",
    description: "Long-lasting nail color with chip-resistant formula. Gel-like shine and smooth application.",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 199, link: "https://www.nykaa.com", rating: 4.3, reviews: 18900 },
      { platform: "Amazon", price: 175, link: "https://www.amazon.in", rating: 4.2, reviews: 21200 },
      { platform: "Flipkart", price: 189, link: "https://www.flipkart.com", rating: 4.1, reviews: 14500 }
    ]
  },
  {
    id: 34,
    name: "Sugar Cosmetics Tip Tac Toe Nail Lacquer",
    brand: "Sugar Cosmetics",
    category: "Nails",
    description: "Quick-drying nail polish with vibrant colors. Streak-free application with glossy finish.",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 249, link: "https://www.nykaa.com", rating: 4.4, reviews: 11200 },
      { platform: "Amazon", price: 225, link: "https://www.amazon.in", rating: 4.3, reviews: 8900 },
      { platform: "Flipkart", price: 239, link: "https://www.flipkart.com", rating: 4.2, reviews: 6500 }
    ]
  },
  {
    id: 35,
    name: "Maybelline Color Show Nail Polish",
    brand: "Maybelline",
    category: "Nails",
    description: "High-shine nail color with smooth formula. Wide range of trendy shades.",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 149, link: "https://www.nykaa.com", rating: 4.2, reviews: 24800 },
      { platform: "Amazon", price: 129, link: "https://www.amazon.in", rating: 4.1, reviews: 28500 },
      { platform: "Flipkart", price: 139, link: "https://www.flipkart.com", rating: 4.0, reviews: 19200 }
    ]
  },

  // MOISTURIZERS
  {
    id: 36,
    name: "Neutrogena Oil-Free Moisture for Sensitive Skin",
    brand: "Neutrogena",
    category: "Skincare",
    description: "Lightweight, non-comedogenic moisturizer. Hypoallergenic and fragrance-free formula.",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 599, link: "https://www.nykaa.com", rating: 4.5, reviews: 28700 },
      { platform: "Amazon", price: 549, link: "https://www.amazon.in", rating: 4.4, reviews: 32100 },
      { platform: "Flipkart", price: 575, link: "https://www.flipkart.com", rating: 4.3, reviews: 22500 }
    ]
  },
  {
    id: 37,
    name: "Plum Green Tea Renewed Clarity Night Gel",
    brand: "Plum",
    category: "Skincare",
    description: "Oil-free night gel with green tea and glycolic acid. Renews skin overnight.",
    image: "https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 495, link: "https://www.nykaa.com", rating: 4.4, reviews: 15800 },
      { platform: "Amazon", price: 445, link: "https://www.amazon.in", rating: 4.3, reviews: 13200 },
      { platform: "Flipkart", price: 470, link: "https://www.flipkart.com", rating: 4.2, reviews: 9600 }
    ]
  },
  {
    id: 38,
    name: "Lakme Peach Milk Soft Creme",
    brand: "Lakme",
    category: "Skincare",
    description: "Moisturizing cream with peach and milk. Keeps skin soft and hydrated all day.",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 225, link: "https://www.nykaa.com", rating: 4.2, reviews: 32800 },
      { platform: "Amazon", price: 199, link: "https://www.amazon.in", rating: 4.1, reviews: 41200 },
      { platform: "Flipkart", price: 212, link: "https://www.flipkart.com", rating: 4.0, reviews: 28500 }
    ]
  },

  // PRIMERS
  {
    id: 39,
    name: "Colorbar Perfect Match Primer",
    brand: "Colorbar",
    category: "Face",
    description: "Smoothens skin texture, minimizes pores, and extends makeup wear. Lightweight gel formula.",
    image: "https://images.unsplash.com/photo-1617897903246-719242758050?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 850, link: "https://www.nykaa.com", rating: 4.3, reviews: 8900 },
      { platform: "Amazon", price: 799, link: "https://www.amazon.in", rating: 4.2, reviews: 7500 },
      { platform: "Flipkart", price: 825, link: "https://www.flipkart.com", rating: 4.1, reviews: 5400 }
    ]
  },
  {
    id: 40,
    name: "Lakme Absolute Blur Perfect Makeup Primer",
    brand: "Lakme",
    category: "Face",
    description: "Silicone-based primer with soft-focus technology. Blurs fine lines and pores instantly.",
    image: "https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=400&h=400&fit=crop",
    prices: [
      { platform: "Nykaa", price: 650, link: "https://www.nykaa.com", rating: 4.4, reviews: 11200 },
      { platform: "Amazon", price: 599, link: "https://www.amazon.in", rating: 4.3, reviews: 9100 },
      { platform: "Flipkart", price: 625, link: "https://www.flipkart.com", rating: 4.2, reviews: 6800 }
    ]
  }
];

app.get('/', (req, res) => res.json({ 
  message: 'Beautynomy API - Beauty Product Price Comparison',
  totalProducts: products.length,
  categories: ['Face', 'Lips', 'Eyes', 'Skincare', 'Nails']
}));

app.get('/api/health', (req, res) => res.json({ status: 'OK', products: products.length }));

app.get('/api/products', (req, res) => {
  const { query, category, brand } = req.query;
  let filtered = products;
  
  if (query) {
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

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

app.listen(process.env.PORT || 5000, () => console.log('Beautynomy Server running on port', process.env.PORT || 5000));
