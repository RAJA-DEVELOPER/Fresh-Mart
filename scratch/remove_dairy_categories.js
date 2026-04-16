const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        // Delete products first to avoid foreign key constraints
        const [prodResult2] = await connection.execute('DELETE FROM products WHERE category_id IN (3, 14)');
        console.log('Products deleted:', prodResult2.affectedRows);

        // Delete categories
        const [catResult] = await connection.execute('DELETE FROM categories WHERE id IN (3, 14)');
        console.log('Categories deleted:', catResult.affectedRows);

    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

run();
