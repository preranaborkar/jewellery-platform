// backend/src/routes/orderRoutes.js
const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();

const {
    createOrder,
    processPayment,
    getUserOrders,
    getOrderById,
    cancelOrder
} = require('../controllers/orderController');

const { protect } = require('../middleware/auth');

// Validation middleware for MongoDB ObjectId
const validateObjectId = (req, res, next) => {
    const mongoose = require('mongoose');
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid order ID format'
        });
    }
    next();
};

// Validation for create order
const validateCreateOrder = [
    body('billingAddress.street')
        .notEmpty()
        .withMessage('Street address is required')
        .isLength({ min: 5, max: 200 })
        .withMessage('Street address must be between 5 and 200 characters'),
    
    body('billingAddress.city')
        .notEmpty()
        .withMessage('City is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('City must be between 2 and 50 characters'),
    
    body('billingAddress.state')
        .notEmpty()
        .withMessage('State is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('State must be between 2 and 50 characters'),
    
    body('billingAddress.zipCode')
        .notEmpty()
        .withMessage('Zip code is required')
        .matches(/^[0-9]{6}$/)
        .withMessage('Zip code must be 6 digits'),
    
    body('billingAddress.country')
        .notEmpty()
        .withMessage('Country is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Country must be between 2 and 50 characters'),
    
    body('paymentMethod')
        .optional()
        .isIn(['razorpay', 'cod', 'upi', 'card'])
        .withMessage('Invalid payment method')
];

// Validation for payment processing
const validatePayment = [
    body('orderId')
        .notEmpty()
        .withMessage('Order ID is required')
        .isMongoId()
        .withMessage('Invalid order ID format'),
    
    body('razorpay_payment_id')
        .notEmpty()
        .withMessage('Razorpay payment ID is required'),
    
    body('razorpay_order_id')
        .notEmpty()
        .withMessage('Razorpay order ID is required'),
    
    body('razorpay_signature')
        .notEmpty()
        .withMessage('Razorpay signature is required')
];

// Validation for order queries
const validateOrderQuery = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50'),
    
    query('status')
        .optional()
        .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
        .withMessage('Invalid order status'),
    
    query('search')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Search term must be between 1 and 100 characters')
];

// Rate limiting middleware for order operations
const rateLimit = require('express-rate-limit');

const orderRateLimit = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // Limit each user to 10 order operations per 5 minutes
    message: {
        success: false,
        message: 'Too many order operations, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user?.id || req.ip
});

const paymentRateLimit = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // Limit each user to 5 payment attempts per minute
    message: {
        success: false,
        message: 'Too many payment attempts, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user?.id || req.ip
});

// Apply authentication middleware to all routes
router.use(protect);

// ORDER PROCESSING ROUTES
router.post('/create', orderRateLimit, validateCreateOrder, createOrder);
router.post('/payment', paymentRateLimit, validatePayment, processPayment);

// USER ORDER ROUTES
router.get('/', validateOrderQuery, getUserOrders);
router.get('/:id', validateObjectId, getOrderById);
router.put('/:id/cancel', validateObjectId, cancelOrder);

module.exports = router;
