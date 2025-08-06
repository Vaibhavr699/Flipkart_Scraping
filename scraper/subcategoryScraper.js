import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export async function scrapeSubcategories(categoryUrl, categoryName) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
  );

  try {
    console.log(`🔄 Scraping subcategories for ${categoryName}...`);
    
    await page.goto(categoryUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    try {
      await page.waitForSelector('button._2KpZ6l._2doB4z', { timeout: 5000 });
      await page.click('button._2KpZ6l._2doB4z');
    } catch {
      console.log('Login popup not found or already closed.');
    }

    await new Promise(resolve => setTimeout(resolve, 3000));

    const subcategories = await page.evaluate((catName) => {
      const baseUrl = 'https://www.flipkart.com';
      let subcatNodes = [];
      
      // Strategy 1: Look for sidebar navigation with subcategories
      const sidebarSelectors = [
        'div._1AtVbE div._1MR4oE',
        'div._1AtVbE div._3FdLqY',
        'div._1AtVbE div._1UoZlX',
        'div._1AtVbE div._3sckoD',
        'div._1AtVbE ul._3xGbi-',
        'div._1AtVbE div._2d0we9'
      ];

      for (const selector of sidebarSelectors) {
        const sidebar = document.querySelector(selector);
        if (sidebar) {
          const links = sidebar.querySelectorAll('a');
          if (links.length > 1) {
            subcatNodes = Array.from(links);
            break;
          }
        }
      }

      // Strategy 2: Look for filter sections with categories
      if (subcatNodes.length === 0) {
        const filterSections = document.querySelectorAll('div._1AtVbE section, div._1AtVbE div[data-testid]');
        for (const section of filterSections) {
          const header = section.querySelector('div, h3, span');
          if (header && header.textContent.toLowerCase().includes('category')) {
            const links = section.querySelectorAll('a, div[role="button"]');
            if (links.length > 0) {
              subcatNodes = Array.from(links);
              break;
            }
          }
        }
      }

      // Strategy 3: Look for breadcrumb-like navigation
      if (subcatNodes.length === 0) {
        const breadcrumb = document.querySelector('div._1MR4oE, div._3FdLqY');
        if (breadcrumb) {
          const links = breadcrumb.querySelectorAll('a');
          if (links.length > 1) {
            subcatNodes = Array.from(links).slice(1); // Skip the main category
          }
        }
      }

      // Strategy 4: Look for grid/list of subcategory cards
      if (subcatNodes.length === 0) {
        const gridSelectors = [
          'div._1AtVbE a._1fQZEK',
          'div._1AtVbE a._2UzuFa',
          'div._1AtVbE div._3xGbi- a',
          'div._1AtVbE a[href*="/pr/"]'
        ];

        for (const selector of gridSelectors) {
          const items = document.querySelectorAll(selector);
          if (items.length > 2 && items.length < 50) { // Reasonable range
            subcatNodes = Array.from(items);
            break;
          }
        }
      }

      const results = [];

      for (const node of subcatNodes) {
        let name = node.textContent?.trim() || '';
        
        // Clean up the name
        name = name.replace(/\s+/g, ' ').trim();
        if (name.length > 50) name = name.substring(0, 50).trim();
        
        // Skip if name is too generic or matches parent category
        if (!name || name.toLowerCase() === catName.toLowerCase() || 
            name.length < 2 || name.includes('Home')) continue;

        const relativeUrl = node.getAttribute('href');
        const url = relativeUrl ? new URL(relativeUrl, baseUrl).href : null;

        if (name && url && url.includes('flipkart.com')) {
          results.push({
            group: catName,
            name: name,
            url: url
          });
        }
      }

      // Remove duplicates
      const uniqueResults = [];
      const seenNames = new Set();
      
      for (const item of results) {
        if (!seenNames.has(item.name.toLowerCase())) {
          seenNames.add(item.name.toLowerCase());
          uniqueResults.push(item);
        }
      }

      return uniqueResults;
    }, categoryName);

    console.log(`✅ Found ${subcategories.length} subcategories for ${categoryName}`);
    
    await browser.close();
    return subcategories;

  } catch (error) {
    console.error(`❌ Error scraping subcategories for ${categoryName}:`, error.message);
    await browser.close();
    return [];
  }
}

export async function scrapeAllSubcategories(categoryMapping) {
  const allSubcategories = {};
  
  for (const [categoryName, categoryData] of Object.entries(categoryMapping)) {
    if (categoryData.url) {
      const subcats = await scrapeSubcategories(categoryData.url, categoryName);
      allSubcategories[categoryName] = subcats;
    } else {
      console.log(`⚠️ No URL found for category: ${categoryName}`);
      allSubcategories[categoryName] = [];
    }
  }
  
  return allSubcategories;
}

// Main function to update subcategory mappings
export async function updateSubcategoryMappings() {
  try {
    const categoryMappingPath = path.resolve('dynamicCategoryMapping.json');
    const subcategoryMappingPath = path.resolve('dynamicSubcategoryMapping.json');
    
    if (!fs.existsSync(categoryMappingPath)) {
      console.error('❌ dynamicCategoryMapping.json not found. Run category scraper first.');
      return;
    }

    const categoryMapping = JSON.parse(fs.readFileSync(categoryMappingPath, 'utf8'));
    console.log(`📋 Found ${Object.keys(categoryMapping).length} categories to process`);

    const subcategories = await scrapeAllSubcategories(categoryMapping);
    
    // Write the updated subcategory mappings
    fs.writeFileSync(subcategoryMappingPath, JSON.stringify(subcategories, null, 2));
    
    console.log(`✅ Subcategory mappings updated with ${Object.keys(subcategories).length} categories`);
    return subcategories;
    
  } catch (error) {
    console.error('❌ Error updating subcategory mappings:', error.message);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateSubcategoryMappings();
}