const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Profile = require('../models/profileModel');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });

exports.signup = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;
  if (!email || !password || !firstName) {
    return res.status(400).json({ message: 'Email, password, and firstName required' });
  }
  if (await User.findOne({ email })) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const user = await User.create({ email, password, firstName, lastName, role });
  await Profile.create({ user: user._id });
  const token = signToken(user._id);

  // Set HTTP-only cookie:
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // set true in prod
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  res.status(201).json({
    message: 'User created',
    user: { email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }
    // Don't need to return the token here unless you want to support localStorage as fallback
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = signToken(user._id);

  // Set HTTP-only cookie:
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // set true in prod
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  res.json({
    message: 'Logged in!',
    user: { email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }
    // Don't need to return the token here unless you want to support localStorage as fallback
  });
});

// LOGOUT: Just clear the cookie
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
};
