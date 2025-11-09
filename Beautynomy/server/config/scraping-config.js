/**
 * Scraping Configuration
 * Configure proxies, user agents, and scraping strategies
 */

// User-Agent rotation for realistic browser simulation
export const USER_AGENTS = [
  // Chrome on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',

  // Chrome on macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',

  // Firefox on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',

  // Edge
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',

  // Safari on macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
];

// Common browser headers for realistic requests
export const getRealisticHeaders = (referer = null) => {
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

  const headers = {
    'User-Agent': userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
    'DNT': '1'
  };

  if (referer) {
    headers['Referer'] = referer;
  }

  return headers;
};

// Proxy configuration (optional)
// You can add your proxy list here
export const PROXIES = process.env.PROXY_LIST
  ? process.env.PROXY_LIST.split(',').map(p => p.trim())
  : [];

export const getRandomProxy = () => {
  if (PROXIES.length === 0) return null;
  return PROXIES[Math.floor(Math.random() * PROXIES.length)];
};

// ScraperAPI configuration (optional paid service)
export const SCRAPER_API_CONFIG = {
  enabled: !!process.env.SCRAPER_API_KEY,
  apiKey: process.env.SCRAPER_API_KEY,
  baseUrl: 'http://api.scraperapi.com',
  params: {
    render: 'true', // Enable JavaScript rendering
    country_code: 'in', // India
    premium: 'false',
    session_number: Math.floor(Math.random() * 10000)
  }
};

// Puppeteer configuration for production
export const PUPPETEER_CONFIG = {
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process', // Required for some hosting platforms
    '--disable-gpu',
    '--disable-web-security',
    '--disable-features=IsolateOrigins,site-per-process',
    '--window-size=1920,1080'
  ],
  defaultViewport: {
    width: 1920,
    height: 1080
  },
  ignoreHTTPSErrors: true,
  timeout: 30000
};

// Retry configuration
export const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 2000, // 2 seconds
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2
};

// Random delay for human-like behavior
export const randomDelay = (min = 1000, max = 3000) => {
  return new Promise(resolve => {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    setTimeout(resolve, delay);
  });
};

// Calculate retry delay with exponential backoff
export const getRetryDelay = (attempt) => {
  const delay = Math.min(
    RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt),
    RETRY_CONFIG.maxDelay
  );
  // Add jitter (±20%)
  const jitter = delay * 0.2 * (Math.random() - 0.5);
  return Math.floor(delay + jitter);
};

// Platform-specific configurations
export const PLATFORM_CONFIGS = {
  nykaa: {
    baseUrl: 'https://www.nykaa.com',
    searchPath: '/search/result/',
    requiresJS: true, // Needs Puppeteer
    selectors: {
      productContainer: '.product-list .productContainer',
      name: '.product-title',
      price: '.css-1d0jf8e',
      image: 'img.css-m7p68c',
      link: 'a.css-qlopj4'
    }
  },
  amazon: {
    baseUrl: 'https://www.amazon.in',
    searchPath: '/s',
    requiresJS: false, // Works with Cheerio
    selectors: {
      productContainer: '[data-component-type="s-search-result"]',
      name: 'h2 a span',
      price: '.a-price-whole',
      image: 'img.s-image',
      link: 'h2 a'
    }
  },
  flipkart: {
    baseUrl: 'https://www.flipkart.com',
    searchPath: '/search',
    requiresJS: true,
    selectors: {
      productContainer: '._1AtVbE',
      name: '._4rR01T',
      price: '._30jeq3',
      image: '._396cs4',
      link: '._1fQZEK'
    }
  },
  purplle: {
    baseUrl: 'https://www.purplle.com',
    searchPath: '/search',
    requiresJS: true,
    selectors: {
      productContainer: '.product-card',
      name: '.product-title',
      price: '.price-box .price',
      image: '.product-image img',
      link: '.product-card a'
    }
  },
  myntra: {
    baseUrl: 'https://www.myntra.com',
    searchPath: '/search',
    requiresJS: true,
    selectors: {
      productContainer: '.product-base',
      name: '.product-product',
      price: '.product-price',
      image: '.product-imageSliderContainer img',
      link: '.product-base'
    }
  }
};

// Detection and error messages
export const ERROR_MESSAGES = {
  CAPTCHA_DETECTED: 'CAPTCHA detected - try again later or use premium proxy',
  BLOCKED: 'Request blocked by anti-bot system',
  TIMEOUT: 'Request timed out',
  RATE_LIMITED: 'Rate limited by platform',
  NO_RESULTS: 'No products found',
  NETWORK_ERROR: 'Network error occurred'
};

// Check if response indicates blocking
export const isBlocked = (html, statusCode) => {
  if (statusCode === 403) return true;
  if (statusCode === 429) return true;

  const blockIndicators = [
    'captcha',
    'robot',
    'unusual traffic',
    'access denied',
    'blocked',
    'security check',
    'verify you are human'
  ];

  const lowerHtml = html.toLowerCase();
  return blockIndicators.some(indicator => lowerHtml.includes(indicator));
};

export default {
  USER_AGENTS,
  getRealisticHeaders,
  PROXIES,
  getRandomProxy,
  SCRAPER_API_CONFIG,
  PUPPETEER_CONFIG,
  RETRY_CONFIG,
  randomDelay,
  getRetryDelay,
  PLATFORM_CONFIGS,
  ERROR_MESSAGES,
  isBlocked
};
