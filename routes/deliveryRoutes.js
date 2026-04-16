const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { checkDeliverability, getDeliverySlots, trackOrder } = require('../controllers/deliveryController');

// Open routes to casually check mapping availability
router.post('/check-zone', checkDeliverability);
router.get('/slots', getDeliverySlots);

// Protected Mock Live GPS tracking route
router.use(authMiddleware);
router.get('/track/:orderId', trackOrder);

module.exports = router;
