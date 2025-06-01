const asyncHandler = require('express-async-handler');
const Product      = require('../models/productModel');

// @desc    Get list of products (optionally filter by concern)
// @route   GET /api/products
exports.getProducts = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.concern) {
    filter.concerns = req.query.concern;
  }
  const products = await Product.find(filter).sort({ id: 1 });
  res.json(products);
});

// @desc    Get single product by id
// @route   GET /api/products/:id
exports.getProductById = asyncHandler(async (req, res) => {
  const prodId = Number(req.params.id);
  const product = await Product.findOne({ id: prodId });
  if (!product) {
    return res.status(404).json({ message: `Product ${prodId} not found` });
  }
  res.json(product);
});
