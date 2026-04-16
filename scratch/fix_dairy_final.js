require('dotenv').config();
const pool = require('../config/db');

async function fixDairyFinal() {
    try {
        console.log('Updating Dairy category and Milk product with Wikipedia images (more reliable)...');

        const milkUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Oat_milk_glass_and_bottles.jpg/320px-Oat_milk_glass_and_bottles.jpg';
        
        // Update both Dairy categories just in case
        await pool.query("UPDATE Categories SET image_url = ? WHERE name = 'Dairy'", [milkUrl]);
        await pool.query("UPDATE Categories SET image_url = ? WHERE name = 'Dairy & Eggs'", [milkUrl]);
        
        // Update Milk product
        await pool.query("UPDATE Products SET image_url = ? WHERE name = 'Milk'", [milkUrl]);
        
        console.log('Update complete.');

        // Verify one last time
        const [cats] = await pool.query("SELECT id, name, image_url FROM Categories WHERE name LIKE '%Dairy%'");
        console.log('Updated Categories:', JSON.stringify(cats, null, 2));

        const [prods] = await pool.query("SELECT id, name, image_url FROM Products WHERE name = 'Milk'");
        console.log('Updated Milk Product:', JSON.stringify(prods, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
fixDairyFinal();
