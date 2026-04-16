const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { sendOfferNotification, getMyNotifications } = require('../controllers/notificationController');

router.use(authMiddleware);

// In reality, /offers should have an adminMiddleware securing it.
router.post('/offers', sendOfferNotification);
router.get('/', getMyNotifications);

module.exports = router;
