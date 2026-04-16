const pool = require('../config/db');

class AdminModel {
    static async getDashboardAnalytics() {
        // 1. Total Orders count
        const [ordersCount] = await pool.query('SELECT COUNT(*) as total_orders FROM Orders');
        
        // 2. Revenue (Sum of final_amount where payment hasn't officially failed)
        const [revenueRes] = await pool.query("SELECT SUM(final_amount) as total_revenue FROM Orders WHERE payment_status IN ('Paid', 'Pending')");
        
        // 3. Pending deliveries (Orders not yet naturally 'Delivered')
        const [pendingDelRes] = await pool.query("SELECT COUNT(*) as pending_deliveries FROM Orders WHERE status IN ('Placed', 'Packed', 'Out for Delivery')");
        
        // 4. Total Products count
        const [productsCount] = await pool.query('SELECT COUNT(*) as total_products FROM Products');

        // 5. Total Customers count (excluding admins)
        const [customersCount] = await pool.query("SELECT COUNT(*) as total_customers FROM Users WHERE role != 'admin'");
        
        // 6. Low stock alerts (Configuring threshold as stock <= 10)
        const [lowStockRes] = await pool.query('SELECT id, name, stock, image_url, unit FROM Products WHERE stock <= 10 ORDER BY stock ASC');

        return {
            total_orders: ordersCount[0].total_orders || 0,
            total_revenue: revenueRes[0].total_revenue || 0,
            pending_deliveries: pendingDelRes[0].pending_deliveries || 0,
            total_products: productsCount[0].total_products || 0,
            total_customers: customersCount[0].total_customers || 0,
            low_stock_products: lowStockRes
        };
    }
}

module.exports = AdminModel;
