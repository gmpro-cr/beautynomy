import axios from 'axios';
import * as cheerio from 'cheerio';

const scrapeFlipkart = async (productName) => {
  try {
    const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(productName)}`;

    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      timeout: 10000
    });

    const $ = cheerio.load(data);
    const results = [];

    // Flipkart product cards
    $('._1AtVbE, ._13oc-S, .s1Q9rs').slice(0, 5).each((i, element) => {
      const name = $(element).find('.IRpwTa, ._4rR01T, .s1Q9rs').text().trim();
      const priceText = $(element).find('._30jeq3, ._1_WHN1').text().trim();
      const price = parseInt(priceText.replace(/[^0-9]/g, '')) || null;
      const link = $(element).find('a._1fQZEK, a._2rpwqI').attr('href');
      const image = $(element).find('img._396cs4').attr('src');
      const ratingText = $(element).find('.gUuXy-, ._3LWZlK').text().trim();
      const rating = parseFloat(ratingText) || 4.0;

      if (name && price && link) {
        results.push({
          platform: 'Flipkart',
          name: name,
          price: price,
          url: link.startsWith('http') ? link : `https://www.flipkart.com${link}`,
          image: image || '',
          rating: rating,
          availability: true
        });
      }
    });

    return results;
  } catch (error) {
    console.error('Flipkart scraping error:', error.message);
    return [];
  }
};

export default scrapeFlipkart;
