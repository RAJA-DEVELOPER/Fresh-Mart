const pool = require('../config/db');

class OrderModel {
    static async placeCheckoutOrder(orderData) {
        const { userId, addressId, couponId, totalAmount, discountAmount, finalAmount, deliverySlot, paymentMethod, paymentStatus, items } = orderData;
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [orderResult] = await connection.query(
                `INSERT INTO Orders (user_id, address_id, coupon_id, total_amount, discount_amount, final_amount, delivery_slot, payment_method, payment_status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, addressId, couponId, totalAmount, discountAmount, finalAmount, deliverySlot, paymentMethod, paymentStatus]
            );
            const orderId = orderResult.insertId;

            for (const item of items) {
                const [productRows] = await connection.query('SELECT stock FROM Products WHERE id = ? FOR UPDATE', [item.product_id]);
                if (!productRows.length || productRows[0].stock < item.quantity) {
                    throw new Error(`Insufficient stock for product ${item.name}`);
                }

                await connection.query(
                    'INSERT INTO OrderItems (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                    [orderId, item.product_id, item.quantity, item.price]
                );

                await connection.query(
                    'UPDATE Products SET stock = stock - ?, is_active = IF(stock - ? <= 0, FALSE, TRUE) WHERE id = ?',
                    [item.quantity, item.quantity, item.product_id]
                );
            }

            await connection.commit();
            return orderId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async getOrderHistory(userId) {
        const [orders] = await pool.query(
            'SELECT * FROM Orders WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        return orders;
    }

    static async getOrderDetails(orderId, userId) {
        const [orderRows] = await pool.query(
            'SELECT * FROM Orders WHERE id = ? AND user_id = ?',
            [orderId, userId]
        );
        
        if (orderRows.length === 0) return null;
        
        const order = orderRows[0];
        const [itemsRows] = await pool.query(
            `SELECT oi.*, p.name, p.image_url, p.unit 
             FROM OrderItems oi 
             JOIN Products p ON oi.product_id = p.id 
             WHERE oi.order_id = ?`,
            [orderId]
        );
        
        order.items = itemsRows;

        if (order.address_id) {
            const [addressRows] = await pool.query(
                'SELECT * FROM Addresses WHERE id = ?',
                [order.address_id]
            );
            if (addressRows.length > 0) {
                order.address = addressRows[0];
            }
        }

        return order;
    }

    static async updateOrderStatus(orderId, status) {
        const [result] = await pool.query(
            'UPDATE Orders SET status = ? WHERE id = ?',
            [status, orderId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = OrderModel;
