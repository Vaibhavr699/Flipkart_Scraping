import mongoose from 'mongoose';

const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true, unique: true },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  scrapedAt: { type: Date, default: Date.now }
});

const Subcategory = mongoose.model('Subcategory', subcategorySchema);

export default Subcategory;
export { subcategorySchema };