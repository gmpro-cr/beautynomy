/**
 * Affiliate Link Generator Utility
 * Generates affiliate tracking links for multiple e-commerce platforms
 */

// Affiliate IDs for different platforms
const AFFILIATE_IDS = {
  nykaa: 'beautynomy',
  amazon: 'beautynomy-21',
  flipkart: 'beautynomy',
  purplle: 'beautynomy',
  myntra: 'beautynomy'
};

/**
 * Generate Flipkart affiliate link
 * @param {string} productUrl - Original Flipkart product URL
 * @param {string} affiliateId - Your Flipkart affiliate ID (default: 'beautynomy')
 * @param {object} trackingParams - Optional tracking parameters
 * @returns {string} - Affiliate URL
 */
export function generateFlipkartAffiliateLink(
  productUrl,
  affiliateId = AFFILIATE_IDS.flipkart,
  trackingParams = {}
) {
  try {
    const url = new URL(productUrl);

    // Add affiliate ID
    url.searchParams.set('affid', affiliateId);

    // Add optional tracking parameters
    if (trackingParams.source) {
      url.searchParams.set('affExtParam1', trackingParams.source);
    }
    if (trackingParams.campaign) {
      url.searchParams.set('affExtParam2', trackingParams.campaign);
    }
    if (trackingParams.medium) {
      url.searchParams.set('affExtParam3', trackingParams.medium);
    }

    return url.toString();
  } catch (error) {
    console.error('Error generating Flipkart affiliate link:', error);
    return productUrl; // Return original URL if parsing fails
  }
}

/**
 * Generate Amazon affiliate link
 * @param {string} productUrl - Original Amazon product URL
 * @param {string} affiliateTag - Your Amazon affiliate tag (default: 'beautynomy-21')
 * @returns {string} - Affiliate URL
 */
export function generateAmazonAffiliateLink(
  productUrl,
  affiliateTag = AFFILIATE_IDS.amazon
) {
  try {
    const url = new URL(productUrl);
    url.searchParams.set('tag', affiliateTag);
    return url.toString();
  } catch (error) {
    console.error('Error generating Amazon affiliate link:', error);
    return productUrl;
  }
}

/**
 * Generate Nykaa affiliate link
 * @param {string} productUrl - Original Nykaa product URL
 * @param {string} affiliateId - Your Nykaa affiliate ID (default: 'beautynomy')
 * @returns {string} - Affiliate URL
 */
export function generateNykaaAffiliateLink(
  productUrl,
  affiliateId = AFFILIATE_IDS.nykaa
) {
  try {
    const url = new URL(productUrl);
    url.searchParams.set('affiliate', affiliateId);
    return url.toString();
  } catch (error) {
    console.error('Error generating Nykaa affiliate link:', error);
    return productUrl;
  }
}

/**
 * Generate Purplle affiliate link
 * @param {string} productUrl - Original Purplle product URL
 * @param {string} affiliateId - Your Purplle affiliate ID (default: 'beautynomy')
 * @returns {string} - Affiliate URL
 */
export function generatePurplleAffiliateLink(
  productUrl,
  affiliateId = AFFILIATE_IDS.purplle
) {
  try {
    const url = new URL(productUrl);
    url.searchParams.set('ref', affiliateId);
    return url.toString();
  } catch (error) {
    console.error('Error generating Purplle affiliate link:', error);
    return productUrl;
  }
}

/**
 * Generate Myntra affiliate link
 * @param {string} productUrl - Original Myntra product URL
 * @param {string} affiliateId - Your Myntra affiliate ID (default: 'beautynomy')
 * @returns {string} - Affiliate URL
 */
export function generateMyntraAffiliateLink(
  productUrl,
  affiliateId = AFFILIATE_IDS.myntra
) {
  try {
    const url = new URL(productUrl);
    url.searchParams.set('affid', affiliateId);
    return url.toString();
  } catch (error) {
    console.error('Error generating Myntra affiliate link:', error);
    return productUrl;
  }
}

/**
 * Detect platform from URL and generate appropriate affiliate link
 * @param {string} productUrl - Product URL from any platform
 * @param {object} options - Configuration options
 * @returns {string} - Affiliate URL
 */
