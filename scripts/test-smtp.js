require('dotenv').config();
const { transporter } = require('../utils/mailer');

/**
 * Script to test SMTP Configuration
 * Run this to verify if your EMAIL_USER and EMAIL_PASS are correct.
 */

async function testConnection() {
    console.log('--- SMTP Connection Test ---');
    console.log('User:', process.env.EMAIL_USER);
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('Error: EMAIL_USER or EMAIL_PASS is missing in .env');
        process.exit(1);
    }

    try {
        // Verify connection configuration
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('✅ Connection is successful! Your credentials are correct.');

        // Send a test email
        const mailOptions = {
            from: `"Test Service" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'FreshMart - SMTP Test Email',
            text: 'If you are reading this, your Nodemailer setup is working perfectly!',
            html: '<b>Success!</b> Your Nodemailer setup is working perfectly!'
        };

        console.log('Sending test email to self...');
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully!');
        console.log('Response:', info.response);
        
    } catch (error) {
        console.error('❌ SMTP Test Failed!');
        console.error('Error details:', error.message);
        
        if (error.message.includes('Invalid login')) {
            console.log('\nTip: If you are using Gmail, make sure you are using an "App Password", not your regular password.');
        }
    } finally {
        process.exit();
    }
}

testConnection();
