ALTER TABLE Orders MODIFY payment_status ENUM('Pending', 'Paid', 'Failed', 'Refunded') DEFAULT 'Pending';
ALTER TABLE Orders MODIFY status ENUM('Placed', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled', 'Refunded') DEFAULT 'Placed';
ALTER TABLE Orders ADD COLUMN IF NOT EXISTS delivery_person_name VARCHAR(100) DEFAULT NULL;
ALTER TABLE Orders ADD COLUMN IF NOT EXISTS delivery_person_contact VARCHAR(50) DEFAULT NULL;
