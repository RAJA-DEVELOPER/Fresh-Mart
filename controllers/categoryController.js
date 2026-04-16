const CategoryModel = require('../models/categoryModel');

const createCategory = async (req, res, next) => {
    try {
        const { name, description, image_url } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Category name is required' });
        }
        
        const categoryId = await CategoryModel.createCategory(name, description, image_url);
        res.status(201).json({ success: true, message: 'Category created successfully', categoryId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Category already exists' });
        }
        next(error);
    }
};

const getCategories = async (req, res, next) => {
    try {
        const categories = await CategoryModel.getAllCategories();
        res.status(200).json({ success: true, categories });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCategory,
    getCategories
};
