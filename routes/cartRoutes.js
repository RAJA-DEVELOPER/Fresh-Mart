const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { addToCart, updateCartQuantity, removeFromCart, getCart } = require('../controllers/cartController');

router.use(authMiddleware);

router.post('/', addToCart);
router.get('/', getCart);
router.put('/:productId', updateCartQuantity);
router.delete('/:productId', removeFromCart);

module.exports = router;
