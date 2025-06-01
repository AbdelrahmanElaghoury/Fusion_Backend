const asyncHandler = require('express-async-handler');
const jwt          = require('jsonwebtoken');
const User         = require('../models/userModel');
const Profile      = require('../models/profileModel');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });

// @route POST /api/auth/signup
exports.signup = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;
  if (!email || !password || !firstName) {
    return res.status(400).json({ message: 'Email, password, and firstName required' });
  }
  if (await User.findOne({ email })) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Create user (allow tests to pass in role='admin' if desired)
  const user = await User.create({ email, password, firstName, lastName, role });

  // **Eagerly bootstrap an empty Profile** so downstream routes never have to "auto-create" it
  await Profile.create({ user: user._id });

  const token = signToken(user._id);
  res.status(201).json({
    message: 'User created',
    token,
    userId: user._id,
    role:   user.role
  });
});

// @route POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = signToken(user._id);
  res.json({
    message: 'Logged in!',
    token,
    userId: user._id,
    role:   user.role
  });
});
