const pool = require('../config/db');

class AdminCustomerModel {
    static async getAllUsers() {
        const [rows] = await pool.query(
            `SELECT u.id, u.name, u.email, u.mobile, u.created_at,
                COUNT(o.id) as order_count,
                COALESCE(SUM(o.final_amount), 0) as total_spent
             FROM Users u
             LEFT JOIN Orders o ON u.id = o.user_id
             GROUP BY u.id
             ORDER BY order_count DESC`
        );
        return rows;
    }

    static async getUserOrderHistory(userId) {
        const [user] = await pool.query('SELECT id, name, email, mobile FROM Users WHERE id = ?', [userId]);
        if (!user.length) return null;

        const [orders] = await pool.query(
            `SELECT o.*, a.street, a.city, a.state
             FROM Orders o
             JOIN Addresses a ON o.address_id = a.id
             WHERE o.user_id = ? ORDER BY o.created_at DESC`,
            [userId]
        );

        return { user: user[0], orders };
    }

    static async getFrequentBuyers(minOrders = 3) {
        const [rows] = await pool.query(
            `SELECT u.id, u.name, u.email, u.mobile,
                COUNT(o.id) as total_orders,
                COALESCE(SUM(o.final_amount), 0) as total_spent,
                MAX(o.created_at) as last_order_at
             FROM Users u
             JOIN Orders o ON u.id = o.user_id
             GROUP BY u.id
             HAVING total_orders >= ?
             ORDER BY total_orders DESC, total_spent DESC`,
            [minOrders]
        );
        return rows;
    }
}

module.exports = AdminCustomerModel;
