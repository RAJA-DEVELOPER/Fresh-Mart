-- FreshMart Seed Data
-- Run this script in your Railway MySQL Query Editor to populate your database with dummy data

-- 1. Insert Categories (Using explicit IDs to match the product mapping)
-- Truncating or ignoring keeps it robust if run multiple times
INSERT IGNORE INTO Categories (id, name, description) VALUES 
(1, 'Groceries', 'Daily grocery essentials'),
(2, 'Vegetables', 'Fresh and organic vegetables'),
(3, 'Dairy', 'Milk, cheese, and other dairy products'),
(4, 'Snacks', 'Chips, namkeen, and quick bites'),
(12, 'Fresh Fruits', 'Seasonal fresh fruits'),
(14, 'Dairy & Eggs', 'Farm fresh dairy and eggs'),
(15, 'Beverages', 'Cold drinks, juices, and water'),
(17, 'Bakery', 'Freshly baked breads and cakes');

-- 2. Insert Products
INSERT IGNORE INTO Products (category_id, name, price, stock, unit, image_url, is_active) VALUES 
-- Vegetables (2)
(2, 'Organic Potatoes', 40.00, 100, 'kg', 'https://images.unsplash.com/photo-1508313880080-c4bef0730395?w=400', 1),
(2, 'Red Onions', 35.00, 80, 'kg', 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400', 1),
(2, 'Fresh Tomatoes', 50.00, 60, 'kg', 'https://images.unsplash.com/photo-1524593166156-312f362cada0?w=400', 1),

-- Dairy (3)
(3, 'Salted Butter', 250.00, 40, '500g', 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400', 1),

-- Snacks (4)
(4, 'Potato Chips', 20.00, 150, 'packet', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400', 1),
(4, 'Dark Chocolate', 99.00, 45, 'bar', 'https://images.unsplash.com/photo-1548365328-8c6db3220e4c?w=400', 1),

-- Fresh Fruits (12)
(12, 'Fresh Strawberries', 180.00, 20, 'box', 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400', 1),

-- Dairy & Eggs (14)
(14, 'Farm Fresh Eggs', 70.00, 30, '12 pack', 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=400', 1),

-- Beverages (15)
(15, 'Mineral Water', 20.00, 200, '1 litre', 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400', 1),
(15, 'Coca Cola', 45.00, 100, '750ml', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400', 1),
(15, 'Fresh Orange Juice', 120.00, 25, '1 litre', 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=400', 1),

-- Bakery (17)
(17, 'Whole Wheat Bread', 45.00, 30, 'loaf', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', 1),
(17, 'Chocolate Muffins', 60.00, 15, '4 pack', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', 1),

-- Groceries (1)
(1, 'All-Purpose Flour', 55.00, 40, 'kg', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400', 1);

-- 3. Insert Delivery Zones
INSERT IGNORE INTO DeliveryZones (name, center_lat, center_lng, radius_km, is_active) VALUES 
('Downtown Hub', 40.7128, -74.0060, 10.0, 1),
('Uptown Hub', 40.7306, -73.9352, 15.0, 1);

-- 4. Insert Delivery Slots
INSERT IGNORE INTO DeliverySlots (day_of_week, start_time, end_time, is_active) VALUES 
('Everyday', '09:00:00', '12:00:00', 1),
('Everyday', '13:00:00', '16:00:00', 1),
('Everyday', '17:00:00', '20:00:00', 1);

-- 5. Insert Dummy Coupons
INSERT IGNORE INTO Coupons (code, discount_type, discount_value, max_discount, min_order_value, valid_until) 
VALUES 
('WELCOME50', 'percentage', 50.00, 100.00, 200.00, DATE_ADD(NOW(), INTERVAL 30 DAY)),
('FLAT50', 'fixed', 50.00, 50.00, 300.00, DATE_ADD(NOW(), INTERVAL 7 DAY));
