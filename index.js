require('dotenv').config();
const connectDB = require('./db');
const Category = require('./models/Category');
const Subcategory = require('./models/Subcategory');
const mongoose = require('mongoose');
const categories = require('./categories/staticCategories');
const { scrapeAllProducts } = require('./scraper/flipkartProducts');
const productSchema = require('./models/Product').schema;

// Professional and minimal category mapping with electronics subcategories
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

async function main() {
  await connectDB();

  for (const categoryData of categories) {
    // Save main category
    const categoryDoc = await Category.findOneAndUpdate(
      { url: categoryData.url },
      { $set: { name: categoryData.name, url: categoryData.url, scrapedAt: new Date() } },
      { upsert: true, new: true }
    );
    console.log(`Saved main category: ${categoryData.name}`);

    // Save subcategories for this main category
    if (categoryData.subcategories && categoryData.subcategories.length > 0) {
      for (const subcategoryData of categoryData.subcategories) {
        const subcategoryDoc = await Subcategory.findOneAndUpdate(
          { url: subcategoryData.url },
          {
            $set: {
              name: subcategoryData.name,
              url: subcategoryData.url,
              parentCategory: categoryDoc._id,
              scrapedAt: new Date()
            }
          },
          { upsert: true, new: true }
        );
        console.log(`Saved subcategory: ${subcategoryData.name} under ${categoryData.name}`);

        // Scrape products for this subcategory only
        console.log(`Scraping all pages of products for subcategory: ${subcategoryData.name}`);
        const subcategoryProducts = await scrapeAllProducts(subcategoryData.url);
        console.log(`Found ${subcategoryProducts.length} products in subcategory: ${subcategoryData.name}`);

        // Get the model for this subcategory's products collection
        const SubcategoryProductModel = getProductModelForCategory(subcategoryData.name);

        // Save subcategory products
        for (const product of subcategoryProducts) {
          await SubcategoryProductModel.findOneAndUpdate(
            { productUrl: product.productUrl },
            {
              $set: {
                ...product,
                category: subcategoryDoc._id,
                categoryType: 'subcategory',
                categoryModel: 'Subcategory',
                scrapedAt: new Date()
              }
            },
            { upsert: true, new: true }
          );
        }
        console.log(`Saved ${subcategoryProducts.length} products for subcategory: ${subcategoryData.name}`);
      }
    }
  }

  console.log('All subcategories and all paginated products saved to MongoDB in separate collections!');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
}); 