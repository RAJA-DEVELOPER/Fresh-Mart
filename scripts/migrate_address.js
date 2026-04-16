require('dotenv').config();
const pool = require('../config/db');

async function migrate() {
    try {
        console.log('--- STARTING ADDRESS TABLE MIGRATION ---');

        // Check if street_address exists
        const [columns] = await pool.query('SHOW COLUMNS FROM Addresses');
        const hasStreetAddress = columns.some(c => c.Field === 'street_address');
        const hasPostalCode = columns.some(c => c.Field === 'postal_code');

        if (hasStreetAddress) {
            console.log('🔄 Renaming street_address to street...');
            await pool.query('ALTER TABLE Addresses CHANGE street_address street VARCHAR(255) NOT NULL');
            console.log('✅ street column fixed.');
        } else {
            console.log('ℹ️ street column already looks correct or street_address missing.');
        }

        if (hasPostalCode) {
            console.log('🔄 Renaming postal_code to zip_code...');
            await pool.query('ALTER TABLE Addresses CHANGE postal_code zip_code VARCHAR(20) NOT NULL');
            console.log('✅ zip_code column fixed.');
        } else {
            console.log('ℹ️ zip_code column already looks correct or postal_code missing.');
        }

        console.log('\n--- MIGRATION COMPLETE ---');
        process.exit(0);
    } catch (e) {
        console.error('❌ Migration failed:', e);
        process.exit(1);
    }
}

migrate();
