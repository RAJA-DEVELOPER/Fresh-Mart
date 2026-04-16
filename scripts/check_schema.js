require('dotenv').config();
const pool = require('../config/db');

async function checkSchema() {
    try {
        console.log('--- ADDRESSES TABLE COLUMNS ---');
        const [rows] = await pool.query('SHOW COLUMNS FROM Addresses');
        console.table(rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkSchema();
