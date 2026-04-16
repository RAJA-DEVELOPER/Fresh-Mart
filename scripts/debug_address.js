require('dotenv').config();
const pool = require('../config/db');
const AddressModel = require('../models/addressModel');

async function debug() {
    try {
        console.log('--- DB CONNECTION TEST ---');
        await pool.query('SELECT 1');
        console.log('✅ DB Connected.');

        console.log('\n--- ADDRESS INSERT TEST ---');
        const userId = 1; // Assuming user 1 exists, or just use a dummy id if FK allows
        const data = {
            street: 'Debug St',
            city: 'Debug City',
            state: 'DS',
            zip_code: '00000',
            country: 'DebugLand'
        };

        const id = await AddressModel.addAddress(userId, data);
        console.log('✅ Address inserted successfully. ID:', id);
        process.exit(0);
    } catch (e) {
        console.error('❌ Error:', e);
        process.exit(1);
    }
}

debug();
