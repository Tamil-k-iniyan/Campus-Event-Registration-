const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_events');
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Error] Failed to connect: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
