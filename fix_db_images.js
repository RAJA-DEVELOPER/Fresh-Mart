require('dotenv').config();
const pool = require('./config/db');

async function fixImages() {
    try {
        console.log('Fixing category images...');
        
        // Update Groceries
        await pool.query(
            "UPDATE Categories SET image_url = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80' WHERE name = 'Groceries'"
        );
        
        // Update Dairy
        await pool.query(
            "UPDATE Categories SET image_url = 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&q=80' WHERE name = 'Dairy'"
        );
        
        // Let's also update 'Snacks' to make sure there are not any duplicates
        await pool.query(
            "UPDATE Categories SET image_url = 'https://images.unsplash.com/photo-15994906592ddc-7742e278687a?w=400&q=80' WHERE name = 'Snacks'"
        );

        console.log('Category images updated.');

        // Let's also check if any products have the same images or null
        // The ones named 'Milk' have the same image (1563636619-e9108ed9219c)
        await pool.query(
            "UPDATE Products SET image_url = 'https://images.unsplash.com/photo-1550583724-b2642d5af558?w=400&q=80' WHERE id = 4"
        );
        await pool.query(
            "UPDATE Products SET image_url = 'https://images.unsplash.com/photo-1574226516831-e1dff420e562?w=400&q=80' WHERE id = 5"
        );
        
        console.log('Product images updated.');
        process.exit(0);

    } catch (err) {
        console.error('Failed:', err.message);
        process.exit(1);
    }
}

fixImages();
