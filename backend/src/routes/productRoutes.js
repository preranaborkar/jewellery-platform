// backend/src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    getProductById,
    getProductsByCategory,
    searchProducts,
    addProductReview,
    getProductReviews
} = require('../controllers/productController');

const { protect } = require('../middleware/auth');

// Validation middleware
const validateObjectId = (req, res, next) => {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid product ID'
        });
    }
    next();
};

const validateCategoryId = (req, res, next) => {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.category)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid category ID'
        });
    }
    next();
};

const validateReview = (req, res, next) => {
    const { rating, comment } = req.body;
    
    if (!rating || !comment) {
        return res.status(400).json({
            success: false,
            message: 'Rating and comment are required'
        });
    }
    
    if (rating < 1 || rating > 5) {
        return res.status(400).json({
            success: false,
            message: 'Rating must be between 1 and 5'
        });
    }
    
    if (comment.length < 10) {
        return res.status(400).json({
            success: false,
            message: 'Comment must be at least 10 characters long'
        });
    }
    
    next();
};

// USER ENDPOINTS
router.get('/search', searchProducts);
router.get('/category/:category', validateCategoryId, getProductsByCategory);//already 
router.get('/:id/reviews', validateObjectId, getProductReviews);
router.post('/:id/reviews', protect, validateObjectId, validateReview, addProductReview);
router.get('/:id', validateObjectId, getProductById);
router.get('/', getAllProducts);

module.exports = router;