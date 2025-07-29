const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: String },
  imageUrl: { type: String },
  rating: { type: String },
  title: { type: String },
  brand: { type: String },
  originalPrice: { type: String },
  productUrl: { type: String, required: true, unique: true },
  category: { type: mongoose.Schema.Types.ObjectId, refPath: 'categoryType', required: true },
  categoryType: { type: String, enum: ['Category', 'Subcategory'], default: 'Category' }
});

// Virtual field to get category name
productSchema.virtual('categoryName').get(function() {
  return this.category ? this.category.name : null;
});

// Pre-save middleware to set the correct categoryType
productSchema.pre('save', function(next) {
  if (this.categoryType === 'Subcategory') {
    this.categoryType = 'Subcategory';
  } else {
    this.categoryType = 'Category';
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 