// routes/cartRoutes.js
const express       = require('express');
const router        = express.Router();
const { protect }   = require('../middleware/authMiddleware');
const cartController = require('../controllers/cartController');

router.use(protect);

router
  .route('/')
  .get(cartController.getCart)
  .post(cartController.addToCart)
  .delete(cartController.clearCart);

router
  .route('/:productId')
  .put(cartController.updateCartItem)
  .delete(cartController.removeCartItem);

module.exports = router;
