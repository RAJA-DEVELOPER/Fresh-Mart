const OrderModel = require('./models/orderModel');
require('dotenv').config();

async function test() {
    try {
        console.log('Testing getOrderDetails...');
        const pool = require('./config/db');
        const [orders] = await pool.query('SELECT * FROM Orders ORDER BY id DESC LIMIT 1');
        if (!orders.length) {
            console.log('No orders to test.');
            process.exit(0);
        }
        
        const orderId = orders[0].id;
        const userId = orders[0].user_id;
        console.log(`Testing Order ID: ${orderId}, User ID: ${userId}`);
        
        const order = await OrderModel.getOrderDetails(orderId, userId);
        console.log('Success!', JSON.stringify(order));
    } catch (e) {
        console.error('Failure:', e.stack);
    }
    process.exit(0);
}

test();
