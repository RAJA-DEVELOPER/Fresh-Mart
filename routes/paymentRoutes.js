const express = require('express');
const router = express.Router();
const { initiatePayment, processPayment } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/initiate', initiatePayment);
router.post('/process', processPayment);

module.exports = router;
