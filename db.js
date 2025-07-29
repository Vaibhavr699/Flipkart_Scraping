import mongoose from 'mongoose';
import 'dotenv/config';

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI not found in .env');
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
}

export default connectDB;