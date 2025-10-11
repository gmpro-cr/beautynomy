import axios from 'axios';
import * as cheerio from 'cheerio';

const scrapeAmazon = async (productName) => {
  try {
    const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(productName + ' beauty makeup')}`;

    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 10000
    });

    const $ = cheerio.load(data);
    const results = [];

    // Amazon product cards
    $('[data-component-type="s-search-result"]').slice(0, 5).each((i, element) => {
      const name = $(element).find('h2 a span, .a-text-normal').first().text().trim();
      const priceWhole = $(element).find('.a-price-whole').first().text().trim();
      const price = parseInt(priceWhole.replace(/[^0-9]/g, '')) || null;
      const link = $(element).find('h2 a').attr('href');
      const image = $(element).find('img.s-image').attr('src');
      const ratingText = $(element).find('.a-icon-star-small span').first().text();
      const rating = parseFloat(ratingText) || 4.0;

      if (name && price && link) {
        results.push({
          platform: 'Amazon',
          name: name,
          price: price,
          url: link.startsWith('http') ? link : `https://www.amazon.in${link}`,
          image: image || '',
          rating: rating,
          availability: true
        });
      }
    });

    return results;
  } catch (error) {
    console.error('Amazon scraping error:', error.message);
    return [];
  }
};

export default scrapeAmazon;
