/**
 * Sephora India Scraper
 * Scrapes product data from Sephora.nnnow.com
 */

import puppeteer from 'puppeteer';

/**
 * Scrape products from Sephora India
 * @param {string} query - Search query
 * @param {number} maxProducts - Maximum number of products to scrape
 * @returns {Promise<Array>} - Array of product data
 */
export async function scrapeSephora(query, maxProducts = 10) {
  let browser;

  try {
    console.log(`🔍 Scraping Sephora for: "${query}"`);

    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set user agent to avoid blocking
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

    // Construct Sephora search URL (using nnnow.com which hosts Sephora India)
    const searchUrl = `https://www.sephora.nnnow.com/search?q=${encodeURIComponent(query)}`;

    console.log(`📄 Loading: ${searchUrl}`);
    await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for products to load
    await page.waitForSelector('.product-card, .product-item, .productCard, [data-testid="product"]', {
      timeout: 10000
    }).catch(() => {
      console.log('⚠️  Product selector not found, trying alternative...');
    });

    // Extract product data
    const products = await page.evaluate((max) => {
      const items = [];

      // Try multiple selector patterns
      const selectors = [
        '.product-card',
        '.product-item',
        '.productCard',
        '[data-testid="product"]',
        '.ProductCard',
        '[class*="product"]'
      ];

      let productElements = [];

      for (const selector of selectors) {
        productElements = document.querySelectorAll(selector);
        if (productElements.length > 0) break;
      }

      console.log(`Found ${productElements.length} product elements on Sephora`);

      productElements.forEach((element, index) => {
        if (index >= max) return;

        try {
          // Extract product name
          const nameElement = element.querySelector('h2, h3, .product-title, .product-name, [class*="title"], [class*="name"]');
          const name = nameElement ? nameElement.textContent.trim() : null;

          // Extract price
          const priceElement = element.querySelector('.price, .product-price, [class*="price"], .priceContainer');
          let price = null;

          if (priceElement) {
            const priceText = priceElement.textContent.replace(/[^0-9]/g, '');
            price = parseInt(priceText);
          }

          // Extract product URL
          const linkElement = element.querySelector('a[href]');
          let url = linkElement ? linkElement.getAttribute('href') : null;

          // Make URL absolute if relative
          if (url && !url.startsWith('http')) {
            url = 'https://www.sephora.nnnow.com' + (url.startsWith('/') ? url : '/' + url);
          }

          // Extract image
          const imgElement = element.querySelector('img');
          const image = imgElement ? (imgElement.src || imgElement.dataset.src || imgElement.getAttribute('data-src')) : null;

          // Extract rating
          const ratingElement = element.querySelector('.rating, [class*="rating"], .stars, [class*="star"]');
          let rating = 0;

          if (ratingElement) {
            const ratingText = ratingElement.textContent || ratingElement.getAttribute('aria-label') || '';
            const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
            rating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;
          }

          if (name && price && url) {
            items.push({
              name,
              price,
              url,
              image: image || '',
              rating: rating || 4.0,
              platform: 'Sephora'
            });
          }
        } catch (err) {
          console.error('Error extracting product:', err.message);
        }
      });

      return items;
    }, maxProducts);

    console.log(`✅ Scraped ${products.length} products from Sephora`);

    return products;

  } catch (error) {
    console.error('❌ Sephora scraping error:', error.message);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export default scrapeSephora;
