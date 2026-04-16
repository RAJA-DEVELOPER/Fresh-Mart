const pool = require('../config/db');

class ReportModel {
    static async getSalesStats(period) {
        let dateFormat = '%Y-%m-%d'; // Default daily
        if (period === 'monthly') dateFormat = '%Y-%m';
        
        const [rows] = await pool.query(
            `SELECT DATE_FORMAT(created_at, ?) as date, 
                    COUNT(*) as order_count, 
                    SUM(final_amount) as total_revenue
             FROM Orders 
             WHERE status NOT IN ('Cancelled', 'Refunded')
             GROUP BY date
             ORDER BY date DESC`,
            [dateFormat]
        );
        return rows;
    }

    static async getProductPerformance() {
        const [rows] = await pool.query(
            `SELECT p.id, p.name, 
                    SUM(oi.quantity) as total_qty, 
                    SUM(oi.quantity * oi.price) as revenue
             FROM OrderItems oi
             JOIN Products p ON oi.product_id = p.id
             JOIN Orders o ON oi.order_id = o.id
             WHERE o.status NOT IN ('Cancelled', 'Refunded')
             GROUP BY p.id
             ORDER BY total_qty DESC`
        );
        return rows;
    }

    static async getPeakOrderTimes() {
        // Peak hours (0-23)
        const [rows] = await pool.query(
            `SELECT HOUR(created_at) as hour, 
                    COUNT(*) as order_count
             FROM Orders
             WHERE status NOT IN ('Cancelled', 'Refunded')
             GROUP BY hour
             ORDER BY order_count DESC`
        );
        return rows;
    }
}

module.exports = ReportModel;
