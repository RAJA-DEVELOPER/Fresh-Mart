const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { sendEmail } = require('../utils/mailer');

// Temporary in-memory OTP store for demonstration
// Format: { 'user@example.com': { otp: '123456', expires: 1612111111111 } }
const otpStore = new Map();

const register = async (req, res, next) => {
    try {
        const { name, email, mobile, password } = req.body;
        
        if (!name || (!email && !mobile) || !password) {
            return res.status(400).json({ success: false, message: 'Name, password, and either email or mobile are required' });
        }

        const identifier = email || mobile;
        const existingUser = await UserModel.findByEmailOrMobile(identifier);
        
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this email/mobile already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Store to Database
        const userId = await UserModel.createUser(name, email, mobile, hashedPassword);

        res.status(201).json({ success: true, message: 'User registered successfully', userId });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { identifier, password } = req.body; // identifier can be email or mobile

        if (!identifier || !password) {
            return res.status(400).json({ success: false, message: 'Email/Mobile and password are required' });
        }

        const user = await UserModel.findByEmailOrMobile(identifier);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({ success: true, token, user, message: 'Login successful' });
    } catch (error) {
        next(error);
    }
};

const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await UserModel.findById(userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { name } = req.body;
        
        if (!name) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }

        await UserModel.updateName(userId, name);
        res.status(200).json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        next(error);
    }
};

const forgotPassword = async (req, res, next) => {
    try {
        const { identifier } = req.body;

        if (!identifier) {
            return res.status(400).json({ success: false, message: 'Email/Mobile is required' });
        }

        const user = await UserModel.findByEmailOrMobile(identifier);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP with 10 minutes expiry
        otpStore.set(identifier, {
            otp,
            expires: Date.now() + 10 * 60 * 1000 // 10 minutes
        });

        console.log(`[OTP Generated] For ${identifier}: ${otp}`);

        // If identifier is an email, send actual email
        if (identifier.includes('@')) {
            const htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                    <h2 style="color: #047857; text-align: center;">FreshMart Password Reset</h2>
                    <p style="color: #475569; font-size: 16px;">Hello,</p>
                    <p style="color: #475569; font-size: 16px;">We received a request to reset the password for your FreshMart account. Please use the following One-Time Password (OTP) to complete the process. This OTP is valid for 10 minutes.</p>
                    
                    <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; margin: 25px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a;">${otp}</span>
                    </div>
                    
                    <p style="color: #475569; font-size: 14px;">If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
                    <div style="margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: center;">
                        &copy; ${new Date().getFullYear()} FreshMart Supermarket. All rights reserved.
                    </div>
                </div>
            `;

            try {
                await sendEmail({
                    to: identifier,
                    subject: 'FreshMart - Password Reset OTP',
                    html: htmlContent
                });
                
                return res.status(200).json({ 
                    success: true, 
                    message: 'OTP has been sent to your email address.'
                });
            } catch (mailError) {
                console.error("Mail Send Error:", mailError);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Failed to send OTP email. Please ensure your EMAIL_USER and EMAIL_PASS are correct in the .env file.' 
                });
            }
        } else {
            // For Mobile numbers, we keep the mock behavior (Twilio can be added here)
            res.status(200).json({ 
                success: true, 
                message: 'OTP generated for mobile. (Check server logs for the code)',
                testOtp: otp 
            });
        }

    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { identifier, otp, newPassword } = req.body;
        
        if (!identifier || !otp || !newPassword) {
            return res.status(400).json({ success: false, message: 'Email/Mobile, OTP, and new password are required' });
        }

        const user = await UserModel.findByEmailOrMobile(identifier);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Verify OTP
        const storedOtpData = otpStore.get(identifier);
        if (!storedOtpData) {
            return res.status(400).json({ success: false, message: 'No OTP requested or OTP has expired' });
        }

        if (storedOtpData.expires < Date.now()) {
            otpStore.delete(identifier);
            return res.status(400).json({ success: false, message: 'OTP has expired' });
        }

        if (storedOtpData.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await UserModel.updatePassword(user.id, hashedPassword);

        // Clear OTP after successful reset
        otpStore.delete(identifier);

        res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    forgotPassword,
    resetPassword
};
