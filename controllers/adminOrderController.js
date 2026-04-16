const AdminOrderModel = require('../models/adminOrderModel');
const NotificationService = require('../utils/notificationService');
const pool = require('../config/db');

const getAllOrders = async (req, res, next) => {
    try {
        const orders = await AdminOrderModel.getAllOrders();
        res.status(200).json({ success: true, count: orders.length, orders });
    } catch (e) { next(e); }
};

const assignDelivery = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const { name, contact } = req.body;
        if (!name || !contact) return res.status(400).json({ success: false, message: 'Delivery name and contact fields are explicitly required' });

        const updated = await AdminOrderModel.assignDeliveryPerson(orderId, name, contact);
        if (!updated) return res.status(404).json({ success: false, message: 'Order not found' });

        // Notify User
        const [users] = await pool.query('SELECT user_id FROM Orders WHERE id = ?', [orderId]);
        if (users.length) {
             await NotificationService.notifyUser(users[0].user_id, 'STATUS_UPDATE', `Your order #${orderId} was just assigned to delivery partner: ${name} (${contact}).`, null, ['WHATSAPP', 'EMAIL']);
        }

        res.status(200).json({ success: true, message: `Delivery assigned successfully to ${name}` });
    } catch (e) { next(e); }
};

const cancelOrder = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const response = await AdminOrderModel.cancelAndRefundOrder(orderId);
        
        if (!response.success) {
            return res.status(400).json(response);
        }

        // Notify user about cancellation natively
        const [users] = await pool.query('SELECT user_id FROM Orders WHERE id = ?', [orderId]);
        if (users.length) {
             await NotificationService.notifyUser(users[0].user_id, 'STATUS_UPDATE', `Your order #${orderId} has successfully been Cancelled/Refunded.`, null, ['WHATSAPP', 'EMAIL']);
        }

        res.status(200).json(response);
    } catch (e) { next(e); }
};

const getOrderDetails = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const order = await AdminOrderModel.getOrderFullDetails(orderId);
        
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        
        res.status(200).json({ success: true, order });
    } catch (e) { next(e); }
};

module.exports = { getAllOrders, assignDelivery, cancelOrder, getOrderDetails };
