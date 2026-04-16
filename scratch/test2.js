const OrderModel = require('../models/orderModel');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function test() {
    try {
        const order = await OrderModel.getOrderDetails(1, 1);
        console.log(order);
    } catch (e) {
        console.error(e);
    } process.exit(0);
}
test();
