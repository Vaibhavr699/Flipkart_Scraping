import puppeteer from 'puppeteer';
import fs from 'fs';
import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import connectDB from '../db.js';
import { scrapeAllProducts } from './flipkartProducts.js';
import { productSchema } from '../models/Product.js';
import { getProductCollectionName } from '../constants/categoryMapping.js';

const categories = JSON.parse(fs.readFileSync('dynamicCategoryMapping.json', 'utf-8'));

function getCollectionName(name) {
  return getProductCollectionName(name);
}

export async function scrapeAndSaveAll() {
  await connectDB();

  console.log('productSchema type:', typeof productSchema, productSchema instanceof mongoose.Schema);
  for (const [catName, catObj] of Object.entries(categories)) {
    if (!catObj.url || !catObj.url.startsWith('http')) continue;

    let categoryDoc = await Category.findOneAndUpdate(
      { name: catName },
      { $set: { name: catName, url: catObj.url, scrapedAt: new Date() } },
      { upsert: true, new: true }
    );

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(catObj.url, { waitUntil: 'networkidle2' });
    const subcategories = await page.evaluate(() => {
      let links = Array.from(document.querySelectorAll('section.Iu4qXa a.uWfXeF, section.Iu4qXa a.hEjLuS.WyLc0s'));
      if (links.length === 0) {
        links = Array.from(document.querySelectorAll('a[title][href*="pr?sid="]'));
      }
      return links.map(a => ({
        name: a.getAttribute('title') || a.textContent.trim(),
        url: a.href
      })).filter(sub => sub.name && sub.url);
    });
    await browser.close();
    if (subcategories.length > 0) {
      for (const sub of subcategories) {
        let subDoc = await Subcategory.findOneAndUpdate(
          { name: sub.name, parentCategory: categoryDoc._id },
          { $set: { name: sub.name, url: sub.url, parentCategory: categoryDoc._id, scrapedAt: new Date() } },
          { upsert: true, new: true }
        );
        try {
          const products = await scrapeAllProducts(sub.url);
          const collectionName = getCollectionName(sub.name);
          const ProductModel = mongoose.models[collectionName] || mongoose.model(collectionName, productSchema);
          for (const product of products) {
            await ProductModel.findOneAndUpdate(
              { productUrl: product.productUrl },
              {
                $set: {
                  ...product,
                  category: subDoc._id,
                  categoryType: 'Subcategory',
                  scrapedAt: new Date()
                }
              },
              { upsert: true, new: true }
            );
          }
          console.log(`Saved ${products.length} products for subcategory: ${sub.name} in collection: ${collectionName}`);
        } catch (err) {
          console.error(`Error scraping products for subcategory ${sub.name}:`, err);
        }
      }
    } else {

      try {
        const products = await scrapeAllProducts(catObj.url);
        const collectionName = getCollectionName(catName);
        const ProductModel = mongoose.models[collectionName] || mongoose.model(collectionName, productSchema);
        for (const product of products) {
          await ProductModel.findOneAndUpdate(
            { productUrl: product.productUrl },
            {
              $set: {
                ...product,
                category: categoryDoc._id,
                categoryType: 'Category',
                scrapedAt: new Date()
              }
            },
            { upsert: true, new: true }
          );
        }
        console.log(`Saved ${products.length} products for main category: ${catName} in collection: ${collectionName}`);
      } catch (err) {
        console.error(`Error scraping products for main category ${catName}:`, err);
      }
    }
  }
  console.log('All categories, subcategories, and products saved to MongoDB in separate collections.');
  process.exit(0);
}

