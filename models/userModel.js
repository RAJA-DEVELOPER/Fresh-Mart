const pool = require('../config/db');

class UserModel {
    static async createUser(name, email, mobile, passwordHash, role = 'customer') {
        const [result] = await pool.query(
            'INSERT INTO Users (name, email, mobile, password, role) VALUES (?, ?, ?, ?, ?)',
            [name, email || null, mobile || null, passwordHash, role]
        );
        return result.insertId;
    }

    static async findByEmailOrMobile(identifier) {
        const [rows] = await pool.query(
            'SELECT * FROM Users WHERE email = ? OR mobile = ? LIMIT 1',
            [identifier, identifier]
        );
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await pool.query(
            'SELECT id, name, email, mobile, role, created_at FROM Users WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async updateName(id, name) {
        const [result] = await pool.query(
            'UPDATE Users SET name = ? WHERE id = ?',
            [name, id]
        );
        return result.affectedRows > 0;
    }

    static async updatePassword(id, passwordHash) {
        const [result] = await pool.query(
            'UPDATE Users SET password = ? WHERE id = ?',
            [passwordHash, id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = UserModel;
