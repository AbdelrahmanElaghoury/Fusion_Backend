require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('../models/serviceModel');

const categories = [
  {
    name: "Hormone Replacement Therapy",
    services: ["Menopause"],
  },
  {
    name: "Pain Management",
    services: ["Migraine"],
  },
  {
    name: "Dermatology",
    services: ["Dark Spots", "Anti Aging", "Aging Hair", "Scars"],
  },
  {
    name: "Veterinary",
    services: [],
  },
];

const servicesToSeed = categories.flatMap(cat =>
  cat.services.map(service => ({
    name: service,
    category: cat.name,
  }))
);

async function seedServices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || "fusion_ecommerce_store",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB for services seeding");

    await Service.deleteMany({});
    console.log("🗑  Cleared existing services");

    await Service.insertMany(servicesToSeed);
    console.log(`✅ Seeded ${servicesToSeed.length} services`);

    await mongoose.disconnect();
    console.log("👋 Disconnected, done.");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedServices();
