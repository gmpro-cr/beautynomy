import * as cheerio from 'cheerio';
import {
  makeRequest,
  extractPrice,
  extractRating,
  normalizeUrl,
  isBlocked,
  isValidProduct,
  cleanProductName,
  randomDelay
} from '../utils/scraper-helpers.js';

/**
 * Enhanced Sephora Scraper with Anti-Bot Measures
 */
const scrapeSephoraEnhanced = async (productName) => {
  try {
    const searchUrl = `https://www.sephora.in/search?q=${encodeURIComponent(productName)}`;

    console.log(`🔍 Scraping Sephora (enhanced): ${productName}`);

    const html = await makeRequest(searchUrl, {
      platform: 'generic',
      timeout: 20000,
      maxRetries: 3,
      retryDelay: 3000
    });

    if (isBlocked(html)) {
      console.log(`🚫 Sephora: Detected CAPTCHA or block page`);
      return [];
    }

    const $ = cheerio.load(html);
    const results = [];

    let productContainers = $('[data-test="product-tile"], .product-tile, .product-card');

    if (productContainers.length === 0) {
      productContainers = $('div:has(img[alt*="product"])').filter((i, el) => {
        const $el = $(el);
        return $el.find('img').length > 0 && $el.find('a').length > 0;
      });
    }

    console.log(`Sephora: Found ${productContainers.length} product containers`);

    const productsToProcess = productContainers.slice(0, 5);

    for (let i = 0; i < productsToProcess.length; i++) {
      const $el = $(productsToProcess[i]);

      try {
        let name = $el.find('h2, h3, .product-name, [class*="ProductName"]').first().text().trim() ||
                   $el.find('a').first().attr('title') ||
                   $el.find('a').first().attr('aria-label') || '';

        if (!name) continue;

        let priceText = $el.find('[class*="price"], [class*="Price"]').first().text().trim() ||
                       $el.find('*:contains("₹")').first().text().trim();

        const price = extractPrice(priceText);
        if (!price) continue;

        let link = $el.find('a').first().attr('href') || '';
        if (!link) continue;

        link = normalizeUrl(link, 'https://www.sephora.in');

        const image = $el.find('img').first().attr('src') ||
                     $el.find('img').first().attr('data-src') || '';

        const ratingText = $el.find('[class*="rating"], [class*="Rating"]').first().text().trim();
        const rating = extractRating(ratingText);

        const product = {
          platform: 'Sephora',
          name: cleanProductName(name),
          price: price,
          url: link,
          image: image || 'https://via.placeholder.com/300x300?text=Sephora+Product',
          rating: rating,
          availability: true
        };

        if (isValidProduct(product)) {
          results.push(product);
          console.log(`✅ Sephora: Parsed "${product.name.substring(0, 50)}..." - ₹${product.price}`);
        }

      } catch (error) {
        console.error(`⚠️  Sephora: Error parsing product ${i + 1}:`, error.message);
        continue;
      }

      if (i < productsToProcess.length - 1) {
        await randomDelay(100, 300);
      }
    }

    console.log(`✅ Sephora: Successfully scraped ${results.length} products`);
    return results;

  } catch (error) {
    console.error('❌ Sephora scraping error:', error.message);
    return [];
  }
};

export default scrapeSephoraEnhanced;
