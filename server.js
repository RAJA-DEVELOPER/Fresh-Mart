require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Attach io to app to access it in routes/controllers
app.set('io', io);

// Socket.io Connection Logic
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    socket.on('join_admin', () => {
        socket.join('admin_room');
        console.log(`Socket ${socket.id} joined admin_room`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disable caching for all /api routes (prevents 304 Not Modified)
app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

// Request Logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Serve Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const testRoutes = require('./routes/testRoutes');
const authRoutes = require('./routes/authRoutes');
const addressRoutes = require('./routes/addressRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

app.use('/api', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/payments', paymentRoutes);

// 404 Route
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'Route not found' });
  }
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Basic Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

