// tests/setup.js
const mongoose              = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

module.exports = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri   = mongoServer.getUri();
  await mongoose.connect(uri, { dbName: 'fusion_test' });
  global.__MONGOSERVER__ = mongoServer;
};
