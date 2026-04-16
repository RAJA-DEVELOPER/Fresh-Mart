const NotificationService = require('../utils/notificationService');
const pool = require('../config/db');

const sendOfferNotification = async (req, res, next) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ success: false, message: "Offer message is required" });

        // Fetch all users to broadcast offer
        const [users] = await pool.query('SELECT id FROM Users');
        
        for (const user of users) {
             await NotificationService.notifyUser(user.id, 'OFFER', message);
        }

        res.status(200).json({ success: true, message: `Offer successfully broadcasted to ${users.length} users via Email, SMS, and WhatsApp.` });
    } catch (error) {
         next(error);
    }
};

const getMyNotifications = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const [notifications] = await pool.query('SELECT * FROM Notifications WHERE user_id = ? ORDER BY sent_at DESC', [userId]);
        res.status(200).json({ success: true, count: notifications.length, notifications });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    sendOfferNotification,
    getMyNotifications
};
