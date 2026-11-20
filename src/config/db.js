const mongoose = require('mongoose');

const connectDB = async (uri = process.env.MONGO_URI) => {
  if (!uri) throw new Error('MONGO_URI is not defined');
  await mongoose.connect(uri);
  console.log('MongoDB connected');
};

module.exports = connectDB;
