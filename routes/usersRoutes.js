// routes/usersRoutes.js
const express      = require('express');
const { protect }  = require('../middleware/authMiddleware');
const asyncHandler = require('express-async-handler');

const router = express.Router();

// GET /api/users/me
router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    res.json({ email: req.user.email });
  })
);

module.exports = router;

