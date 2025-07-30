import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


import { productSchema } from './models/Product.js';
import connectDB from './db.js';
import { scrapeCategories } from './scraper/categoryScraper.js';
import { scrapeAndSaveAll } from './scraper/scrapeAllToMongo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


function getProductModelForCategory(categoryName) {
  const collectionName = getProductCollectionName(categoryName);
  // Avoid OverwriteModelError
  if (mongoose.models[collectionName]) {
    return mongoose.models[collectionName];
  }
  return mongoose.model(collectionName, productSchema, collectionName);
}

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('MongoDB connected.');

    console.log('Step 1: Scraping categories from Flipkart...');
    await scrapeCategories();
    console.log('Categories scraped successfully!');

    console.log('Step 2: Scraping subcategories and products and saving to MongoDB...');
    await scrapeAndSaveAll();
    console.log('Subcategories and products scraped and saved successfully!');

    console.log('All scraping tasks completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error in scraping process:', error);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ Unhandled error in main:', err);
  process.exit(1);
});
