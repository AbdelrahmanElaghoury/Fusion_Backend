// models/answerModel.js
const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    answer:   { type: String, required: true }  // store whatever user chose or typed
  },
  { timestamps: true }
);

module.exports = mongoose.model('Answer', answerSchema);
