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
        const newImageUrl = 'https://images.unsplash.com/photo-1614735241165-6756e1df61ab?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c25hY2tzfGVufDB8fDB8fHww';
        const [result] = await connection.execute('UPDATE categories SET image_url = ? WHERE id = 4', [newImageUrl]);
        console.log('Update result:', result);
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

run();
