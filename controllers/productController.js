const ProductModel = require('../models/productModel');

const addProduct = async (req, res, next) => {
    try {
        const { category_id, name, price, stock, image_url, unit } = req.body;
        
        if (!category_id || !name || price === undefined || stock === undefined || !unit) {
            return res.status(400).json({ 
                success: false, 
                message: 'category_id, name, price, stock, and unit are required' 
            });
        }

        const productId = await ProductModel.addProduct(req.body);
        
        // Trigger real-time update
        const io = req.app.get('io');
        if (io) io.to('admin_room').emit('STOCK_UPDATE', { id: productId, name });

        res.status(201).json({ success: true, message: 'Product added successfully', productId });
    } catch (error) {
        next(error);
    }
};

const getProducts = async (req, res, next) => {
    try {
        const filters = {
            category_id: req.query.category_id,
            min_price: req.query.min_price,
            max_price: req.query.max_price,
            search: req.query.search,
            include_out_of_stock: req.query.include_out_of_stock, // Allows admin views later
            limit: req.query.limit
        };

        const products = await ProductModel.getProducts(filters);
        
        // Ensure products appear unavailable in case include_out_of_stock was provided explicitly
        const mappedProducts = products.map(p => ({
            ...p,
            available: p.stock > 0
        }));

        res.status(200).json({ success: true, count: mappedProducts.length, products: mappedProducts });
    } catch (error) {
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const productId = req.params.id;
        const updated = await ProductModel.updateProduct(productId, req.body);
        
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Product found' });
        }

        // Trigger real-time update
        const io = req.app.get('io');
        if (io) io.to('admin_room').emit('STOCK_UPDATE', { id: productId });

        res.status(200).json({ success: true, message: 'Product updated successfully' });
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const productId = req.params.id;
        const deleted = await ProductModel.deleteProduct(productId);
        
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        next(error);
    }
};

const updateStock = async (req, res, next) => {
    try {
        const productId = req.params.id;
        const { stock } = req.body;
        
        if (stock === undefined || typeof stock !== 'number') {
            return res.status(400).json({ success: false, message: 'Valid stock number is required.' });
        }

        const updated = await ProductModel.updateStock(productId, stock);
        if (!updated) return res.status(404).json({ success: false, message: 'Product not found.' });

        // Trigger real-time update
        const io = req.app.get('io');
        if (io) io.to('admin_room').emit('STOCK_UPDATE', { id: productId, stock });

        res.status(200).json({ success: true, message: 'Stock explicitly updated successfully' });
    } catch (e) { next(e); }
};

const bulkUpload = async (req, res, next) => {
    try {
        const { csv_data } = req.body;
        if (!csv_data || !Array.isArray(csv_data)) {
            return res.status(400).json({ success: false, message: 'Valid JSON array mimicking CSV data is required.' });
        }

        const count = await ProductModel.bulkUploadProducts(csv_data);
        res.status(201).json({ success: true, message: `Successfully bulk uploaded ${count} products.` });
    } catch (e) { next(e); }
};

module.exports = {
    addProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    updateStock,
    bulkUpload
};
