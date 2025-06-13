const asyncHandler = require('express-async-handler');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// Helper: Flatten product+quantity into frontend-friendly cart item
function formatCartItems(cartItems) {
  return cartItems.map(item => {
    const product = item.product;
    return {
      id: product._id.toString(),
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: item.quantity,
    };
  });
}

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  res.json({
    user: cart.user,
    items: formatCartItems(cart.items),
  });
});

// @desc    Add item or increment quantity (NO full cart returned!)
// @route   POST /api/cart
// @access  Private
exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

  const idx = cart.items.findIndex(item => item.product.toString() === productId);
  if (idx > -1) {
    cart.items[idx].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  // Don't populate, don't return cart data
  res.status(201).json({ success: true });
});

// @desc    Update item quantity (NO full cart returned!)
// @route   PUT /api/cart/:productId
// @access  Private
exports.updateCartItem = asyncHandler(async (req, res) => {
  const { quantity }  = req.body;
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const item = cart.items.find(item => item.product.toString() === productId);
  if (!item) {
    res.status(404);
    throw new Error('Item not in cart');
  }

  item.quantity = quantity;
  await cart.save();
  res.json({ success: true });
});

// @desc    Remove single item (NO full cart returned!)
// @route   DELETE /api/cart/:productId
// @access  Private
exports.removeCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter(item => item.product.toString() !== productId);
  await cart.save();
  res.json({ success: true });
});

// @desc    Clear entire cart (NO full cart returned!)
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  else {
    cart.items = [];
    await cart.save();
  }
  res.status(201).json({ success: true });
});
