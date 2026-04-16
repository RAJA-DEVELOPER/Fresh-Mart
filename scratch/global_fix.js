require('dotenv').config();
const pool = require('../config/db');

async function fixEverything() {
    try {
        console.log('--- STARTING GLOBAL FIX ---');

        // 1. Find ANY product that has "Fish" in the name or has a fishy image URL (unsplash-photo-1574226516831)
        const [fishyProducts] = await pool.query("SELECT * FROM Products WHERE name LIKE '%Fish%' OR image_url LIKE '%1574226516831%'");
        console.log('Fishy products found:', JSON.stringify(fishyProducts, null, 2));

        for (const p of fishyProducts) {
            if (p.category_id === 3 || p.category_id === 14) {
                 console.log(`Renaming product ${p.id} from ${p.name} to Milk...`);
                 await pool.query("UPDATE Products SET name = 'Milk', image_url = 'https://images.unsplash.com/photo-1550583724-b2642d5af558?w=400&q=80' WHERE id = ?", [p.id]);
            }
        }

        // 2. Ensure ALL products named "Milk" have the correct image
        await pool.query("UPDATE Products SET image_url = 'https://images.unsplash.com/photo-1550583724-b2642d5af558?w=400&q=80' WHERE name = 'Milk'");
        console.log('Updated all Milk products.');

        // 3. Ensure Dairy categories have the correct image
        await pool.query("UPDATE Categories SET image_url = 'https://images.unsplash.com/photo-1550583724-b2642d5af558?w=400&q=80' WHERE name LIKE '%Dairy%'");
        console.log('Updated all Dairy categories.');

        // 4. Double check if there are any other products with weird images in Dairy
        const [dairyProds] = await pool.query("SELECT * FROM Products WHERE category_id = 3 OR category_id = 14");
        console.log('Current Dairy Products:', JSON.stringify(dairyProds, null, 2));

        console.log('--- GLOBAL FIX COMPLETE ---');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
fixEverything();
