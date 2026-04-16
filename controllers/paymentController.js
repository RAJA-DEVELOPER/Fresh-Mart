const OrderModel = require('../models/orderModel');

const initiatePayment = async (req, res, next) => {
    try {
        const { orderId, method } = req.body;
        if (!orderId || !method) {
            return res.status(400).json({ success: false, message: 'orderId and payment method are required' });
        }

        // Generate a mock transaction ID
        const transactionId = 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase();
        
        // In a real scenario, you'd call Razorpay/Stripe API here to get an order_id or client_secret
        res.status(200).json({
            success: true,
            transaction_id: transactionId,
            message: 'Payment initiated. Proceed with simulation.'
        });
    } catch (e) {
        next(e);
    }
};

const processPayment = async (req, res, next) => {
    try {
        const { orderId, status } = req.body;
        const io = req.app.get('io');

        // Simulate network delay
        setTimeout(async () => {
            const isSuccess = status === 'success';
            const newStatus = isSuccess ? 'Paid' : 'Failed';

            // Update order in DB
            const pool = require('../config/db');
            await pool.query('UPDATE Orders SET payment_status = ? WHERE id = ?', [newStatus, orderId]);

            // Emit real-time status to the client
            if (io) {
                io.emit(`payment_status_${orderId}`, {
                    success: isSuccess,
                    status: newStatus,
                    message: isSuccess ? 'Payment completed successfully' : 'Payment was declined by the bank'
                });

                // If success, notify admin about the cleared payment
                if (isSuccess) {
                    io.to('admin_room').emit('ORDER_STATUS_UPDATE', { id: orderId, status: 'Paid' });
                }
            }
        }, 2000);

        res.status(200).json({ success: true, message: 'Payment processing started' });
    } catch (e) {
        next(e);
    }
};

module.exports = { initiatePayment, processPayment };
