import puppeteer from 'puppeteer';

const SELECTORS = {
  productCards: [
    'div.cPHDOP > div._75nlfW > div',
    'div._1AtVbE',
    'article[data-id]',
    '[data-testid="product-card"]',
    '.product-card',
    '[data-component-type="s-search-result"]',
    '.s-result-item',
    '.s-card-container',
    '.sg-col-inner',
    '[data-asin]',
    '.a-section',
    '.s-item-container'
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
    'article',
    '.s-result-item',
    '.s-card-container',
    '.a-section',
    '.s-item-container'
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
    '[data-testid="product-link"]',
    'a[href*="/product/"]',
    'a[href*="/item/"]',
    '.a-link-normal',
    'h2 a',
    '.s-link-style a',
    '.a-color-base'
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
    '[data-testid="product-title"]',
    'h2.s-size-mini',
    '.a-size-medium',
    '.a-size-base-plus',
    '.a-text-normal',
    '.s-color-base'
  ],
  brand: [
    'div.syl9yP',
    'div._2WkVRV',
    'div._3wU53n',
    '[data-testid="product-brand"]',
    '.brand',
    '.a-size-base-plus',
    '.s-color-base',
    'span.a-size-base'
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
    '.product-image img',
    'img[src*="images-amazon"]',
    'img[src*="ssl-images-amazon"]',
    '.s-image',
    '.a-dynamic-image'
  ],
  price: [
    'div.Nx9bqj._4b5DiR',
    'div.Nx9bqj',
    'div._30jeq3',
    '[data-testid="product-price"]',
    '.price',
    '.selling-price',
    '.a-price-whole',
    '.a-price .a-offscreen',
    '.a-price-range',
    '.a-price .a-offscreen',
    '.a-price-symbol'
  ],
  originalPrice: [
    'div.yRaY8j',
    'div._3I9_wc',
    '[data-testid="product-original-price"]',
    '.original-price',
    '.mrp',
    '.a-text-price .a-offscreen',
    '.a-price.a-text-price .a-offscreen',
    '.a-price-base'
  ],
  discount: [
    'div.UkUFwK span',
    'div._3Ay6Sb span',
    '[data-testid="product-discount"]',
    '.discount',
    '.a-color-price',
    '.s-coupon-highlight-color',
    '.a-color-base'
  ],
  rating: [
    'div.XQDdHH',
    'div._3LWZlK',
    '[data-testid="product-rating"]',
    '.rating',
    '[aria-label*="star"]',
    '.a-icon-alt',
    '.a-icon-star',
    '.a-star-medium',
    '.a-icon-star-small'
  ],
  ratingCount: [
    'span.Wphh3N',
    'span._2_R_DZ',
    '[data-testid="product-rating-count"]',
    '.rating-count',
    '.a-size-base',
    '.a-link-normal'
  ],
  highlights: [
    'ul.G4BRas li.J+igdf',
    'ul._1xgFaf li',
    '[data-testid="product-highlights"] li',
    '.highlights li',
    '.a-unordered-list li',
    '.a-list-item',
    '.a-size-base'
  ],
  highlightsText: [
    'div.NqpwHC',
    'div._3djpdu',
    '[data-testid="product-description"]',
    '.description',
    '.a-size-base',
    '.a-color-base',
    '.a-spacing-small'
  ]
};

const USER_AGENTS = [
  // Chrome on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
  
  // Chrome on Mac
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  
  // Chrome on Linux
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  
  // Firefox on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Windows NT 11.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:119.0) Gecko/20100101 Firefox/119.0',
  
  // Firefox on Mac
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13.6; rv:120.0) Gecko/20100101 Firefox/120.0',
  
  // Firefox on Linux
  'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
  
  // Edge on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
  
  // Safari on Mac
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
  
  // Mobile browsers
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
];

