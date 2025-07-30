import mongoose from 'mongoose';
import 'dotenv/config';

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI not found in environment variables');
  }

  // Production-ready connection options
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    maxPoolSize: 10, // Maintain up to 10 socket connections
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    heartbeatFrequencyMS: 10000, // Send keepalive ping every 10 seconds
    retryWrites: true,
    retryReads: true
  };

  try {
    await mongoose.connect(uri, options);
    console.log('✅ Successfully connected to MongoDB');

    // Log connection status
    const connectionState = mongoose.connection.readyState;
    console.log(`🔄 MongoDB connection state: ${getConnectionState(connectionState)}`);
  } catch (err) {
    console.error('❌ MongoDB initial connection error:', err);
    
    // For production, you might want to implement a retry mechanism here
    if (process.env.NODE_ENV === 'production') {
      console.log('⏳ Attempting to reconnect...');
      setTimeout(connectDB, 5000); // Retry after 5 seconds
    } else {
      process.exit(1);
    }
  }

  // Event handlers for connection state changes
  mongoose.connection.on('connected', () => {
    console.log('🔄 MongoDB connected');
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected');
    
    // In production, you might want to attempt reconnection
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

  // Close the Mongoose connection when Node process ends
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🛑 MongoDB connection disconnected through app termination');
    process.exit(0);
  });
}

// Helper function to translate connection state codes
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