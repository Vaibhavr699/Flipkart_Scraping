import puppeteer from 'puppeteer';

const SELECTORS = {
  productCards: [
    'div.cPHDOP > div._75nlfW > div',
    'div._1AtVbE',
    'article[data-id]',
    '[data-testid="product-card"]',
    '.product-card'
  ],
  productContent: [
    'div._1sdMkc',
    'div.slAVV4',
    'div._4ddWXP',
    'div._2kHMtA',
    'div._3pLy-c',
    'div._2B099V',
    'div._1xHGtK',
    '[data-id]',
    '[data-tkid]',
    '.product-item',
    '[data-testid="product-content"]',
    'article'
  ],
  productUrl: [
    'a.CGtC98',
    'a.rPDeLR',
    'a.VJA3rP',
    'a._1fQZEK',
    'a.s1Q9rs',
    'a.IRpwTa',
    'a.WKTcLC',
    'a.wjcEIp',
    'a[href*="/p/"]',
    'a[href*="/pr?"]',
    '[data-testid="product-link"]'
  ],
  title: [
    'div.KzDlHZ',
    'a.WKTcLC',
    'a.wjcEIp',
    'div._4rR01T',
    'a.s1Q9rs',
    'div.IRpwTa',
    'div._2WkVRV',
    'div._3wU53n',
    'div._2B099V',
    'div._1xHGtK',
    'h1',
    'h2',
    'h3',
    '[data-testid="product-title"]'
  ],
  brand: [
    'div.syl9yP',
    'div._2WkVRV',
    'div._3wU53n',
    '[data-testid="product-brand"]',
    '.brand'
  ],
  imageUrl: [
    'img.DByuf4',
    'img._53J4C-',
    'img._396cs4',
    'img._2r_T1I',
    'img._3togXc',
    'img._1Nyybr',
    'img[src*="rukminim"]',
    'img[data-testid="product-image"]',
    '.product-image img'
  ],
  price: [
    'div.Nx9bqj._4b5DiR',
    'div.Nx9bqj',
    'div._30jeq3',
    '[data-testid="product-price"]',
    '.price',
    '.selling-price'
  ],
  originalPrice: [
    'div.yRaY8j',
    'div._3I9_wc',
    '[data-testid="product-original-price"]',
    '.original-price',
    '.mrp'
  ],
  discount: [
    'div.UkUFwK span',
    'div._3Ay6Sb span',
    '[data-testid="product-discount"]',
    '.discount'
  ],
  rating: [
    'div.XQDdHH',
    'div._3LWZlK',
    '[data-testid="product-rating"]',
    '.rating',
    '[aria-label*="star"]'
  ],
  ratingCount: [
    'span.Wphh3N',
    'span._2_R_DZ',
    '[data-testid="product-rating-count"]',
    '.rating-count'
  ],
  highlights: [
    'ul.G4BRas li.J+igdf',
    'ul._1xgFaf li',
    '[data-testid="product-highlights"] li',
    '.highlights li'
  ],
  highlightsText: [
    'div.NqpwHC',
    'div._3djpdu',
    '[data-testid="product-description"]',
    '.description'
  ]
};

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
];

const ANTI_DETECTION_OPTIONS = {
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu',
    '--disable-blink-features=AutomationControlled',
    '--disable-features=IsolateOrigins,site-per-process',
    '--disable-web-security',
    '--disable-features=TranslateUI',
    '--disable-extensions',
    '--disable-default-apps',
    '--no-default-browser-check',
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
    '--disable-ipc-flooding-protection',
    '--disable-client-side-phishing-detection',
    '--disable-component-extensions-with-background-pages',
    '--disable-breakpad',
    '--disable-component-update',
    '--disable-domain-reliability',
    '--disable-features=AudioServiceOutOfProcess',
    '--disable-hang-monitor',
    '--disable-sync',
    '--disable-web-resources',
    '--disable-features=Translate',
    '--disable-features=TranslateUI',
    '--metrics-recording-only',
    '--safebrowsing-disable-auto-update',
    '--disable-background-networking',
    '--disable-features=VizDisplayCompositor',
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows'
  ]
};

function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function getRandomDelay(min = 1000, max = 3000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getElementBySelectors(element, selectors) {
  for (const selector of selectors) {
    const found = element.querySelector(selector);
    if (found) return found;
  }
  return null;
}

async function safeGoto(page, url, options = {}, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      await page.goto(url, { ...options, timeout: 60000 }); // 60 seconds timeout
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(1000, 2000)));
      return;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(res => setTimeout(res, getRandomDelay(3000, 6000))); // random delay 3-6 seconds
    }
  }
}

