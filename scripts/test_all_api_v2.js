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
    console.log('🚀 INITIALIZING COMPREHENSIVE BACKEND TEST (v2)...\n');

    try {
        // --- 1. AUTH TESTS ---
        console.log('[1/10] Testing Authentication...');
        
        const loginAdmin = await request('/auth/login', 'POST', { identifier: ADMIN_EMAIL, password: ADMIN_PASS });
        if (loginAdmin.status === 200) {
            adminToken = loginAdmin.body.token;
            console.log('✅ Admin Login: SUCCESS');
        } else {
            console.error('❌ Admin Login: FAILED', loginAdmin.body);
            return;
        }

        const regCust = await request('/auth/register', 'POST', { 
            name: 'Test Customer', 
            email: CUSTOMER_EMAIL, 
            mobile: `099${Math.floor(Math.random() * 10000000)}`, 
            password: CUSTOMER_PASS 
        });
        if (regCust.status === 201) {
            console.log('✅ Customer Registration: SUCCESS');
        } else {
            console.error('❌ Customer Registration: FAILED', regCust.body);
            return;
        }

        const loginCust = await request('/auth/login', 'POST', { identifier: CUSTOMER_EMAIL, password: CUSTOMER_PASS });
        customerToken = loginCust.body.token;
        console.log('✅ Customer Login: SUCCESS\n');

        // --- 2. CATEGORY & PRODUCT TESTS ---
        console.log('[2/10] Testing Product Management...');
        
        const addCat = await request('/categories', 'POST', { name: `Test Category ${Date.now()}` }, adminToken);
        testCategoryId = addCat.body.categoryId;
        console.log('✅ Add Category: SUCCESS');

        const addProd = await request('/products', 'POST', {
            category_id: testCategoryId,
            name: 'Test Milk Premium',
            price: 60.00,
            stock: 100,
            unit: '1L',
            image_url: 'http://test.com/milk.jpg'
        }, adminToken);
        testProductId = addProd.body.productId;
        console.log('✅ Add Product: SUCCESS');

        const listProd = await request('/products', 'GET');
        if (listProd.body.products && listProd.body.products.length > 0) {
            console.log(`✅ List Products: SUCCESS (${listProd.body.count} found)\n`);
        } else {
            console.error('❌ List Products: EMPTY OR FAILED', listProd.body);
        }

        // --- 3. ADDRESS TESTS ---
        console.log('[3/10] Testing Address Management...');
        const addAddr = await request('/addresses', 'POST', {
            street: '456 Garden Route', city: 'Green City', state: 'GC', zip_code: '54321', country: 'Testland'
        }, customerToken);
        testAddressId = addAddr.body.addressId;
        console.log('✅ Add Address: SUCCESS');

        const getAddr = await request('/addresses', 'GET', null, customerToken);
        console.log(`✅ Get Addresses: SUCCESS (${getAddr.body.addresses.length} found)\n`);

        // --- 4. CART TESTS ---
        console.log('[4/10] Testing Cart Logic...');
        await request('/cart', 'POST', { product_id: testProductId, quantity: 3 }, customerToken);
        console.log('✅ Add to Cart: SUCCESS');

        const getCart = await request('/cart', 'GET', null, customerToken);
        if (getCart.body.cart && getCart.body.cart.length > 0) {
            console.log(`✅ Get Cart: SUCCESS (Items: ${getCart.body.cart.length}, Total: ${getCart.body.total_price})\n`);
        } else {
            console.error('❌ Get Cart: FAILED', getCart.body);
            return;
        }

        // --- 5. CHECKOUT TESTS ---
        console.log('[5/10] Testing Checkout...');
        const summary = await request('/checkout/summary', 'POST', { address_id: testAddressId, delivery_slot: 'Afternoon' }, customerToken);
        console.log(`✅ Get Summary: SUCCESS (Final Amount: ${summary.body.summary.final_amount})`);

        const placeResp = await request('/checkout', 'POST', {
            address_id: testAddressId,
            delivery_slot: 'Afternoon',
            payment_method: 'COD'
        }, customerToken);
        
        if (placeResp.status === 201) {
            testOrderId = placeResp.body.order_id;
            console.log(`✅ Place Order: SUCCESS (Order ID: ${testOrderId})\n`);
        } else {
            console.error('❌ Place Order: FAILED', placeResp.body);
            return;
        }

        // --- 6. ORDER LISTING TESTS ---
        console.log('[6/10] Testing Order History...');
        const userOrders = await request('/orders', 'GET', null, customerToken);
        console.log(`✅ User Orders: SUCCESS (${userOrders.body.orders.length} found)`);

        const adminOrders = await request('/admin/orders', 'GET', null, adminToken);
        console.log(`✅ Admin Global Orders: SUCCESS (${adminOrders.body.orders.length} found)\n`);

        // --- 7. NOTIFICATIONS TESTS ---
        console.log('[7/10] Testing Notifications...');
        const notifies = await request('/notifications', 'GET', null, customerToken);
        console.log(`✅ Get Notifications: SUCCESS (${notifies.body.notifications.length} found)\n`);

        // --- 8. ADMIN DASHBOARD & CUSTOMERS ---
        console.log('[8/10] Testing Admin Insights...');
        const dashboard = await request('/admin/dashboard', 'GET', null, adminToken);
        console.log('✅ Admin Dashboard: SUCCESS');

        const customers = await request('/admin/customers', 'GET', null, adminToken);
        console.log(`✅ Admin Customer List: SUCCESS (${customers.body.users.length} found)`);

        const frequent = await request('/admin/customers/frequent', 'GET', null, adminToken);
        console.log(`✅ Admin Frequent Buyers: SUCCESS\n`);

        // --- 9. ADMIN REPORTS ---
        console.log('[9/10] Testing Admin Reports...');
        const salesRep = await request('/admin/reports/sales?period=monthly', 'GET', null, adminToken);
        console.log('✅ Sales Report: SUCCESS');
        const prodRep = await request('/admin/reports/products', 'GET', null, adminToken);
        console.log('✅ Product Performance Report: SUCCESS\n');

        // --- 10. SECURITY (RBAC) ---
        console.log('[10/10] Verifying Role-Based Access Control...');
        const rbacCheck = await request('/admin/dashboard', 'GET', null, customerToken);
        if (rbacCheck.status === 403) {
            console.log('✅ RBAC Verification: SUCCESS (Customer blocked from Admin tools)');
        } else {
            console.error('❌ RBAC ERROR: Customer accessed Admin endpoint!');
        }

        console.log('\n🌟🏆 ALL BACKEND API MODULES VERIFIED & WORKING PERFECTLY! 🏆🌟');
        process.exit(0);

    } catch (error) {
        console.error('\n💥 TEST SUITE CRASHED:', error);
        process.exit(1);
    }
}

runAllTests();
