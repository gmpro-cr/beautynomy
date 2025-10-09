import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TRENDING_TAGS = [
  { name: 'Foundation', icon: '💄', color: 'from-pink-400 to-rose-500' },
  { name: 'Lipstick', icon: '💋', color: 'from-red-400 to-pink-500' },
  { name: 'Serum', icon: '✨', color: 'from-purple-400 to-pink-400' },
  { name: 'Mascara', icon: '👁️', color: 'from-violet-400 to-purple-500' },
  { name: 'Blush', icon: '🌸', color: 'from-rose-400 to-pink-500' },
  { name: 'Skincare', icon: '🧴', color: 'from-blue-400 to-purple-400' },
];

function App() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchProducts('');
  }, []);

  const fetchProducts = async (searchQuery) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/products${searchQuery ? `?query=${searchQuery}` : ''}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const search = () => {
    fetchProducts(query);
    setCurrentPage('home');
  };

  const handleTrendingClick = (tagName) => {
    setQuery(tagName);
    fetchProducts(tagName);
    setCurrentPage('home');
  };

  const handleAffiliateClick = async (product, priceObj) => {
    // Track the click
    try {
      await axios.post(`${API_URL}/api/track/click`, {
        productId: product.id,
        platform: priceObj.platform
      });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
    
    // Open the affiliate link in a new tab
    window.open(priceObj.link, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white font-['Inter',sans-serif]">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-lg border-b border-purple-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div onClick={() => setCurrentPage('home')} className="flex items-center gap-3 cursor-pointer group">
              <span className="text-3xl group-hover:scale-110 transition-transform">💄</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
                Beautynomy
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-8 items-center">
              <button
                onClick={() => setCurrentPage('home')}
                className={`text-sm font-medium transition-colors ${
                  currentPage === 'home' ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentPage('about')}
                className={`text-sm font-medium transition-colors ${
                  currentPage === 'about' ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                About
              </button>
              <button
                onClick={() => setCurrentPage('contact')}
                className={`text-sm font-medium transition-colors ${
                  currentPage === 'contact' ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                Contact
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-purple-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 flex flex-col gap-2">
              <button
                onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }}
                className="text-left text-sm font-medium text-gray-600 hover:text-purple-600 py-2"
              >
                Home
              </button>
              <button
                onClick={() => { setCurrentPage('about'); setMobileMenuOpen(false); }}
                className="text-left text-sm font-medium text-gray-600 hover:text-purple-600 py-2"
              >
                About
              </button>
              <button
                onClick={() => { setCurrentPage('contact'); setMobileMenuOpen(false); }}
                className="text-left text-sm font-medium text-gray-600 hover:text-purple-600 py-2"
              >
                Contact
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {currentPage === 'home' && (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
                Where Beauty Meets{' '}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Simplicity
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Compare prices, discover trending products, and make smarter beauty decisions
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="flex gap-3 p-2 bg-white rounded-2xl shadow-lg border border-purple-100">
                <input
                  type="text"
                  placeholder="Search for lipstick, serum, foundation..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && search()}
                  className="flex-1 px-6 py-4 text-gray-700 outline-none rounded-xl bg-transparent placeholder-gray-400"
                />
                <button
                  onClick={search}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Trending Tags */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Trending Categories
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {TRENDING_TAGS.map((tag) => (
                  <button
                    key={tag.name}
                    onClick={() => handleTrendingClick(tag.name)}
                    className="group p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-purple-100"
                  >
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                      {tag.icon}
                    </div>
                    <div className={`text-sm font-semibold bg-gradient-to-r ${tag.color} bg-clip-text text-transparent`}>
                      {tag.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  <div className="mt-4 text-center text-gray-600 font-medium">Loading...</div>
                </div>
              </div>
            ) : products.length > 0 ? (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {query ? `Results for "${query}"` : 'Featured Products'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-2 border border-purple-50"
                    >
                      {/* Product Image */}
                      <div className="relative aspect-square bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden">
                        <img
                          src={product.image || 'https://via.placeholder.com/400x400?text=Beauty+Product'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {product.prices && product.prices[0] && (
                          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500">⭐</span>
                              <span className="text-sm font-semibold text-gray-700">{product.prices[0].rating}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="p-5">
                        <div className="text-xs font-semibold text-purple-600 mb-2 uppercase tracking-wide">
                          {product.brand}
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {product.description}
                          </p>
                        )}

                        {/* Price Comparison */}
                        {product.prices && product.prices.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Price Comparison
                            </div>
                            {product.prices.slice(0, 3).map((priceObj, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleAffiliateClick(product, priceObj)}
                                className="w-full flex justify-between items-center p-2 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer"
                              >
                                <span className="text-sm font-medium text-gray-700">{priceObj.platform}</span>
                                <span className="text-sm font-bold text-purple-600">₹{priceObj.amount}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Best Price Button */}
                        {product.prices && product.prices.length > 0 && (
                          <button 
                            onClick={() => {
                              const bestPrice = product.prices.reduce((min, p) => p.amount < min.amount ? p : min);
                              handleAffiliateClick(product, bestPrice);
                            }}
                            className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
                          >
                            Buy at Best Price →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try searching for something else or explore our trending categories</p>
              </div>
            )}
          </>
        )}

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
                  We understand that finding the perfect beauty product at the best price can be overwhelming. 
                  That's why we've created a platform that aggregates prices from major e-commerce platforms like 
                  Nykaa, Amazon, and Flipkart, helping you make informed purchasing decisions.
                </p>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Our Mission</h3>
                  <p>
                    To empower beauty enthusiasts with transparent pricing, authentic reviews, and trending product 
                    recommendations – all in one elegant, easy-to-use platform.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">What We Offer</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-purple-600 font-bold">✓</span>
                      <span>Price comparison across multiple platforms</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-purple-600 font-bold">✓</span>
                      <span>Trending beauty products and categories</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-purple-600 font-bold">✓</span>
                      <span>Detailed product information and ratings</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-purple-600 font-bold">✓</span>
                      <span>Beautiful, intuitive interface inspired by Fenty Beauty aesthetics</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'contact' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-12 border border-purple-100">
              <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Get in Touch</h2>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full px-6 py-4 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    className="w-full px-6 py-4 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                  <textarea
                    rows="5"
                    placeholder="Your message..."
                    className="w-full px-6 py-4 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-purple-100 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-600">
          <p>© 2025 Beautynomy. Where Beauty Meets Simplicity.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
