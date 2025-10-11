import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Scrape Amazon India for beauty products
 *
 * CSS Structure (as of 2024):
 * - Product Container: [data-component-type="s-search-result"], .s-result-item, div[data-asin]
 * - Product Name: h2 a span, .a-text-normal, h2 .a-link-normal span
 * - Price Whole: .a-price-whole, .a-price .a-offscreen, span[data-a-color="price"]
 * - Product Link: h2 a, .a-link-normal
 * - Image: img.s-image, .s-product-image-container img
 * - Rating: .a-icon-star-small span, .a-icon-alt, [aria-label*="stars"]
 *
 * Note: Amazon frequently changes their HTML structure. Update selectors if scraping fails.
 */
const scrapeAmazon = async (productName) => {
  try {
    const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(productName + ' beauty makeup')}`;

    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
        'Referer': 'https://www.amazon.in/'
      },
      timeout: 15000
    });

    const $ = cheerio.load(data);
    const results = [];

    // Multiple selector strategies for Amazon product containers
    const containerSelectors = [
      '[data-component-type="s-search-result"]',
      '.s-result-item[data-asin]',
      'div[data-asin]:not([data-asin=""])',
      '.s-card-container'
    ];

    // Try each selector until we find products
    let productContainers = $();
    for (const selector of containerSelectors) {
      productContainers = $(selector);
      if (productContainers.length > 0) {
        console.log(`Amazon: Found ${productContainers.length} products with selector: ${selector}`);
        break;
      }
    }

    // Limit to first 5 products
    productContainers.slice(0, 5).each((i, element) => {
      const $el = $(element);

      // Extract product name with multiple fallback selectors
      const name = $el.find('h2 a span').first().text().trim() ||
                   $el.find('.a-text-normal').first().text().trim() ||
                   $el.find('h2 .a-link-normal span').first().text().trim() ||
                   $el.find('h2').text().trim() ||
                   $el.find('.a-size-base-plus').text().trim() ||
                   $el.find('.a-size-medium').text().trim() ||
                   '';

      // Extract price with multiple strategies
      let price = null;

      // Try whole price element
      const priceWhole = $el.find('.a-price-whole').first().text().trim();
      if (priceWhole) {
        price = parseInt(priceWhole.replace(/[^0-9]/g, ''));
      }

      // Try offscreen price (screen reader text)
      if (!price) {
        const offscreenPrice = $el.find('.a-price .a-offscreen').first().text().trim();
        if (offscreenPrice) {
          price = parseInt(offscreenPrice.replace(/[^0-9]/g, ''));
        }
      }

      // Try data attribute
      if (!price) {
        const priceAttr = $el.find('[data-a-color="price"]').first().text().trim();
        if (priceAttr) {
          price = parseInt(priceAttr.replace(/[^0-9]/g, ''));
        }
      }

      // Try generic price span
      if (!price) {
        const genericPrice = $el.find('span.a-price').first().text().trim();
        if (genericPrice) {
          price = parseInt(genericPrice.replace(/[^0-9]/g, ''));
        }
      }

      // Extract product link
      const link = $el.find('h2 a').attr('href') ||
                   $el.find('.a-link-normal').first().attr('href') ||
                   $el.find('a.s-underline-text').attr('href') ||
                   '';

      // Extract image
      const image = $el.find('img.s-image').attr('src') ||
                   $el.find('.s-product-image-container img').attr('src') ||
                   $el.find('img').first().attr('src') ||
                   '';

      // Extract rating
      const ratingText = $el.find('.a-icon-star-small span').first().text() ||
                        $el.find('.a-icon-alt').first().text() ||
                        $el.find('[aria-label*="stars"]').attr('aria-label') ||
                        '';
      const rating = parseFloat(ratingText.match(/[\d.]+/)?.[0]) || 4.0;

      // Only add if we have minimum required fields
      if (name && price && link) {
        results.push({
          platform: 'Amazon',
          name: name.substring(0, 200), // Limit name length
          price: price,
          url: link.startsWith('http') ? link : `https://www.amazon.in${link}`,
          image: image || 'https://via.placeholder.com/300x300?text=Amazon+Product',
          rating: Math.min(rating, 5), // Cap at 5 stars
          availability: true
        });
      }
    });

    console.log(`Amazon: Successfully parsed ${results.length} products`);
    return results;

  } catch (error) {
    console.error('Amazon scraping error:', error.message);
    return [];
  }
};

export default scrapeAmazon;
