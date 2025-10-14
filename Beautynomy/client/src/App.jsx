import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Heart, GitCompare, Star, Clock, X, Filter, Menu, ChevronDown, Award, ShieldCheck, Sparkles, Users, Package } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://beautynomy-api.onrender.com';

// Product categories with skin-type focus
const CATEGORIES = [
  { name: 'Foundation', label: 'Foundation', icon: '💄' },
  { name: 'Skincare', label: 'Skincare', icon: '✨' },
  { name: 'Lipstick', label: 'Lipstick', icon: '💋' },
  { name: 'Serum', label: 'Serum', icon: '🧴' },
  { name: 'Mascara', label: 'Mascara', icon: '👁️' },
  { name: 'Blush', label: 'Blush', icon: '🌸' },
];

// Skin types for filtering
const SKIN_TYPES = ['All Skin Types', 'Dry', 'Oily', 'Combination', 'Sensitive', 'Normal'];

// Skin concerns for filtering
const CONCERNS = ['Anti-Aging', 'Acne-Prone', 'Hyperpigmentation', 'Dullness', 'Fine Lines', 'Dark Spots', 'Uneven Texture'];

// Key ingredients
const INGREDIENTS = ['Hyaluronic Acid', 'Vitamin C', 'Retinol', 'Niacinamide', 'Salicylic Acid', 'AHA/BHA', 'Peptides'];

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
  const [showQuiz, setShowQuiz] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSkinType, setSelectedSkinType] = useState('All Skin Types');
  const [selectedConcerns, setSelectedConcerns] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});

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
  }, [products, priceRange, selectedBrands, sortBy, selectedSkinType, selectedConcerns, selectedIngredients]);

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
      case 'popular':
        return sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
      default:
        return sorted;
    }
  };

  const getLowestPrice = (product) => {
    return Math.min(...product.prices.map(p => p.amount));
  };

  const getSavingsPercent = (product) => {
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

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSearchQuery('');
    setCurrentPage('home');
    setMobileMenuOpen(false);
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

  const allBrands = [...new Set(products.map(p => p.brand))].sort();

  const toggleBrand = (brand) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  const toggleConcern = (concern) => {
    if (selectedConcerns.includes(concern)) {
      setSelectedConcerns(selectedConcerns.filter(c => c !== concern));
    } else {
      setSelectedConcerns([...selectedConcerns, concern]);
    }
  };

  const toggleIngredient = (ingredient) => {
    if (selectedIngredients.includes(ingredient)) {
      setSelectedIngredients(selectedIngredients.filter(i => i !== ingredient));
    } else {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setSelectedSkinType('All Skin Types');
    setSelectedConcerns([]);
    setSelectedIngredients([]);
    setPriceRange([0, 5000]);
    setSearchQuery('');
    setSelectedCategory('');
  };

  const activeFilterCount = selectedBrands.length + selectedConcerns.length + selectedIngredients.length +
    (selectedSkinType !== 'All Skin Types' ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 5000 ? 1 : 0);

  // Quiz questions
  const quizQuestions = [
    {
      question: "What's your primary skin type?",
      options: ['Dry', 'Oily', 'Combination', 'Sensitive', 'Normal'],
      key: 'skinType'
    },
    {
      question: "What's your main skin concern?",
      options: ['Anti-Aging', 'Acne', 'Hyperpigmentation', 'Dullness', 'Dryness'],
      key: 'concern'
    },
    {
      question: "What's your budget range?",
      options: ['Under ₹500', '₹500-₹1000', '₹1000-₹2000', 'Above ₹2000'],
      key: 'budget'
    }
  ];

  const handleQuizAnswer = (answer) => {
    const currentQuestion = quizQuestions[quizStep];
    setQuizAnswers({ ...quizAnswers, [currentQuestion.key]: answer });

    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      // Quiz complete - apply recommendations
      const { skinType, concern, budget } = { ...quizAnswers, [currentQuestion.key]: answer };
      setSelectedSkinType(skinType || 'All Skin Types');
      if (concern) {
        setSelectedConcerns([concern]);
      }
      // Set price range based on budget
      if (budget === 'Under ₹500') setPriceRange([0, 500]);
      else if (budget === '₹500-₹1000') setPriceRange([500, 1000]);
      else if (budget === '₹1000-₹2000') setPriceRange([1000, 2000]);
      else setPriceRange([2000, 5000]);

      setShowQuiz(false);
      setQuizStep(0);
      setCurrentPage('home');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-blush-50 relative">
      {/* Elegant Background Pattern */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d99b82' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Header - Elegant and Minimalist */}
      <header className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => { setCurrentPage('home'); setSelectedCategory(''); setSearchQuery(''); }}
              className="flex items-center gap-3 group"
              aria-label="Go to homepage"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blush-400 to-mauve-400 rounded-full flex items-center justify-center shadow-soft">
                <span className="text-white text-xl font-bold">B</span>
              </div>
              <span className="text-2xl font-semibold tracking-tight text-slate-800">Beautynomy</span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8" role="navigation" aria-label="Main navigation">
              <button
                onClick={() => setCurrentPage('home')}
                className={`text-sm font-medium transition-colors ${
                  currentPage === 'home' ? 'text-blush-600' : 'text-slate-700 hover:text-blush-600'
                }`}
                aria-current={currentPage === 'home' ? 'page' : undefined}
              >
                Home
              </button>
              <button
                onClick={() => setShowQuiz(true)}
                className="text-sm font-medium text-slate-700 hover:text-blush-600 transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-4 h-4" />
                Find My Match
              </button>
              <button
                onClick={() => setCurrentPage('about')}
                className={`text-sm font-medium transition-colors ${
                  currentPage === 'about' ? 'text-blush-600' : 'text-slate-700 hover:text-blush-600'
                }`}
                aria-current={currentPage === 'about' ? 'page' : undefined}
              >
                About
              </button>
              <button
                onClick={() => setCurrentPage('contact')}
                className={`text-sm font-medium transition-colors ${
                  currentPage === 'contact' ? 'text-blush-600' : 'text-slate-700 hover:text-blush-600'
                }`}
                aria-current={currentPage === 'contact' ? 'page' : undefined}
              >
                Contact
              </button>

              {/* Wishlist & Compare */}
              <button
                onClick={() => setCurrentPage('wishlist')}
                className="relative p-2 hover:bg-blush-50 rounded-full transition-colors"
                aria-label={`Wishlist (${wishlist.length} items)`}
              >
                <Heart
                  className={`w-5 h-5 ${
                    wishlist.length > 0 ? 'fill-blush-500 text-blush-500' : 'text-slate-600'
                  }`}
                />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-terracotta-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setCurrentPage('compare')}
                className="relative p-2 hover:bg-blush-50 rounded-full transition-colors"
                aria-label={`Compare (${compareList.length} items)`}
              >
                <GitCompare className={`w-5 h-5 ${compareList.length > 0 ? 'text-blush-500' : 'text-slate-600'}`} />
                {compareList.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-terracotta-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {compareList.length}
                  </span>
                )}
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-700 p-2"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-slate-200">
              <nav className="flex flex-col gap-3">
                <button onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }} className="text-left text-sm font-medium text-slate-700 hover:text-blush-600 py-2">Home</button>
                <button onClick={() => { setShowQuiz(true); setMobileMenuOpen(false); }} className="text-left text-sm font-medium text-slate-700 hover:text-blush-600 py-2 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Find My Match</button>
                <button onClick={() => { setCurrentPage('about'); setMobileMenuOpen(false); }} className="text-left text-sm font-medium text-slate-700 hover:text-blush-600 py-2">About</button>
                <button onClick={() => { setCurrentPage('contact'); setMobileMenuOpen(false); }} className="text-left text-sm font-medium text-slate-700 hover:text-blush-600 py-2">Contact</button>
                <button onClick={() => { setCurrentPage('wishlist'); setMobileMenuOpen(false); }} className="text-left text-sm font-medium text-slate-700 hover:text-blush-600 py-2">Wishlist ({wishlist.length})</button>
                <button onClick={() => { setCurrentPage('compare'); setMobileMenuOpen(false); }} className="text-left text-sm font-medium text-slate-700 hover:text-blush-600 py-2">Compare ({compareList.length})</button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
        {currentPage === 'home' && (
          <>
            {/* Hero Section - Elegant and Clean */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-slate-800 mb-4">
                Beauty for Everyone
              </h1>
              <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                Compare prices, discover products, and find what works for your unique beauty needs
              </p>

              {/* Search Bar - Prominent and Clean */}
              <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-6">
                <div className="relative shadow-lg rounded-full">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden="true" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for lipstick, foundation, serum..."
                    className="w-full pl-14 pr-36 py-4 bg-white border-2 border-slate-200 focus:border-blush-400 focus:outline-none focus:ring-2 focus:ring-blush-200 text-base rounded-full transition-all"
                    aria-label="Search products"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-gradient-to-r from-blush-500 to-mauve-500 text-white font-medium hover:from-blush-600 hover:to-mauve-600 transition-all duration-200 rounded-full shadow-md"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Trust Signals */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600 mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sage-600" aria-hidden="true" />
                  <span>Verified Products</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-terracotta-600" aria-hidden="true" />
                  <span>Best Price Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blush-600" aria-hidden="true" />
                  <span>Updated {getTimeSinceUpdate()}</span>
                </div>
              </div>
            </div>

            {/* Category Pills - Clean and Accessible */}
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-slate-800 mb-6 text-center">
                Shop by Category
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => handleCategoryClick(cat.name)}
                    className={`px-6 py-3 rounded-full transition-all duration-300 border-2 ${
                      selectedCategory === cat.name
                        ? 'border-blush-500 bg-blush-500 text-white shadow-md'
                        : 'border-slate-200 bg-white hover:border-blush-300 text-slate-700 hover:shadow-soft'
                    }`}
                    aria-pressed={selectedCategory === cat.name}
                  >
                    <span className="mr-2" aria-hidden="true">{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filters and Sort - Clean Interface */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
              <div className="flex items-center gap-4 flex-wrap">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors rounded-lg"
                  aria-expanded={showFilters}
                >
                  <Filter className="w-4 h-4" aria-hidden="true" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-terracotta-500 text-white text-xs rounded-full px-2 py-0.5">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-slate-600 hover:text-slate-800 font-medium underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label htmlFor="sort-select" className="text-sm font-medium text-slate-700">Sort by:</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-slate-300 bg-white focus:outline-none focus:border-blush-400 focus:ring-2 focus:ring-blush-200 rounded-lg text-sm"
                >
                  <option value="relevance">Relevance</option>
                  <option value="popular">Most Popular</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="reviews">Most Reviews</option>
                </select>
              </div>
            </div>

            {/* Filter Panel - Comprehensive */}
            {showFilters && (
              <div className="mb-8 bg-white p-6 rounded-xl border border-slate-200 shadow-soft">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Skin Type */}
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blush-500" aria-hidden="true" />
                      Skin Type
                    </h3>
                    <div className="space-y-2">
                      {SKIN_TYPES.map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="radio"
                            name="skinType"
                            checked={selectedSkinType === type}
                            onChange={() => setSelectedSkinType(type)}
                            className="w-4 h-4 accent-blush-500"
                          />
                          <span className="text-sm text-slate-700 group-hover:text-slate-900">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Concerns */}
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-mauve-500" aria-hidden="true" />
                      Concerns
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {CONCERNS.map((concern) => (
                        <label key={concern} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedConcerns.includes(concern)}
                            onChange={() => toggleConcern(concern)}
                            className="w-4 h-4 accent-mauve-500"
                          />
                          <span className="text-sm text-slate-700 group-hover:text-slate-900">{concern}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4 text-sage-600" aria-hidden="true" />
                      Key Ingredients
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {INGREDIENTS.map((ingredient) => (
                        <label key={ingredient} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedIngredients.includes(ingredient)}
                            onChange={() => toggleIngredient(ingredient)}
                            className="w-4 h-4 accent-sage-500"
                          />
                          <span className="text-sm text-slate-700 group-hover:text-slate-900">{ingredient}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range & Brands */}
                  <div className="space-y-6">
                    {/* Price Range */}
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-3">Price Range</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-600 w-12">₹{priceRange[0]}</span>
                          <input
                            type="range"
                            min="0"
                            max="5000"
                            step="100"
                            value={priceRange[0]}
                            onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                            className="flex-1 accent-blush-500"
                            aria-label="Minimum price"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-600 w-12">₹{priceRange[1]}</span>
                          <input
                            type="range"
                            min="0"
                            max="5000"
                            step="100"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                            className="flex-1 accent-blush-500"
                            aria-label="Maximum price"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Brands */}
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-3">Brands</h3>
                      <div className="max-h-32 overflow-y-auto space-y-2">
                        {allBrands.slice(0, 10).map((brand) => (
                          <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={selectedBrands.includes(brand)}
                              onChange={() => toggleBrand(brand)}
                              className="w-4 h-4 accent-terracotta-500"
                            />
                            <span className="text-sm text-slate-700 group-hover:text-slate-900">{brand}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-32">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blush-200 border-t-blush-500" role="status">
                  <span className="sr-only">Loading products...</span>
                </div>
                <p className="mt-6 text-slate-700 font-medium">Loading products...</p>
              </div>
            ) : error ? (
              <div className="text-center py-32 bg-white rounded-xl border border-slate-200 p-12">
                <div className="text-6xl mb-6" aria-hidden="true">⚠️</div>
                <h3 className="text-3xl font-semibold text-slate-800 mb-4">Connection Error</h3>
                <p className="text-slate-600 mb-6">{error}</p>
                <button
                  onClick={fetchProducts}
                  className="px-8 py-3 bg-blush-500 text-white font-medium hover:bg-blush-600 transition-all rounded-lg"
                >
                  Try Again
                </button>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-slate-800">
                    {selectedCategory ? `${selectedCategory} Products` : 'All Products'}
                  </h2>
                  <p className="text-slate-600">{filteredProducts.length} products</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => {
                    const bestDeal = getBestDeal(product);
                    const savingsPercent = getSavingsPercent(product);

                    return (
                      <article
                        key={product._id}
                        className="group bg-white rounded-xl border border-slate-200 hover:border-blush-300 hover:shadow-lg transition-all duration-300"
                      >
                        {/* Product Image */}
                        <div className="relative bg-cream-50 p-6 rounded-t-xl h-64 flex items-center justify-center overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />

                          {/* Wishlist & Compare Buttons */}
                          <div className="absolute top-3 right-3 flex flex-col gap-2">
                            <button
                              onClick={() => toggleWishlist(product)}
                              className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-blush-500 hover:text-white transition-all shadow-soft"
                              aria-label={isInWishlist(product) ? 'Remove from wishlist' : 'Add to wishlist'}
                            >
                              <Heart
                                className={`w-5 h-5 ${
                                  isInWishlist(product) ? 'fill-blush-500 text-blush-500' : ''
                                }`}
                              />
                            </button>
                            <button
                              onClick={() => toggleCompare(product)}
                              className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-mauve-500 hover:text-white transition-all shadow-soft"
                              aria-label={isInCompare(product) ? 'Remove from compare' : 'Add to compare'}
                            >
                              <GitCompare
                                className={`w-5 h-5 ${isInCompare(product) ? 'text-mauve-500' : ''}`}
                              />
                            </button>
                          </div>

                          {/* Badges */}
                          {savingsPercent > 0 && (
                            <div className="absolute top-3 left-3 bg-terracotta-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                              Save {savingsPercent}%
                            </div>
                          )}

                          {/* Rating Badge */}
                          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1 shadow-soft">
                            <Star className="w-3.5 h-3.5 fill-terracotta-500 text-terracotta-500" aria-hidden="true" />
                            <span className="text-sm font-semibold text-slate-700">{product.rating || '4.5'}</span>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-5">
                          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                            {product.brand}
                          </div>
                          <h3 className="text-base font-semibold text-slate-800 mb-2 line-clamp-2 min-h-[2.5rem]">
                            {product.name}
                          </h3>

                          {/* Reviews */}
                          <div className="flex items-center gap-2 mb-4 text-sm text-slate-600">
                            <Star className="w-4 h-4 fill-terracotta-400 text-terracotta-400" aria-hidden="true" />
                            <span>{product.rating || '4.5'}</span>
                            <span className="text-slate-400">•</span>
                            <span>{product.reviewCount || '127'} reviews</span>
                          </div>

                          {/* Price Comparison - Minimal */}
                          <div className="space-y-2 mb-4">
                            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                              Compare Prices
                            </div>
                            {product.prices.slice(0, 3).map((price, idx) => (
                              <a
                                key={idx}
                                href={price.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`block group/price relative overflow-hidden transition-all duration-200 rounded-lg ${
                                  price.platform === bestDeal.platform
                                    ? 'bg-gradient-to-r from-blush-50 to-mauve-50 border-2 border-blush-300'
                                    : 'bg-slate-50 border border-slate-200 hover:border-blush-200'
                                }`}
                              >
                                <div className="flex justify-between items-center p-3">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-sm font-medium ${
                                      price.platform === bestDeal.platform ? 'text-blush-700' : 'text-slate-700'
                                    }`}>
                                      {price.platform}
                                    </span>
                                    {price.platform === bestDeal.platform && (
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-600 flex items-center gap-1">
                                        <Award className="w-3 h-3" aria-hidden="true" />
                                        Best
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-base font-bold ${
                                      price.platform === bestDeal.platform ? 'text-slate-900' : 'text-slate-700'
                                    }`}>
                                      ₹{price.amount}
                                    </span>
                                    <ChevronDown className="w-4 h-4 -rotate-90 text-slate-400 group-hover/price:translate-x-1 transition-transform" aria-hidden="true" />
                                  </div>
                                </div>
                              </a>
                            ))}
                          </div>

                          {/* CTA Button */}
                          <a
                            href={bestDeal.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full py-3 bg-gradient-to-r from-blush-500 to-mauve-500 text-white text-center font-semibold hover:from-blush-600 hover:to-mauve-600 transition-all duration-200 rounded-lg shadow-md hover:shadow-lg"
                          >
                            View Best Price - ₹{bestDeal.amount}
                          </a>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Trust Section - Reviews & UGC */}
                <div className="mt-16 bg-gradient-to-br from-cream-50 to-blush-50 rounded-2xl p-8 border border-slate-200">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-serif font-bold text-slate-800 mb-3">
                      Trusted by Beauty Lovers
                    </h2>
                    <p className="text-slate-600">Real reviews from real customers</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {[
                      { name: 'Priya S.', product: 'Lakme Foundation', rating: 5, review: 'Found the best price here! Saved ₹200 on my favorite foundation.' },
                      { name: 'Ananya M.', product: 'Nykaa Lipstick', rating: 5, review: 'The skin quiz helped me find perfect products for my oily skin.' },
                      { name: 'Riya K.', product: 'Maybelline Mascara', rating: 4, review: 'Love the price comparison feature. Makes shopping so much easier!' },
                    ].map((review, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-soft">
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-terracotta-500 text-terracotta-500" aria-hidden="true" />
                          ))}
                        </div>
                        <p className="text-slate-700 mb-4 text-sm leading-relaxed">"{review.review}"</p>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blush-400 to-mauve-400 rounded-full flex items-center justify-center text-white font-semibold">
                            {review.name[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 text-sm">{review.name}</div>
                            <div className="text-xs text-slate-500">{review.product}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Affiliate Disclosure */}
                <div className="mt-12 p-6 bg-white rounded-xl border border-slate-200 text-center">
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold">Affiliate Disclosure:</span> We earn from qualifying purchases made through links on this site.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-32 bg-white rounded-xl border border-slate-200 p-12">
                <div className="text-6xl mb-6" aria-hidden="true">🔍</div>
                <h3 className="text-3xl font-semibold text-slate-800 mb-4">No Products Found</h3>
                <p className="text-slate-600 mb-6">Try adjusting your filters or search for something else</p>
                <button
                  onClick={clearAllFilters}
                  className="px-8 py-3 bg-blush-500 text-white font-medium hover:bg-blush-600 transition-all rounded-lg"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </>
        )}

        {/* Wishlist Page */}
        {currentPage === 'wishlist' && (
          <div>
            <h2 className="text-4xl font-serif font-bold text-slate-800 mb-8">My Wishlist</h2>
            {wishlist.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlist.map((product) => {
                  const bestDeal = getBestDeal(product);
                  return (
                    <div key={product._id} className="bg-white rounded-xl border border-slate-200 relative shadow-soft hover:shadow-lg transition-all">
                      <button
                        onClick={() => toggleWishlist(product)}
                        className="absolute top-3 right-3 p-2 bg-white rounded-full hover:bg-red-50 z-10 shadow-soft"
                        aria-label="Remove from wishlist"
                      >
                        <X className="w-5 h-5 text-red-500" />
                      </button>
                      <div className="bg-cream-50 p-6 rounded-t-xl">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-48 object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-5">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          {product.brand}
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-4">{product.name}</h3>
                        <div className="text-2xl font-bold text-slate-900 mb-4">
                          ₹{bestDeal.amount}
                        </div>
                        <a
                          href={bestDeal.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full py-3 bg-blush-500 text-white text-center font-semibold hover:bg-blush-600 transition-all rounded-lg"
                        >
                          Buy Now
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-32 bg-white rounded-xl border border-slate-200 p-12">
                <Heart className="w-24 h-24 text-slate-300 mx-auto mb-6" aria-hidden="true" />
                <h3 className="text-3xl font-semibold text-slate-800 mb-4">Your Wishlist is Empty</h3>
                <p className="text-slate-600 mb-8">Start adding products you love!</p>
                <button
                  onClick={() => setCurrentPage('home')}
                  className="px-8 py-3 bg-blush-500 text-white font-medium hover:bg-blush-600 transition-all rounded-lg"
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
            <h2 className="text-4xl font-serif font-bold text-slate-800 mb-8">Compare Products</h2>
            {compareList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-xl border border-slate-200 shadow-soft">
                  <thead className="bg-gradient-to-r from-blush-500 to-mauve-500 text-white">
                    <tr>
                      <th className="p-4 text-left font-semibold">Feature</th>
                      {compareList.map((product) => (
                        <th key={product._id} className="p-4">
                          <div className="relative">
                            <button
                              onClick={() => toggleCompare(product)}
                              className="absolute -top-2 -right-2 p-2 bg-white text-slate-700 rounded-full hover:bg-red-50 shadow-soft"
                              aria-label="Remove from compare"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <div className="bg-cream-50 p-4 rounded-lg mb-3">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-32 h-32 object-contain mx-auto"
                                loading="lazy"
                              />
                            </div>
                            <div className="text-sm font-semibold">{product.brand}</div>
                            <div className="text-xs text-white/80 mt-1">{product.name}</div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="p-4 font-semibold bg-cream-50">Best Price</td>
                      {compareList.map((product) => {
                        const bestDeal = getBestDeal(product);
                        return (
                          <td key={product._id} className="p-4 text-center">
                            <div className="text-2xl font-bold text-slate-900">₹{bestDeal.amount}</div>
                            <div className="text-xs text-slate-600 mt-1">{bestDeal.platform}</div>
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-4 font-semibold bg-cream-50">Rating</td>
                      {compareList.map((product) => (
                        <td key={product._id} className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Star className="w-5 h-5 fill-terracotta-500 text-terracotta-500" aria-hidden="true" />
                            <span className="font-semibold">{product.rating || '4.5'}</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-4 font-semibold bg-cream-50">Reviews</td>
                      {compareList.map((product) => (
                        <td key={product._id} className="p-4 text-center font-semibold">
                          {product.reviewCount || '127'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold bg-cream-50">Action</td>
                      {compareList.map((product) => {
                        const bestDeal = getBestDeal(product);
                        return (
                          <td key={product._id} className="p-4 text-center">
                            <a
                              href={bestDeal.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block px-6 py-2.5 bg-blush-500 text-white font-semibold hover:bg-blush-600 transition-all rounded-lg"
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
              <div className="text-center py-32 bg-white rounded-xl border border-slate-200 p-12">
                <GitCompare className="w-24 h-24 text-slate-300 mx-auto mb-6" aria-hidden="true" />
                <h3 className="text-3xl font-semibold text-slate-800 mb-4">No Products to Compare</h3>
                <p className="text-slate-600 mb-8">Add up to 3 products to compare them side by side</p>
                <button
                  onClick={() => setCurrentPage('home')}
                  className="px-8 py-3 bg-blush-500 text-white font-medium hover:bg-blush-600 transition-all rounded-lg"
                >
                  Browse Products
                </button>
              </div>
            )}
          </div>
        )}

        {/* About Page */}
        {currentPage === 'about' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 p-12 shadow-soft">
              <h2 className="text-4xl font-serif font-bold text-slate-800 mb-6">About Beautynomy</h2>
              <div className="space-y-6 text-slate-700 text-lg leading-relaxed">
                <p>
                  <span className="font-semibold text-slate-900">Beautynomy</span> is your intelligent beauty companion
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
                <div className="bg-cream-50 border-l-4 border-blush-500 p-8 mt-8 rounded-r-xl">
                  <h3 className="font-semibold text-2xl mb-4 text-slate-800">Why Choose Beautynomy?</h3>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-sage-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span>Real-time price comparison across major platforms</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-terracotta-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span>Curated selection of trusted beauty brands</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Star className="w-5 h-5 text-blush-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span>User ratings and authentic reviews</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-mauve-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span>Regular price updates for accuracy</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-sage-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span>Personalized recommendations based on your skin type</span>
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
            <div className="bg-white rounded-2xl border border-slate-200 p-12 shadow-soft">
              <h2 className="text-4xl font-serif font-bold text-slate-800 mb-4">Get in Touch</h2>
              <p className="text-slate-600 mb-8 text-lg">
                Have questions or feedback? We'd love to hear from you.
              </p>
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                    Your Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="w-full px-4 py-3 bg-cream-50 border border-slate-300 focus:border-blush-400 focus:outline-none focus:ring-2 focus:ring-blush-200 rounded-lg"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full px-4 py-3 bg-cream-50 border border-slate-300 focus:border-blush-400 focus:outline-none focus:ring-2 focus:ring-blush-200 rounded-lg"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows="6"
                    className="w-full px-4 py-3 bg-cream-50 border border-slate-300 focus:border-blush-400 focus:outline-none focus:ring-2 focus:ring-blush-200 resize-none rounded-lg"
                    placeholder="Tell us what's on your mind..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-blush-500 to-mauve-500 text-white font-semibold hover:from-blush-600 hover:to-mauve-600 transition-all duration-200 rounded-lg shadow-md"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation - Touch Friendly */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-2xl z-50" role="navigation" aria-label="Mobile navigation">
        <div className="flex items-center justify-around py-3 px-2">
          <button
            onClick={() => setCurrentPage('home')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              currentPage === 'home' ? 'text-blush-600 bg-blush-50' : 'text-slate-600'
            }`}
            aria-current={currentPage === 'home' ? 'page' : undefined}
          >
            <Search className="w-5 h-5" aria-hidden="true" />
            <span className="text-xs font-medium">Shop</span>
          </button>
          <button
            onClick={() => setShowQuiz(true)}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors text-slate-600"
          >
            <Sparkles className="w-5 h-5" aria-hidden="true" />
            <span className="text-xs font-medium">Quiz</span>
          </button>
          <button
            onClick={() => setCurrentPage('wishlist')}
            className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              currentPage === 'wishlist' ? 'text-blush-600 bg-blush-50' : 'text-slate-600'
            }`}
            aria-current={currentPage === 'wishlist' ? 'page' : undefined}
            aria-label={`Wishlist (${wishlist.length} items)`}
          >
            <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'fill-blush-500' : ''}`} aria-hidden="true" />
            <span className="text-xs font-medium">Wishlist</span>
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-terracotta-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setCurrentPage('compare')}
            className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              currentPage === 'compare' ? 'text-blush-600 bg-blush-50' : 'text-slate-600'
            }`}
            aria-current={currentPage === 'compare' ? 'page' : undefined}
            aria-label={`Compare (${compareList.length} items)`}
          >
            <GitCompare className="w-5 h-5" aria-hidden="true" />
            <span className="text-xs font-medium">Compare</span>
            {compareList.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-terracotta-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {compareList.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Skin Quiz Modal */}
      {showQuiz && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-labelledby="quiz-title" aria-modal="true">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 id="quiz-title" className="text-2xl font-serif font-bold text-slate-800">Find Your Perfect Match</h2>
              <button
                onClick={() => { setShowQuiz(false); setQuizStep(0); }}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Close quiz"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-slate-600 mb-2">
                <span>Question {quizStep + 1} of {quizQuestions.length}</span>
                <span>{Math.round(((quizStep + 1) / quizQuestions.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blush-500 to-mauve-500 transition-all duration-300"
                  style={{ width: `${((quizStep + 1) / quizQuestions.length) * 100}%` }}
                  role="progressbar"
                  aria-valuenow={(quizStep + 1) / quizQuestions.length * 100}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-6">
                {quizQuestions[quizStep].question}
              </h3>
              <div className="space-y-3">
                {quizQuestions[quizStep].options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleQuizAnswer(option)}
                    className="w-full p-4 text-left border-2 border-slate-200 hover:border-blush-400 hover:bg-blush-50 rounded-xl transition-all font-medium text-slate-700"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer - Clean and Modern */}
      <footer className="bg-slate-900 text-white mt-24 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blush-400 to-mauve-400 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl font-bold">B</span>
                </div>
                <span className="text-xl font-semibold">Beautynomy</span>
              </div>
              <p className="text-slate-400 text-sm">
                Beauty for Everyone
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-base mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => { setCurrentPage('home'); window.scrollTo(0, 0); }} className="text-slate-400 hover:text-white transition-colors">Home</button></li>
                <li><button onClick={() => { setCurrentPage('about'); window.scrollTo(0, 0); }} className="text-slate-400 hover:text-white transition-colors">About</button></li>
                <li><button onClick={() => { setCurrentPage('contact'); window.scrollTo(0, 0); }} className="text-slate-400 hover:text-white transition-colors">Contact</button></li>
                <li><button onClick={() => { setCurrentPage('wishlist'); window.scrollTo(0, 0); }} className="text-slate-400 hover:text-white transition-colors">Wishlist</button></li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-semibold text-base mb-4">Categories</h3>
              <ul className="space-y-2 text-sm">
                {CATEGORIES.map((cat) => (
                  <li key={cat.name}>
                    <button
                      onClick={() => { handleCategoryClick(cat.name); window.scrollTo(0, 0); }}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {cat.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-base mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Affiliate Disclosure</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 text-center text-slate-500 text-sm">
            <p>&copy; 2025 Beautynomy. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
