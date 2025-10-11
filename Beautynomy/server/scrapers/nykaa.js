import axios from 'axios';
import * as cheerio from 'cheerio';

const scrapeNykaa = async (productName) => {
  try {
    const searchUrl = `https://www.nykaa.com/search/result/?q=${encodeURIComponent(productName)}`;

    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(data);
    const results = [];

    // Nykaa product cards
    $('.product-listing .productCard, .css-1u2ooc8, .css-xrzmfa').slice(0, 5).each((i, element) => {
      const name = $(element).find('.css-1gc4wt9, .product-title, h2').text().trim();
      const priceText = $(element).find('.css-111z9ua, .product-price, .css-1d0jf8e').first().text().trim();
      const price = parseInt(priceText.replace(/[^0-9]/g, '')) || null;
      const link = $(element).find('a').first().attr('href');
      const image = $(element).find('img').first().attr('src');
      const rating = parseFloat($(element).find('.css-19yf5ek, .rating').text().trim()) || 4.0;

      if (name && price && link) {
        results.push({
          platform: 'Nykaa',
          name: name,
          price: price,
          url: link.startsWith('http') ? link : `https://www.nykaa.com${link}`,
          image: image || '',
          rating: rating,
          availability: true
        });
      }
    });

    return results;
  } catch (error) {
    console.error('Nykaa scraping error:', error.message);
    return [];
  }
};

export default scrapeNykaa;
