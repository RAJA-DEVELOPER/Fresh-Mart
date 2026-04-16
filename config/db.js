const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Enable SSL for cloud databases (Render/Aiven/etc.)
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Test the connection with more detailed logging
pool.getConnection()
    .then(connection => {
        console.log('✅ DB connected successfully to:', process.env.DB_HOST);
        connection.release();
    })
    .catch(err => {
        console.error('❌ DB Connection Error Details:');
        console.error('Host:', process.env.DB_HOST);
        console.error('User:', process.env.DB_USER);
        console.error('Error:', err.message);
        
        if (err.code === 'ECONNREFUSED') {
            console.error('Suggestion: Check if the DB host and port are correct and the DB is running.');
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Suggestion: Check your DB username and password.');
        } else if (err.message.includes('ssl')) {
            console.error('Suggestion: Your database might require SSL. Try setting DB_SSL=true in environment variables.');
        }
    });

module.exports = pool;
