const nodemailer = require('nodemailer');

/**
 * Mailer Utility
 * Configures the transporter and provides a function to send emails.
 */

// Create the transporter using environment variables
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // false for 587 (STARTTLS)
    requireTLS: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Sends an email
 * @param {Object} options - { to, subject, html }
 */
const sendEmail = async ({ to, subject, html }) => {
    const mailOptions = {
        from: `"FreshMart Security" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return { success: true, info };
    } catch (error) {
        console.error('Nodemailer Error:', error);
        throw error;
    }
};

module.exports = {
    sendEmail,
    transporter // Exported for verification scripts
};
