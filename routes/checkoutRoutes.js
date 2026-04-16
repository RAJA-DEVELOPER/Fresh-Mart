const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getSummary, placeOrder } = require('../controllers/checkoutController');

router.use(authMiddleware);

router.post('/summary', getSummary);
router.post('/place-order', placeOrder);

module.exports = router;
