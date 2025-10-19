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
 * Enhanced Flipkart Scraper with Anti-Bot Measures
 */
const scrapeFlipkartEnhanced = async (productName) => {
  try {
    const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(productName + ' beauty')}`;

    console.log(`🔍 Scraping Flipkart (enhanced): ${productName}`);

    const html = await makeRequest(searchUrl, {
      platform: 'flipkart',
      timeout: 20000,
      maxRetries: 3,
      retryDelay: 3000
    });

    if (isBlocked(html)) {
      console.log(`🚫 Flipkart: Detected CAPTCHA or block page`);
      return [];
    }

    const $ = cheerio.load(html);
    const results = [];

    // Multiple selector strategies for Flipkart
    let productContainers = $('[data-id], ._1AtVbE, ._13oc-S, .s1Q9rs, ._2kHMtA, .cPHDOP');

    if (productContainers.length === 0) {
      productContainers = $('div:has(img[alt*="product"], img[alt*="Product"])').filter((i, el) => {
        const $el = $(el);
        return $el.find('img').length > 0 && $el.find('a').length > 0;
      });
    }

    if (productContainers.length === 0) {
      productContainers = $('div:has(span[class*="price"], div[class*="price"])').filter((i, el) => {
        const $el = $(el);
        const hasImage = $el.find('img').length > 0;
        const hasLink = $el.find('a').length > 0;
        const hasPrice = $el.text().includes('₹') || $el.text().match(/\d{2,}/);
        return hasImage && hasLink && hasPrice;
      });
    }

    console.log(`Flipkart: Found ${productContainers.length} product containers`);

    const productsToProcess = productContainers.slice(0, 5);

    for (let i = 0; i < productsToProcess.length; i++) {
      const $el = $(productsToProcess[i]);

      try {
        let name = '';
        name = $el.find('.IRpwTa, ._4rR01T, .s1Q9rs, ._2WkVRV, .KzDlHZ').first().text().trim();

        if (!name) {
          name = $el.find('a[class*="product"]').attr('title') || '';
        }

        if (!name) {
          name = $el.find('[class*="title"], [class*="Title"], [class*="name"]').first().text().trim();
        }

        if (!name) {
          name = $el.attr('title') || $el.find('a').first().attr('title') || '';
        }

        if (!name) continue;

        let priceText = '';
        priceText = $el.find('._30jeq3, ._1_WHN1, .Nx9bqj, ._1vC4OE').first().text().trim();

        if (!priceText) {
          priceText = $el.find('[class*="price"], [class*="Price"]').first().text().trim();
        }

        if (!priceText) {
          priceText = $el.find('*:contains("₹")').first().text().trim();
        }

        const price = extractPrice(priceText);
        if (!price) continue;

        let link = '';
        if ($el.is('a')) {
          link = $el.attr('href');
        } else {
          link = $el.find('a._1fQZEK, a._2rpwqI, a._1_WHN1').first().attr('href') ||
                 $el.find('a[class*="product"]').first().attr('href') ||
                 $el.find('a').first().attr('href') || '';
        }

        if (!link) continue;
        link = normalizeUrl(link, 'https://www.flipkart.com');

        const image = $el.find('img._396cs4, img._2r_T1I, img[loading="eager"]').first().attr('src') ||
                     $el.find('img').first().attr('src') || '';

        const ratingText = $el.find('.gUuXy-, ._3LWZlK, ._1lRcqv, [class*="rating"]').first().text().trim();
        const rating = extractRating(ratingText);

        const product = {
          platform: 'Flipkart',
          name: cleanProductName(name),
          price: price,
          url: link,
          image: image || 'https://via.placeholder.com/300x300?text=Flipkart+Product',
          rating: rating,
          availability: true
        };

        if (isValidProduct(product)) {
          results.push(product);
          console.log(`✅ Flipkart: Parsed "${product.name.substring(0, 50)}..." - ₹${product.price}`);
        }

      } catch (error) {
        console.error(`⚠️  Flipkart: Error parsing product ${i + 1}:`, error.message);
        continue;
      }

      if (i < productsToProcess.length - 1) {
        await randomDelay(100, 300);
      }
    }

    console.log(`✅ Flipkart: Successfully scraped ${results.length} products`);
    return results;

  } catch (error) {
    console.error('❌ Flipkart scraping error:', error.message);
    return [];
  }
};

export default scrapeFlipkartEnhanced;
