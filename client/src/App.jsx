import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Trending beauty categories
const TRENDING_TAGS = [
  { name: 'Foundation', icon: '💄', color: 'from-pink-400 to-rose-500' },
  { name: 'Lipstick', icon: '💋', color: 'from-red-400 to-pink-500' },
  { name: 'Serum', icon: '✨', color: 'from-purple-400 to-pink-400' },
  { name: 'Mascara', icon: '👁️', color: 'from-violet-400 to-purple-500' },
  { name: 'Blush', icon: '🌸', color: 'from-rose-400 to-pink-500' },
  { name: 'Skincare', icon: '🧴', color: 'from-blue-400 to-purple-400' },
];

export default function App() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);

  // Load featured products on mount
  useEffect(() => {
    fetchProducts('');
  }, []);

  const fetchProducts = async (searchTerm) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/products${searchTerm ? `?query=${searchTerm}` : ''}`);
      setProducts(res.data);
    } catch (err) {
      console.error('Error:', err);
    }
    setLoading(false);
  };

  const search = () => {
    fetchProducts(query);
    setCurrentPage('home');
  };

  const handleTrendingClick = (tag) => {
    setQuery(tag);
    fetchProducts(tag);
    setCurrentPage('home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white font-['Inter',sans-serif]">
      {/* Navbar */}
      <nav className="bg-white/95 backdrop-blur-lg border-b border-purple-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div 
              onClick={() => setCurrentPage('home')} 
              className="flex items-center gap-3 cursor-pointer group"
            >
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
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-gray-700 hover:text-purple-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3">
              <button 
                onClick={() => { setCurrentPage('home'); setMenuOpen(false); }} 
                className="block w-full text-left py-2 px-4 text-sm font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => { setCurrentPage('about'); setMenuOpen(false); }} 
                className="block w-full text-left py-2 px-4 text-sm font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => { setCurrentPage('contact'); setMenuOpen(false); }} 
                className="block w-full text-left py-2 px-4 text-sm font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
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
                    className={`group p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-purple-100`}
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
                      key={product._id}
                      className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-2 border border-purple-50"
                    >
                      {/* Product Image */}
                      <div className="relative aspect-square bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden">
                        <img
                          src={product.image || 'https://via.placeholder.com/400x400?text=Beauty+Product'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {product.rating && (
                          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500">⭐</span>
                              <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
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
                        {product.prices && product.prices.length > 0 ? (
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Price Comparison
                            </div>
                            {product.prices.slice(0, 3).map((price, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center p-2 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                              >
                                <span className="text-sm font-medium text-gray-700">{price.platform}</span>
                                <span className="text-sm font-bold text-purple-600">₹{price.amount}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            ₹{product.price || '999'}
                          </div>
                        )}

                        {/* View Details Button */}
                        <button className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200">
                          View Details
                        </button>
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
                  Nykaa, Amazon, and Sephora, helping you make informed purchasing decisions.
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
                    className="w-full px-6 py-4 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-6 py-4 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                  <textarea
                    rows="5"
                    placeholder="Your message..."
                    className="w-full px-6 py-4 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all resize-none"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200"
                >
                  Send Message
                </button>
              </form>
              <div className="mt-8 pt-8 border-t border-purple-100">
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">Follow us on social media</p>
                  <div className="flex justify-center gap-4">
                    <a href="#" className="text-2xl hover:scale-110 transition-transform">📱</a>
                    <a href="#" className="text-2xl hover:scale-110 transition-transform">💌</a>
                    <a href="#" className="text-2xl hover:scale-110 transition-transform">🐦</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-900 to-pink-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">💄</span>
                <span className="text-2xl font-bold">Beautynomy</span>
              </div>
              <p className="text-purple-200">
                Where Beauty Meets Simplicity
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-purple-200">
                <li><button onClick={() => setCurrentPage('home')} className="hover:text-white transition-colors">Home</button></li>
                <li><button onClick={() => setCurrentPage('about')} className="hover:text-white transition-colors">About</button></li>
                <li><button onClick={() => setCurrentPage('contact')} className="hover:text-white transition-colors">Contact</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Categories</h3>
              <ul className="space-y-2 text-purple-200">
                {TRENDING_TAGS.slice(0, 4).map((tag) => (
                  <li key={tag.name}>
                    <button 
                      onClick={() => handleTrendingClick(tag.name)} 
                      className="hover:text-white transition-colors"
                    >
                      {tag.icon} {tag.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-700 pt-8 text-center text-purple-200">
            <p>&copy; 2025 Beautynomy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
