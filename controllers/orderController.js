// controllers/orderController.js
const asyncHandler = require('express-async-handler');
const Order        = require('../models/orderModel');
const Product      = require('../models/productModel');

// @desc   List orders for the current user
// @route  GET /api/orders
// @access Private
exports.getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @desc   Get single order (only if it belongs to the user)
// @route  GET /api/orders/:id
// @access Private
exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  res.json(order);
});

// @desc   Create a new order
// @route  POST /api/orders
// @access Private
exports.createOrder = asyncHandler(async (req, res) => {
  const incoming = req.body.items || req.body.products;
  if (!Array.isArray(incoming) || incoming.length === 0) {
    return res.status(400).json({ message: 'No order items provided' });
  }

  // build paymentDetails
  const paymentDetails = req.body.paymentDetails || {};
  if (typeof req.body.doctorFee === 'number') {
    paymentDetails.doctorFee = req.body.doctorFee;
  }

  let items = [];
  let subtotal = 0;

  // validate each product
  for (const it of incoming) {
    const prodId = it.product || it.productId;
    const qty    = it.quantity || it.qty || 1;
    const product = await Product.findById(prodId);
    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${prodId}`);
    }
    items.push({
      product:  product._id,
      quantity: qty,
      price:    product.price
    });
    subtotal += product.price * qty;
  }

  // compute total
  const extraFee   = typeof paymentDetails.doctorFee === 'number'
    ? paymentDetails.doctorFee
    : 0;
  const totalAmount = subtotal + extraFee;

  const order = await Order.create({
    user:           req.user._id,
    items,
    totalAmount,
    paymentDetails
  });

  res.status(201).json(order);
});

// @desc   Admin only: update an order's status
// @route  PUT /api/orders/:id/status
// @access Private/Admin
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  order.status = req.body.status;
  await order.save();
  res.json(order);
});

// @desc   Cancel (delete) an order: user may cancel their own
// @route  DELETE /api/orders/:id
// @access Private
exports.cancelOrder = asyncHandler(async (req, res) => {
  const result = await Order.deleteOne({
    _id:  req.params.id,
    user: req.user._id
  });
  if (result.deletedCount === 0) {
    return res.status(404).json({ message: 'Order not found' });
  }
  res.status(204).end();
});
