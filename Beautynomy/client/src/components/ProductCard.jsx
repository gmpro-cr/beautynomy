import { Star, ExternalLink, TrendingDown } from 'lucide-react'

function ProductCard({ product }) {
  // Find the best price
  const bestPrice = Math.min(...product.prices.map(p => p.price))

  // Sort prices by price (lowest first)
  const sortedPrices = [...product.prices].sort((a, b) => a.price - b.price)

  const getPlatformColor = (platform) => {
    switch(platform) {
      case 'Nykaa': return 'bg-pink-500'
      case 'Amazon': return 'bg-orange-500'
      case 'Flipkart': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Product Image */}
      <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain p-4"
        />
        <span className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-semibold text-purple-600">
          {product.category}
        </span>
      </div>

      {/* Product Info */}
      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-800 mb-1">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-3">{product.brand}</p>
        <p className="text-sm text-gray-600 mb-4">{product.description}</p>

        {/* Best Price Badge */}
        <div className="flex items-center gap-2 mb-4 bg-green-50 border border-green-200 rounded-lg p-2">
          <TrendingDown className="w-4 h-4 text-green-600" />
          <span className="text-sm font-semibold text-green-700">
            Best Price: {formatPrice(bestPrice)}
          </span>
        </div>

        {/* Price Comparison */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-700 mb-2">Compare Prices:</p>
          {sortedPrices.map((priceInfo, index) => (
            <div
              key={priceInfo.platform}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                priceInfo.price === bestPrice
                  ? 'bg-green-50 border-green-300'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 flex-1">
                <span className={`${getPlatformColor(priceInfo.platform)} text-white text-xs font-bold px-2 py-1 rounded`}>
                  {priceInfo.platform}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{priceInfo.rating}</span>
                  <span className="text-gray-400">({priceInfo.reviews})</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">
                  {formatPrice(priceInfo.price)}
                </span>
                <a
                  href={priceInfo.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${getPlatformColor(priceInfo.platform)} hover:opacity-80 text-white px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-opacity`}
                >
                  Buy
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Savings Info */}
        {sortedPrices.length > 1 && (
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">
              Save up to {formatPrice(sortedPrices[sortedPrices.length - 1].price - bestPrice)} by choosing the best price!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductCard
