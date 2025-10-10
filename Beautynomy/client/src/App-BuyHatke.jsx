import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, TrendingDown, Star, ExternalLink, Info, Zap } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://beautynomy-api.onrender.com';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Foundation', 'Lipstick', 'Serum', 'Cleanser', 'Moisturizer'];

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products
  useEffect(() => {
    let filtered = [...products];

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/products`);
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getBestPrice = (prices) => {
    return prices.reduce((min, p) => p.amount < min.amount ? p : min, prices[0]);
  };

  const getSavings = (prices) => {
    const amounts = prices.map(p => p.amount);
    const max = Math.max(...amounts);
    const min = Math.min(...amounts);
    return max - min;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Clean BuyHatke Style */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">B</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Beautynomy</span>
              <span className="hidden sm:inline text-xs text-gray-500 ml-2">Beauty Price Comparison</span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="hidden lg:flex items-center gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-gray-900">{products.length}</div>
                <div className="text-xs text-gray-500">Products</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-900">5</div>
                <div className="text-xs text-gray-500">Stores</div>
              </div>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 pb-4 overflow-x-auto scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Price Disclaimer */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <strong>Price Disclaimer:</strong> Prices shown are approximate and may vary on seller websites.
            We earn affiliate commissions when you purchase through our links at no extra cost to you.
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading amazing deals...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchProducts}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProducts.map((product) => {
              const bestPrice = getBestPrice(product.prices);
              const savings = getSavings(product.prices);

              return (
                <div key={product._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="p-6">
                    {/* Product Header */}
                    <div className="flex gap-4 mb-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-lg p-2 border border-gray-200">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-blue-600 mb-1">{product.brand}</div>
                        <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium text-gray-900">{product.rating}</span>
                            <span className="text-gray-500">({product.reviewCount.toLocaleString()})</span>
                          </div>
                          {product.dealScore && (
                            <div className="flex items-center gap-1">
                              <Zap className="w-4 h-4 text-green-600" />
                              <span className="font-medium text-green-600">{product.dealScore}% Deal</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Best Price Highlight */}
                    <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-medium text-green-700 mb-1">BEST PRICE</div>
                          <div className="text-2xl font-bold text-green-900">₹{bestPrice.amount}</div>
                          {savings > 0 && (
                            <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                              <TrendingDown className="w-3 h-3" />
                              Save up to ₹{savings}
                            </div>
                          )}
                        </div>
                        <a
                          href={bestPrice.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                        >
                          Buy on {bestPrice.platform}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    {/* Price Comparison Table */}
                    <div>
                      <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Compare Prices Across Stores</div>
                      <div className="space-y-2">
                        {product.prices.map((price, idx) => (
                          <a
                            key={idx}
                            href={price.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`block group relative ${
                              price.platform === bestPrice.platform
                                ? 'bg-green-50 border-2 border-green-500'
                                : 'bg-gray-50 border border-gray-200 hover:border-blue-400'
                            } rounded-lg p-3 transition-all`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                                  price.platform === bestPrice.platform
                                    ? 'bg-green-600 text-white border-green-600'
                                    : 'bg-white text-gray-700 border-gray-300 group-hover:border-blue-500'
                                }`}>
                                  {price.platform.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{price.platform}</div>
                                  {price.affiliate && (
                                    <div className="text-xs text-blue-600">
                                      +{price.cashback} cashback
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div className="text-lg font-bold text-gray-900">₹{price.amount}</div>
                                  {price.platform !== bestPrice.platform && (
                                    <div className="text-xs text-gray-500">
                                      +₹{price.amount - bestPrice.amount} more
                                    </div>
                                  )}
                                </div>
                                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition" />
                              </div>
                            </div>
                            {price.platform === bestPrice.platform && (
                              <div className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">
                                BEST DEAL
                              </div>
                            )}
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Price History */}
                    {product.priceHistory && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>Historical Range:</span>
                          <span className="font-medium">₹{product.priceHistory.min} - ₹{product.priceHistory.max}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-600 mb-4">No products found</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Affiliate Disclosure */}
        <div className="mt-12 p-6 bg-white border border-gray-200 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Affiliate Disclosure</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Beautynomy participates in affiliate programs with Nykaa, Amazon, and Flipkart.
            When you purchase through our links, we earn a small commission at no extra cost to you.
            This helps us maintain and improve our service. Prices shown are approximate and may vary on seller websites.
            We recommend checking the actual price before making a purchase.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>© 2025 Beautynomy. Smart Beauty Shopping with Price Comparison.</p>
            <p className="mt-2">Compare prices across Nykaa, Amazon, Flipkart, Purplle & Myntra</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
