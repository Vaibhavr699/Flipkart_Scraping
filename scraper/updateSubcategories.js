import { updateSubcategoryMappings } from './subcategoryScraper.js';

console.log('🚀 Starting subcategory mapping update...');

updateSubcategoryMappings()
  .then(() => {
    console.log('✅ Subcategory mapping update completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Subcategory mapping update failed:', error);
    process.exit(1);
  });