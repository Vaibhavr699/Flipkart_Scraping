import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export async function scrapeCategories() {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });

  const page = await browser.newPage();
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ];
  
  await page.setUserAgent(userAgents[Math.floor(Math.random() * userAgents.length)]);
  await page.setViewport({
    width: 1200 + Math.floor(Math.random() * 200),
    height: 800 + Math.floor(Math.random() * 200)
  });

  try {
    console.log('🚀 Navigating to Flipkart...');
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await page.goto('https://www.flipkart.com/', {
          waitUntil: 'domcontentloaded',
          timeout: 60000
        });
        break;
      } catch (error) {
        console.log(`⏳ Navigation attempt ${attempt}/3 failed, retrying...`);
        if (attempt === 3) throw error;
        await new Promise(resolve => setTimeout(resolve, 3000 * attempt));
      }
    }

    try {
      await page.waitForSelector('button._2KpZ6l._2doB4z', { timeout: 10000 });
      await page.click('button._2KpZ6l._2doB4z');
    } catch {
      console.log('Login popup not found or already closed.');
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: 'flipkart-screenshot.png' });
    console.log('📸 Screenshot saved to flipkart-screenshot.png');

    let categories = await page.evaluate(() => {
      const baseUrl = 'https://www.flipkart.com';
      let catNodes = [];

      // Strategy 1: Horizontal nav with equal height children
      const horizontalContainers = Array.from(document.querySelectorAll('div[style*="display: flex"], nav, header'));
      const possibleNavbars = horizontalContainers.filter(container => {
        const children = container.children;
        return children.length >= 5 &&
          Array.from(children).every(child =>
            Math.abs(child.getBoundingClientRect().height - children[0].getBoundingClientRect().height) < 20
          ) &&
          container.getBoundingClientRect().width > window.innerWidth * 0.7;
      });

      for (const navbar of possibleNavbars) {
        const items = Array.from(navbar.children);
        const itemsWithImages = items.filter(item => item.querySelector('img'));
        if (itemsWithImages.length >= 5) {
          catNodes = items;
          break;
        }
      }

      // Strategy 2: Specific known selectors
      if (catNodes.length === 0) {
        catNodes = Array.from(document.querySelectorAll('div._3sdu8W.emupdz > a._1ch8e_, div._3sdu8W.emupdz > div._1ch8e_'));

        if (catNodes.length < 8) {
          const navContainer = document.querySelector('div[class*="navigationCard"]')?.closest('div');
          if (navContainer) {
            catNodes = Array.from(navContainer.querySelectorAll('a[class*="navigationCard"], div[class*="navigationCard"]'));
          }
        }

        if (catNodes.length < 8) {
          catNodes = Array.from(document.querySelectorAll('a[href*="navigationCard"], div[class*="rich_navigation"]'));
        }

        if (catNodes.length < 8) {
          const flexContainers = Array.from(document.querySelectorAll('div[style*="display: flex"]'));
          for (const container of flexContainers) {
            const items = container.querySelectorAll('a, div');
            if (items.length >= 8 && Array.from(items).every(i => i.querySelector('img'))) {
              catNodes = Array.from(items);
              break;
            }
          }
        }
      }

      const results = [];

      for (const node of catNodes) {
        let name = node.querySelector('span[class*="XjE3T"] > span, span[class*="text"] > span, div > span')?.textContent.trim()
          || node.getAttribute('aria-label')
          || node.getAttribute('title')
          || node.textContent.trim();

        if (name && name.length > 50) name = name.substring(0, 50).trim();

        const relativeUrl = node.tagName === 'A' ? node.getAttribute('href') : null;
        const url = relativeUrl ? new URL(relativeUrl, baseUrl).href : null;
        const img = node.querySelector('img')?.src || null;

        if (name) results.push({ name, url, img });
      }

      return results;
    });

    // Strategy 3: Aggressive fallback if too few categories
    if (categories.length < 8) {
      console.log('⚠️ Not enough categories found, trying aggressive fallback...');
      const aggressiveCategories = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('a, div[role="button"]')).filter(el => {
          const img = el.querySelector('img');
          const text = el.textContent.trim();
          return img && text.length > 2 && text.length < 40;
        });

        return items.map(el => ({
          name: el.textContent.trim(),
          url: el.href || el.querySelector('a')?.href || null,
          img: el.querySelector('img')?.src || null
        })).filter((item, idx, arr) => arr.findIndex(x => x.name === item.name) === idx);
      });

      categories.push(...aggressiveCategories);
    }

    // Build category object
    const categoryObject = {};
    categories.forEach(cat => {
      if (cat.name) {
        categoryObject[cat.name] = {
          name: cat.name,
          url: cat.url?.replace(/`/g, '').trim() || null,
          img: cat.img?.replace(/`/g, '').trim() || null
        };
      }
    });

    // Fill in missing URLs manually
    if (categoryObject['Fashion'] && !categoryObject['Fashion'].url) {
      categoryObject['Fashion'].url = 'https://www.flipkart.com/clothing-and-accessories/pr?sid=clo';
    }
    if (categoryObject['Electronics'] && !categoryObject['Electronics'].url) {
      categoryObject['Electronics'].url = 'https://www.flipkart.com/electronics-store';
    }
    if (categoryObject['Home & Furniture'] && !categoryObject['Home & Furniture'].url) {
      categoryObject['Home & Furniture'].url = 'https://www.flipkart.com/home-furnishing/pr?sid=jra';
    }
    if (categoryObject['Beauty, Food..'] && !categoryObject['Beauty, Food..'].url) {
      categoryObject['Beauty, Food..'].url = 'https://www.flipkart.com/beauty-and-grooming/pr?sid=g9b';
    }

    const outputPath = path.resolve('dynamicCategoryMapping.json');
    fs.writeFileSync(outputPath, JSON.stringify(categoryObject, null, 2));

    console.log(`✅ ${Object.keys(categoryObject).length} categories saved to ${outputPath}`);
  } catch (error) {
    console.error('❌ Scraping failed:', error.message);
  } finally {
    await browser.close();
  }
}
