const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.log('ℹ️ No MONGO_URI provided in environment. Initializing in-memory MongoDB for local testing...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create();
        mongoUri = mongodInstance.getUri();
        console.log(`⚡ In-Memory MongoDB running at: ${mongoUri}`);
      } catch (memErr) {
        console.warn('⚠️ Could not start mongodb-memory-server:', memErr.message);
      }
    }

    if (mongoUri) {
      const conn = await mongoose.connect(mongoUri);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } else {
      console.warn('⚠️ MongoDB connection could not be established.');
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
  }
};

module.exports = connectDB;
