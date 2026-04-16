const CartModel = require('../models/cartModel');

const addToCart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { product_id, quantity } = req.body;

        if (!product_id || !quantity || quantity < 1) {
            return res.status(400).json({ success: false, message: 'Valid product_id and quantity are required' });
        }

        await CartModel.addItem(userId, product_id, quantity);
        res.status(200).json({ success: true, message: 'Item added to cart' });
    } catch (error) {
        next(error);
    }
};

const updateCartQuantity = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;
        const { quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
        }

        const updated = await CartModel.updateQuantity(userId, productId, quantity);
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Item not found in cart' });
        }
        res.status(200).json({ success: true, message: 'Cart updated' });
    } catch (error) {
        next(error);
    }
};

const removeFromCart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;

        const removed = await CartModel.removeItem(userId, productId);
        if (!removed) {
            return res.status(404).json({ success: false, message: 'Item not found in cart' });
        }
        res.status(200).json({ success: true, message: 'Item removed from cart' });
    } catch (error) {
        next(error);
    }
};

const getCart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const items = await CartModel.getCart(userId);
        
        let totalPrice = 0;
        items.forEach(item => {
            totalPrice += item.price * item.quantity;
        });

        res.status(200).json({ 
            success: true, 
            cart: items,
            total_price: parseFloat(totalPrice.toFixed(2))
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addToCart,
    updateCartQuantity,
    removeFromCart,
    getCart
};
