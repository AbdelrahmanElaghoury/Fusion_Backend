// routes/authRoutes.js
console.log('🔌 routes/auth loaded');

const express = require('express');
const { signup, login } = require('../controllers/authController');
const router = express.Router();

// Ping to verify the router is live:
router.get('/_ping', (req, res) => {
  console.log('🏓 /api/auth/_ping hit');
  res.json({ alive: true });
});

// POST /api/auth/signup
router.post('/signup', signup);

// POST /api/auth/login
router.post('/login', login);

module.exports = router;
