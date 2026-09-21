const mongoose = require('mongoose');

/**
 * Establishes connection to MongoDB Atlas.
 * Exits the process on failure so process managers (pm2, docker) can restart it.
 */
const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: process.env.NODE_ENV !== 'production',
    });

    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error(`[MongoDB] Connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Disconnected. Attempting to reconnect is handled by the driver.');
    });

    return conn;
  } catch (error) {
    console.error(`[MongoDB] Initial connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