async function scrapeProductsOnPage(page, url) {
  await safeGoto(page, url, { waitUntil: 'networkidle2' });
  try {
    await page.waitForSelector('div.cPHDOP, div._1AtVbE', { timeout: 15000 });
  } catch (e) {
    return [];
  }
  return await page.evaluate((SELECTORS) => {
    const getElementBySelectors = (element, selectors) => {
      for (const selector of selectors) {
        const found = element.querySelector(selector);
        if (found) return found;
      }
      return null;
    };

    const productCards = [
      ...Array.from(document.querySelectorAll('div.cPHDOP > div._75nlfW > div')),
      ...Array.from(document.querySelectorAll('div._1AtVbE')),
    ];
    return productCards.map(card => {
      const productContent = getElementBySelectors(card, SELECTORS.productContent) || card;
      
      let productUrl = getElementBySelectors(productContent, SELECTORS.productUrl)?.href || '';
      if (productUrl && !productUrl.startsWith('http')) {
        productUrl = 'https://www.flipkart.com' + productUrl;
      }
      
      const title = getElementBySelectors(productContent, SELECTORS.title)?.innerText || 
                   getElementBySelectors(productContent, SELECTORS.productUrl)?.getAttribute('title') || 
                   getElementBySelectors(productContent, SELECTORS.productUrl)?.innerText || '';
      
      const name = title;
      const brand = getElementBySelectors(productContent, SELECTORS.brand)?.innerText || '';
      const imageUrl = getElementBySelectors(productContent, SELECTORS.imageUrl)?.src || '';
      const price = getElementBySelectors(productContent, SELECTORS.price)?.innerText || '';
      const originalPrice = getElementBySelectors(productContent, SELECTORS.originalPrice)?.innerText || '';
      const discount = getElementBySelectors(productContent, SELECTORS.discount)?.innerText || '';
      const rating = getElementBySelectors(productContent, SELECTORS.rating)?.innerText || '';
      
      let ratingsCount = '';
      let reviewsCount = '';
      const ratingCountElement = getElementBySelectors(productContent, SELECTORS.ratingCount);
      if (ratingCountElement) {
        const text = ratingCountElement.innerText.trim();
        const match = text.match(/([\d,]+)\s*Ratings?.*&?\s*([\d,]+)\s*Reviews?/);
        if (match) {
          ratingsCount = match[1].replace(/,/g, '');
          reviewsCount = match[2].replace(/,/g, '');
        } else {
          const singleCountMatch = text.match(/([\d,]+)\s*Ratings?/);
          if (singleCountMatch) {
            ratingsCount = singleCountMatch[1].replace(/,/g, '');
          }
        }
      }
      
      let highlights = [];
      const listHighlights = Array.from(productContent.querySelectorAll('ul.G4BRas li.J+igdf, ul._1xgFaf li'))
        .map(li => li.innerText.trim());
      const textHighlights = getElementBySelectors(productContent, SELECTORS.highlightsText)?.innerText?.trim();
      if (listHighlights.length > 0) {
        highlights = listHighlights;
      } else if (textHighlights) {
        highlights = [textHighlights];
      }
      
      return { name, title, brand, productUrl, imageUrl, price, originalPrice, discount, rating, ratingsCount, reviewsCount, highlights };
    }).filter(p => p && p.name && p.productUrl);
  }, SELECTORS);
}

//pagination
async function scrapeAllProducts(categoryUrl, maxPages = 100) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ANTI_DETECTION_OPTIONS.args,
    ignoreDefaultArgs: ['--enable-automation'],
    defaultViewport: null
  });
  
  const page = await browser.newPage();
  
  // Enhanced stealth settings
  await page.evaluateOnNewDocument(() => {
    // Remove webdriver property
    delete navigator.__proto__.webdriver;
    
    // Override languages
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en']
    });
    
    // Override plugins
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5]
    });
    
    // Override screen resolution
    Object.defineProperty(screen, 'resolution', {
      get: () => ({ width: 1920, height: 1080 })
    });
  });
  
  await page.setUserAgent(getRandomUserAgent());
  
  // Enhanced viewport randomization
  const width = 1200 + Math.floor(Math.random() * 400);
  const height = 800 + Math.floor(Math.random() * 400);
  const deviceScaleFactor = 1 + Math.random() * 0.5;
  await page.setViewport({ width, height, deviceScaleFactor });
  
  // Randomize other browser properties
  await page.evaluateOnNewDocument(() => {
    // Randomize screen dimensions slightly
    const screenWidth = 1366 + Math.floor(Math.random() * 200);
    const screenHeight = 768 + Math.floor(Math.random() * 200);
    Object.defineProperty(screen, 'width', { get: () => screenWidth });
    Object.defineProperty(screen, 'height', { get: () => screenHeight });
    Object.defineProperty(screen, 'availWidth', { get: () => screenWidth });
    Object.defineProperty(screen, 'availHeight', { get: () => screenHeight - 100 });
  });
  
  let allProducts = [];
  let pageNum = 1;
  let consecutiveEmptyPages = 0;
  
  while (pageNum <= maxPages && consecutiveEmptyPages < 3) {
    try {
      let url = categoryUrl;
      if (!/([&?])page=/.test(url)) {
        url += (url.includes('?') ? '&' : '?') + 'page=' + pageNum;
      } else {
        url = url.replace(/([&?])page=\d+/, `$1page=${pageNum}`);
      }
      
      console.log(`Scraping page ${pageNum}: ${url}`);
      const products = await scrapeProductsOnPage(page, url);
      
      if (!products.length) {
        consecutiveEmptyPages++;
        console.warn(`Page ${pageNum} returned no products (consecutive empty: ${consecutiveEmptyPages})`);
      } else {
        consecutiveEmptyPages = 0;
        allProducts = allProducts.concat(products);
        console.log(`Found ${products.length} products on page ${pageNum}`);
      }
      
      if (pageNum < maxPages) {
        const delay = getRandomDelay(3000, 6000); // Increased delay for better stealth
        console.log(`Waiting ${delay}ms before next page...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      pageNum++;
    } catch (error) {
      console.error(`Error scraping page ${pageNum}:`, error.message);
      if (consecutiveEmptyPages >= 2) {
        console.log('Too many consecutive errors, stopping pagination');
        break;
      }
      consecutiveEmptyPages++;
      pageNum++;
    }
  }
  
  await browser.close();
  console.log(`Scraping completed. Total products found: ${allProducts.length}`);
  return allProducts;
}

export { scrapeAllProducts };