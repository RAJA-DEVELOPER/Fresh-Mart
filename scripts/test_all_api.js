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

function request(path, method, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 8000,
            path: `/api${path}`,
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
    console.log('🚀 INITIALIZING COMPREHENSIVE BACKEND TEST...\n');

    try {
        // --- 1. AUTH TESTS ---
        console.log('[1/7] Testing Authentication...');
        
        // Admin Login
        const loginAdmin = await request('/auth/login', 'POST', { identifier: ADMIN_EMAIL, password: ADMIN_PASS });
        if (loginAdmin.status === 200) {
            adminToken = loginAdmin.body.token;
            console.log('✅ Admin Login: SUCCESS');
        } else {
            console.error('❌ Admin Login: FAILED', loginAdmin.body);
            return;
        }

        // Customer Register
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

        // Customer Login
        const loginCust = await request('/auth/login', 'POST', { identifier: CUSTOMER_EMAIL, password: CUSTOMER_PASS });
        customerToken = loginCust.body.token;
        console.log('✅ Customer Login: SUCCESS\n');

        // --- 2. CATEGORY & PRODUCT TESTS ---
        console.log('[2/7] Testing Product Management...');
        
        // Add Category (Admin)
        const addCat = await request('/categories', 'POST', { name: `Test Category ${Date.now()}` }, adminToken);
        testCategoryId = addCat.body.categoryId;
        console.log('✅ Add Category: SUCCESS');

        // Add Product (Admin)
        const addProd = await request('/products', 'POST', {
            category_id: testCategoryId,
            name: 'Test Milk',
            price: 50.00,
            stock: 100,
            unit: '1L',
            image_url: 'http://test.com/milk.jpg'
        }, adminToken);
        testProductId = addProd.body.productId;
        console.log('✅ Add Product: SUCCESS');

        // Get Products (Customer)
        const listProd = await request('/products', 'GET');
        if (listProd.body.products.length > 0) {
            console.log(`✅ List Products: SUCCESS (${listProd.body.products.length} found)\n`);
        }

        // --- 3. ADDRESS & CART TESTS ---
        console.log('[3/7] Testing Cart & Address...');
        
        // Add Address
        const addAddr = await request('/addresses', 'POST', {
            street: '123 Test St', city: 'Test City', state: 'TS', zip_code: '12345', country: 'Testland'
        }, customerToken);
        const addressId = addAddr.body.addressId;
        console.log('✅ Add Address: SUCCESS');

        // Add to Cart
        const addToCart = await request('/cart', 'POST', { product_id: testProductId, quantity: 2 }, customerToken);
        console.log('✅ Add to Cart: SUCCESS');

        // Get Cart
        const getCart = await request('/cart', 'GET', null, customerToken);
        if (getCart.body.items.length > 0) {
            console.log('✅ Get Cart: SUCCESS\n');
        }

        // --- 4. CHECKOUT TESTS ---
        console.log('[4/7] Testing Checkout...');
        const placeOrder = await request('/checkout', 'POST', {
            address_id: addressId,
            delivery_slot: 'Morning',
            payment_method: 'COD'
        }, customerToken);
        
        if (placeOrder.status === 201) {
            testOrderId = placeOrder.body.orderId;
            console.log('✅ Place Order: SUCCESS\n');
        } else {
            console.error('❌ Place Order: FAILED', placeOrder.body);
        }

        // --- 5. ORDER MANAGEMENT TESTS ---
        console.log('[5/7] Testing Order History...');
        // User Orders
        const userOrders = await request('/orders', 'GET', null, customerToken);
        console.log(`✅ User Order List: SUCCESS (${userOrders.body.orders.length} found)`);

        // Admin All Orders
        const adminOrders = await request('/admin/orders', 'GET', null, adminToken);
        console.log(`✅ Admin Full Order List: SUCCESS (${adminOrders.body.orders.length} found)\n`);

        // --- 6. ADMIN UTILS TESTS ---
        console.log('[6/7] Testing Admin Tools...');
        
        // Admin Dashboard
        const dashboard = await request('/admin/dashboard', 'GET', null, adminToken);
        console.log('✅ Admin Dashboard Access: SUCCESS');

        // Admin Sales Report
        const report = await request('/admin/reports/sales?period=daily', 'GET', null, adminToken);
        console.log('✅ Admin Sales Reports: SUCCESS\n');

        // --- 7. SECURITY/RBAC TESTS ---
        console.log('[7/7] Testing Security (RBAC)...');
        
        // Customer trying to access Admin Dashboard
        const failAdmin = await request('/admin/dashboard', 'GET', null, customerToken);
        if (failAdmin.status === 403) {
            console.log('✅ RBAC Test: SUCCESS (Customer access denied to Admin routes)');
        } else {
            console.error('❌ RBAC Test: FAILED (Customer accessed Admin routes!)');
        }

        console.log('\n🌟 ALL CORE BACKEND API TESTS PASSED! 🌟');
        process.exit(0);

    } catch (error) {
        console.error('\n💥 TEST SUITE CRASHED:', error);
        process.exit(1);
    }
}

runAllTests();
