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
 * Enhanced Purplle Scraper with Anti-Bot Measures
 */
const scrapePurplleEnhanced = async (productName) => {
  try {
    const searchUrl = `https://www.purplle.com/search?q=${encodeURIComponent(productName)}`;

    console.log(`🔍 Scraping Purplle (enhanced): ${productName}`);

    const html = await makeRequest(searchUrl, {
      platform: 'generic',
      timeout: 20000,
      maxRetries: 3,
      retryDelay: 3000
    });

    if (isBlocked(html)) {
      console.log(`🚫 Purplle: Detected CAPTCHA or block page`);
      return [];
    }

    const $ = cheerio.load(html);
    const results = [];

    let productContainers = $('[data-test="product-card"], .product-card, .product-item');

    if (productContainers.length === 0) {
      productContainers = $('div:has(img[alt*="product"])').filter((i, el) => {
        const $el = $(el);
        return $el.find('img').length > 0 && $el.find('a').length > 0;
      });
    }

    console.log(`Purplle: Found ${productContainers.length} product containers`);

    const productsToProcess = productContainers.slice(0, 5);

    for (let i = 0; i < productsToProcess.length; i++) {
      const $el = $(productsToProcess[i]);

      try {
        let name = $el.find('h2, h3, .product-title, [class*="title"]').first().text().trim() ||
                   $el.find('a').first().attr('title') || '';

        if (!name) continue;

        let priceText = $el.find('[class*="price"], [class*="Price"]').first().text().trim() ||
                       $el.find('*:contains("₹")').first().text().trim();

        const price = extractPrice(priceText);
        if (!price) continue;

        let link = $el.find('a').first().attr('href') || '';
        if (!link) continue;

        link = normalizeUrl(link, 'https://www.purplle.com');

        const image = $el.find('img').first().attr('src') ||
                     $el.find('img').first().attr('data-src') || '';

        const ratingText = $el.find('[class*="rating"], [class*="Rating"]').first().text().trim();
        const rating = extractRating(ratingText);

        const product = {
          platform: 'Purplle',
          name: cleanProductName(name),
          price: price,
          url: link,
          image: image || 'https://via.placeholder.com/300x300?text=Purplle+Product',
          rating: rating,
          availability: true
        };

        if (isValidProduct(product)) {
          results.push(product);
          console.log(`✅ Purplle: Parsed "${product.name.substring(0, 50)}..." - ₹${product.price}`);
        }

      } catch (error) {
        console.error(`⚠️  Purplle: Error parsing product ${i + 1}:`, error.message);
        continue;
      }

      if (i < productsToProcess.length - 1) {
        await randomDelay(100, 300);
      }
    }

    console.log(`✅ Purplle: Successfully scraped ${results.length} products`);
    return results;

  } catch (error) {
    console.error('❌ Purplle scraping error:', error.message);
    return [];
  }
};

export default scrapePurplleEnhanced;
