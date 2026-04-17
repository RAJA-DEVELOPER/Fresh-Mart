CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    mobile VARCHAR(20) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    lat DECIMAL(10, 8) DEFAULT NULL,
    lng DECIMAL(11, 8) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    unit VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES Categories(id) ON DELETE CASCADE
);

INSERT IGNORE INTO Categories (name) VALUES ('Groceries'), ('Vegetables'), ('Dairy'), ('Snacks');

CREATE TABLE IF NOT EXISTS Carts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS CartItems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (cart_id) REFERENCES Carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE,
    UNIQUE(cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS Coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
    discount_value DECIMAL(10,2) NOT NULL,
    max_discount DECIMAL(10,2) NOT NULL DEFAULT 999999.99,
    min_order_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    valid_until DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    address_id INT NOT NULL,
    coupon_id INT DEFAULT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    final_amount DECIMAL(10, 2) NOT NULL,
    delivery_slot ENUM('Morning', 'Afternoon', 'Evening') NOT NULL,
    payment_method ENUM('COD', 'Online') NOT NULL,
    payment_status ENUM('Pending', 'Paid', 'Failed', 'Refunded') DEFAULT 'Pending',
    status ENUM('Placed', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled', 'Refunded') DEFAULT 'Placed',
    delivery_person_name VARCHAR(100) DEFAULT NULL,
    delivery_person_contact VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (address_id) REFERENCES Addresses(id) ON DELETE RESTRICT,
    FOREIGN KEY (coupon_id) REFERENCES Coupons(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS OrderItems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE
);

-- Insert dummy coupon for testing
INSERT IGNORE INTO Coupons (code, discount_type, discount_value, max_discount, min_order_value, valid_until) 
VALUES 
('WELCOME50', 'percentage', 50.00, 100.00, 200.00, DATE_ADD(NOW(), INTERVAL 30 DAY)),
('FLAT50', 'fixed', 50.00, 50.00, 300.00, DATE_ADD(NOW(), INTERVAL 7 DAY));


CREATE TABLE IF NOT EXISTS Notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS DeliveryZones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    center_lat DECIMAL(10, 8) NOT NULL,
    center_lng DECIMAL(11, 8) NOT NULL,
    radius_km DECIMAL(5, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS DeliverySlots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_orders INT NOT NULL DEFAULT 50,
    is_active BOOLEAN DEFAULT TRUE
);

INSERT IGNORE INTO DeliveryZones (name, center_lat, center_lng, radius_km) VALUES 
('Downtown Hub', 40.7128, -74.0060, 10.0),
('Uptown Hub', 40.7306, -73.9352, 15.0);

INSERT IGNORE INTO DeliverySlots (day_of_week, start_time, end_time) VALUES 
('Everyday', '09:00:00', '12:00:00'),
('Everyday', '13:00:00', '16:00:00'),
('Everyday', '17:00:00', '20:00:00');
