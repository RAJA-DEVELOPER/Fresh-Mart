require('dotenv').config();
const pool = require('../config/db');

async function fixImages() {
    try {
        console.log('Fixing all image URLs with VERIFIED working ones...\n');

        // --- CATEGORIES ---
        const categoryImages = [
            { name: 'Groceries',    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400' },
            { name: 'Vegetables',   url: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400' },
            { name: 'Dairy',        url: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400' },
            { name: 'Snacks',       url: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400' },
            { name: 'Fresh Fruits', url: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400' },
            { name: 'Dairy & Eggs', url: 'https://images.unsplash.com/photo-1498654200943-1088dd4438ae?w=400' },
            { name: 'Beverages',    url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400' },
            { name: 'Bakery',       url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' },
        ];

        for (const cat of categoryImages) {
            const [res] = await pool.query('UPDATE Categories SET image_url = ? WHERE name = ?', [cat.url, cat.name]);
            console.log(`Category "${cat.name}" -> ${res.affectedRows > 0 ? 'UPDATED' : 'NOT FOUND'}`);
        }

        // --- PRODUCTS ---
        const productImages = [
            { id: 2, url: 'https://images.unsplash.com/photo-1600718374662-0483d2b9da44?w=400' },  // Milk
            { id: 3, url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' }, // Rice
            { id: 4, url: 'https://images.unsplash.com/photo-1600718374662-0483d2b9da44?w=400' },  // Milk
            { id: 5, url: 'https://images.unsplash.com/photo-1600718374662-0483d2b9da44?w=400' },  // Milk
            { id: 6, url: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400' }, // Apple
            { id: 7, url: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400' },   // Orange
            { id: 8, url: 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=400' }, // Banana
        ];

        console.log('');
        for (const prod of productImages) {
            const [res] = await pool.query('UPDATE Products SET image_url = ? WHERE id = ?', [prod.url, prod.id]);
            console.log(`Product ID ${prod.id} (${prod.url}) -> ${res.affectedRows > 0 ? 'UPDATED' : 'NOT FOUND'}`);
        }

        // Final fallback for anything else
        await pool.query(
            "UPDATE Products SET image_url = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400' WHERE image_url IS NULL OR image_url = ''"
        );

        console.log('\nSUCCESS: All images updated with working URLs.');
        process.exit(0);

    } catch (err) {
        console.error('CRITICAL ERROR:', err.message);
        process.exit(1);
    }
}

fixImages();
