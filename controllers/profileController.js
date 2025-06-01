// controllers/profileController.js
const asyncHandler = require('express-async-handler');
const Profile      = require('../models/profileModel');

/**
 * GET /api/profile
 * Get or create a profile for the logged-in user
 */
exports.getProfile = asyncHandler(async (req, res) => {
  let profile = await Profile.findOne({ user: req.user._id })
                             .populate('user','email firstName lastName');

  if (!profile) {
    profile = await Profile.create({ user: req.user._id });
    await profile.populate('user','email firstName lastName');
  }

  res.json({
    userId:         profile.user._id.toString(),
    email:          profile.user.email,
    firstName:      profile.user.firstName,
    lastName:       profile.user.lastName,
    addresses:      profile.addresses,
    paymentMethods: profile.paymentMethods,
    incompleteVisit: profile.incompleteVisit
  });
});

/**
 * PUT /api/profile
 * Bulk‐update addresses, paymentMethods, or incompleteVisit flag
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  const updates = {};
  if (req.body.addresses)       updates.addresses      = req.body.addresses;
  if (req.body.paymentMethods)  updates.paymentMethods = req.body.paymentMethods;
  if (typeof req.body.incompleteVisit === 'boolean') {
    updates.incompleteVisit = req.body.incompleteVisit;
  }

  const profile = await Profile.findOneAndUpdate(
    { user: req.user._id },
    { $set: updates },
    { new: true, upsert: true }
  ).populate('user','email firstName lastName');

  res.json({
    userId:         profile.user._id.toString(),
    email:          profile.user.email,
    firstName:      profile.user.firstName,
    lastName:       profile.user.lastName,
    addresses:      profile.addresses,
    paymentMethods: profile.paymentMethods,
    incompleteVisit: profile.incompleteVisit
  });
});

/**
 * POST /api/profile/address
 * Add a single address
 */
exports.addAddress = asyncHandler(async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { user: req.user._id },
    { $push: { addresses: req.body } },
    { new: true, upsert: true }
  );
  res.status(201).json(profile);
});

/**
 * DELETE /api/profile/address/:index
 * Remove an address by its index in the array
 */
exports.removeAddress = asyncHandler(async (req, res) => {
  const idx = parseInt(req.params.index, 10);
  const profile = await Profile.findOne({ user: req.user._id });
  if (!profile || !profile.addresses[idx]) {
    return res.status(404).json({ message: 'Address not found' });
  }
  profile.addresses.splice(idx, 1);
  await profile.save();
  res.json(profile);
});

/**
 * PATCH /api/profile/visit/start
 * Mark that the user has begun a questionnaire / visit
 */
exports.startVisit = asyncHandler(async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { user: req.user._id },
    { $set: { incompleteVisit: true } },
    { new: true, upsert: true }
  );
  res.json({ incompleteVisit: profile.incompleteVisit });
});

/**
 * PATCH /api/profile/visit/clear
 * Clear the “incompleteVisit” flag once they finish
 */
exports.clearVisit = asyncHandler(async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { user: req.user._id },
    { $set: { incompleteVisit: false } },
    { new: true }
  );
  res.json({ incompleteVisit: profile.incompleteVisit });
});
