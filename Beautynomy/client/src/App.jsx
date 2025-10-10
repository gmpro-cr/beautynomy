import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Heart, GitCompare, TrendingDown, TrendingUp, Star, Clock, X, Filter, Menu } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://beautynomy-api.onrender.com';

// Trending categories - Fenty Beauty inspired
const TRENDING_TAGS = [
  { name: 'Foundation', label: 'FOUNDATION' },
  { name: 'Lipstick', label: 'LIPSTICK' },
  { name: 'Serum', label: 'SERUM' },
  { name: 'Mascara', label: 'MASCARA' },
  { name: 'Blush', label: 'BLUSH' },
  { name: 'Skincare', label: 'SKINCARE' },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    fetchProducts();
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
      setError('Failed to load products. Please check your connection.');
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-amber-50/30 relative">
      {/* Elegant Background Pattern */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Header - Fenty Beauty Style */}
      <header className="bg-black text-white sticky top-0 z-50 border-b border-neutral-800 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => { setCurrentPage('home'); setSelectedCategory(''); setSearchQuery(''); }}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">B</span>
              </div>
              <span className="text-2xl font-bold tracking-wider">BEAUTYNOMY</span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => setCurrentPage('home')}
                className={`text-sm font-semibold tracking-widest transition-colors ${
                  currentPage === 'home' ? 'text-amber-500' : 'text-white hover:text-amber-500'
                }`}
              >
                HOME
              </button>
              <button
                onClick={() => setCurrentPage('about')}
                className={`text-sm font-semibold tracking-widest transition-colors ${
                  currentPage === 'about' ? 'text-amber-500' : 'text-white hover:text-amber-500'
                }`}
              >
                ABOUT
              </button>
              <button
                onClick={() => setCurrentPage('contact')}
                className={`text-sm font-semibold tracking-widest transition-colors ${
                  currentPage === 'contact' ? 'text-amber-500' : 'text-white hover:text-amber-500'
                }`}
              >
                CONTACT
              </button>
              <button
                onClick={() => setCurrentPage('wishlist')}
                className="relative"
              >
                <Heart
                  className={`w-6 h-6 transition-all ${
                    wishlist.length > 0 ? 'fill-amber-500 text-amber-500' : 'text-white hover:text-amber-500'
                  }`}
                />
                {wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setCurrentPage('compare')}
                className="relative"
              >
                <GitCompare
                  className={`w-6 h-6 transition-all ${
                    compareList.length > 0 ? 'text-amber-500' : 'text-white hover:text-amber-500'
                  }`}
                />
                {compareList.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {compareList.length}
                  </span>
                )}
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-neutral-800">
              <nav className="flex flex-col gap-4">
                <button onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }} className="text-left text-sm font-semibold tracking-widest text-white hover:text-amber-500">HOME</button>
                <button onClick={() => { setCurrentPage('about'); setMobileMenuOpen(false); }} className="text-left text-sm font-semibold tracking-widest text-white hover:text-amber-500">ABOUT</button>
                <button onClick={() => { setCurrentPage('contact'); setMobileMenuOpen(false); }} className="text-left text-sm font-semibold tracking-widest text-white hover:text-amber-500">CONTACT</button>
                <button onClick={() => { setCurrentPage('wishlist'); setMobileMenuOpen(false); }} className="text-left text-sm font-semibold tracking-widest text-white hover:text-amber-500">WISHLIST ({wishlist.length})</button>
                <button onClick={() => { setCurrentPage('compare'); setMobileMenuOpen(false); }} className="text-left text-sm font-semibold tracking-widest text-white hover:text-amber-500">COMPARE ({compareList.length})</button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {currentPage === 'home' && (
          <>
            {/* Hero Section - Fenty Style */}
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-7xl font-bold text-black mb-6 tracking-tight">
                BEAUTY FOR ALL
              </h1>
              <p className="text-xl text-neutral-600 mb-12 max-w-2xl mx-auto">
                Compare prices across platforms. Find your perfect match. Save more.
              </p>

              {/* Search Bar - Elegant Black/White */}
              <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-6">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products..."
                    className="w-full px-8 py-5 pr-32 bg-neutral-50 border-2 border-black focus:border-amber-600 focus:outline-none text-lg font-medium tracking-wide"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-8 py-3 bg-black text-white font-bold tracking-widest hover:bg-amber-600 transition-all duration-200"
                  >
                    SEARCH
                  </button>
                </div>
              </form>

              {/* Price Update Info */}
              <div className="flex items-center justify-center gap-2 text-sm text-neutral-500 tracking-wide">
                <Clock className="w-4 h-4" />
                <span>UPDATED {getTimeSinceUpdate().toUpperCase()}</span>
              </div>
            </div>

            {/* Trending Categories - Clean Grid */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-black mb-8 text-center tracking-tight">
                SHOP BY CATEGORY
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {TRENDING_TAGS.map((tag) => (
                  <button
                    key={tag.name}
                    onClick={() => handleTrendingClick(tag.name)}
                    className={`p-8 bg-neutral-50 hover:bg-black hover:text-white transition-all duration-300 border-2 ${
                      selectedCategory === tag.name
                        ? 'border-amber-600 bg-black text-white'
                        : 'border-black'
                    }`}
                  >
                    <div className="text-sm font-bold tracking-widest">{tag.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Filters and Sort - Minimal Black/White */}
            <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between bg-neutral-50 p-6 border-2 border-black">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-6 py-3 bg-black text-white font-bold tracking-widest hover:bg-amber-600 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  FILTERS
                  {(selectedBrands.length > 0 || priceRange[0] > 0 || priceRange[1] < 5000) && (
                    <span className="bg-amber-500 text-black text-xs rounded-full px-2 py-1">
                      {selectedBrands.length + (priceRange[0] > 0 || priceRange[1] < 5000 ? 1 : 0)}
                    </span>
                  )}
                </button>

                {selectedBrands.length > 0 && (
                  <button
                    onClick={() => setSelectedBrands([])}
                    className="text-sm text-neutral-600 hover:text-black font-semibold tracking-wide"
                  >
                    CLEAR FILTERS
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold tracking-widest text-black">SORT:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border-2 border-black bg-white focus:outline-none focus:border-amber-600 font-semibold tracking-wide"
                >
                  <option value="relevance">RELEVANCE</option>
                  <option value="price_low">PRICE: LOW TO HIGH</option>
                  <option value="price_high">PRICE: HIGH TO LOW</option>
                  <option value="rating">HIGHEST RATED</option>
                  <option value="reviews">MOST REVIEWS</option>
                  <option value="discount">BEST DISCOUNT</option>
                </select>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mb-8 bg-neutral-50 p-8 border-2 border-black">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Price Range */}
                  <div>
                    <h3 className="font-bold text-black mb-4 tracking-widest">PRICE RANGE</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-neutral-700 w-16">MIN:</span>
                        <input
                          type="range"
                          min="0"
                          max="5000"
                          step="100"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                          className="flex-1 accent-amber-600"
                        />
                        <span className="text-sm font-bold text-black w-20">₹{priceRange[0]}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-neutral-700 w-16">MAX:</span>
                        <input
                          type="range"
                          min="0"
                          max="5000"
                          step="100"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                          className="flex-1 accent-amber-600"
                        />
                        <span className="text-sm font-bold text-black w-20">₹{priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Brands */}
                  <div>
                    <h3 className="font-bold text-black mb-4 tracking-widest">BRANDS</h3>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {allBrands.map((brand) => (
                        <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand)}
                            onChange={() => toggleBrand(brand)}
                            className="w-5 h-5 accent-amber-600"
                          />
                          <span className="text-sm font-semibold text-neutral-700 group-hover:text-black">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-32">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-black border-t-amber-600"></div>
                <p className="mt-6 text-black font-bold tracking-widest">LOADING PRODUCTS...</p>
              </div>
            ) : error ? (
              <div className="text-center py-32 bg-neutral-50 border-2 border-black p-12">
                <div className="text-6xl mb-6">⚠️</div>
                <h3 className="text-3xl font-bold text-black mb-4 tracking-tight">CONNECTION ERROR</h3>
                <p className="text-neutral-600 mb-6">{error}</p>
                <button
                  onClick={fetchProducts}
                  className="px-8 py-4 bg-black text-white font-bold tracking-widest hover:bg-amber-600 transition-all"
                >
                  TRY AGAIN
                </button>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div>
                <div className="mb-8 flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-black tracking-tight">
                    {selectedCategory ? `${selectedCategory.toUpperCase()} PRODUCTS` : 'ALL PRODUCTS'}
                  </h2>
                  <p className="text-neutral-600 font-semibold">{filteredProducts.length} PRODUCTS</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredProducts.map((product) => {
                    const bestDeal = getBestDeal(product);
                    const maxDiscount = getMaxDiscount(product);
                    const lowestPrice = getLowestPrice(product);
                    const priceDropped = product.priceChange && product.priceChange < 0;

                    return (
                      <div
                        key={product._id}
                        className="group bg-white border-2 border-black hover:border-amber-600 transition-all duration-300"
                      >
                        {/* Product Image */}
                        <div className="relative bg-neutral-50 p-8 h-72 flex items-center justify-center overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500"
                          />

                          {/* Wishlist & Compare Buttons */}
                          <div className="absolute top-4 right-4 flex flex-col gap-2">
                            <button
                              onClick={() => toggleWishlist(product)}
                              className="p-3 bg-white border-2 border-black hover:bg-black hover:text-white transition-all"
                            >
                              <Heart
                                className={`w-5 h-5 ${
                                  isInWishlist(product)
                                    ? 'fill-amber-600 text-amber-600'
                                    : ''
                                }`}
                              />
                            </button>
                            <button
                              onClick={() => toggleCompare(product)}
                              className="p-3 bg-white border-2 border-black hover:bg-black hover:text-white transition-all"
                            >
                              <GitCompare
                                className={`w-5 h-5 ${
                                  isInCompare(product)
                                    ? 'text-amber-600'
                                    : ''
                                }`}
                              />
                            </button>
                          </div>

                          {/* Badges */}
                          <div className="absolute top-4 left-4 flex flex-col gap-2">
                            {maxDiscount > 0 && (
                              <div className="bg-amber-600 text-black text-xs font-bold px-3 py-1 tracking-wider">
                                SAVE {maxDiscount}%
                              </div>
                            )}
                            {priceDropped && (
                              <div className="bg-black text-white text-xs font-bold px-3 py-1 tracking-wider flex items-center gap-1">
                                <TrendingDown className="w-3 h-3" />
                                PRICE DROP
                              </div>
                            )}
                          </div>

                          {/* Rating */}
                          <div className="absolute bottom-4 right-4 bg-white px-3 py-2 border-2 border-black flex items-center gap-1">
                            <Star className="w-4 h-4 fill-amber-600 text-amber-600" />
                            <span className="text-sm font-bold">{product.rating || '4.5'}</span>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-6 bg-white">
                          <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">
                            {product.brand}
                          </div>
                          <h3 className="text-lg font-bold text-black mb-3 line-clamp-2 min-h-[3.5rem] tracking-tight">
                            {product.name}
                          </h3>
                          <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                            {product.description}
                          </p>

                          {/* Review Count */}
                          <div className="flex items-center gap-2 mb-4 text-sm text-neutral-500">
                            <Star className="w-4 h-4" />
                            <span>{product.rating || '4.5'} ({product.reviewCount || '127'} reviews)</span>
                          </div>

                          {/* Price Comparison - Skyscanner Style */}
                          <div className="space-y-2 mb-6">
                            <div className="text-xs font-bold text-black uppercase tracking-widest mb-3 flex items-center gap-2">
                              <span>COMPARE PRICES</span>
                              <span className="text-neutral-400 text-[10px]">• TAP TO VISIT</span>
                            </div>
                            {product.prices.map((price, idx) => (
                              <a
                                key={idx}
                                href={price.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`block group relative overflow-hidden transition-all duration-200 border-2 ${
                                  price.platform === bestDeal.platform
                                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 border-amber-700 text-white shadow-lg scale-105'
                                    : 'bg-white border-neutral-200 hover:border-black hover:shadow-md'
                                }`}
                              >
                                <div className="flex justify-between items-center p-4">
                                  <div className="flex items-center gap-3">
                                    {/* Platform Icon/Badge */}
                                    <div className={`w-10 h-10 flex items-center justify-center font-black text-xs border-2 ${
                                      price.platform === bestDeal.platform
                                        ? 'bg-black text-white border-black'
                                        : 'bg-neutral-100 text-black border-neutral-300 group-hover:bg-black group-hover:text-white group-hover:border-black'
                                    }`}>
                                      {price.platform.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className={`text-sm font-bold ${
                                        price.platform === bestDeal.platform ? 'text-white' : 'text-black'
                                      }`}>
                                        {price.platform}
                                      </div>
                                      {price.platform === bestDeal.platform && (
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-black flex items-center gap-1">
                                          <Star className="w-3 h-3 fill-black" />
                                          Best Price
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className={`text-right ${price.platform === bestDeal.platform ? 'text-white' : ''}`}>
                                      <div className="text-lg font-black">₹{price.amount}</div>
                                      {price.platform !== bestDeal.platform && (
                                        <div className="text-[10px] text-neutral-500 group-hover:text-amber-600">
                                          +₹{price.amount - bestDeal.amount} more
                                        </div>
                                      )}
                                    </div>
                                    <svg
                                      className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
                                        price.platform === bestDeal.platform ? 'text-white' : 'text-neutral-400 group-hover:text-black'
                                      }`}
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </div>
                                </div>
                                {/* Hover effect */}
                                {price.platform !== bestDeal.platform && (
                                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                                )}
                              </a>
                            ))}
                          </div>

                          {/* Quick Buy Button */}
                          <a
                            href={bestDeal.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full py-4 bg-gradient-to-r from-black to-neutral-800 text-white text-center font-bold tracking-widest hover:from-amber-600 hover:to-amber-500 transition-all duration-200 shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
                          >
                            QUICK BUY - ₹{bestDeal.amount}
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Affiliate Disclosure */}
                <div className="mt-16 p-6 bg-neutral-50 border-2 border-black text-center">
                  <p className="text-sm text-neutral-700 tracking-wide">
                    <span className="font-bold">AFFILIATE DISCLOSURE:</span> We earn from qualifying purchases made through links on this site.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-32 bg-neutral-50 border-2 border-black p-12">
                <div className="text-6xl mb-6">🔍</div>
                <h3 className="text-3xl font-bold text-black mb-4 tracking-tight">NO PRODUCTS FOUND</h3>
                <p className="text-neutral-600 mb-6">Try adjusting your filters or search for something else</p>
                <button
                  onClick={() => { setSelectedBrands([]); setPriceRange([0, 5000]); setSearchQuery(''); setSelectedCategory(''); }}
                  className="px-8 py-4 bg-black text-white font-bold tracking-widest hover:bg-amber-600 transition-all"
                >
                  CLEAR ALL FILTERS
                </button>
              </div>
            )}
          </>
        )}

        {/* Wishlist Page */}
        {currentPage === 'wishlist' && (
          <div>
            <h2 className="text-5xl font-bold text-black mb-12 tracking-tight">MY WISHLIST</h2>
            {wishlist.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {wishlist.map((product) => {
                  const bestDeal = getBestDeal(product);
                  return (
                    <div key={product._id} className="bg-white border-2 border-black relative">
                      <button
                        onClick={() => toggleWishlist(product)}
                        className="absolute top-4 right-4 p-3 bg-white border-2 border-black hover:bg-black hover:text-white z-10"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <div className="bg-neutral-50 p-8">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-48 object-contain"
                        />
                      </div>
                      <div className="p-6">
                        <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">
                          {product.brand}
                        </div>
                        <h3 className="font-bold text-black mb-4 tracking-tight">{product.name}</h3>
                        <div className="text-2xl font-bold text-black mb-4">
                          ₹{bestDeal.amount}
                        </div>
                        <a
                          href={bestDeal.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full py-3 bg-black text-white text-center font-bold tracking-widest hover:bg-amber-600 transition-all"
                        >
                          BUY NOW
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-32 bg-neutral-50 border-2 border-black p-12">
                <Heart className="w-24 h-24 text-neutral-300 mx-auto mb-6" />
                <h3 className="text-3xl font-bold text-black mb-4 tracking-tight">YOUR WISHLIST IS EMPTY</h3>
                <p className="text-neutral-600 mb-8">Start adding products you love!</p>
                <button
                  onClick={() => setCurrentPage('home')}
                  className="px-8 py-4 bg-black text-white font-bold tracking-widest hover:bg-amber-600 transition-all"
                >
                  BROWSE PRODUCTS
                </button>
              </div>
            )}
          </div>
        )}

        {/* Compare Page */}
        {currentPage === 'compare' && (
          <div>
            <h2 className="text-5xl font-bold text-black mb-12 tracking-tight">COMPARE PRODUCTS</h2>
            {compareList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full bg-white border-2 border-black">
                  <thead className="bg-black text-white">
                    <tr>
                      <th className="p-6 text-left font-bold tracking-widest">FEATURE</th>
                      {compareList.map((product) => (
                        <th key={product._id} className="p-6">
                          <div className="relative">
                            <button
                              onClick={() => toggleCompare(product)}
                              className="absolute -top-3 -right-3 p-2 bg-white text-black border-2 border-black hover:bg-amber-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <div className="bg-neutral-50 p-6 mb-4">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-40 h-40 object-contain mx-auto"
                              />
                            </div>
                            <div className="text-sm font-bold tracking-widest">{product.brand}</div>
                            <div className="text-xs text-neutral-400 mt-2">{product.name}</div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b-2 border-black">
                      <td className="p-6 font-bold tracking-widest bg-neutral-50">BEST PRICE</td>
                      {compareList.map((product) => {
                        const bestDeal = getBestDeal(product);
                        return (
                          <td key={product._id} className="p-6 text-center">
                            <div className="text-3xl font-bold text-black">₹{bestDeal.amount}</div>
                            <div className="text-xs text-neutral-600 mt-1">{bestDeal.platform}</div>
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b-2 border-black">
                      <td className="p-6 font-bold tracking-widest bg-neutral-50">RATING</td>
                      {compareList.map((product) => (
                        <td key={product._id} className="p-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Star className="w-5 h-5 fill-amber-600 text-amber-600" />
                            <span className="font-bold">{product.rating || '4.5'}</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b-2 border-black">
                      <td className="p-6 font-bold tracking-widest bg-neutral-50">REVIEWS</td>
                      {compareList.map((product) => (
                        <td key={product._id} className="p-6 text-center font-semibold">
                          {product.reviewCount || '127'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b-2 border-black">
                      <td className="p-6 font-bold tracking-widest bg-neutral-50">MAX SAVINGS</td>
                      {compareList.map((product) => (
                        <td key={product._id} className="p-6 text-center">
                          <span className="text-amber-600 font-bold text-xl">{getMaxDiscount(product)}%</span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-6 font-bold tracking-widest bg-neutral-50">ACTION</td>
                      {compareList.map((product) => {
                        const bestDeal = getBestDeal(product);
                        return (
                          <td key={product._id} className="p-6 text-center">
                            <a
                              href={bestDeal.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block px-8 py-3 bg-black text-white font-bold tracking-widest hover:bg-amber-600 transition-all"
                            >
                              BUY NOW
                            </a>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-32 bg-neutral-50 border-2 border-black p-12">
                <GitCompare className="w-24 h-24 text-neutral-300 mx-auto mb-6" />
                <h3 className="text-3xl font-bold text-black mb-4 tracking-tight">NO PRODUCTS TO COMPARE</h3>
                <p className="text-neutral-600 mb-8">Add up to 3 products to compare them side by side</p>
                <button
                  onClick={() => setCurrentPage('home')}
                  className="px-8 py-4 bg-black text-white font-bold tracking-widest hover:bg-amber-600 transition-all"
                >
                  BROWSE PRODUCTS
                </button>
              </div>
            )}
          </div>
        )}

        {/* About Page */}
        {currentPage === 'about' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border-2 border-black p-16">
              <h2 className="text-5xl font-bold text-black mb-8 tracking-tight">ABOUT BEAUTYNOMY</h2>
              <div className="space-y-6 text-neutral-700 text-lg leading-relaxed">
                <p>
                  <span className="font-bold text-black">BEAUTYNOMY</span> is your intelligent beauty companion
                  that simplifies the way you discover and shop for cosmetics and skincare products.
                </p>
                <p>
                  We understand that finding the perfect beauty product at the best price can be overwhelming.
                  That's why we've created a platform that compares prices across multiple e-commerce platforms,
                  helping you make informed decisions and save money.
                </p>
                <p>
                  Our mission is to empower beauty enthusiasts with transparent pricing information,
                  helping you discover the best deals on your favorite products from trusted brands.
                </p>
                <div className="bg-neutral-50 border-l-4 border-amber-600 p-8 mt-8">
                  <h3 className="font-bold text-2xl mb-4 text-black tracking-tight">WHY CHOOSE BEAUTYNOMY?</h3>
                  <ul className="space-y-3 text-neutral-700">
                    <li className="flex items-start gap-3">
                      <span className="text-amber-600 font-bold">✓</span>
                      <span>Real-time price comparison across major platforms</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-amber-600 font-bold">✓</span>
                      <span>Curated selection of trusted beauty brands</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-amber-600 font-bold">✓</span>
                      <span>User ratings and authentic reviews</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-amber-600 font-bold">✓</span>
                      <span>Regular price updates for accuracy</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-amber-600 font-bold">✓</span>
                      <span>Clean, intuitive interface</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Page */}
        {currentPage === 'contact' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border-2 border-black p-16">
              <h2 className="text-5xl font-bold text-black mb-8 tracking-tight">GET IN TOUCH</h2>
              <p className="text-neutral-600 mb-12 text-lg">
                Have questions or feedback? We'd love to hear from you.
              </p>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-black mb-3 tracking-widest">
                    YOUR NAME
                  </label>
                  <input
                    type="text"
                    className="w-full px-6 py-4 bg-neutral-50 border-2 border-black focus:border-amber-600 focus:outline-none font-medium"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-3 tracking-widest">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    className="w-full px-6 py-4 bg-neutral-50 border-2 border-black focus:border-amber-600 focus:outline-none font-medium"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-3 tracking-widest">
                    MESSAGE
                  </label>
                  <textarea
                    rows="6"
                    className="w-full px-6 py-4 bg-neutral-50 border-2 border-black focus:border-amber-600 focus:outline-none resize-none font-medium"
                    placeholder="Tell us what's on your mind..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full py-5 bg-black text-white font-bold tracking-widest hover:bg-amber-600 transition-all duration-200"
                >
                  SEND MESSAGE
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer - Fenty Style */}
      <footer className="bg-black text-white mt-32 border-t-2 border-amber-600">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">B</span>
                </div>
                <span className="text-2xl font-bold tracking-wider">BEAUTYNOMY</span>
              </div>
              <p className="text-neutral-400 text-sm tracking-wide">
                BEAUTY FOR ALL
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-lg mb-4 tracking-widest">QUICK LINKS</h3>
              <ul className="space-y-2 text-neutral-400 text-sm">
                <li><button onClick={() => setCurrentPage('home')} className="hover:text-amber-500 transition-colors">HOME</button></li>
                <li><button onClick={() => setCurrentPage('about')} className="hover:text-amber-500 transition-colors">ABOUT</button></li>
                <li><button onClick={() => setCurrentPage('contact')} className="hover:text-amber-500 transition-colors">CONTACT</button></li>
                <li><button onClick={() => setCurrentPage('wishlist')} className="hover:text-amber-500 transition-colors">WISHLIST</button></li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-bold text-lg mb-4 tracking-widest">CATEGORIES</h3>
              <ul className="space-y-2 text-neutral-400 text-sm">
                {TRENDING_TAGS.map((tag) => (
                  <li key={tag.name}>
                    <button
                      onClick={() => { handleTrendingClick(tag.name); window.scrollTo(0, 0); }}
                      className="hover:text-amber-500 transition-colors"
                    >
                      {tag.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-bold text-lg mb-4 tracking-widest">LEGAL</h3>
              <ul className="space-y-2 text-neutral-400 text-sm">
                <li><a href="#" className="hover:text-amber-500 transition-colors">PRIVACY POLICY</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">TERMS OF SERVICE</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">COOKIE POLICY</a></li>
                <li><a href="#" className="hover:text-amber-500 transition-colors">AFFILIATE DISCLOSURE</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-800 pt-8 text-center text-neutral-500 text-sm">
            <p>&copy; 2025 BEAUTYNOMY. ALL RIGHTS RESERVED.</p>
            <p className="mt-2 tracking-widest">BEAUTY FOR ALL</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
