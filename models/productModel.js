const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  percentage: { type: String, default: '' }
}, { _id: false });

const productSchema = new mongoose.Schema({
  id:          { type: Number, required: true, unique: true },
  name:        { type: String, required: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true },
  type:        { type: String, enum: ['RX', 'OTC'], required: true },
  imageUrl:    { type: String, default: '' },

  ingredients: [ingredientSchema],
  concerns:    [{ type: String }],

  howWhy:    { type: String, default: '' },
  howToUse:  { type: String, default: '' },
  pairsWith: [{ type: String }],

  topIcon:  { type: String, default: '' },
  sideIcon: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
