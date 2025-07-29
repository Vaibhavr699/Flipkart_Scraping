import puppeteer from 'puppeteer';

async function safeGoto(page, url, options = {}, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      await page.goto(url, { ...options, timeout: 60000 }); // 60 seconds timeout
      return;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(res => setTimeout(res, 2000)); // wait 2 seconds before retry
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
  return await page.evaluate(() => {
    const productCards = [
      ...Array.from(document.querySelectorAll('div.cPHDOP > div._75nlfW > div')),
      ...Array.from(document.querySelectorAll('div._1AtVbE')),
    ];
    return productCards.map(card => {
      const productContent = card.querySelector('div._1sdMkc, div.slAVV4, div._4ddWXP, div._2kHMtA, div._3pLy-c, div._2B099V, div._1xHGtK') || card;
      let productUrl = productContent.querySelector('a.CGtC98, a.rPDeLR, a.VJA3rP, a._1fQZEK, a.s1Q9rs, a.IRpwTa, a.WKTcLC, a.wjcEIp')?.href || '';
      if (productUrl && !productUrl.startsWith('http')) {
        productUrl = 'https://www.flipkart.com' + productUrl;
      }
      const title = productContent.querySelector('div.KzDlHZ')?.innerText
        || productContent.querySelector('a.WKTcLC, a.wjcEIp')?.getAttribute('title')
        || productContent.querySelector('a.WKTcLC, a.wjcEIp')?.innerText
        || productContent.querySelector('div._4rR01T, a.s1Q9rs, div.IRpwTa, div._2WkVRV, div._3wU53n, div._2B099V, div._1xHGtK')?.innerText
        || '';
      const name = title;
      const brand = productContent.querySelector('div.syl9yP, div._2WkVRV, div._3wU53n')?.innerText || '';
      const imageUrl = productContent.querySelector('img.DByuf4, img._53J4C-, img._396cs4, img._2r_T1I, img._2r_T1I, img._3togXc, img._3ywSr_', 'img._1Nyybr')?.src || '';
      const price = productContent.querySelector('div.Nx9bqj._4b5DiR')?.innerText
        || productContent.querySelector('div.Nx9bqj')?.innerText
        || productContent.querySelector('div._30jeq3')?.innerText
        || '';
      const originalPrice = productContent.querySelector('div.yRaY8j, div._3I9_wc')?.innerText || '';
      const discount = productContent.querySelector('div.UkUFwK span, div._3Ay6Sb span')?.innerText || '';
      const rating = productContent.querySelector('div.XQDdHH, div._3LWZlK')?.innerText || '';
      let ratingsCount = '';
      let reviewsCount = '';
      const ratingCountElement = productContent.querySelector('span.Wphh3N, span._2_R_DZ');
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
      const textHighlights = productContent.querySelector('div.NqpwHC, div._3djpdu')?.innerText?.trim();
      if (listHighlights.length > 0) {
        highlights = listHighlights;
      } else if (textHighlights) {
        highlights = [textHighlights];
      }
      return { name, title, brand, productUrl, imageUrl, price, originalPrice, discount, rating, ratingsCount, reviewsCount, highlights };
    }).filter(p => p && p.name && p.productUrl);
  });
}

//pagination
async function scrapeAllProducts(categoryUrl, maxPages = 100) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
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
    pageNum++;
  }
  await browser.close();
  return allProducts;
}

export { scrapeAllProducts };