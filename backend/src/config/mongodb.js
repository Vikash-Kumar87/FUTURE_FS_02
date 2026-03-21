const mongoose = require('mongoose');

let mongoConnected = false;

const connectMongo = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || !uri.trim()) {
    throw new Error('MONGODB_URI is missing in backend/.env');
  }

  await mongoose.connect(uri.trim());
  mongoConnected = true;
};

const isMongoConnected = () => mongoConnected && mongoose.connection.readyState === 1;

module.exports = {
  connectMongo,
  isMongoConnected,
};
