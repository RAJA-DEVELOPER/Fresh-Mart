require('dotenv').config();
const pool = require('./config/db');

async function makeAdmin(emailOrMobile) {
    if (!emailOrMobile) {
        console.error('Please provide the registered email address or mobile number as an argument.');
        console.log('Example: node make-admin.js john@example.com');
        process.exit(1);
    }

    try {
        const [result] = await pool.query(
            "UPDATE Users SET role = 'admin' WHERE email = ? OR mobile = ?", 
            [emailOrMobile, emailOrMobile]
        );

        if (result.affectedRows > 0) {
            console.log(`✅ Success! The account for '${emailOrMobile}' is now an Admin.`);
            console.log('Please log out and log back in to access the admin dashboard.');
        } else {
            console.log(`⚠️ User '${emailOrMobile}' not found in the database.`);
        }
        process.exit(0);
    } catch (err) {
        console.error('Error updating user role:', err);
        process.exit(1);
    }
}

makeAdmin(process.argv[2]);