const ANTI_DETECTION_OPTIONS = {
  args: [
    // Basic stealth
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-blink-features=AutomationControlled',
    '--disable-features=IsolateOrigins,site-per-process',
    '--disable-web-security',
    '--disable-features=VizDisplayCompositor',
    '--disable-extensions',
    '--disable-plugins',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-background-networking',
    '--disable-default-apps',
    '--disable-extensions-file-access-check',
    '--disable-extensions-http-throttling',
    '--disable-ipc-flooding-protection',
    '--disable-prompt-on-repost',
    '--disable-hang-monitor',
    '--disable-sync',
    '--disable-component-extensions-with-background-pages',
    '--disable-breakpad',
    '--disable-client-side-phishing-detection',
    '--disable-component-update',
    '--disable-domain-reliability',
    '--disable-features=AudioServiceOutOfProcess',
    '--disable-features=TranslateUI',
    '--disable-features=site-per-process',
    '--force-color-profile=srgb',
    '--metrics-recording-only',
    '--password-store=basic',
    '--safebrowsing-disable-auto-update',
    '--use-mock-keychain',
    
    // User agent spoofing
    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    
    // Window size and viewport
    '--window-size=1920,1080',
    '--start-maximized',
    '--window-position=0,0',
    
    // Disable automation flags
    '--disable-blink-features=AutomationControlled',
    '--disable-features=AutomationControlled',
    '--disable-blink-settings=AutomationControlled',
    
    // GPU and rendering
    '--disable-gpu',
    '--disable-gpu-compositing',
    '--disable-gpu-rasterization',
    '--disable-gpu-sandbox',
    '--disable-software-rasterizer',
    '--enable-gpu-rasterization',
    '--enable-zero-copy',
    '--enable-gpu-memory-buffer-compositor-resources',
    '--enable-gpu-memory-buffer-video-frames',
    '--enable-native-gpu-memory-buffers',
    
    // Memory and performance
    '--memory-pressure-off',
    '--max_old_space_size=4096',
    '--aggressive-cache-discard',
    
    // Network and security
    '--allow-running-insecure-content',
    '--disable-features=ChromeWhatsNewUI',
    '--disable-features=OptimizationHints',
    '--disable-features=PrivacySandboxSettings4',
    
    // Media and audio
    '--autoplay-policy=no-user-gesture-required',
    '--disable-features=PreloadMediaEngagementData',
    '--disable-background-media-suspend',
    
    // Language and locale
    '--lang=en-US',
    '--accept-lang=en-US,en;q=0.9',
    
    // Timezone and locale
    '--timezone=America/New_York',
    '--enable-features=NetworkService,NetworkServiceLogging',
    
    // Experimental features
    '--enable-experimental-web-platform-features',
    '--enable-features=ExperimentalProductivityFeatures',
    '--enable-features=ExperimentalAccessibilityFeatures'
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
    // Comprehensive stealth settings
    
    // Remove webdriver property
    delete navigator.__proto__.webdriver;
    
    // Override languages with realistic pattern
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en', 'en-GB', 'en-CA']
    });
    
    // Override plugins with detailed realistic data
    Object.defineProperty(navigator, 'plugins', {
      get: () => [
        { name: 'PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format', version: '1.0' },
        { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: 'Portable Document Format', version: '1.0' },
        { name: 'Chromium PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: 'Portable Document Format', version: '1.0' },
        { name: 'Microsoft Edge PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: 'Portable Document Format', version: '1.0' },
        { name: 'WebKit built-in PDF', filename: 'WebKit built-in PDF', description: 'Portable Document Format', version: '1.0' }
      ]
    });
    
    // Override mimeTypes
    Object.defineProperty(navigator, 'mimeTypes', {
      get: () => [
        { type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format', enabledPlugin: navigator.plugins[0] },
        { type: 'application/x-google-chrome-pdf', suffixes: 'pdf', description: 'Portable Document Format', enabledPlugin: navigator.plugins[1] }
      ]
    });
    
    // Override webdriver detection
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });
    
    // Override navigator properties for better stealth
    Object.defineProperty(navigator, 'platform', {
      get: () => 'Win32'
    });
    
    Object.defineProperty(navigator, 'userAgent', {
      get: () => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    // Override screen properties with realistic values
    Object.defineProperty(screen, 'width', {
      get: () => 1920
    });
    
    Object.defineProperty(screen, 'height', {
      get: () => 1080
    });
    
    Object.defineProperty(screen, 'availWidth', {
      get: () => 1920
    });
    
    Object.defineProperty(screen, 'availHeight', {
      get: () => 1040
    });
    
    Object.defineProperty(screen, 'colorDepth', {
      get: () => 24
    });
    
    Object.defineProperty(screen, 'pixelDepth', {
      get: () => 24
    });
    
    // Override window properties
    Object.defineProperty(window, 'outerWidth', {
      get: () => 1920
    });
    
    Object.defineProperty(window, 'outerHeight', {
      get: () => 1080
    });
    
    Object.defineProperty(window, 'innerWidth', {
      get: () => 1920
    });
    
    Object.defineProperty(window, 'innerHeight', {
      get: () => 955
    });
    
    // Add chrome runtime for Chrome browsers
    if (navigator.userAgent.includes('Chrome')) {
      window.chrome = {
        runtime: {
          lastError: null,
          onConnect: {},
          onMessage: {},
          sendMessage: function() {},
          connect: function() { return { onMessage: {}, postMessage: function() {} } }
        },
        loadTimes: () => ({
          commitLoadTime: Date.now() - 1000,
          connectionInfo: 'h2',
          finishDocumentLoadTime: Date.now() - 500,
          finishLoadTime: Date.now(),
          firstPaintAfterLoadTime: 0,
          firstPaintTime: Date.now() - 400,
          navigationType: 'Other',
          npnNegotiatedProtocol: 'h2',
          requestTime: Date.now() - 2000,
          startLoadTime: Date.now() - 1500,
          wasAlternateProtocolAvailable: false,
          wasFetchedViaSpdy: true,
          wasNpnNegotiated: true
        }),
        csi: () => ({ pageT: Date.now(), startE: 0, tran: 15 })
      };
    }
    
    // Override permissions API with more realistic behavior
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) => {
      if (parameters.name === 'notifications') {
        return Promise.resolve({ state: 'granted' });
      } else if (parameters.name === 'geolocation') {
        return Promise.resolve({ state: 'prompt' });
      } else if (parameters.name === 'camera' || parameters.name === 'microphone') {
        return Promise.resolve({ state: 'prompt' });
      }
      return originalQuery(parameters);
    };
    
    // Override navigator.connection for mobile detection
    Object.defineProperty(navigator, 'connection', {
      get: () => ({
        effectiveType: '4g',
        downlink: 10,
        rtt: 50,
        saveData: false
      })
    });
    
    // Override battery API
    if ('getBattery' in navigator) {
      navigator.getBattery = () => Promise.resolve({
        charging: true,
        level: 0.95,
        chargingTime: 0,
        dischargingTime: Infinity
      });
    }
    
    // Override device memory
    Object.defineProperty(navigator, 'deviceMemory', {
      get: () => 8
    });
    
    // Override hardware concurrency
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      get: () => 8
    });
    
    // Override do not track
    Object.defineProperty(navigator, 'doNotTrack', {
      get: () => null
    });
    
    // Override cookie enabled
    Object.defineProperty(navigator, 'cookieEnabled', {
      get: () => true
    });
    
    // Override onLine status
    Object.defineProperty(navigator, 'onLine', {
      get: () => true
    });
    
    // Override max touch points
    Object.defineProperty(navigator, 'maxTouchPoints', {
      get: () => 0
    });
    
    // Override vendor
    Object.defineProperty(navigator, 'vendor', {
      get: () => 'Google Inc.'
    });
    
    // Override vendorSub
    Object.defineProperty(navigator, 'vendorSub', {
      get: () => ''
    });
    
    // Override productSub
    Object.defineProperty(navigator, 'productSub', {
      get: () => '20030107'
    });
    
    // Override appCodeName
    Object.defineProperty(navigator, 'appCodeName', {
      get: () => 'Mozilla'
    });
    
    // Override appName
    Object.defineProperty(navigator, 'appName', {
      get: () => 'Netscape'
    });
    
    // Override appVersion
    Object.defineProperty(navigator, 'appVersion', {
      get: () => '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    // Override platform
    Object.defineProperty(navigator, 'platform', {
      get: () => 'Win32'
    });
    
    // Override oscpu
    Object.defineProperty(navigator, 'oscpu', {
      get: () => 'Windows NT 10.0; Win64; x64'
    });
    
    // Override buildID
    Object.defineProperty(navigator, 'buildID', {
      get: () => '20181001000000'
    });
    
    // Override product
    Object.defineProperty(navigator, 'product', {
      get: () => 'Gecko'
    });
    
    // Override userAgentData
    if ('userAgentData' in navigator) {
      delete navigator.userAgentData;
    }
    
    // Hide automation properties
    Object.defineProperty(window, 'cdc_adoQpoasnfa76pfcZLmcfl_Array', {
      get: () => undefined
    });
    
    Object.defineProperty(window, 'cdc_adoQpoasnfa76pfcZLmcfl_Promise', {
      get: () => undefined
    });
    
    Object.defineProperty(window, 'cdc_adoQpoasnfa76pfcZLmcfl_Symbol', {
      get: () => undefined
    });
    
    // Override console.debug to hide automation messages
    const originalDebug = console.debug;
    console.debug = function(...args) {
      if (args[0] && args[0].includes('DevTools')) return;
      return originalDebug.apply(console, args);
    };
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
  let totalErrors = 0;
  let maxConsecutiveErrors = 5;
  
  // Enhanced viewport randomization for each session
  const viewportConfigs = [
    { width: 1920, height: 1080, deviceScaleFactor: 1 },
    { width: 1366, height: 768, deviceScaleFactor: 1 },
    { width: 1536, height: 864, deviceScaleFactor: 1.25 },
    { width: 1440, height: 900, deviceScaleFactor: 1 },
    { width: 1280, height: 720, deviceScaleFactor: 1 }
  ];
  
  const randomViewport = viewportConfigs[Math.floor(Math.random() * viewportConfigs.length)];
  await page.setViewport(randomViewport);
  
  // Additional browser fingerprint randomization
  await page.evaluateOnNewDocument(() => {
    // Randomize screen dimensions slightly for each session
    const baseWidth = 1920 + Math.floor(Math.random() * 20) - 10;
    const baseHeight = 1080 + Math.floor(Math.random() * 20) - 10;
    
    Object.defineProperty(screen, 'width', { get: () => baseWidth });
    Object.defineProperty(screen, 'height', { get: () => baseHeight });
    Object.defineProperty(screen, 'availWidth', { get: () => baseWidth });
    Object.defineProperty(screen, 'availHeight', { get: () => baseHeight - 40 });
    
    // Randomize timezone offset
    const timezoneOffset = -300 + Math.floor(Math.random() * 120) - 60; // EST to CST range
    Date.prototype.getTimezoneOffset = () => timezoneOffset;
    
    // Randomize hardware info
    Object.defineProperty(navigator, 'deviceMemory', { get: () => [4, 8, 16][Math.floor(Math.random() * 3)] });
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => [4, 8, 12, 16][Math.floor(Math.random() * 4)] });
  });
  
  while (pageNum <= maxPages && consecutiveEmptyPages < 3 && totalErrors < maxConsecutiveErrors) {
    try {
      let url = categoryUrl;
      
      // Smart URL construction for different Flipkart URL patterns
      if (categoryUrl.includes('flipkart.com/search')) {
        url = categoryUrl.replace(/([&?])page=\d+/, '').replace(/([&?])start=\d+/, '');
        url += (url.includes('?') ? '&' : '?') + `page=${pageNum}`;
      } else if (categoryUrl.includes('flipkart.com/')) {
        url = categoryUrl.replace(/([&?])page=\d+/, '').replace(/([&?])start=\d+/, '');
        url += (url.includes('?') ? '&' : '?') + `page=${pageNum}`;
      } else {
        url = categoryUrl.replace(/([&?])page=\d+/, `$1page=${pageNum}`);
        if (!url.includes('page=')) {
          url += (url.includes('?') ? '&' : '?') + `page=${pageNum}`;
        }
      }
      
      console.log(`[${new Date().toISOString()}] Scraping page ${pageNum}: ${url}`);
      
      const products = await scrapeProductsOnPage(page, url);
      
      if (!products || !products.length) {
        consecutiveEmptyPages++;
        console.warn(`[${new Date().toISOString()}] Page ${pageNum} returned no products (consecutive empty: ${consecutiveEmptyPages})`);
        
        // Check for rate limiting or blocking
        const pageContent = await page.content();
        if (pageContent.includes('blocked') || pageContent.includes('captcha') || pageContent.includes('verify')) {
          console.error('Rate limiting or blocking detected. Stopping scrape.');
          break;
        }
      } else {
        consecutiveEmptyPages = 0;
        totalErrors = 0; // Reset error counter on success
        allProducts = allProducts.concat(products);
        console.log(`[${new Date().toISOString()}] Found ${products.length} products on page ${pageNum} (total: ${allProducts.length})`);
        
        // Log sample product for debugging
        if (products.length > 0) {
          console.log(`Sample product: ${products[0].title?.substring(0, 50)}...`);
        }
      }
      
      if (pageNum < maxPages) {
        // Dynamic delay based on page number and success rate
        const baseDelay = 3000;
        const pageDelay = Math.min(8000, baseDelay + (pageNum * 200)); // Gradual increase
        const randomDelayTime = getRandomDelay(pageDelay, pageDelay + 3000);
        
        console.log(`[${new Date().toISOString()}] Waiting ${randomDelayTime}ms before next page...`);
        await new Promise(resolve => setTimeout(resolve, randomDelayTime));
        
        // Random mouse movement to appear more human
        try {
          await page.mouse.move(
            Math.random() * randomViewport.width,
            Math.random() * randomViewport.height
          );
        } catch (e) {
          // Ignore mouse movement errors
        }
      }
      pageNum++;
      
    } catch (error) {
      totalErrors++;
      console.error(`[${new Date().toISOString()}] Error scraping page ${pageNum}:`, error.message);
      
      // Handle specific error types
      if (error.message.includes('timeout') || error.message.includes('TimeoutError')) {
        console.log('Timeout error detected, increasing wait time...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      } else if (error.message.includes('navigation')) {
        console.log('Navigation error, retrying with longer delay...');
        await new Promise(resolve => setTimeout(resolve, 15000));
      } else {
        // General error - exponential backoff
        const backoffDelay = Math.min(30000, 5000 * Math.pow(2, totalErrors - 1));
        console.log(`General error, backing off for ${backoffDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
      
      if (totalErrors >= maxConsecutiveErrors) {
        console.error('Maximum consecutive errors reached. Stopping scrape.');
        break;
      }
      
      // Continue to next page after error handling
      pageNum++;
    }
  }
  
  // Enhanced summary and cleanup
  const summary = {
    totalProducts: allProducts.length,
    pagesScraped: pageNum - 1,
    consecutiveEmptyPages,
    totalErrors,
    uniqueProducts: new Set(allProducts.map(p => p.productUrl)).size,
    timestamp: new Date().toISOString()
  };
  
  console.log(`\n=== Scraping Summary ===`);
  console.log(`Total products found: ${summary.totalProducts}`);
  console.log(`Pages scraped: ${summary.pagesScraped}`);
  console.log(`Unique products: ${summary.uniqueProducts}`);
  console.log(`Consecutive empty pages: ${summary.consecutiveEmptyPages}`);
  console.log(`Total errors: ${summary.totalErrors}`);
  console.log(`Timestamp: ${summary.timestamp}`);
  console.log(`======================\n`);
  
  await browser.close();
  
  // Remove duplicates based on product URL
  const uniqueProducts = allProducts.filter((product, index, self) => 
    index === self.findIndex(p => p.productUrl === product.productUrl)
  );
  
  console.log(`Final unique products after deduplication: ${uniqueProducts.length}`);
  
  return uniqueProducts;
}

// Enhanced exports with additional utility functions
module.exports = { 
  scrapeAllProducts,
  getRandomUserAgent,
  getRandomDelay,
  SELECTORS,
  USER_AGENTS,
  ANTI_DETECTION_OPTIONS
};