export function generateAffiliateLink(productUrl, options = {}) {
  const url = productUrl.toLowerCase();

  if (url.includes('flipkart.com')) {
    return generateFlipkartAffiliateLink(productUrl, options.affiliateId, options.trackingParams);
  } else if (url.includes('amazon.in') || url.includes('amazon.com')) {
    return generateAmazonAffiliateLink(productUrl, options.affiliateId);
  } else if (url.includes('nykaa.com')) {
    return generateNykaaAffiliateLink(productUrl, options.affiliateId);
  } else if (url.includes('purplle.com')) {
    return generatePurplleAffiliateLink(productUrl, options.affiliateId);
  } else if (url.includes('myntra.com')) {
    return generateMyntraAffiliateLink(productUrl, options.affiliateId);
  }

  // Return original URL if platform not recognized
  console.warn('Platform not recognized for URL:', productUrl);
  return productUrl;
}

/**
 * Batch convert multiple product URLs to affiliate links
 * @param {Array<object>} products - Array of product objects with platform and link properties
 * @returns {Array<object>} - Products with updated affiliate links
 */
export function batchGenerateAffiliateLinks(products) {
  return products.map(product => {
    if (product.prices && Array.isArray(product.prices)) {
      product.prices = product.prices.map(price => ({
        ...price,
        link: generateAffiliateLink(price.link, {
          trackingParams: {
            source: 'beautynomy',
            campaign: 'product_comparison',
            medium: 'web'
          }
        })
      }));
    }
    return product;
  });
}

/**
 * Check if a URL already has affiliate parameters
 * @param {string} url - URL to check
 * @param {string} platform - Platform name (optional)
 * @returns {boolean} - True if URL has affiliate params
 */
export function hasAffiliateParams(url, platform = null) {
  try {
    const urlObj = new URL(url);
    const urlLower = url.toLowerCase();

    // Detect platform if not provided
    if (!platform) {
      if (urlLower.includes('flipkart.com')) platform = 'flipkart';
      else if (urlLower.includes('amazon')) platform = 'amazon';
      else if (urlLower.includes('nykaa.com')) platform = 'nykaa';
      else if (urlLower.includes('purplle.com')) platform = 'purplle';
      else if (urlLower.includes('myntra.com')) platform = 'myntra';
    }

    // Check for platform-specific affiliate parameters
    switch (platform) {
      case 'flipkart':
      case 'myntra':
        return urlObj.searchParams.has('affid');
      case 'amazon':
        return urlObj.searchParams.has('tag');
      case 'nykaa':
        return urlObj.searchParams.has('affiliate');
      case 'purplle':
        return urlObj.searchParams.has('ref');
      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking affiliate params:', error);
    return false;
  }
}

/**
 * Extract tracking data from affiliate URL
 * @param {string} affiliateUrl - Affiliate URL
 * @returns {object} - Tracking data
 */
export function extractTrackingData(affiliateUrl) {
  try {
    const url = new URL(affiliateUrl);
    const urlLower = affiliateUrl.toLowerCase();

    let platform = 'unknown';
    let affiliateId = null;
    let trackingParams = {};

    // Detect platform and extract data
    if (urlLower.includes('flipkart.com')) {
      platform = 'flipkart';
      affiliateId = url.searchParams.get('affid');
      trackingParams = {
        source: url.searchParams.get('affExtParam1'),
        campaign: url.searchParams.get('affExtParam2'),
        medium: url.searchParams.get('affExtParam3')
      };
    } else if (urlLower.includes('amazon')) {
      platform = 'amazon';
      affiliateId = url.searchParams.get('tag');
    } else if (urlLower.includes('nykaa.com')) {
      platform = 'nykaa';
      affiliateId = url.searchParams.get('affiliate');
    } else if (urlLower.includes('purplle.com')) {
      platform = 'purplle';
      affiliateId = url.searchParams.get('ref');
    } else if (urlLower.includes('myntra.com')) {
      platform = 'myntra';
      affiliateId = url.searchParams.get('affid');
    }

    return {
      platform,
      affiliateId,
      trackingParams,
      hasAffiliateParams: affiliateId !== null
    };
  } catch (error) {
    console.error('Error extracting tracking data:', error);
    return {
      platform: 'unknown',
      affiliateId: null,
      trackingParams: {},
      hasAffiliateParams: false
    };
  }
}

// Export default object with all functions
export default {
  generateFlipkartAffiliateLink,
  generateAmazonAffiliateLink,
  generateNykaaAffiliateLink,
  generatePurplleAffiliateLink,
  generateMyntraAffiliateLink,
  generateAffiliateLink,
  batchGenerateAffiliateLinks,
  hasAffiliateParams,
  extractTrackingData,
  AFFILIATE_IDS
};
