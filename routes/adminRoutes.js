const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { authorize } = authMiddleware;
const { getDashboardStats } = require('../controllers/adminController');
const { getAllOrders, getOrderDetails, assignDelivery, cancelOrder } = require('../controllers/adminOrderController');
const { updateOrderStatus } = require('../controllers/orderController');
const { getAllUsers, getUserOrderHistory, getFrequentBuyers } = require('../controllers/adminCustomerController');
const { createCoupon, getAllCoupons, updateCoupon, deleteCoupon } = require('../controllers/couponController');
const { getSalesReport, getProductReport, getPeakTimesReport } = require('../controllers/reportController');
const { getAllZones, getDeliverySlots, createZone, updateZone, deleteZone } = require('../controllers/deliveryController');
const { sendPromo } = require('../controllers/adminPromoController');

// Using standard authMiddleware for authentication, then authorize for roles.
router.use(authMiddleware);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.post('/promo', sendPromo);

// Admin Order Management Endpoints
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderDetails);
router.put('/orders/:id/status', updateOrderStatus); // Expose status mapping securely!
router.put('/orders/:id/assign', assignDelivery);
router.put('/orders/:id/cancel', cancelOrder);

// Admin Customer Management Endpoints
router.get('/customers', getAllUsers);
router.get('/customers/frequent', getFrequentBuyers);
router.get('/customers/:id/orders', getUserOrderHistory);

// Admin Coupon Management
router.post('/coupons', createCoupon);
router.get('/coupons', getAllCoupons);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

// Admin Reports & Analytics
router.get('/reports/sales', getSalesReport);
router.get('/reports/products', getProductReport);
router.get('/reports/peak-times', getPeakTimesReport);

// Admin Delivery/Logistics
router.get('/delivery/zones', getAllZones);
router.post('/delivery/zones', createZone);
router.put('/delivery/zones/:id', updateZone);
router.delete('/delivery/zones/:id', deleteZone);
router.get('/delivery/slots', getDeliverySlots);

module.exports = router;

