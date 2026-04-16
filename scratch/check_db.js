const pool = require('./config/db');

async function checkCategories() {
    try {
        const [rows] = await pool.query('SELECT * FROM Categories');
        console.log('Categories:', JSON.stringify(rows, null, 2));
        const [products] = await pool.query('SELECT * FROM Products LIMIT 5');
        console.log('Sample Products:', JSON.stringify(products, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

checkCategories();
