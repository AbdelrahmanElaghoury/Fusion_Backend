// controllers/questionController.js
const asyncHandler = require('express-async-handler');
const Question     = require('../models/questionModel');

// @desc    Fetch all questions, optional filters
// @route   GET /api/questions
exports.getQuestions = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.category)   filter.category   = req.query.category;
  if (req.query.productKey) filter.productKey = req.query.productKey;
  const questions = await Question.find(filter).sort({ category: 1, _id: 1 });
  res.json(questions);
});

// @desc    Fetch single question by Mongo _id
// @route   GET /api/questions/:id
exports.getQuestionById = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (!question) return res.status(404).json({ message: 'Question not found' });
  res.json(question);
});
