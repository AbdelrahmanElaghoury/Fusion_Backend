require('dotenv').config(); // Loads .env variables
const mongoose = require('mongoose');
const MainConcerns = require('../models/mainConcernsModel.js');

const mainConcerns = [
  {
    main_concern_name: "Dark Spots",
    subConcerns: [
      { name: "Melasma", imageUrl: "/assets/concern_FrecklesFace2.jpg" }
    ]
  },
  {
    main_concern_name: "Anti-Aging",
    subConcerns: [
      { name: "Wrinkles (Face)", imageUrl: "/assets/concern_WrinklesFace.jpg" }
    ]
  },
  {
    main_concern_name: "Aging-Hair",
    subConcerns: [
      { name: "Thinning (Women)", imageUrl: "/assets/concern_Thinning2.jpg" }
    ]
  },
  {
    main_concern_name: "Menopause",
    subConcerns: [
      { name: "Hot Flashes", imageUrl: "/assets/concern_HotFlashes.jpg" }
    ]
  },
  {
    main_concern_name: "Migraine",
    subConcerns: [
      { name: "Migraine", imageUrl: "/assets/Migraine.jpg" }
    ]
  },
  {
    main_concern_name: "Scars",
    subConcerns: [
      { name: "Scars", imageUrl: "/assets/concern_AcneScarsFace.jpg" }
    ]
  }
];

async function seedMainConcerns() {
  try {
    // 1. Connect
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'fusion_ecommerce_store',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB for mainConcerns seeding');

    // 2. Clear & Insert
    await MainConcerns.deleteMany({});
    console.log('🗑  Cleared existing mainConcerns');
    await MainConcerns.insertMany(mainConcerns);
    console.log(`✅ Seeded ${mainConcerns.length} mainConcerns`);

    // 3. Disconnect
    await mongoose.disconnect();
    console.log('👋 Disconnected, done.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedMainConcerns();
