const pool = require('../config/db');

class AddressModel {
    static async addAddress(userId, addressData) {
        const { street, city, state, zip_code, country, lat, lng } = addressData;
        const [result] = await pool.query(
            'INSERT INTO Addresses (user_id, street, city, state, zip_code, country, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, street, city, state, zip_code, country, lat, lng]
        );
        return result.insertId;
    }

    static async updateAddress(addressId, userId, addressData) {
        const { street, city, state, zip_code, country } = addressData;
        const [result] = await pool.query(
            'UPDATE Addresses SET street = ?, city = ?, state = ?, zip_code = ?, country = ? WHERE id = ? AND user_id = ?',
            [street, city, state, zip_code, country, addressId, userId]
        );
        return result.affectedRows > 0;
    }

    static async deleteAddress(addressId, userId) {
        const [result] = await pool.query(
            'UPDATE Addresses SET is_deleted = TRUE WHERE id = ? AND user_id = ?',
            [addressId, userId]
        );
        return result.affectedRows > 0;
    }

    static async getAddressesByUserId(userId) {
        const [rows] = await pool.query(
            'SELECT * FROM Addresses WHERE user_id = ? AND is_deleted = FALSE',
            [userId]
        );
        return rows;
    }

    static async getAddressById(addressId) {
        const [rows] = await pool.query(
            'SELECT * FROM Addresses WHERE id = ?',
            [addressId]
        );
        return rows[0] || null;
    }
}

module.exports = AddressModel;
