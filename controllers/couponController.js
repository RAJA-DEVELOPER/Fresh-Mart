const CouponModel = require('../models/couponModel');

const createCoupon = async (req, res, next) => {
    try {
        const { code, discount_type, discount_value, max_discount, min_order_value, valid_until } = req.body;
        if (!code || !discount_type || discount_value === undefined || !valid_until) {
            return res.status(400).json({ success: false, message: 'code, discount_type, discount_value, and valid_until are required' });
        }
        const couponId = await CouponModel.createCoupon(req.body);
        res.status(201).json({ success: true, message: 'Coupon created successfully', couponId });
    } catch (error) {
        next(error);
    }
};

const getAllCoupons = async (req, res, next) => {
    try {
        const coupons = await CouponModel.getAllCoupons();
        res.status(200).json({ success: true, count: coupons.length, coupons });
    } catch (error) {
        next(error);
    }
};

const updateCoupon = async (req, res, next) => {
    try {
        const updated = await CouponModel.updateCoupon(req.params.id, req.body);
        if (!updated) return res.status(404).json({ success: false, message: 'Coupon not found' });
        res.status(200).json({ success: true, message: 'Coupon updated successfully' });
    } catch (error) {
        next(error);
    }
};

const deleteCoupon = async (req, res, next) => {
    try {
        const deleted = await CouponModel.deleteCoupon(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Coupon not found' });
        res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { createCoupon, getAllCoupons, updateCoupon, deleteCoupon };
