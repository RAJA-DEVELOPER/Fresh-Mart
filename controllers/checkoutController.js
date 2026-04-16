const CartModel = require('../models/cartModel');
const CouponModel = require('../models/couponModel');
const OrderModel = require('../models/orderModel'); 
const UserModel = require('../models/userModel');

const calculateSummary = async (userId, couponCode) => {
    const cartItems = await CartModel.getCart(userId);
    if (!cartItems.length) {
        throw new Error('Cart is empty');
    }

    let totalAmount = 0;
    for (const item of cartItems) {
        if (item.stock < item.quantity) {
            throw new Error(`Insufficient stock for product: ${item.name}`);
        }
        totalAmount += item.price * item.quantity;
    }

    let discountAmount = 0;
    let coupon = null;

    if (couponCode) {
        coupon = await CouponModel.getCouponByCode(couponCode);
        if (!coupon) {
            throw new Error('Invalid or expired coupon code');
        }
        if (totalAmount < coupon.min_order_value) {
            throw new Error(`Minimum order value for this coupon is ${coupon.min_order_value}`);
        }

        if (coupon.discount_type === 'percentage') {
            discountAmount = (totalAmount * Number(coupon.discount_value)) / 100;
            if (discountAmount > Number(coupon.max_discount)) {
                discountAmount = Number(coupon.max_discount);
            }
        } else {
            discountAmount = Number(coupon.discount_value);
        }
    }

    discountAmount = Number(discountAmount) || 0;
    const finalAmount = totalAmount - discountAmount;

    return {
        cartItems,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        finalAmount: parseFloat(finalAmount.toFixed(2)),
        coupon
    };
};

const getSummary = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { coupon_code, address_id, delivery_slot } = req.body;

        const summary = await calculateSummary(userId, coupon_code);

        res.status(200).json({
            success: true,
            summary: {
                total_amount: summary.totalAmount,
                discount_amount: summary.discountAmount,
                final_amount: summary.finalAmount,
                delivery_slot: delivery_slot || null,
                address_id: address_id || null,
                coupon_applied: summary.coupon ? summary.coupon.code : null,
                items_count: summary.cartItems.length
            }
        });
    } catch (error) {
        if (['Cart is empty', 'Invalid or expired coupon code'].includes(error.message) || error.message.includes('Insufficient stock') || error.message.includes('Minimum order value')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
};

const placeOrder = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { address_id, delivery_slot, coupon_code, payment_method } = req.body;

        if (!address_id || !delivery_slot || !payment_method) {
            return res.status(400).json({ success: false, message: 'address_id, delivery_slot, and payment_method are required.' });
        }

        const validMethods = ['COD', 'Online'];
        if (!validMethods.includes(payment_method)) {
            return res.status(400).json({ success: false, message: 'Invalid payment method. Use COD or Online.' });
        }

        const summary = await calculateSummary(userId, coupon_code);

        // Operational Zone Validation
        const AddressModel = require('../models/addressModel');
        const DeliveryModel = require('../models/deliveryModel');
        const address = await AddressModel.getAddressById(address_id);
        if (!address) return res.status(404).json({ success: false, message: 'Address not found.' });

        if (address.lat && address.lng) {
            const deliverability = await DeliveryModel.isAddressDeliverable(address.lat, address.lng);
            if (!deliverability.deliverable) {
                return res.status(400).json({ 
                    success: false, 
                    message: `This address is outside our delivery zone. Please choose a location within our active service area.` 
                });
            }
        } else {
            return res.status(400).json({ 
                success: false, 
                message: `Delivery zone could not be verified for this address. Please edit and save this address again on the map to confirm delivery.` 
            });
        }

        let payment_status = 'Pending';
        let mock_payment_id = null;

        if (payment_method === 'Online') {
            // Advanced mock razorpay/stripe integration simulation - ONLY for online
            mock_payment_id = 'mock_tx_' + Math.random().toString(36).substr(2, 9);
            payment_status = 'Paid'; // We confirm payment via separate /payments/process route
        }

        const orderData = {
            userId,
            addressId: address_id,
            couponId: summary.coupon ? summary.coupon.id : null,
            totalAmount: summary.totalAmount,
            discountAmount: summary.discountAmount,
            finalAmount: summary.finalAmount,
            deliverySlot: delivery_slot,
            paymentMethod: payment_method,
            paymentStatus: payment_status,
            items: summary.cartItems
        };

        const orderId = await OrderModel.placeCheckoutOrder(orderData);

        // Only clear cart if order payment didn't officially fail
        if (payment_status !== 'Failed') {
            await CartModel.clearCart(userId);

            try {
                // Trigger notification
                const io = req.app.get('io');
                const user = await UserModel.findById(userId);
                const items_list = summary.cartItems.map(i => `• ${i.name} (x${i.quantity}) - ₹${i.price * i.quantity}`).join('\n');
                const wa_message = `🛒 *FreshMart Order Confirmed!*\nOrder ID: #FM-${orderId}\n--------------------------\n${items_list}\n--------------------------\n*Total: ₹${summary.finalAmount}*\n--------------------------\nDelivery: ${delivery_slot}\n\nThank you for shopping with us! 🌿`;
                
                const NotificationService = require('../utils/notificationService');
                await NotificationService.notifyUser(userId, 'ORDER_CONFIRMATION', wa_message, io);
            } catch (notifErr) {
                console.error('Notification failed (non-critical):', notifErr.message);
            }
        }

        // Trigger real-time update for admin
        const io = req.app.get('io');
        if (io) {
            io.to('admin_room').emit('NEW_ORDER', {
                id: orderId,
                customer_name: req.user.name,
                final_amount: summary.finalAmount,
                created_at: new Date()
            });
        }

        // Return the required detailed response
        const userForRes = await UserModel.findById(userId);
        let wa_message_for_link = '';
        try {
            const items_list_simple = summary.cartItems.map(i => `- ${i.name} (x${i.quantity}) - Rs.${i.price * i.quantity}`).join('\n');
            wa_message_for_link = `FRESHMART ORDER CONFIRMED\n\nOrder ID: FM-${orderId}\n--------------------------\n${items_list_simple}\n--------------------------\nTOTAL: Rs.${summary.finalAmount}\n--------------------------\nDelivery: ${delivery_slot || 'ASAP'}\n\nThank you for shopping with us!`;
        } catch (msgErr) {
            console.error('Error building WA message:', msgErr);
            wa_message_for_link = `FreshMart Order #FM-${orderId} Confirmed! Total: Rs.${summary.finalAmount}. Thank you!`;
        }

        const responseData = {
            success: true,
            message: 'Order placed successfully',
            orderId: orderId,
            order_id: orderId,
            mobile: userForRes ? userForRes.mobile : null,
            wa_message: wa_message_for_link,
            waMessage: wa_message_for_link,
            payment_details: {
                transaction_id: mock_payment_id || 'N/A',
                payment_method: payment_method,
                payment_status: payment_status
            }
        };

        console.log(`[WA_DEBUG] Sending Response. Mobile: ${responseData.mobile}, Msg Length: ${responseData.wa_message.length}`);
        res.status(201).json(responseData);

    } catch (error) {
        if (['Cart is empty', 'Invalid or expired coupon code'].includes(error.message) || error.message.includes('Insufficient stock') || error.message.includes('Minimum order value')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
};

module.exports = {
    getSummary,
    placeOrder
};
