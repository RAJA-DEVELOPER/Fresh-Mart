const pool = require('../config/db');

class CartModel {
    static async getOrCreateCart(userId) {
        const [rows] = await pool.query('SELECT * FROM Carts WHERE user_id = ?', [userId]);
        if (rows.length > 0) return rows[0].id;
        
        const [result] = await pool.query('INSERT INTO Carts (user_id) VALUES (?)', [userId]);
        return result.insertId;
    }

    static async addItem(userId, productId, quantity) {
        const cartId = await this.getOrCreateCart(userId);
        
        const [result] = await pool.query(
            `INSERT INTO CartItems (cart_id, product_id, quantity) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
            [cartId, productId, quantity]
        );
        return result.affectedRows > 0;
    }

    static async updateQuantity(userId, productId, quantity) {
        const cartId = await this.getOrCreateCart(userId);
        const [result] = await pool.query(
            'UPDATE CartItems SET quantity = ? WHERE cart_id = ? AND product_id = ?',
            [quantity, cartId, productId]
        );
        return result.affectedRows > 0;
    }

    static async removeItem(userId, productId) {
        const cartId = await this.getOrCreateCart(userId);
        const [result] = await pool.query(
            'DELETE FROM CartItems WHERE cart_id = ? AND product_id = ?',
            [cartId, productId]
        );
        return result.affectedRows > 0;
    }

    static async getCart(userId) {
        const cartId = await this.getOrCreateCart(userId);
        const [items] = await pool.query(
            `SELECT ci.product_id, ci.quantity, p.name, p.price, p.stock, p.image_url, p.unit 
             FROM CartItems ci 
             JOIN Products p ON ci.product_id = p.id 
             WHERE ci.cart_id = ?`,
            [cartId]
        );
        return items;
    }

    static async clearCart(userId) {
        const cartId = await this.getOrCreateCart(userId);
        const [result] = await pool.query('DELETE FROM CartItems WHERE cart_id = ?', [cartId]);
        return result.affectedRows >= 0;
    }
}

module.exports = CartModel;
