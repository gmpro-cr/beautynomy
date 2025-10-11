/**
 * Affiliate Link Generator
 * Converts regular product URLs to affiliate-tracked URLs
 */

// Store your affiliate IDs here after getting approved
const AFFILIATE_CONFIG = {
  amazon: {
    tag: 'beautynomy25-21', // Your actual Amazon Associates tag
    enabled: true // ✅ Enabled - you're approved!
  },
  flipkart: {
    affid: 'beautynomy', // Replace with your actual Flipkart affiliate ID
    enabled: false // Set to true when you get approved
  },
  nykaa: {
    network: 'admitad', // or 'vcommission'
    code: 'YOUR_ADMITAD_CODE', // Replace with your network code
    enabled: false // Set to true when you get approved
  },
  purplle: {
    network: 'admitad',
    code: 'YOUR_ADMITAD_CODE',
    enabled: false // Set to true when you get approved
  },
  myntra: {
    network: 'admitad',
    code: 'YOUR_ADMITAD_CODE',
    enabled: false // Set to true when you get approved
  }
};

/**
 * Add Amazon affiliate tag to URL
 */
function addAmazonAffiliate(url) {
  if (!AFFILIATE_CONFIG.amazon.enabled) {
    return url; // Return original if not enabled
  }

  try {
    const urlObj = new URL(url);

    // Amazon affiliate tag parameter
    urlObj.searchParams.set('tag', AFFILIATE_CONFIG.amazon.tag);

    return urlObj.toString();
  } catch (error) {
    console.error('Error adding Amazon affiliate:', error);
    return url;
  }
}

/**
 * Add Flipkart affiliate ID to URL
 */
function addFlipkartAffiliate(url) {
  if (!AFFILIATE_CONFIG.flipkart.enabled) {
    return url;
  }

  try {
    const urlObj = new URL(url);

    // Flipkart affiliate ID parameter
    urlObj.searchParams.set('affid', AFFILIATE_CONFIG.flipkart.affid);

    return urlObj.toString();
  } catch (error) {
    console.error('Error adding Flipkart affiliate:', error);
    return url;
  }
}

/**
 * Wrap URL with Admitad/vCommission tracking
 */
function wrapWithNetwork(url, network, code) {
  if (network === 'admitad') {
    return `https://ad.admitad.com/g/${code}/?ulp=${encodeURIComponent(url)}`;
  } else if (network === 'vcommission') {
    return `https://linkmydeals.com/lmd_track/${code}/?url=${encodeURIComponent(url)}`;
  }
  return url;
}

/**
 * Add Nykaa affiliate (via network)
 */
function addNykaaAffiliate(url) {
  if (!AFFILIATE_CONFIG.nykaa.enabled) {
    return url;
  }

  return wrapWithNetwork(
    url,
    AFFILIATE_CONFIG.nykaa.network,
    AFFILIATE_CONFIG.nykaa.code
  );
}

/**
 * Add Purplle affiliate (via network)
 */
function addPurplleAffiliate(url) {
  if (!AFFILIATE_CONFIG.purplle.enabled) {
    return url;
  }

  return wrapWithNetwork(
    url,
    AFFILIATE_CONFIG.purplle.network,
    AFFILIATE_CONFIG.purplle.code
  );
}

/**
 * Add Myntra affiliate (via network)
 */
function addMyntraAffiliate(url) {
  if (!AFFILIATE_CONFIG.myntra.enabled) {
    return url;
  }

  return wrapWithNetwork(
    url,
    AFFILIATE_CONFIG.myntra.network,
    AFFILIATE_CONFIG.myntra.code
  );
}

/**
 * Main function: Detect platform and add appropriate affiliate tracking
 */
function generateAffiliateLink(url, platform) {
  const platformLower = platform.toLowerCase();

  if (platformLower.includes('amazon')) {
    return addAmazonAffiliate(url);
  } else if (platformLower.includes('flipkart')) {
    return addFlipkartAffiliate(url);
  } else if (platformLower.includes('nykaa')) {
    return addNykaaAffiliate(url);
  } else if (platformLower.includes('purplle')) {
    return addPurplleAffiliate(url);
  } else if (platformLower.includes('myntra')) {
    return addMyntraAffiliate(url);
  }

  return url; // Return original if platform not recognized
}

/**
 * Process all prices for a product and add affiliate tracking
 */
function processProductPrices(product) {
  if (!product.prices || !Array.isArray(product.prices)) {
    return product;
  }

  const updatedPrices = product.prices.map(price => ({
    ...price,
    url: generateAffiliateLink(price.url, price.platform)
  }));

  return {
    ...product,
    prices: updatedPrices
  };
}

/**
 * Bulk update: Process multiple products
 */
function processMultipleProducts(products) {
  return products.map(product => processProductPrices(product));
}

/**
 * Get configuration status
 */
function getConfigStatus() {
  return {
    amazon: AFFILIATE_CONFIG.amazon.enabled,
    flipkart: AFFILIATE_CONFIG.flipkart.enabled,
    nykaa: AFFILIATE_CONFIG.nykaa.enabled,
    purplle: AFFILIATE_CONFIG.purplle.enabled,
    myntra: AFFILIATE_CONFIG.myntra.enabled,
    summary: {
      enabled: Object.values(AFFILIATE_CONFIG).filter(p => p.enabled).length,
      total: Object.keys(AFFILIATE_CONFIG).length
    }
  };
}

// Export functions
export {
  generateAffiliateLink,
  processProductPrices,
  processMultipleProducts,
  addAmazonAffiliate,
  addFlipkartAffiliate,
  addNykaaAffiliate,
  addPurplleAffiliate,
  addMyntraAffiliate,
  getConfigStatus,
  AFFILIATE_CONFIG
};

// Example usage:
/*

// Single product
const product = {
  name: "Maybelline Foundation",
  prices: [
    {
      platform: "Amazon",
      amount: 399,
      url: "https://www.amazon.in/product/dp/B071VKJKVC"
    }
  ]
};

const updatedProduct = processProductPrices(product);
console.log(updatedProduct.prices[0].url);
// Output: https://www.amazon.in/product/dp/B071VKJKVC?tag=beautynomy-21

// Multiple products
const products = [product1, product2, product3];
const updatedProducts = processMultipleProducts(products);

// Check configuration status
console.log(getConfigStatus());

*/
