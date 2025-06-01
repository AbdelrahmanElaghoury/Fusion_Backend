// models/questionModel.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    questionId:   { type: String, required: true, unique: true },
    questionText: { type: String, required: true },
    type:         { type: String, required: true, enum: ['radio','text'] },
    options:      { type: [String], default: [] },
    category:     { type: String, required: true, enum: ['personal','medical','product'] },
    productKey:   { type: String, default: null }  // e.g. "Topical Cream HQ8"
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
