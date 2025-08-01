// backend/src/routes/wishlistRoutes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
    moveToCart,
    clearWishlist
} = require('../controllers/wishlistController');

const { protect } = require('../middleware/auth');

// Validation middleware for MongoDB ObjectId
const validateObjectId = (req, res, next) => {
    const mongoose = require('mongoose');
    const { productId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid product ID format'
        });
    }
    next();
};

// Validation for add to wishlist
const validateAddToWishlist = [
    body('productId')
        .notEmpty()
        .withMessage('Product ID is required')
        .isMongoId()
        .withMessage('Invalid product ID format')
];

// Validation for move to cart
const validateMoveToCart = [
    body('productId')
        .notEmpty()
        .withMessage('Product ID is required')
        .isMongoId()
        .withMessage('Invalid product ID format'),
    
    body('quantity')
        .optional()
        .isInt({ min: 1, max: 10 })
        .withMessage('Quantity must be between 1 and 10')
        .toInt()
];

// Rate limiting middleware for wishlist operations
const rateLimit = require('express-rate-limit');

const wishlistRateLimit = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // Limit each user to 30 requests per windowMs
    message: {
        success: false,
        message: 'Too many wishlist operations, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user?.id || req.ip
});

// Apply authentication middleware to all routes
router.use(protect);

// Apply rate limiting to wishlist operations
router.use(wishlistRateLimit);


router.post('/add', validateAddToWishlist, addToWishlist);

router.get('/', getWishlist);

router.delete('/remove/:productId', validateObjectId, removeFromWishlist);

router.post('/move-to-cart', validateMoveToCart, moveToCart);

router.delete('/clear', clearWishlist);

module.exports = router;