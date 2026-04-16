const OrderModel = require('../models/orderModel');
const CartModel = require('../models/cartModel');

const placeOrder = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        const cartItems = await CartModel.getCart(userId);
        if (cartItems.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        let totalAmount = 0;
        for (const item of cartItems) {
            if (item.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for product: ${item.name}`
                });
            }
            totalAmount += item.price * item.quantity;
        }

        const orderId = await OrderModel.placeOrder(userId, parseFloat(totalAmount.toFixed(2)), cartItems);
        
        await CartModel.clearCart(userId);

        res.status(201).json({ success: true, message: 'Order placed successfully', orderId });
    } catch (error) {
        // Handle custom transaction error or fallback
        if (error.message.includes('Insufficient stock for product')) {
             return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const getOrderHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const orders = await OrderModel.getOrderHistory(userId);
        res.status(200).json({ success: true, count: orders.length, orders });
    } catch (error) {
        next(error);
    }
};

const getOrderDetails = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const orderId = req.params.id;
        
        const order = await OrderModel.getOrderDetails(orderId, userId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.status(200).json({ success: true, order });
    } catch (error) {
        next(error);
    }
};

const updateOrderStatus = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;

        const validStatuses = ['Placed', 'Packed', 'Out for Delivery', 'Delivered'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status. Must be Placed, Packed, Out for Delivery, or Delivered.' });
        }

        const updated = await OrderModel.updateOrderStatus(orderId, status);
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const pool = require('../config/db');
        const io = req.app.get('io');
        const [rows] = await pool.query('SELECT user_id FROM Orders WHERE id = ?', [orderId]);
        if (rows.length > 0) {
            const NotificationService = require('../utils/notificationService');
            await NotificationService.notifyUser(
                rows[0].user_id,
                'DELIVERY_UPDATE',
                `Your order #${orderId} status has been updated to: ${status}`,
                io,
                ['WHATSAPP', 'EMAIL']
            );
        }

        // Trigger real-time update for admin & client
        if (io) {
            io.to('admin_room').emit('ORDER_STATUS_UPDATE', { id: orderId, status });
        }

        res.status(200).json({ success: true, message: `Order status successfully updated to ${status}` });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    placeOrder,
    getOrderHistory,
    getOrderDetails,
    updateOrderStatus
};
