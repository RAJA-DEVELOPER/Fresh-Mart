const express = require('express');
const router = express.Router();
const { createCategory, getCategories } = require('../controllers/categoryController');

// You may need to add AuthMiddleware for admins only on createCategory in the future.
router.post('/', createCategory);
router.get('/', getCategories);

module.exports = router;
