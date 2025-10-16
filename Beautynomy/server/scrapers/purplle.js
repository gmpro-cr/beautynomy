import puppeteer from 'puppeteer';

/**
 * Scrape product prices from Purplle
 * @param {string} productName - Product search query
 * @returns {Promise<Array>} - Array of products with prices
 */
async function scrapePurplle(productName) {
  console.log(`🔍 Scraping Purplle for: ${productName}`);

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    // Search on Purplle
    const searchUrl = `https://www.purplle.com/search?search=${encodeURIComponent(productName)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for products to load
    await page.waitForSelector('.product-card, .product-list-item, [data-test="product"]', { timeout: 10000 }).catch(() => {});

    // Extract product information
    const products = await page.evaluate(() => {
      const productElements = document.querySelectorAll('.product-card, .product-list-item, [data-test="product"]');
      const results = [];

      productElements.forEach((element, index) => {
        if (index >= 5) return; // Limit to 5 products

        try {
          // Get product name
          const nameEl = element.querySelector('h2, .product-name, .product-title, [data-test="product-name"]');
          const name = nameEl ? nameEl.textContent.trim() : '';

          // Get price
          const priceEl = element.querySelector('.price, .product-price, [data-test="price"], .discounted-price');
          const priceText = priceEl ? priceEl.textContent.trim() : '';
          const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));

          // Get product URL
          const linkEl = element.querySelector('a');
          const url = linkEl ? linkEl.href : '';

          // Get image
          const imgEl = element.querySelector('img');
          const image = imgEl ? imgEl.src : '';

          // Get rating
          const ratingEl = element.querySelector('.rating, .product-rating, [data-test="rating"]');
          const ratingText = ratingEl ? ratingEl.textContent.trim() : '4.0';
          const rating = parseFloat(ratingText.replace(/[^0-9.]/g, '')) || 4.0;

          if (name && price && url) {
            results.push({
              name,
              price,
              url: url.startsWith('http') ? url : `https://www.purplle.com${url}`,
              platform: 'Purplle',
              image,
              rating: Math.min(rating, 5)
            });
          }
        } catch (err) {
          console.error('Error parsing Purplle product:', err);
        }
      });

      return results;
    });

    await browser.close();

    console.log(`✅ Purplle: Found ${products.length} products`);
    return products;

  } catch (error) {
    console.error('Purplle scraping error:', error.message);
    return [];
  }
}

export default scrapePurplle;
