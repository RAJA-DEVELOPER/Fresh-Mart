const pool = require('../config/db');

// Example model template for future use
class Model {
    static async findAll() {
        const [rows] = await pool.query('SELECT 1 as isWorking');
        return rows;
    }
}

module.exports = Model;
