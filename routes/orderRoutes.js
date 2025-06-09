// routes/orderRoutes.js
const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  getAllOrders, // Import the new controller function
} = require('../controllers/orderController');

const router = express.Router();

// All routes below require authentication
router.use(protect);

// GET   /api/orders         → list this user's orders
// POST  /api/orders         → place a new order
router
  .route('/')
  .get(getOrders)
  .post(createOrder);

// GET   /api/orders/all     → admin only, list all orders
router
  .route('/all')
  .get(restrictTo('admin'), getAllOrders);

// GET   /api/orders/:id     → fetch a single order
// DELETE /api/orders/:id    → cancel (delete) an order
router
  .route('/:id')
  .get(getOrderById)
  .delete(cancelOrder);

// PUT   /api/orders/:id/status → only admin can change status
router
  .route('/:id/status')
  .put(restrictTo('admin'), updateOrderStatus);

module.exports = router;
