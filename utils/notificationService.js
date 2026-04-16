const pool = require('../config/db');
const { sendEmail } = require('./mailer');

class NotificationService {
    static async sendNotification(userId, type, channel, message) {
        // 1. Log to DB
        await pool.query(
            'INSERT INTO Notifications (user_id, type, channel, message) VALUES (?, ?, ?, ?)',
            [userId, type, channel, message]
        );

        // 2. Deliver the payload
        if (channel === 'EMAIL') {
            try {
                // Fetch user info for actual email dispatch
                const [rows] = await pool.query('SELECT name, email FROM Users WHERE id = ?', [userId]);
                if (rows.length > 0 && rows[0].email) {
                    const user = rows[0];
                    await sendEmail({
                        to: user.email,
                        subject: `FreshMart Alert: ${type.replace(/_/g, ' ')}`,
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; background: #fff; padding: 30px; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
                                <h1 style="color: #059669; font-size: 24px; margin-top: 0;">FreshMart</h1>
                                <p style="font-size: 16px;">Hello <strong>${user.name}</strong>,</p>
                                <p style="font-size: 16px; line-height: 1.5; padding: 20px; background: #f8fafc; border-radius: 12px; margin: 24px 0;">
                                    ${message}
                                </p>
                                <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
                                    Thank you for shopping with us!<br>The FreshMart Team
                                </p>
                            </div>
                        `
                    });
                } else {
                    console.log(`[INFO] Skipped real EMAIL notification for User ${userId} (No email on record)`);
                }
            } catch (err) {
                console.error(`[ERROR] Failed to send real email for user ${userId}:`, err);
            }
        } else {
            // For SMS/WhatsApp fallback to console mock until an API like Twilio is integrated
            console.log(`\n[MOCK NOTIFICATION]`);
            console.log(`To: User ID ${userId}`);
            console.log(`Channel: ${channel}`);
            console.log(`Type: ${type}`);
            console.log(`Message: ${message}\n`);
        }
    }

    static async notifyUser(userId, type, message, io = null, channels = ['WHATSAPP']) {
        // Dispatch all notifications concurrently
        const promises = channels.map(channel =>
            this.sendNotification(userId, type, channel, message)
        );

        await Promise.all(promises);

        // Real-time emission via Socket.io
        if (io) {
            io.emit(`NOTIFICATION_${userId}`, {
                type,
                message,
                timestamp: new Date(),
                channels: channels
            });
        }
    }
}

module.exports = NotificationService;
