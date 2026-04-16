const http = require('http');

const email = 'admin_test@example.com';
const password = 'Password@123';

function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ statusCode: res.statusCode, body: JSON.parse(body) });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, body });
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function runTest() {
    console.log('--- API ACCESS TEST ---');
    
    try {
        // 1. Login
        console.log(`1. Logging in as ${email}...`);
        const loginRes = await makeRequest({
            hostname: 'localhost',
            port: 8000,
            path: '/api/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { identifier: email, password });

        if (loginRes.statusCode !== 200) {
            console.error('❌ Login failed:', loginRes.body);
            return;
        }
        
        const token = loginRes.body.token;
        console.log('✅ Login successful. Token received.');

        // 2. Test Admin Route
        console.log('\n2. Accessing /api/admin/dashboard...');
        const adminRes = await makeRequest({
            hostname: 'localhost',
            port: 8000,
            path: '/api/admin/dashboard',
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            }
        });

        if (adminRes.statusCode === 200) {
            console.log('✅ Admin Access Granted! Dashboard data received:');
            console.log(JSON.stringify(adminRes.body.stats, null, 2));
        } else {
            console.error(`❌ Admin Access Denied! Status: ${adminRes.statusCode}`);
            console.error('Response:', adminRes.body);
        }

    } catch (error) {
        console.error('❌ Error during test:', error.message);
        console.log('Is the server running on port 8000?');
    }
}

runTest();
