import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Scrape Flipkart for beauty products
 *
 * CSS Structure (as of 2024):
 * - Product Container: ._1AtVbE, ._13oc-S, .s1Q9rs, [data-id], ._2kHMtA, .cPHDOP
 * - Product Name: .IRpwTa, ._4rR01T, .s1Q9rs, ._2WkVRV, .KzDlHZ
 * - Price: ._30jeq3, ._1_WHN1, .Nx9bqj, ._1vC4OE, ._30jeq3._1_WHN1
 * - Product Link: a._1fQZEK, a._2rpwqI, a._1_WHN1, a[class*="product"]
 * - Image: img._396cs4, img._2r_T1I, img[loading="eager"]
 * - Rating: .gUuXy-, ._3LWZlK, ._1lRcqv, ._3LWZlK.kC9KRR
 *
 * Note: Flipkart uses obfuscated CSS class names. Update selectors if scraping fails.
 */
const scrapeFlipkart = async (productName) => {
  try {
    const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(productName + ' beauty')}`;

    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
        'Referer': 'https://www.flipkart.com/'
      },
      timeout: 15000
    });

    const $ = cheerio.load(data);
    const results = [];

    // Multiple selector strategies for Flipkart product containers
    const containerSelectors = [
      '._1AtVbE',
      '._13oc-S',
      '.s1Q9rs',
      '[data-id]',
      '._2kHMtA',
      '.cPHDOP',
      'div[class*="product"]',
      'a[class*="product"]'
    ];

    // Try each selector until we find products
    let productContainers = $();
    for (const selector of containerSelectors) {
      productContainers = $(selector);
      if (productContainers.length > 0) {
        console.log(`Flipkart: Found ${productContainers.length} products with selector: ${selector}`);
        break;
      }
    }

    // Limit to first 5 products
    productContainers.slice(0, 5).each((i, element) => {
      const $el = $(element);

      // Extract product name with multiple fallback selectors
      const name = $el.find('.IRpwTa').text().trim() ||
                   $el.find('._4rR01T').text().trim() ||
                   $el.find('.s1Q9rs').text().trim() ||
                   $el.find('._2WkVRV').text().trim() ||
                   $el.find('.KzDlHZ').text().trim() ||
                   $el.find('a[class*="product"]').attr('title') ||
                   $el.find('div[class*="title"]').text().trim() ||
                   $el.attr('title') ||
                   '';

      // Extract price with multiple strategies
      const priceText = $el.find('._30jeq3').first().text().trim() ||
                       $el.find('._1_WHN1').first().text().trim() ||
                       $el.find('.Nx9bqj').first().text().trim() ||
                       $el.find('._1vC4OE').first().text().trim() ||
                       $el.find('._30jeq3._1_WHN1').first().text().trim() ||
                       $el.find('div[class*="price"]').first().text().trim() ||
                       '';

      const price = parseInt(priceText.replace(/[^0-9]/g, '')) || null;

      // Extract product link
      let link = '';
      if ($el.is('a')) {
        link = $el.attr('href');
      } else {
        link = $el.find('a._1fQZEK').attr('href') ||
               $el.find('a._2rpwqI').attr('href') ||
               $el.find('a._1_WHN1').attr('href') ||
               $el.find('a[class*="product"]').first().attr('href') ||
               $el.find('a').first().attr('href') ||
               '';
      }

      // Extract image
      const image = $el.find('img._396cs4').attr('src') ||
                   $el.find('img._2r_T1I').attr('src') ||
                   $el.find('img[loading="eager"]').attr('src') ||
                   $el.find('img').first().attr('src') ||
                   '';

      // Extract rating
      const ratingText = $el.find('.gUuXy-').text().trim() ||
                        $el.find('._3LWZlK').text().trim() ||
                        $el.find('._1lRcqv').text().trim() ||
                        $el.find('._3LWZlK.kC9KRR').text().trim() ||
                        $el.find('div[class*="rating"]').text().trim() ||
                        '';
      const rating = parseFloat(ratingText.match(/[\d.]+/)?.[0]) || 4.0;

      // Only add if we have minimum required fields
      if (name && price && link) {
        results.push({
          platform: 'Flipkart',
          name: name.substring(0, 200), // Limit name length
          price: price,
          url: link.startsWith('http') ? link : `https://www.flipkart.com${link}`,
          image: image || 'https://via.placeholder.com/300x300?text=Flipkart+Product',
          rating: Math.min(rating, 5), // Cap at 5 stars
          availability: true
        });
      }
    });

    console.log(`Flipkart: Successfully parsed ${results.length} products`);
    return results;

  } catch (error) {
    console.error('Flipkart scraping error:', error.message);
    return [];
  }
};

export default scrapeFlipkart;
