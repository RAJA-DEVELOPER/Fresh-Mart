require('dotenv').config();
const pool = require('../config/db');

async function debugData() {
    try {
        console.log('Categories:');
        const [cats] = await pool.query("SELECT * FROM Categories");
        console.log(JSON.stringify(cats, null, 2));

        console.log('\nProducts (limit 20):');
        const [prods] = await pool.query("SELECT p.*, c.name as cat_name FROM Products p JOIN Categories c ON p.category_id = c.id LIMIT 20");
        console.log(JSON.stringify(prods, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
debugData();
