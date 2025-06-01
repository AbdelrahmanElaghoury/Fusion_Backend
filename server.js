// server.js

// 1️⃣ Load the correct .env based on NODE_ENV
const envFile =
  process.env.NODE_ENV === 'test'       ? '.env.test'
: process.env.NODE_ENV === 'production' ? '.env.production'
:                                         '.env';
require('dotenv').config({ path: envFile });

const mongoose = require('mongoose');
const app      = require('./app');     // <-- your express() + routers

// 2️⃣ Only auto-connect + listen when NOT in test
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGODB_URI, {
    dbName:           process.env.DB_NAME,
    useNewUrlParser:  true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('✅ MongoDB connected');
    const port = process.env.PORT || 5001;
    app.listen(port, () => console.log(`🚀 Listening on ${port}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
}

// 3️⃣ Export the app directly for supertest
module.exports = app;
