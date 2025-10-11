import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    min: 0,
    default: 0
  },
  priceChange: {
    type: Number
  },
  prices: [{
    platform: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    url: {
      type: String,
      required: true
    }
  }],
  priceHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    prices: [{
      platform: {
        type: String,
        required: true
      },
      amount: {
        type: Number,
        required: true,
        min: 0
      }
    }],
    lowestPrice: {
      type: Number,
      required: true,
      min: 0
    },
    averagePrice: {
      type: Number,
      required: true,
      min: 0
    }
  }]
}, {
  timestamps: true,
  _id: false  // Use custom _id field
});

// Indexes for better query performance
productSchema.index({ name: 'text', brand: 'text', description: 'text', category: 'text' });
productSchema.index({ brand: 1 });
productSchema.index({ category: 1 });
productSchema.index({ rating: -1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
