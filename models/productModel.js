const pool = require('../config/db');

class ProductModel {
    static async addProduct(productData) {
        const { category_id, name, price, stock, image_url, unit } = productData;
        const isActive = stock > 0;
        const [result] = await pool.query(
            'INSERT INTO Products (category_id, name, price, stock, is_active, image_url, unit) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [category_id, name, price, stock, isActive, image_url || null, unit]
        );
        return result.insertId;
    }

    static async getProducts(filters = {}) {
        let query = 'SELECT p.*, c.name as category_name FROM Products p JOIN Categories c ON p.category_id = c.id WHERE 1=1';
        const queryParams = [];

        if (filters.category_id) {
            query += ' AND p.category_id = ?';
            queryParams.push(filters.category_id);
        }

        if (filters.min_price) {
            query += ' AND p.price >= ?';
            queryParams.push(filters.min_price);
        }

        if (filters.max_price) {
            query += ' AND p.price <= ?';
            queryParams.push(filters.max_price);
        }

        if (filters.search) {
            query += ' AND p.name LIKE ?';
            queryParams.push(`%${filters.search}%`);
        }

        if (filters.include_out_of_stock !== 'true') {
            query += ' AND p.is_active = TRUE';
        }

        if (filters.limit) {
            query += ' LIMIT ?';
            queryParams.push(parseInt(filters.limit));
        }

        const [rows] = await pool.query(query, queryParams);
        return rows;
    }

    static async updateProduct(id, productData) {
        const { category_id, name, price, stock, image_url, unit } = productData;
        const isActive = stock > 0;
        const [result] = await pool.query(
            'UPDATE Products SET category_id = ?, name = ?, price = ?, stock = ?, is_active = ?, image_url = ?, unit = ? WHERE id = ?',
            [category_id, name, price, stock, isActive, image_url || null, unit, id]
        );
        return result.affectedRows > 0;
    }

    static async deleteProduct(id) {
        const [result] = await pool.query('DELETE FROM Products WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async getProductById(id) {
        const [rows] = await pool.query('SELECT * FROM Products WHERE id = ?', [id]);
        return rows[0];
    }

    static async updateStock(id, newStock) {
        const isActive = newStock > 0;
        const [result] = await pool.query(
            'UPDATE Products SET stock = ?, is_active = ? WHERE id = ?',
            [newStock, isActive, id]
        );
        return result.affectedRows > 0;
    }

    static async bulkUploadProducts(productsArray) {
        let successfulInserts = 0;
        for (const item of productsArray) {
            try {
                const isActive = item.stock > 0;
                await pool.query(
                     'INSERT INTO Products (category_id, name, price, stock, is_active, unit) VALUES (?, ?, ?, ?, ?, ?)',
                     [item.category_id, item.name, item.price, item.stock, isActive, item.unit || 'unit']
                );
                successfulInserts++;
            } catch (err) {
                 // Ignore rows generating logic errors (like bad foreign keys) to allow safe bulk imports
            }
        }
        return successfulInserts;
    }
}

module.exports = ProductModel;
