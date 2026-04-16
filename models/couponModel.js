const pool = require('../config/db');

class CouponModel {
    static async createCoupon(data) {
        const {
            code,
            discount_type,
            discount_value,
            max_discount = 999999.99,
            min_order_value = 0,
            valid_until
        } = data;

        const [result] = await pool.query(
            'INSERT INTO Coupons (code, discount_type, discount_value, max_discount, min_order_value, valid_until) VALUES (?, ?, ?, ?, ?, ?)',
            [code, discount_type, discount_value, max_discount, min_order_value, valid_until]
        );
        return result.insertId;
    }

    static async getAllCoupons() {
        const [rows] = await pool.query('SELECT * FROM Coupons ORDER BY created_at DESC');
        return rows;
    }

    static async getCouponByCode(code) {
        const [rows] = await pool.query(
            'SELECT * FROM Coupons WHERE code = ? AND is_active = TRUE AND valid_until > NOW()',
            [code]
        );
        return rows[0];
    }

    static async updateCoupon(id, data) {
        const fields = [];
        const values = [];
        for (const [key, value] of Object.entries(data)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
        values.push(id);
        const [result] = await pool.query(`UPDATE Coupons SET ${fields.join(', ')} WHERE id = ?`, values);
        return result.affectedRows > 0;
    }

    static async deleteCoupon(id) {
        const [result] = await pool.query('DELETE FROM Coupons WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = CouponModel;
