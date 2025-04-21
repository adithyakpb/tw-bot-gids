import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    // Connect to MongoDB using the URI from .env
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tw_gids_db', {
      // These options are no longer needed in newer versions of Mongoose
      // but keeping them for compatibility with older versions
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
