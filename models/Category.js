import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true, unique: true },
  scrapedAt: { type: Date, default: Date.now },
});

const Category = mongoose.model('Category', categorySchema);

// ✅ This fixes the error
export default Category;
export { categorySchema };
