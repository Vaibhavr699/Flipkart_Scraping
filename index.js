import 'dotenv/config';
import mongoose from 'mongoose';
import { productSchema } from './models/Product.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const categoryCollectionMap = {
  // Electronics
  'Electronics': 'electronics',
  'Mobiles': 'mobiles',
  'Laptops': 'laptops',
  'Mobile Accessories': 'mobile_accessories',
  'Smart Wearable': 'smart_wearable',
  'Cameras': 'cameras',

  // TV & Appliances
  'TV & Appliances': 'tv_appliances',
  'Washing Machines': 'washing_machines',
  'Air Conditioners': 'air_conditioners',

  // Home & Kitchen
  'Home & Kitchen': 'home_kitchen',
  'Kitchen Appliances': 'kitchen_appliances',
  'Tableware & Dinnerware': 'tableware_dinnerware',
  'Living Room Furniture': 'living_room_furniture',
  'Home Decor': 'home_decor',

  // Men Clothing
  'Men Clothing': 'men_clothing',
  'Men Top Wear': 'men_top_wear',
  'Men Bottom Wear': 'men_bottom_wear',

  // Women Clothing
  'Women Clothing': 'women_clothing',
  'Women Top Wear': 'women_top_wear',
  'Women Bottom Wear': 'women_bottom_wear',

  // Appliances (general)
  'Appliances': 'appliances',
};

function getProductCollectionName(categoryName) {
  const base = categoryCollectionMap[categoryName] || categoryName;
  return base.toLowerCase();
}

function getProductModelForCategory(categoryName) {
  const collectionName = getProductCollectionName(categoryName);
  // Avoid OverwriteModelError
  if (mongoose.models[collectionName]) {
    return mongoose.models[collectionName];
  }
  return mongoose.model(collectionName, productSchema, collectionName);
}

// Import the scraping functions from the scraper files
import { scrapeCategories } from './scraper/categoryScraper.js';
import { scrapeAndSaveAll } from './scraper/scrapeAllToMongo.js';

async function main() {
  try {
    console.log('Step 1: Scraping categories from Flipkart...');
    await scrapeCategories();
    console.log('Categories scraped successfully!');
    
    console.log('Step 2: Scraping subcategories and products and saving to MongoDB...');
    await scrapeAndSaveAll();
    console.log('Subcategories and products scraped and saved successfully!');
    
    console.log('All scraping tasks completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error in scraping process:', error);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});