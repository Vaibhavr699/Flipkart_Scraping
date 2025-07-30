import mongoose from 'mongoose';
import 'dotenv/config';

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI not found in environment variables');
  }

  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
    socketTimeoutMS: 45000,
    heartbeatFrequencyMS: 10000,
    retryWrites: true,
    retryReads: true
  };

  try {
    await mongoose.connect(uri, options);
    console.log('✅ Successfully connected to MongoDB');


    const connectionState = mongoose.connection.readyState;
    console.log(`🔄 MongoDB connection state: ${getConnectionState(connectionState)}`);
  } catch (err) {
    console.error('❌ MongoDB initial connection error:', err);
    
    if (process.env.NODE_ENV === 'production') {
      console.log('⏳ Attempting to reconnect...');
      setTimeout(connectDB, 5000);
    } else {
      process.exit(1);
    }
  }

  mongoose.connection.on('connected', () => {
    console.log('🔄 MongoDB connected');
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected');

    if (process.env.NODE_ENV === 'production') {
      setTimeout(connectDB, 5000);
    }
  });

  mongoose.connection.on('reconnected', () => {
    console.log('♻️ MongoDB reconnected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
  });

  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🛑 MongoDB connection disconnected through app termination');
    process.exit(0);
  });
}

function getConnectionState(state) {
  switch (state) {
    case 0: return 'disconnected';
    case 1: return 'connected';
    case 2: return 'connecting';
    case 3: return 'disconnecting';
    case 99: return 'uninitialized';
    default: return 'unknown';
  }
}

export default connectDB;