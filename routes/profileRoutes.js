// routes/profileRoutes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  addAddress,
  removeAddress,
  startVisit,
  clearVisit
} = require('../controllers/profileController');

const router = express.Router();
router.use(protect);

// GET + bulk‐PUT profile (adds incompleteVisit too)
router
  .route('/')
  .get(getProfile)
  .put(updateProfile);

// address sub‐endpoints
router
  .route('/address')
  .post(addAddress);
router
  .route('/address/:index')
  .delete(removeAddress);

// new endpoints for the visit flag
router
  .route('/visit/start')
  .patch(startVisit);
router
  .route('/visit/clear')
  .patch(clearVisit);

module.exports = router;
