import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Scrape Nykaa.com for beauty products
 *
 * CSS Structure (as of 2024):
 * - Product Cards: .productCard, [data-test="product-card"], .css-xrzmfa
 * - Product Name: .css-1gc4wt9, [data-test="product-title"], h2, .product-title
 * - Price: .css-111z9ua, [data-test="product-price"], .product-price, .css-1d0jf8e
 * - Link: a (first child or parent)
 * - Image: img (with src or data-src)
 * - Rating: .css-19yf5ek, [data-test="star-rating"], .rating
 *
 * Note: Nykaa uses dynamic CSS class names. Update selectors if scraping fails.
 */
const scrapeNykaa = async (productName) => {
  try {
    const searchUrl = `https://www.nykaa.com/search/result/?q=${encodeURIComponent(productName)}`;

    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
      },
      timeout: 15000
    });

    const $ = cheerio.load(data);
    const results = [];

    // Multiple selector strategies for Nykaa product cards
    const cardSelectors = [
      '.productCard',
      '[data-test="product-card"]',
      '.css-xrzmfa',
      '.css-1u2ooc8',
      'div[class*="product"]',
      'article'
    ];

    // Try each selector until we find products
    let productCards = $();
    for (const selector of cardSelectors) {
      productCards = $(selector);
      if (productCards.length > 0) {
        console.log(`Nykaa: Found ${productCards.length} products with selector: ${selector}`);
        break;
      }
    }

    // Limit to first 5 products
    productCards.slice(0, 5).each((i, element) => {
      const $el = $(element);

      // Extract product name with multiple fallback selectors
      const name = $el.find('.css-1gc4wt9').text().trim() ||
                   $el.find('[data-test="product-title"]').text().trim() ||
                   $el.find('.product-title').text().trim() ||
                   $el.find('h2').text().trim() ||
                   $el.find('h3').text().trim() ||
                   $el.find('div[class*="title"]').text().trim() ||
                   '';

      // Extract price with multiple fallback selectors
      const priceText = $el.find('.css-111z9ua').first().text().trim() ||
                       $el.find('[data-test="product-price"]').first().text().trim() ||
                       $el.find('.product-price').first().text().trim() ||
                       $el.find('.css-1d0jf8e').first().text().trim() ||
                       $el.find('span[class*="price"]').first().text().trim() ||
                       $el.find('div[class*="price"]').first().text().trim() ||
                       '';

      const price = parseInt(priceText.replace(/[^0-9]/g, '')) || null;

      // Extract product link
      const link = $el.find('a').first().attr('href') ||
                   $el.attr('href') ||
                   $el.closest('a').attr('href') ||
                   '';

      // Extract image with fallback to data-src
      const image = $el.find('img').first().attr('src') ||
                   $el.find('img').first().attr('data-src') ||
                   $el.find('img').first().attr('data-lazy-src') ||
                   '';

      // Extract rating
      const ratingText = $el.find('.css-19yf5ek').text().trim() ||
                        $el.find('[data-test="star-rating"]').text().trim() ||
                        $el.find('.rating').text().trim() ||
                        $el.find('span[class*="rating"]').text().trim() ||
                        '';
      const rating = parseFloat(ratingText) || 4.0;

      // Only add if we have minimum required fields
      if (name && price && link) {
        results.push({
          platform: 'Nykaa',
          name: name.substring(0, 200), // Limit name length
          price: price,
          url: link.startsWith('http') ? link : `https://www.nykaa.com${link}`,
          image: image || 'https://via.placeholder.com/300x300?text=Nykaa+Product',
          rating: rating,
          availability: true
        });
      }
    });

    console.log(`Nykaa: Successfully parsed ${results.length} products`);
    return results;

  } catch (error) {
    console.error('Nykaa scraping error:', error.message);
    return [];
  }
};

export default scrapeNykaa;
