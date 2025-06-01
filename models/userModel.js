// models/userModel.js
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

const userSchema = new mongoose.Schema({
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true, select: false },
  firstName: { type: String, required: true },
  lastName:  String,
  role:      { type: String, enum: ['user','admin'], default: 'user' },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare candidate password
userSchema.methods.correctPassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
