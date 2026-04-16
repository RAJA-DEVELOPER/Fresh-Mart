const AdminModel = require('../models/adminModel');

const getDashboardStats = async (req, res, next) => {
    try {
        const stats = await AdminModel.getDashboardAnalytics();
        
        res.status(200).json({
            success: true,
            data: {
                totalOrders: stats.total_orders,
                totalSales: parseFloat(stats.total_revenue || 0).toFixed(2),
                totalProducts: stats.total_products,
                totalCustomers: stats.total_customers,
                pendingDeliveries: stats.pending_deliveries,
                lowStockCount: stats.low_stock_products.length,
                lowStockAlerts: stats.low_stock_products
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStats
};
