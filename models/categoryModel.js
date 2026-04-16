const pool = require('../config/db');

class CategoryModel {
    static async createCategory(name, description, image_url) {
        const [result] = await pool.query(
            'INSERT INTO Categories (name, description, image_url) VALUES (?, ?, ?)',
            [name, description || null, image_url || null]
        );
        return result.insertId;
    }

    static async getAllCategories() {
        const [rows] = await pool.query('SELECT * FROM Categories');
        return rows;
    }
}

module.exports = CategoryModel;
