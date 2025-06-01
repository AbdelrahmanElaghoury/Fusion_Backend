// data/seedProducts.js

require('dotenv').config();
const mongoose = require('mongoose');
const Product  = require('../models/productModel');
const rawProducts = require('./products');

async function seedProducts() {
  try {
    const uri    = process.env.MONGODB_URI;
    const dbName = process.env.DB_NAME || 'fusion_ecommerce_store';

    await mongoose.connect(uri, { dbName });
    console.log(`✅ Connected to MongoDB "${dbName}" for seeding`);

    //  Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Normalize and insert
    const toInsert = rawProducts.map(p => {
      const { Type, ...rest } = p;
      return { ...rest, type: Type };
    });
    await Product.insertMany(toInsert);
    console.log(`📦 Inserted ${toInsert.length} products`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seedProducts();
