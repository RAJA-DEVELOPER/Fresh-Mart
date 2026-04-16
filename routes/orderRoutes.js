const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { placeOrder, getOrderHistory, getOrderDetails, updateOrderStatus } = require('../controllers/orderController');

router.use(authMiddleware);

router.post('/', placeOrder);
router.get('/', getOrderHistory);
router.get('/:id', getOrderDetails);
// Typically, you might want an admin integration here to secure the updater correctly
router.put('/:id/status', updateOrderStatus);

module.exports = router;
