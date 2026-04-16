require('dotenv').config();
const pool = require('../config/db');
const bcrypt = require('bcrypt');

async function setup() {
    try {
        console.log('--- Step 1: Checking for "role" column ---');
        try {
            await pool.query('ALTER TABLE Users ADD COLUMN role ENUM(\'customer\', \'admin\') DEFAULT \'customer\'');
            console.log('✅ Column "role" added successfully.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ Column "role" already exists.');
            } else {
                throw e;
            }
        }

        console.log('\n--- Step 2: Creating/Promoting Admin User ---');
        const email = 'admin_test@example.com';
        const password = 'Password@123';
        const name = 'Test Admin';
        const mobile = '1234567890';

        const [existing] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
        
        if (existing.length === 0) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            await pool.query(
                'INSERT INTO Users (name, email, mobile, password, role) VALUES (?, ?, ?, ?, ?)',
                [name, email, mobile, hashedPassword, 'admin']
            );
            console.log(`✅ User ${email} created as admin.`);
        } else {
            await pool.query('UPDATE Users SET role = ? WHERE email = ?', ['admin', email]);
            console.log(`✅ User ${email} promoted to admin.`);
        }

        console.log('\n--- Test Credentials ---');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

setup();
