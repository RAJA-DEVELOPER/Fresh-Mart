const express = require('express');
const router = express.Router();
const { addAddress, updateAddress, deleteAddress, getAddresses } = require('../controllers/addressController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all address routes with JWT Middleware
router.use(authMiddleware);

router.post('/', addAddress);
router.get('/', getAddresses);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);

module.exports = router;
