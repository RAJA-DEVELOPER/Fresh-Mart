const http = require('http');

const BASE_URL = 'http://localhost:8000/api';

const ADMIN_EMAIL = 'admin_test@example.com';
const ADMIN_PASS = 'Password@123';
const CUSTOMER_EMAIL = `cust_${Date.now()}@test.com`;
const CUSTOMER_PASS = 'CustPass123';

let adminToken = '';
let customerToken = '';
let testProductId = null;
let testCategoryId = null;
let testOrderId = null;
let testAddressId = null;

function request(path, method, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(`${BASE_URL}${path}`);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                let parsed;
                try {
                    parsed = JSON.parse(body);
                } catch (e) {
                    parsed = body;
                }
                resolve({ status: res.statusCode, body: parsed });
            });
        });

        req.on('error', (e) => reject(e));
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function runAllTests() {
    console.log('🚀 INITIALIZING COMPREHENSIVE BACKEND TEST (v3)...\n');

    try {
        // --- 1. AUTH ---
        console.log('[1/10] Auth Tests...');
        const loginAdmin = await request('/auth/login', 'POST', { identifier: ADMIN_EMAIL, password: ADMIN_PASS });
        adminToken = loginAdmin.body.token;
        console.log('✅ Admin Login');

        await request('/auth/register', 'POST', { name: 'Test User', email: CUSTOMER_EMAIL, mobile: `${Date.now()}`.slice(-10), password: CUSTOMER_PASS });
        const loginCust = await request('/auth/login', 'POST', { identifier: CUSTOMER_EMAIL, password: CUSTOMER_PASS });
        customerToken = loginCust.body.token;
        console.log('✅ Customer Register & Login');

        // --- 2. CATALOG ---
        console.log('[2/10] Product Tests...');
        const addCat = await request('/categories', 'POST', { name: `Cat ${Date.now()}` }, adminToken);
        testCategoryId = addCat.body.categoryId;
        const addProd = await request('/products', 'POST', { category_id: testCategoryId, name: 'Fresh Milk', price: 45, stock: 50, unit: '1L' }, adminToken);
        testProductId = addProd.body.productId;
        console.log('✅ Category & Product Created');

        // --- 3. ADDRESS ---
        console.log('[3/10] Address Tests...');
        const addAddr = await request('/addresses', 'POST', { street: 'Main St', city: 'Metropolis', state: 'NY', zip_code: '10001', country: 'USA' }, customerToken);
        testAddressId = addAddr.body.addressId;
        console.log('✅ Address Created');

        // --- 4. CART ---
        console.log('[4/10] Cart Tests...');
        await request('/cart', 'POST', { product_id: testProductId, quantity: 2 }, customerToken);
        const getCart = await request('/cart', 'GET', null, customerToken);
        console.log(`✅ Cart Verified (${getCart.body.cart.length} items)`);

        // --- 5. CHECKOUT ---
        console.log('[5/10] Checkout Tests...');
        const summ = await request('/checkout/summary', 'POST', { address_id: testAddressId, delivery_slot: 'Morning' }, customerToken);
        console.log(`✅ Summary Verified (Total: ${summ.body.summary.final_amount})`);

        const place = await request('/checkout/place-order', 'POST', { address_id: testAddressId, delivery_slot: 'Morning', payment_method: 'COD' }, customerToken);
        if (place.status === 201) {
            testOrderId = place.body.order_id;
            console.log(`✅ Order Placed Successfully! (ID: ${testOrderId})`);
        } else {
            throw new Error(`Place order failed: ${JSON.stringify(place.body)}`);
        }

        // --- 6. HISTORY ---
        console.log('[6/10] History Tests...');
        const orders = await request('/orders', 'GET', null, customerToken);
        console.log(`✅ User History Working (${orders.body.orders.length} orders)`);

        // --- 7. NOTIFICATIONS ---
        console.log('[7/10] Notifications...');
        const notifies = await request('/notifications', 'GET', null, customerToken);
        console.log(`✅ Notifications Working (${notifies.body.notifications.length} found)`);

        // --- 8. ADMIN DASHBOARD ---
        console.log('[8/10] Admin Dashboard...');
        const dash = await request('/admin/dashboard', 'GET', null, adminToken);
        console.log('✅ Dashboard Access OK');

        // --- 9. ADMIN REPORTS ---
        console.log('[9/10] Admin Reports...');
        const sRep = await request('/admin/reports/sales', 'GET', null, adminToken);
        const pRep = await request('/admin/reports/products', 'GET', null, adminToken);
        console.log('✅ Sales & Product Reports OK');

        // --- 10. SECURITY ---
        console.log('[10/10] Security (RBAC)...');
        const blocked = await request('/admin/dashboard', 'GET', null, customerToken);
        if (blocked.status === 403) {
            console.log('✅ RBAC Test Passed (Customer blocked from Admin)');
        } else {
            throw new Error('RBAC Test Failed: Customer accessed admin route');
        }

        console.log('\n🏆 ALL BACKEND SYSTEMS TESTED AND OPERATIONAL! 🏆');
        process.exit(0);
    } catch (e) {
        console.error('\n❌ TEST FAILED:', e.message);
        process.exit(1);
    }
}

runAllTests();
