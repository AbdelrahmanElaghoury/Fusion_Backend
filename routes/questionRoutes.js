// routes/questionRoutes.js
const express               = require('express');
const { getQuestions, getQuestionById } = require('../controllers/questionController');
const router                = express.Router();

router.get('/', getQuestions);
router.get('/:id', getQuestionById);

module.exports = router;
