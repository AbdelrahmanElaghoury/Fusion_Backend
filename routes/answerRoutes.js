const express                = require('express');
const { protect }            = require('../middleware/authMiddleware');
const { createAnswer, getUserAnswers } = require('../controllers/answerController');
const router                 = express.Router();

router.use(protect);

// POST will now upsert
router.post('/', createAnswer);

// GET all
router.get('/', getUserAnswers);

module.exports = router;
