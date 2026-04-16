const express = require('express');
const router = express.Router();
const { addProduct, getProducts, updateProduct, deleteProduct, updateStock, bulkUpload } = require('../controllers/productController');

// In a real scenario, you probably want to protect the POST, PUT and DELETE endpoints with AdminMiddleware
router.post('/', addProduct);
router.post('/bulk-upload', bulkUpload);
router.get('/', getProducts);
router.put('/:id', updateProduct);
router.patch('/:id/stock', updateStock);
router.delete('/:id', deleteProduct);

module.exports = router;
