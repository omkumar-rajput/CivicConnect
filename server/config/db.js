// Database connection configuration using Mongoose
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civicconnect';
    
    const conn = await mongoose.connect(mongoUri);
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    console.warn(`[Database Tip] Please make sure your MongoDB URI is set properly in .env`);
    // In production we exit, but in dev we keep server alive to allow debugging
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
