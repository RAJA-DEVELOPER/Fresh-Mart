const pool = require('../config/db');
const NotificationService = require('../utils/notificationService');

const sendPromo = async (req, res, next) => {
    try {
        const { title, message, channel } = req.body;
        if (!title || !message) {
            return res.status(400).json({ success: false, message: 'Title and message are required' });
        }

        const io = req.app.get('io');
        
        // Fetch all active users to send promo
        const [users] = await pool.query('SELECT id FROM Users WHERE role = "customer"');
        
        const promoType = 'OFFERS_PROMOTIONS';
        const promoMessage = `${title}: ${message}`;

        // Send notifications to all users (Simulated async)
        const promises = users.map(user => 
            NotificationService.notifyUser(user.id, promoType, promoMessage, io)
        );

        await Promise.all(promises);

        res.status(200).json({ 
            success: true, 
            message: `Promo sent to ${users.length} users successfully.` 
        });
    } catch (e) {
        next(e);
    }
};

module.exports = { sendPromo };
