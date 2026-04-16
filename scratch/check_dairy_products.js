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
        const [dairyRows] = await connection.execute('SELECT COUNT(*) as count FROM products WHERE category_id = 3');
        const [dairyEggsRows] = await connection.execute('SELECT COUNT(*) as count FROM products WHERE category_id = 14');
        
        console.log('Products in Dairy (id: 3):', dairyRows[0].count);
        console.log('Products in Dairy & Eggs (id: 14):', dairyEggsRows[0].count);
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

run();
