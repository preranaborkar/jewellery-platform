// backend/src/middleware/cartMiddleware.js
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Middleware to validate cart ownership
const validateCartOwnership = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({ user: userId });
        
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found for this user'
            });
        }
        
        req.cart = cart;
        next();
    } catch (error) {
        console.error('Cart ownership validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate cart ownership'
        });
    }
};

// Middleware to check cart abandonment (optional feature)
const checkCartAbandonment = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({ user: userId });
        
        if (cart && cart.items.length > 0) {
            const lastUpdated = new Date(cart.updatedAt);
            const now = new Date();
            const hoursSinceUpdate = (now - lastUpdated) / (1000 * 60 * 60);
            
            // If cart hasn't been updated in 24 hours, flag as abandoned
            if (hoursSinceUpdate >= 24) {
                // You could implement email notifications, analytics tracking, etc.
                console.log(`Abandoned cart detected for user ${userId}`);
                
                // Optional: Add abandonment tracking
                req.cartAbandoned = true;
                req.abandonmentHours = Math.floor(hoursSinceUpdate);
            }
        }
        
        next();
    } catch (error) {
        console.error('Cart abandonment check error:', error);
        // Don't fail the request, just continue
        next();
    }
};

// Middleware to validate product stock before cart operations
const validateStock = async (req, res, next) => {
    try {
        const { productId, quantity = 1 } = req.body;
        
        if (!productId) {
            return next();
        }
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock. Only ${product.stock} items available`,
                availableStock: product.stock,
                requestedQuantity: quantity
            });
        }
        
        req.product = product;
        next();
    } catch (error) {
        console.error('Stock validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate stock'
        });
    }
};

// Middleware to sanitize cart data
const sanitizeCartData = (req, res, next) => {
    if (req.body.quantity) {
        // Ensure quantity is a positive integer
        const quantity = parseInt(req.body.quantity);
        if (isNaN(quantity) || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be a positive integer'
            });
        }
        
        // Limit maximum quantity per item
        if (quantity > 10) {
            return res.status(400).json({
                success: false,
                message: 'Maximum quantity per item is 10'
            });
        }
        
        req.body.quantity = quantity;
    }
    
    next();
};

// Middleware to log cart operations (for analytics)
const logCartOperation = (operation) => {
    return (req, res, next) => {
        const originalSend = res.send;
        
        res.send = function(data) {
            // Log successful cart operations
            if (res.statusCode >= 200 && res.statusCode < 300) {
                console.log(`Cart Operation: ${operation}`, {
                    userId: req.user?.id,
                    productId: req.body?.productId || req.params?.productId,
                    quantity: req.body?.quantity,
                    timestamp: new Date().toISOString(),
                    userAgent: req.get('User-Agent'),
                    ip: req.ip
                });
            }
            
            originalSend.call(this, data);
        };
        
        next();
    };
};

module.exports = {
    validateCartOwnership,
    checkCartAbandonment,
    validateStock,
    sanitizeCartData,
    logCartOperation
};