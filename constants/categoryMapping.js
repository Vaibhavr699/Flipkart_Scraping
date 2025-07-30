// Category to collection name mapping for consistent MongoDB collection naming
export const categoryCollectionMap = {
  'Minutes': 'products_minutes',
  'Mobiles & Tablets': 'products_mobiles_tablets',
  'Fashion': 'products_fashion',
  'Electronics': 'products_electronics',
  'Home & Furniture': 'products_home_furniture',
  'TVs & Appliances': 'products_tvs_appliances',
  'Flight Bookings': 'products_flight_bookings',
  'Beauty, Food..': 'products_beauty_food',
  'Grocery': 'products_grocery',
  'Appliances': 'products_appliances'
};

// Helper function to get collection name from category name
export function getProductCollectionName(categoryName) {
  // Use predefined mapping if available
  if (categoryCollectionMap[categoryName]) {
    return categoryCollectionMap[categoryName];
  }
  
  // Fallback to auto-generation
  return 'products_' + categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}