import puppeteer from 'puppeteer';

const SELECTORS = {
  productCards: [
    'div.cPHDOP > div._75nlfW > div',
    'div._1AtVbE'
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
    '.product-item'
  ],
  productUrl: [
    'a.CGtC98',
    'a.rPDeLR',
    'a.VJA3rP',
    'a._1fQZEK',
    'a.s1Q9rs',
    'a.IRpwTa',
    'a.WKTcLC',
    'a.wjcEIp'
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
    'div._1xHGtK'
  ],
  brand: [
    'div.syl9yP',
    'div._2WkVRV',
    'div._3wU53n'
  ],
  imageUrl: [
    'img.DByuf4',
    'img._53J4C-',
    'img._396cs4',
    'img._2r_T1I',
    'img._3togXc',
    'img._1Nyybr'
  ],
  price: [
    'div.Nx9bqj._4b5DiR',
    'div.Nx9bqj',
    'div._30jeq3'
  ],
  originalPrice: [
    'div.yRaY8j',
    'div._3I9_wc'
  ],
  discount: [
    'div.UkUFwK span',
    'div._3Ay6Sb span'
  ],
  rating: [
    'div.XQDdHH',
    'div._3LWZlK'
  ],
  ratingCount: [
    'span.Wphh3N',
    'span._2_R_DZ'
  ],
  highlights: [
    'ul.G4BRas li.J+igdf',
    'ul._1xgFaf li'
  ],
  highlightsText: [
    'div.NqpwHC',
    'div._3djpdu'
  ]
};

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

const ANTI_DETECTION_OPTIONS = {
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu'
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
    args: ANTI_DETECTION_OPTIONS.args
  });
  const page = await browser.newPage();
  await page.setUserAgent(getRandomUserAgent());
  
  const width = 1200 + Math.floor(Math.random() * 200);
  const height = 800 + Math.floor(Math.random() * 200);
  await page.setViewport({ width, height });
  let allProducts = [];
  let pageNum = 1;
  while (pageNum <= maxPages) {
    let url = categoryUrl;
    if (!/([&?])page=/.test(url)) {
      url += (url.includes('?') ? '&' : '?') + 'page=' + pageNum;
    } else {
      url = url.replace(/([&?])page=\d+/, `$1page=${pageNum}`);
    }
    const products = await scrapeProductsOnPage(page, url);
    if (!products.length) break;
    allProducts = allProducts.concat(products);
    
    if (pageNum < maxPages) {
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(2000, 4000)));
    }
    pageNum++;
  }
  await browser.close();
  return allProducts;
}

export { scrapeAllProducts };