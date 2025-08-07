// backend/src/routes/cartRoutes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart
} = require('../controllers/cartController');

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

// Validation for add to cart
const validateAddToCart = [
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

// Validation for update cart item
const validateUpdateCartItem = [
    body('productId')
        .notEmpty()
        .withMessage('Product ID is required')
        .isMongoId()
        .withMessage('Invalid product ID format'),
    
    body('quantity')
        .notEmpty()
        .withMessage('Quantity is required')
        .isInt({ min: 1, max: 10 })
        .withMessage('Quantity must be between 1 and 10')
        .toInt()
];





// Apply authentication middleware to all routes
router.use(protect);




router.post('/add', validateAddToCart, addToCart);

router.get('/', getCart);

router.put('/update', validateUpdateCartItem, updateCartItem);

router.delete('/remove/:productId', validateObjectId, removeFromCart);

router.delete('/clear', clearCart);

module.exports = router;