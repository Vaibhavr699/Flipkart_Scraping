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
      if (subcategory) {
        const parentCategory = await Category.findById(subcategory.parentCategory);
        return {
          name: subcategory.name,
          parentName: parentCategory?.name || null,
          fullPath: parentCategory ? `${parentCategory.name} > ${subcategory.name}` : subcategory.name,
          type: 'subcategory'
        };
      }
    } else {
      const category = await Category.findById(categoryId);
      if (category) {
        return {
          name: category.name,
          parentName: null,
          fullPath: category.name,
          type: 'category'
        };
      }
    }
    return null;
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
    const result = [];

    for (const category of categories) {
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
      if (!parentCategory) return [];

      const subcategory = await Subcategory.findOne({
        name: subcategoryName,
        parentCategory: parentCategory._id
      });
      if (!subcategory) return [];

      if (subcategory) {
        return await ProductModel.find({ category: subcategory._id });
      }
    } else {
      const category = await Category.findOne({ name: parentName });
      if (category) {
        return await ProductModel.find({ category: category._id });
      }
    }

    return [];
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
