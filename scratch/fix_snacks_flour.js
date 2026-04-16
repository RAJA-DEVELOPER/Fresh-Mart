require('dotenv').config();
const pool = require('../config/db');

async function fixSnacksAndFlour() {
    try {
        console.log('Fixing Snacks category and Flour product images...');

        // Update Snacks category (ID 4)
        await pool.query('UPDATE Categories SET image_url = ? WHERE id = 4', [
            'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400'
        ]);
        console.log('Updated Snacks category image.');

        // Update All-Purpose Flour product
        const [flourResult] = await pool.query("SELECT id FROM Products WHERE name LIKE '%Flour%'");
        if (flourResult.length > 0) {
            const flourId = flourResult[0].id;
            await pool.query('UPDATE Products SET image_url = ? WHERE id = ?', [
                'https://images.unsplash.com/photo-1512034400317-de97d7d6c3ed?w=400', 
                flourId
            ]);
            console.log('Updated Flour product image (ID ' + flourId + ').');
        } else {
            console.log('Flour product not found.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
fixSnacksAndFlour();
