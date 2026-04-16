const pool = require('../config/db');

class AdminOrderModel {
    static async getAllOrders() {
        // Fetch all orders with rich details including customer names
        const [orders] = await pool.query(`
            SELECT o.*, u.name as customer_name 
            FROM Orders o
            JOIN Users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `);
        return orders;
    }

    static async assignDeliveryPerson(orderId, name, contact) {
        const [result] = await pool.query(
            'UPDATE Orders SET delivery_person_name = ?, delivery_person_contact = ? WHERE id = ?',
            [name, contact, orderId]
        );
        return result.affectedRows > 0;
    }

    static async cancelAndRefundOrder(orderId) {
        const [rows] = await pool.query('SELECT status, payment_status, payment_method FROM Orders WHERE id = ?', [orderId]);
        if (!rows.length) return { success: false, message: 'Order not found' };
        
        const order = rows[0];
        if (order.status === 'Cancelled' || order.status === 'Refunded' || order.status === 'Delivered') {
            return { success: false, message: 'Order cannot be cancelled in its current terminal state' };
        }

        // Logical targets: If Paid, then Refund. If COD (Pending), then simply Cancel.
        const newTargetStatus = (order.payment_method === 'Online' && order.payment_status === 'Paid') ? 'Refunded' : 'Cancelled';
        const newPaymentStatus = newTargetStatus === 'Refunded' ? 'Refunded' : order.payment_status;

        // 2. Restore stock securely allowing the store to sell the items again
        const [items] = await pool.query('SELECT product_id, quantity FROM OrderItems WHERE order_id = ?', [orderId]);
        for (const item of items) {
             await pool.query('UPDATE Products SET stock = stock + ?, is_active = TRUE WHERE id = ?', [item.quantity, item.product_id]);
        }

        // 3. Mark update
        await pool.query('UPDATE Orders SET status = ?, payment_status = ? WHERE id = ?', [newTargetStatus, newPaymentStatus, orderId]);
        return { success: true, message: `Order successfully marked as ${newTargetStatus}. Internal stock natively restored.` };
    }

    static async getOrderFullDetails(id) {
        // 1. Fetch main order with customer name
        const [orders] = await pool.query(`
            SELECT o.*, u.name as customer_name 
            FROM Orders o
            JOIN Users u ON o.user_id = u.id
            WHERE o.id = ?
        `, [id]);
        
        if (!orders.length) return null;
        const order = orders[0];

        // 2. Fetch shipping address
        const [addresses] = await pool.query('SELECT * FROM Addresses WHERE id = ?', [order.address_id]);
        order.address = addresses[0] || {};

        // 3. Fetch line items
        const [items] = await pool.query(`
            SELECT oi.*, p.name 
            FROM OrderItems oi
            JOIN Products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [id]);
        order.items = items;

        return order;
    }
}

module.exports = AdminOrderModel;
