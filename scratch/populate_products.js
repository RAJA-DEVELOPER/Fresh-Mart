require('dotenv').config();
const pool = require('../config/db');

async function populateProducts() {
    try {
        console.log('Starting full product database population...\n');

        // 1. First, move current fruits to the correct category (12) and clear existing data to avoid duplicates if necessary
        // In this case, I will just update the existing IDs I know and then insert the rest.
        
        console.log('Cleaning/Updating existing items...');
        // Moves: Apple(6), Orange(7), Banana(8) -> Fresh Fruits(12)
        await pool.query('UPDATE Products SET category_id = 12 WHERE id IN (6, 7, 8)');
        
        const products = [
            // [category_id, name, price, stock, unit, image_url]
            
            // Vegetables (2)
            [2, 'Organic Potatoes', 40.00, 100, 'kg', 'https://images.unsplash.com/photo-1508313880080-c4bef0730395?w=400'],
            [2, 'Red Onions', 35.00, 80, 'kg', 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400'],
            [2, 'Fresh Tomatoes', 50.00, 60, 'kg', 'https://images.unsplash.com/photo-1524593166156-312f362cada0?w=400'],
            
            // Dairy (3)
            [3, 'Salted Butter', 250.00, 40, '500g', 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400'],
            
            // Snacks (4)
            [4, 'Potato Chips', 20.00, 150, 'packet', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400'],
            [4, 'Dark Chocolate', 99.00, 45, 'bar', 'https://images.unsplash.com/photo-1548365328-8c6db3220e4c?w=400'],
            
            // Fresh Fruits (12)
            [12, 'Fresh Strawberries', 180.00, 20, 'box', 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400'],
            
            // Dairy & Eggs (14)
            [14, 'Farm Fresh Eggs', 70.00, 30, '12 pack', 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=400'],
            
            // Beverages (15)
            [15, 'Mineral Water', 20.00, 200, '1 litre', 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400'],
            [15, 'Coca Cola', 45.00, 100, '750ml', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400'],
            [15, 'Fresh Orange Juice', 120.00, 25, '1 litre', 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=400'],
            
            // Bakery (17)
            [17, 'Whole Wheat Bread', 45.00, 30, 'loaf', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'],
            [17, 'Chocolate Muffins', 60.00, 15, '4 pack', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400'],
            
            // Groceries (1)
            [1, 'All-Purpose Flour', 55.00, 40, 'kg', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400']
        ];

        console.log('Inserting new high-quality products...');
        for (const p of products) {
            await pool.query(
                'INSERT INTO Products (category_id, name, price, stock, unit, image_url, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
                p
            );
        }

        console.log('\nFinal validation: Checking for NULLs or empty categories...');
        const [nullCheck] = await pool.query('SELECT COUNT(*) as count FROM Products WHERE name IS NULL OR price IS NULL OR category_id IS NULL OR image_url IS NULL');
        const [catCounts] = await pool.query('SELECT c.name, COUNT(p.id) as count FROM Categories c LEFT JOIN Products p ON c.id = p.category_id GROUP BY c.id');
        
        console.table(catCounts);
        if (nullCheck[0].count > 0) {
            console.error('WARNING: Found', nullCheck[0].count, 'rows with NULL values!');
        } else {
            console.log('SUCCESS: No NULL values found.');
        }

        console.log('\nProduct database fully updated.');
        process.exit(0);

    } catch (err) {
        console.error('CRITICAL ERROR DURING POPULATION:', err.message);
        process.exit(1);
    }
}

populateProducts();
