import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Heart, GitCompare, TrendingDown, TrendingUp, Star, Clock, X, Filter, ChevronDown } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Trending categories
const TRENDING_TAGS = [
  { name: 'Foundation', icon: '💄', emoji: '💄' },
  { name: 'Lipstick', icon: '💋', emoji: '💋' },
  { name: 'Serum', icon: '✨', emoji: '✨' },
  { name: 'Mascara', icon: '👁️', emoji: '👁️' },
  { name: 'Blush', icon: '🌸', emoji: '🌸' },
  { name: 'Skincare', icon: '🧴', emoji: '🧴' },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [wishlist, setWishlist] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Load wishlist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('beautynomy_wishlist');
    if (saved) setWishlist(JSON.parse(saved));
  }, []);

  // Save wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('beautynomy_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Fetch products
  useEffect(() => {
    if (searchQuery || selectedCategory) {
      fetchProducts();
    } else {
      // Load featured products on page load
      fetchProducts();
    }
  }, [searchQuery, selectedCategory]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...products];

    // Filter by price range
    filtered = filtered.filter(p => {
      const minPrice = Math.min(...p.prices.map(pr => pr.amount));
      return minPrice >= priceRange[0] && minPrice <= priceRange[1];
    });

    // Filter by brands
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => selectedBrands.includes(p.brand));
    }

    // Sort products
    filtered = sortProducts(filtered, sortBy);

    setFilteredProducts(filtered);
  }, [products, priceRange, selectedBrands, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const query = searchQuery || selectedCategory || 'all';
      const response = await axios.get(`${API_URL}/api/products?query=${query}`);
      setProducts(response.data);
      setFilteredProducts(response.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sortProducts = (prods, sortType) => {
    const sorted = [...prods];
    switch (sortType) {
      case 'price_low':
        return sorted.sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
      case 'price_high':
        return sorted.sort((a, b) => getLowestPrice(b) - getLowestPrice(a));
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'reviews':
        return sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
      case 'discount':
        return sorted.sort((a, b) => getMaxDiscount(b) - getMaxDiscount(a));
      default:
        return sorted;
    }
  };

  const getLowestPrice = (product) => {
    return Math.min(...product.prices.map(p => p.amount));
  };

  const getHighestPrice = (product) => {
    return Math.max(...product.prices.map(p => p.amount));
  };

  const getMaxDiscount = (product) => {
    const prices = product.prices.map(p => p.amount);
    const max = Math.max(...prices);
    const min = Math.min(...prices);
    return ((max - min) / max * 100).toFixed(0);
  };

  const getBestDeal = (product) => {
    const sorted = [...product.prices].sort((a, b) => a.amount - b.amount);
    return sorted[0];
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleTrendingClick = (category) => {
    setSelectedCategory(category);
    setSearchQuery('');
    setCurrentPage('home');
  };

  const toggleWishlist = (product) => {
    const exists = wishlist.find(p => p._id === product._id);
    if (exists) {
      setWishlist(wishlist.filter(p => p._id !== product._id));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  const toggleCompare = (product) => {
    const exists = compareList.find(p => p._id === product._id);
    if (exists) {
      setCompareList(compareList.filter(p => p._id !== product._id));
    } else {
      if (compareList.length < 3) {
        setCompareList([...compareList, product]);
      } else {
        alert('You can compare up to 3 products at a time');
      }
    }
  };

  const isInWishlist = (product) => {
    return wishlist.some(p => p._id === product._id);
  };

  const isInCompare = (product) => {
    return compareList.some(p => p._id === product._id);
  };

  const getTimeSinceUpdate = () => {
    const minutes = Math.floor((new Date() - lastUpdated) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Today';
  };

  const allBrands = [...new Set(products.map(p => p.brand))];

  const toggleBrand = (brand) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => { setCurrentPage('home'); setSelectedCategory(''); setSearchQuery(''); }}
              className="flex items-center gap-2 group"
            >
              <span className="text-4xl group-hover:scale-110 transition-transform">💄</span>
              <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Beautynomy
              </span>
            </button>

            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => setCurrentPage('home')}
                className={`font-medium transition-colors ${
                  currentPage === 'home'
                    ? 'text-purple-600'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentPage('about')}
                className={`font-medium transition-colors ${
                  currentPage === 'about'
                    ? 'text-purple-600'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                About
              </button>
              <button
                onClick={() => setCurrentPage('contact')}
                className={`font-medium transition-colors ${
                  currentPage === 'contact'
                    ? 'text-purple-600'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                Contact
              </button>
              <button
                onClick={() => setCurrentPage('wishlist')}
                className="relative"
              >
                <Heart
                  className={`w-6 h-6 transition-colors ${
                    wishlist.length > 0 ? 'fill-pink-500 text-pink-500' : 'text-gray-600 hover:text-pink-500'
                  }`}
                />
                {wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setCurrentPage('compare')}
                className="relative"
              >
                <GitCompare
                  className={`w-6 h-6 transition-colors ${
                    compareList.length > 0 ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'
                  }`}
                />
                {compareList.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {compareList.length}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {currentPage === 'home' && (
          <>
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
                Where Beauty Meets{' '}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Simplicity
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Compare prices, discover trending products, and make smarter beauty decisions
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for lipstick, serum, foundation..."
                    className="w-full px-6 py-4 pr-32 rounded-full border-2 border-purple-200 focus:border-purple-500 focus:outline-none text-lg shadow-lg"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-8 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:shadow-lg transition-all duration-200"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </form>

              {/* Price Update Info */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Prices updated {getTimeSinceUpdate()}</span>
              </div>
            </div>

            {/* Trending Categories */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Trending Categories
              </h2>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {TRENDING_TAGS.map((tag) => (
                  <button
                    key={tag.name}
                    onClick={() => handleTrendingClick(tag.name)}
                    className={`p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105 border-2 ${
                      selectedCategory === tag.name
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-transparent'
                    }`}
                  >
                    <div className="text-4xl mb-2">{tag.emoji}</div>
                    <div className="text-sm font-semibold text-gray-700">{tag.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Filters and Sort */}
            <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-md">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {(selectedBrands.length > 0 || priceRange[0] > 0 || priceRange[1] < 5000) && (
                    <span className="bg-purple-500 text-white text-xs rounded-full px-2">
                      {selectedBrands.length + (priceRange[0] > 0 || priceRange[1] < 5000 ? 1 : 0)}
                    </span>
                  )}
                </button>
                
                {selectedBrands.length > 0 && (
                  <button
                    onClick={() => setSelectedBrands([])}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="reviews">Most Reviews</option>
                  <option value="discount">Best Discount</option>
                </select>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mb-8 bg-white p-6 rounded-xl shadow-md">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Price Range */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="0"
                          max="5000"
                          step="100"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                          className="flex-1"
                        />
                        <span className="text-sm text-gray-600 w-20">₹{priceRange[0]}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="0"
                          max="5000"
                          step="100"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                          className="flex-1"
                        />
                        <span className="text-sm text-gray-600 w-20">₹{priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Brands */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Brands</h3>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {allBrands.map((brand) => (
                        <label key={brand} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand)}
                            onChange={() => toggleBrand(brand)}
                            className="w-4 h-4 text-purple-600 rounded"
                          />
                          <span className="text-sm text-gray-700">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-600">Loading amazing products...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">😞</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h3>
                <p className="text-gray-600">{error}</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedCategory ? `${selectedCategory} Products` : 'Featured Products'}
                  </h2>
                  <p className="text-gray-600">{filteredProducts.length} products found</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => {
                    const bestDeal = getBestDeal(product);
                    const maxDiscount = getMaxDiscount(product);
                    const lowestPrice = getLowestPrice(product);
                    const highestPrice = getHighestPrice(product);
                    const priceDropped = product.priceChange && product.priceChange < 0;
                    const priceIncreased = product.priceChange && product.priceChange > 0;

                    return (
                      <div
                        key={product._id}
                        className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                      >
                        {/* Product Image */}
                        <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 p-6 h-64 flex items-center justify-center overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                          />
                          
                          {/* Wishlist & Compare Buttons */}
                          <div className="absolute top-3 right-3 flex gap-2">
                            <button
                              onClick={() => toggleWishlist(product)}
                              className="p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
                            >
                              <Heart
                                className={`w-5 h-5 ${
                                  isInWishlist(product)
                                    ? 'fill-pink-500 text-pink-500'
                                    : 'text-gray-400'
                                }`}
                              />
                            </button>
                            <button
                              onClick={() => toggleCompare(product)}
                              className="p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
                            >
                              <GitCompare
                                className={`w-5 h-5 ${
                                  isInCompare(product)
                                    ? 'text-purple-600'
                                    : 'text-gray-400'
                                }`}
                              />
                            </button>
                          </div>

                          {/* Badges */}
                          <div className="absolute top-3 left-3 flex flex-col gap-2">
                            {maxDiscount > 0 && (
                              <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                Save {maxDiscount}%
                              </div>
                            )}
                            {priceDropped && (
                              <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                                <TrendingDown className="w-3 h-3" />
                                Price Drop
                              </div>
                            )}
                            {priceIncreased && (
                              <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                Price Up
                              </div>
                            )}
                          </div>

                          {/* Rating */}
                          <div className="absolute bottom-3 right-3 bg-white px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-semibold">{product.rating || '4.5'}</span>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-5">
                          <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">
                            {product.brand}
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {product.description}
                          </p>

                          {/* Review Count */}
                          <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                            <Star className="w-4 h-4" />
                            <span>{product.rating || '4.5'} ({product.reviewCount || '127'} reviews)</span>
                          </div>

                          {/* Price Comparison */}
                          <div className="space-y-2 mb-4">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Price Comparison
                            </div>
                            {product.prices.map((price, idx) => (
                              <div
                                key={idx}
                                className={`flex justify-between items-center p-2 rounded-lg transition-colors ${
                                  price.platform === bestDeal.platform
                                    ? 'bg-green-50 border-2 border-green-400'
                                    : 'bg-gray-50'
                                }`}
                              >
                                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                  {price.platform}
                                  {price.platform === bestDeal.platform && (
                                    <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">
                                      BEST
                                    </span>
                                  )}
                                </span>
                                <span className={`text-sm font-bold ${
                                  price.platform === bestDeal.platform
                                    ? 'text-green-600 text-base'
                                    : 'text-gray-600'
                                }`}>
                                  ₹{price.amount}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Buy Button */}
                          <a
                            href={bestDeal.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 text-center"
                          >
                            Buy at {bestDeal.platform} for ₹{bestDeal.amount} →
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Affiliate Disclosure */}
                <div className="mt-12 p-4 bg-purple-50 border border-purple-200 rounded-xl text-center">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Affiliate Disclosure:</span> We earn from qualifying purchases made through links on this site. This helps us keep the service free for you.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your filters or search for something else</p>
              </div>
            )}
          </>
        )}

        {/* Wishlist Page */}
        {currentPage === 'wishlist' && (
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-8">My Wishlist</h2>
            {wishlist.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlist.map((product) => {
                  const bestDeal = getBestDeal(product);
                  return (
                    <div key={product._id} className="bg-white rounded-2xl shadow-md p-5 relative">
                      <button
                        onClick={() => toggleWishlist(product)}
                        className="absolute top-3 right-3 p-2 bg-pink-100 rounded-full hover:bg-pink-200"
                      >
                        <X className="w-4 h-4 text-pink-600" />
                      </button>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-contain mb-4"
                      />
                      <div className="text-xs font-semibold text-purple-600 uppercase mb-1">
                        {product.brand}
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">{product.name}</h3>
                      <div className="text-2xl font-bold text-green-600 mb-3">
                        ₹{bestDeal.amount}
                      </div>
                      <a
                        href={bestDeal.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg text-center"
                      >
                        Buy Now
                      </a>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <Heart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h3>
                <p className="text-gray-600 mb-6">Start adding products you love!</p>
                <button
                  onClick={() => setCurrentPage('home')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl"
                >
                  Browse Products
                </button>
              </div>
            )}
          </div>
        )}

        {/* Compare Page */}
        {currentPage === 'compare' && (
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Compare Products</h2>
            {compareList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-2xl shadow-md overflow-hidden">
                  <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    <tr>
                      <th className="p-4 text-left">Feature</th>
                      {compareList.map((product) => (
                        <th key={product._id} className="p-4">
                          <div className="relative">
                            <button
                              onClick={() => toggleCompare(product)}
                              className="absolute -top-2 -right-2 p-1 bg-white rounded-full text-purple-600 hover:bg-gray-100"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-32 h-32 object-contain mx-auto mb-2"
                            />
                            <div className="text-sm font-semibold">{product.brand}</div>
                            <div className="text-xs">{product.name}</div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4 font-semibold">Best Price</td>
                      {compareList.map((product) => {
                        const bestDeal = getBestDeal(product);
                        return (
                          <td key={product._id} className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">₹{bestDeal.amount}</div>
                            <div className="text-xs text-gray-600">{bestDeal.platform}</div>
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-semibold">Rating</td>
                      {compareList.map((product) => (
                        <td key={product._id} className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{product.rating || '4.5'}</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-semibold">Reviews</td>
                      {compareList.map((product) => (
                        <td key={product._id} className="p-4 text-center">
                          {product.reviewCount || '127'} reviews
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-semibold">Max Savings</td>
                      {compareList.map((product) => (
                        <td key={product._id} className="p-4 text-center">
                          <span className="text-green-600 font-bold">{getMaxDiscount(product)}%</span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold">Action</td>
                      {compareList.map((product) => {
                        const bestDeal = getBestDeal(product);
                        return (
                          <td key={product._id} className="p-4 text-center">
                            <a
                              href={bestDeal.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg"
                            >
                              Buy Now
                            </a>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20">
                <GitCompare className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No products to compare</h3>
                <p className="text-gray-600 mb-6">Add up to 3 products to compare them side by side</p>
                <button
                  onClick={() => setCurrentPage('home')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl"
                >
                  Browse Products
                </button>
              </div>
            )}
          </div>
        )}

        {/* About Page */}
        {currentPage === 'about' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-12 border border-purple-100">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">About Beautynomy</h2>
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p className="text-lg">
                  <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Beautynomy
                  </span>{' '}
                  is your go-to beauty intelligence hub that simplifies the way you shop for cosmetics and skincare products.
                </p>
                <p>
                  We understand that finding the perfect beauty product at the best price can be overwhelming. That's why we've created a platform that compares prices across multiple e-commerce platforms, so you can make informed decisions and save money.
                </p>
                <p>
                  Our mission is to empower beauty enthusiasts with transparent pricing information, helping you discover the best deals on your favorite products from trusted brands.
                </p>
                <div className="bg-purple-50 border-l-4 border-purple-600 p-6 rounded-lg">
                  <h3 className="font-bold text-xl mb-3 text-purple-900">Why Choose Beautynomy?</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>✓ Real-time price comparison across major platforms</li>
                    <li>✓ Curated selection of trusted beauty brands</li>
                    <li>✓ User ratings and reviews</li>
                    <li>✓ Regular price updates</li>
                    <li>✓ Easy-to-use interface</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Page */}
        {currentPage === 'contact' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-12 border border-purple-100">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              <p className="text-gray-600 mb-8">
                Have questions or feedback? We'd love to hear from you!
              </p>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    rows="5"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
                    placeholder="Tell us what's on your mind..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Privacy Policy Page */}
        {currentPage === 'privacy' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-12 border border-purple-100">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h2>
              <div className="space-y-6 text-gray-700">
                <p className="text-sm text-gray-500">Last updated: October 9, 2025</p>
                
                <section>
                  <h3 className="text-xl font-bold mb-3">1. Information We Collect</h3>
                  <p>We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.</p>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-3">2. How We Use Your Information</h3>
                  <p>We use the information we collect to provide, maintain, and improve our services, to process your transactions, and to communicate with you.</p>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-3">3. Cookies and Tracking</h3>
                  <p>We use cookies and similar tracking technologies to track activity on our service and hold certain information to improve your experience.</p>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-3">4. Third-Party Services</h3>
                  <p>We may employ third-party companies and individuals to facilitate our service, provide the service on our behalf, or assist us in analyzing how our service is used.</p>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-3">5. Data Security</h3>
                  <p>We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.</p>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-3">6. Your Rights</h3>
                  <p>You have the right to access, update, or delete your personal information at any time. Contact us to exercise these rights.</p>
                </section>
              </div>
            </div>
          </div>
        )}

        {/* Terms of Service Page */}
        {currentPage === 'terms' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-12 border border-purple-100">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Terms of Service</h2>
              <div className="space-y-6 text-gray-700">
                <p className="text-sm text-gray-500">Last updated: October 9, 2025</p>
                
                <section>
                  <h3 className="text-xl font-bold mb-3">1. Acceptance of Terms</h3>
                  <p>By accessing and using Beautynomy, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-3">2. Use of Service</h3>
                  <p>You may use our service only for lawful purposes and in accordance with these Terms. You agree not to use the service in any way that violates any applicable law or regulation.</p>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-3">3. Price Information</h3>
                  <p>While we strive to provide accurate price information, prices are subject to change. We are not responsible for any pricing errors on third-party websites.</p>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-3">4. Affiliate Disclosure</h3>
                  <p>Beautynomy participates in affiliate marketing programs. We may earn commissions from qualifying purchases made through links on our site.</p>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-3">5. Intellectual Property</h3>
                  <p>The service and its original content, features, and functionality are owned by Beautynomy and are protected by copyright, trademark, and other intellectual property laws.</p>
                </section>

                <section>
                  <h3 className="text-xl font-bold mb-3">6. Limitation of Liability</h3>
                  <p>In no event shall Beautynomy be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the service.</p>
                </section>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-r from-purple-900 to-pink-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">💄</span>
                <span className="text-2xl font-bold">Beautynomy</span>
              </div>
              <p className="text-purple-200 mb-4">
                Where Beauty Meets Simplicity
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-purple-200 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="text-purple-200 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="#" className="text-purple-200 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-purple-200">
                <li><button onClick={() => setCurrentPage('home')} className="hover:text-white transition-colors">Home</button></li>
                <li><button onClick={() => setCurrentPage('about')} className="hover:text-white transition-colors">About</button></li>
                <li><button onClick={() => setCurrentPage('contact')} className="hover:text-white transition-colors">Contact</button></li>
                <li><button onClick={() => setCurrentPage('wishlist')} className="hover:text-white transition-colors">Wishlist</button></li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-bold text-lg mb-4">Categories</h3>
              <ul className="space-y-2 text-purple-200">
                {TRENDING_TAGS.map((tag) => (
                  <li key={tag.name}>
                    <button 
                      onClick={() => { handleTrendingClick(tag.name); window.scrollTo(0, 0); }} 
                      className="hover:text-white transition-colors"
                    >
                      {tag.icon} {tag.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-bold text-lg mb-4">Legal</h3>
              <ul className="space-y-2 text-purple-200">
                <li><button onClick={() => setCurrentPage('privacy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => setCurrentPage('terms')} className="hover:text-white transition-colors">Terms of Service</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Affiliate Disclosure</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-purple-700 pt-8 text-center text-purple-200">
            <p>&copy; 2025 Beautynomy. All rights reserved.</p>
            <p className="mt-2 text-sm">Where Beauty Meets Simplicity</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
