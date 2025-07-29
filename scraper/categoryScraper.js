import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export async function scrapeCategories() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
  );

  try {
    await page.goto('https://www.flipkart.com/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    try {
      await page.waitForSelector('button._2KpZ6l._2doB4z', { timeout: 5000 });
      await page.click('button._2KpZ6l._2doB4z');
    } catch (e) {
      console.log('Login popup not found or already closed.');
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.screenshot({ path: 'flipkart-screenshot.png' });
    console.log('Screenshot saved to flipkart-screenshot.png');

    const categories = await page.evaluate(() => {
      
      let catNodes = [];
      
      const horizontalContainers = Array.from(document.querySelectorAll('div[style*="display: flex"], div[class*="flex"], nav, header'));
      
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
          console.log('Found navbar with image items:', items.length);
          break;
        }
      }

      if (catNodes.length === 0) {
        catNodes = Array.from(
          document.querySelectorAll('div._3sdu8W.emupdz > a._1ch8e_, div._3sdu8W.emupdz > div._1ch8e_')
        );

        if (catNodes.length === 0 || catNodes.length < 8) {
          const navContainer = document.querySelector('div[class*="navigationCard"]')?.parentElement?.parentElement;
          if (navContainer) {
            catNodes = Array.from(navContainer.querySelectorAll('a[class*="navigationCard"], div[class*="navigationCard"]'));
          }

          if (catNodes.length === 0 || catNodes.length < 8) {
            catNodes = Array.from(document.querySelectorAll('a[href*="navigationCard"], div[class*="rich_navigation"]'));
          }

          if (catNodes.length === 0 || catNodes.length < 8) {
            const possibleContainers = Array.from(document.querySelectorAll('div[style*="display: flex"]'));
            for (const container of possibleContainers) {
              const items = container.querySelectorAll('a, div');
              if (items.length >= 8 && Array.from(items).every(item => item.querySelector('img'))) {
                catNodes = Array.from(items);
                break;
              }
            }
          }
        }
      }

      const baseUrl = 'https://www.flipkart.com';
      const results = [];

      catNodes.forEach(node => {
        let name = null;

        const nameSpan = node.querySelector('span[class*="XjE3T"] > span, span[class*="text"] > span, div > span');
        if (nameSpan) {
          name = nameSpan.textContent.trim();
        } else {
          name = node.getAttribute('aria-label') || 
                 node.getAttribute('title') || 
                 node.textContent.trim();
        }

        if (name && name.length > 50) {
          name = name.substring(0, 50).trim();
        }

        const relativeUrl = node.tagName === 'A' ? node.getAttribute('href') : null;
        const url = relativeUrl ? new URL(relativeUrl, baseUrl).href : null;

        const img = node.querySelector('img')?.src || null;

        if (name) {
          results.push({ name, url, img });
        }
      });

      console.log(`Found ${results.length} categories`);

      if (results.length < 8) {
        console.log('Not enough categories found, trying alternative approach');

        const allImages = document.querySelectorAll('img');
        for (const img of allImages) {
          if (img.width > 30 && img.width < 150 && img.height > 30 && img.height < 150) {
            let parent = img.parentElement;
            for (let i = 0; i < 5; i++) { 
              if (!parent) break;

              const text = parent.textContent.trim();
              if (text && text.length < 30) {
                const link = parent.tagName === 'A' ? parent : parent.querySelector('a');
                const url = link ? (link.href || null) : null;
                
                const name = text;
                if (name && !results.some(r => r.name === name)) {
                  results.push({ name, url, img: img.src });
                }
                
                break;
              }
              
              parent = parent.parentElement;
            }
          }
        }
        
        console.log(`After alternative approach, found ${results.length} categories`);
      }

      if (results.length < 8) {
        console.log('Still not enough categories, trying final approach');

        const navElements = document.querySelectorAll('nav, [role="navigation"], header, [class*="menu"], [class*="nav"]');
        
        for (const nav of navElements) {
          const items = nav.querySelectorAll('a, li, div[role="button"], [class*="item"]');
          
          if (items.length >= 5) { 
            for (const item of items) {

              const text = item.textContent.trim();
              if (text && text.length > 2 && text.length < 30) { // Reasonable length for a category name
                const link = item.tagName === 'A' ? item : item.querySelector('a');
                const url = link ? (link.href || null) : null;

                const img = item.querySelector('img')?.src || null;

                const name = text;
                if (name && !results.some(r => r.name === name)) {
                  results.push({ name, url, img });
                }
              }
            }
          }
        }
        
        console.log(`After final approach, found ${results.length} categories`);
      }

      if (results.length < 8) {
        console.log('Using hardcoded categories as last resort');

        const hardcodedCategories = [
          { 
            name: 'Minutes', 
            url: 'https://www.flipkart.com/flipkart-minutes-store?marketplace=HYPERLOCAL&fm=neo%2Fmerchandising&iid=M_498ef42f-84a9-44dc-bfa0-b5c50b6a1108_2_X1NCR146KC29_MC.HPVQFYHAHC9Q&otracker=hp_rich_navigation_1_2.navigationCard.RICH_NAVIGATION_Minutes_HPVQFYHAHC9Q&otracker1=hp_rich_navigation_PINNED_neo%2Fmerchandising_NA_NAV_EXPANDABLE_navigationCard_cc_1_L0_view-all&cid=HPVQFYHAHC9Q',
            img: 'https://rukminim2.flixcart.com/fk-p-flap/128/128/image/a22a213ca6221b65.png?q=100'
          },
          { 
            name: 'Mobiles & Tablets', 
            url: 'https://www.flipkart.com/mobile-phones-store?param=4111&fm=neo%2Fmerchandising&iid=M_498ef42f-84a9-44dc-bfa0-b5c50b6a1108_2_X1NCR146KC29_MC.AH1NTIJZ241Z&otracker=hp_rich_navigation_2_2.navigationCard.RICH_NAVIGATION_Mobiles%2B%26%2BTablets_AH1NTIJZ241Z&otracker1=hp_rich_navigation_PINNED_neo%2Fmerchandising_NA_NAV_EXPANDABLE_navigationCard_cc_2_L0_view-all&cid=AH1NTIJZ241Z',
            img: 'https://rukminim2.flixcart.com/fk-p-flap/128/128/image/5f2ee7f883cdb774.png?q=100'
          },
          { 
            name: 'Fashion', 
            url: 'https://www.flipkart.com/clothing-and-accessories/pr?sid=clo',
            img: 'https://rukminim2.flixcart.com/fk-p-flap/128/128/image/ff559cb9d803d424.png?q=100'
          },
          { 
            name: 'Electronics', 
            url: 'https://www.flipkart.com/electronics-store',
            img: 'https://rukminim2.flixcart.com/fk-p-flap/128/128/image/af646c36d74c4be9.png?q=100'
          },
          { 
            name: 'Home & Furniture', 
            url: 'https://www.flipkart.com/home-furnishing/pr?sid=jra',
            img: 'https://rukminim2.flixcart.com/fk-p-flap/128/128/image/1788f177649e6991.png?q=100'
          },
          { 
            name: 'TVs & Appliances', 
            url: 'https://www.flipkart.com/fk-sasalele-sale-tv-and-appliances-may25-at-store?param=3783&fm=neo%2Fmerchandising&iid=M_498ef42f-84a9-44dc-bfa0-b5c50b6a1108_2_X1NCR146KC29_MC.YX88A89LFA7C&otracker=hp_rich_navigation_6_2.navigationCard.RICH_NAVIGATION_TVs%2B%26%2BAppliances_YX88A89LFA7C&otracker1=hp_rich_navigation_PINNED_neo%2Fmerchandising_NA_NAV_EXPANDABLE_navigationCard_cc_6_L0_view-all&cid=YX88A89LFA7C',
            img: 'https://rukminim2.flixcart.com/fk-p-flap/128/128/image/e90944802d996756.jpg?q=100'
          },
          { 
            name: 'Flight Bookings', 
            url: 'https://www.flipkart.com/travel/flights?param=bsd-2025-booknow&fm=neo%2Fmerchandising&iid=M_498ef42f-84a9-44dc-bfa0-b5c50b6a1108_2_X1NCR146KC29_MC.LE8A9JOLY9F3&otracker=hp_rich_navigation_7_2.navigationCard.RICH_NAVIGATION_Flight%2BBookings_LE8A9JOLY9F3&otracker1=hp_rich_navigation_PINNED_neo%2Fmerchandising_NA_NAV_EXPANDABLE_navigationCard_cc_7_L0_view-all&cid=LE8A9JOLY9F3',
            img: null
          },
          { 
            name: 'Beauty, Food..', 
            url: 'https://www.flipkart.com/beauty-and-grooming/pr?sid=g9b',
            img: null
          },
          { 
            name: 'Grocery', 
            url: 'https://www.flipkart.com/grocery-supermart-store?marketplace=GROCERY&fm=neo%2Fmerchandising&iid=M_498ef42f-84a9-44dc-bfa0-b5c50b6a1108_2_X1NCR146KC29_MC.XO8YX5A5U8SC&otracker=hp_rich_navigation_9_2.navigationCard.RICH_NAVIGATION_Grocery_XO8YX5A5U8SC&otracker1=hp_rich_navigation_PINNED_neo%2Fmerchandising_NA_NAV_EXPANDABLE_navigationCard_cc_9_L0_view-all&cid=XO8YX5A5U8SC',
            img: null
          }
        ];

        for (const cat of hardcodedCategories) {
          const existingCat = results.find(r => r.name === cat.name);
          if (!existingCat) {

            results.push(cat);
          } else {
            if (!existingCat.url && cat.url) {
              existingCat.url = cat.url;
            }
            if (!existingCat.img && cat.img) {
              existingCat.img = cat.img;
            }
          }
        }
        
        console.log(`After adding hardcoded categories, found ${results.length} categories`);
      }

      return results;
    });

    // Save results to file
    const filePath = path.resolve('dynamicCategoryMapping.json');

    const categoryObject = {};
    categories.forEach(category => {
      categoryObject[category.name] = category;
    });

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

      for (const catName in categoryObject) {
        if (categoryObject[catName].url) {

          categoryObject[catName].url = categoryObject[catName].url.replace(/`/g, '').trim();
        }
        if (categoryObject[catName].img) {
          categoryObject[catName].img = categoryObject[catName].img.replace(/`/g, '').trim();
        }
      }
     
     fs.writeFileSync(filePath, JSON.stringify(categoryObject, null, 2));

    console.log(`✅ ${categories.length} categories scraped and saved to ${filePath}`);
  } catch (error) {
    console.error('❌ Scraping failed:', error);
  } finally {
    await browser.close();
  }
}

