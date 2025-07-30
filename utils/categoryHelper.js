import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';

/**
 * Get category information from ID
 * @param {string} categoryId - The category ID
 * @param {string} categoryType - 'category' or 'subcategory'
 * @returns {Object|null} Category information with name, parentName, and fullPath
 */
export async function getCategoryInfo(categoryId, categoryType) {
  try {
    if (categoryType === 'subcategory') {
      const subcategory = await Subcategory.findById(categoryId);
      if (!subcategory) {
        console.warn(`Subcategory not found with ID: ${categoryId}`);
        return null;
      }
      
      const parentCategory = await Category.findById(subcategory.parentCategory);
      if (!parentCategory) {
        console.warn(`Parent category not found for subcategory: ${subcategory.name} (parent ID: ${subcategory.parentCategory})`);
      }
      
      return {
        name: subcategory.name,
        parentName: parentCategory?.name || null,
        fullPath: parentCategory ? `${parentCategory.name} > ${subcategory.name}` : subcategory.name,
        type: 'subcategory'
      };
    } else {
      const category = await Category.findById(categoryId);
      if (!category) {
        console.warn(`Category not found with ID: ${categoryId}`);
        return null;
      }
      
      return {
        name: category.name,
        parentName: null,
        fullPath: category.name,
        type: 'category'
      };
    }
  } catch (error) {
    console.error('Error getting category info:', error);
    return null;
  }
}

/**
 * Get category name from ID (simple version)
 * @param {string} categoryId - The category ID
 * @param {string} categoryType - 'category' or 'subcategory'
 * @returns {string} Category name
 */
export async function getCategoryName(categoryId, categoryType) {
  const info = await getCategoryInfo(categoryId, categoryType);
  return info ? info.fullPath : 'Unknown Category';
}

/**
 * Populate products with category information
 * @param {Array} products - Array of product objects
 * @returns {Array} Products with populated category information
 */
export async function populateProductsWithCategories(products) {
  const populatedProducts = [];
  for (const product of products) {
    const categoryInfo = await getCategoryInfo(product.category, product.categoryType);
    populatedProducts.push({
      ...((typeof product.toObject === 'function') ? product.toObject() : product),
      categoryInfo
    });
  }
  return populatedProducts;
}

/**
 * Get all categories with their subcategories
 * @returns {Array} Categories with subcategories
 */
export async function getAllCategoriesWithSubcategories() {
  try {
    const categories = await Category.find({});
    if (!categories || categories.length === 0) {
      console.warn('No categories found in database');
      return [];
    }

    const result = [];

    for (const category of categories) {
      try {
        const subcategories = await Subcategory.find({ parentCategory: category._id });
        result.push({
          _id: category._id,
          name: category.name,
          url: category.url,
          subcategories: subcategories.map(sub => ({
            _id: sub._id,
            name: sub.name,
            url: sub.url
          }))
        });
      } catch (subError) {
        console.error(`Error processing category ${category.name}:`, subError);
        // Continue with other categories even if one fails
        continue;
      }
    }

    return result;
  } catch (error) {
    console.error('Error getting categories with subcategories:', error);
    return [];
  }
}

/**
 * Get products by category path
 * @param {string} categoryPath - e.g., "Electronics > Mobiles"
 * @param {Object} ProductModel - The product model to query
 * @returns {Array} Products in that category
 */
export async function getProductsByCategoryPath(categoryPath, ProductModel) {
  try {
    const [parentName, subcategoryName] = categoryPath.split(' > ');

    if (subcategoryName) {
      const parentCategory = await Category.findOne({ name: parentName });
      if (!parentCategory) {
        console.warn(`Parent category not found: ${parentName}`);
        return [];
      }

      const subcategory = await Subcategory.findOne({
        name: subcategoryName,
        parentCategory: parentCategory._id
      });
      if (!subcategory) {
        console.warn(`Subcategory not found: ${subcategoryName} under ${parentName}`);
        return [];
      }

      return await ProductModel.find({ category: subcategory._id });
    } else {
      const category = await Category.findOne({ name: parentName });
      if (!category) {
        console.warn(`Category not found: ${parentName}`);
        return [];
      }
      return await ProductModel.find({ category: category._id });
    }
  } catch (error) {
    console.error('Error getting products by category path:', error);
    return [];
  }
}

/**
 * Format product for display with category information
 * @param {Object} product - Product object
 * @returns {Object} Formatted product with category display
 */
export async function formatProductForDisplay(product) {
  const categoryInfo = await getCategoryInfo(product.category, product.categoryType);

  return {
    _id: product._id,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice,
    imageUrl: product.imageUrl,
    rating: product.rating,
    title: product.title,
    brand: product.brand,
    productUrl: product.productUrl,
    category: {
      id: product.category,
      name: categoryInfo?.fullPath || 'Unknown',
      type: product.categoryType
    },
    categoryInfo
  };
}
