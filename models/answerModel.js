const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: String, required: true }, // just store the questionId from JSON
    answer:   { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Answer', answerSchema);
