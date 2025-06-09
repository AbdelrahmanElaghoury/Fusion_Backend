// data/seedAdmin.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Profile = require('../models/profileModel');

const ADMIN_EMAIL = 'mohand@fusion.com';
const ADMIN_PASSWORD = 'fusionadmin123'; // Change after first login!
const ADMIN_FIRSTNAME = 'Admin';
const ADMIN_LASTNAME = 'Fusion';

async function seedAdmin() {
  try {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.DB_NAME || 'fusion_ecommerce_store';

    await mongoose.connect(uri, { dbName });
    console.log(`✅ Connected to MongoDB "${dbName}" for seeding`);

    // Check if admin already exists
    const exists = await User.findOne({ email: ADMIN_EMAIL });
    if (exists) {
      console.log('✅ Admin user already exists:', exists.email);
      return process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      firstName: ADMIN_FIRSTNAME,
      lastName: ADMIN_LASTNAME,
      role: 'admin',
    });

    // Optionally create a profile for the admin
    await Profile.create({ user: admin._id });

    console.log('🎉 Admin user seeded successfully!');
    console.log('   Email:', ADMIN_EMAIL);
    console.log('   Password:', ADMIN_PASSWORD);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seedAdmin();
