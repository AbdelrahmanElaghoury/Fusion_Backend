// controllers/answerController.js
const asyncHandler = require('express-async-handler');
const Answer       = require('../models/answerModel');
const Question     = require('../models/questionModel');

// allow either one object or an array
exports.createAnswer = asyncHandler(async (req, res) => {
  const payload = Array.isArray(req.body) ? req.body : [req.body];
  if (payload.length === 0) {
    return res.status(400).json({ message: 'No answers provided' });
  }

  // validate all question IDs
  const qIds = payload.map(a => a.questionId || a.question);
  const existCount = await Question.countDocuments({ _id: { $in: qIds } });
  if (existCount !== qIds.length) {
    return res.status(404).json({ message: 'One or more questions not found' });
  }

  const results = await Promise.all(payload.map(async a => {
    const qId = a.questionId || a.question;
    // see if an answer already exists
    const existing = await Answer.findOne({ user: req.user._id, question: qId });

    if (existing) {
      // update in place
      existing.answer = a.answer;
      await existing.save();
      return { doc: existing, created: false };
    } else {
      // create new
      const created = await Answer.create({
        user: req.user._id,
        question: qId,
        answer: a.answer
      });
      return { doc: created, created: true };
    }
  }));

  // if single‐object, return single
  if (!Array.isArray(req.body)) {
    const { doc, created } = results[0];
    return res.status(created ? 201 : 200).json(doc);
  }

  // for array, always 201
  return res.status(201).json(results.map(r => r.doc));
});

exports.getUserAnswers = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.productKey) {
    // filter by questionId prefix "ProductName::qId"
    filter.question = new RegExp(`^${req.query.productKey}::`);
  }
  const answers = await Answer.find(filter);
  res.json(answers);
});
