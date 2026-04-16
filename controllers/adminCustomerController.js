const AdminCustomerModel = require('../models/adminCustomerModel');

const getAllUsers = async (req, res, next) => {
    try {
        const customers = await AdminCustomerModel.getAllUsers();
        res.status(200).json({ success: true, count: customers.length, customers });
    } catch (e) { next(e); }
};

const getUserOrderHistory = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const data = await AdminCustomerModel.getUserOrderHistory(userId);

        if (!data) return res.status(404).json({ success: false, message: 'User not found' });

        res.status(200).json({ success: true, data });
    } catch (e) { next(e); }
};

const getFrequentBuyers = async (req, res, next) => {
    try {
        // Allow admin to set the minimum orders threshold using query param
        const minOrders = parseInt(req.query.min_orders) || 3;
        const buyers = await AdminCustomerModel.getFrequentBuyers(minOrders);

        res.status(200).json({
            success: true,
            count: buyers.length,
            threshold: `${minOrders}+ orders`,
            frequent_buyers: buyers
        });
    } catch (e) { next(e); }
};

module.exports = { getAllUsers, getUserOrderHistory, getFrequentBuyers };
