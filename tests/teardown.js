// tests/teardown.js
const mongoose = require('mongoose');

module.exports = async () => {
  await mongoose.disconnect();
  await global.__MONGOSERVER__.stop();
};
