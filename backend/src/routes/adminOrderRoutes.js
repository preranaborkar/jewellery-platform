
// backend/src/routes/adminOrderRoutes.js
const express = require('express');
const { query, body } = require('express-validator');
const router = express.Router();

const {
    getAllOrders,
    updateOrderStatus,
    cancelOrderAdmin,
    getOrderAnalytics,
    getOrderDetails
} = require('../controllers/adminOrderController');

const { protect, authorize } = require('../middleware/auth');

// Validation middleware for MongoDB ObjectId (admin)
const validateAdminObjectId = (req, res, next) => {
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

// Validation for admin order queries
const validateAdminOrderQuery = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    
    query('status')
        .optional()
        .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
        .withMessage('Invalid order status'),
    
    query('search')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Search term must be between 1 and 100 characters'),
    
    query('dateFrom')
        .optional()
        .isISO8601()
        .withMessage('Invalid date format for dateFrom'),
    
    query('dateTo')
        .optional()
        .isISO8601()
        .withMessage('Invalid date format for dateTo'),
    
    query('sortBy')
        .optional()
        .isIn(['createdAt', 'totalAmount', 'orderStatus'])
        .withMessage('Invalid sort field'),
    
    query('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Sort order must be asc or desc')
];

// Validation for status update
const validateStatusUpdate = [
    body('status')
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['confirmed', 'processing', 'shipped', 'delivered'])
        .withMessage('Invalid status for update'),
    
    body('notes')
        .optional()
        .isLength({ min: 1, max: 500 })
        .withMessage('Notes must be between 1 and 500 characters')
];

// Validation for order cancellation
const validateCancellation = [
    body('reason')
        .notEmpty()
        .withMessage('Cancellation reason is required')
        .isLength({ min: 5, max: 500 })
        .withMessage('Reason must be between 5 and 500 characters'),
    
    body('refundAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Refund amount must be a positive number')
];

// Apply authentication and authorization middleware to all routes
router.use(protect);
router.use(authorize('admin'));

// ADMIN ORDER MANAGEMENT ROUTES
router.get('/', validateAdminOrderQuery, getAllOrders);
router.get('/analytics', getOrderAnalytics);
router.get('/:id', validateAdminObjectId, getOrderDetails);
router.put('/:id/status', validateAdminObjectId, validateStatusUpdate, updateOrderStatus);
router.put('/:id/cancel', validateAdminObjectId, validateCancellation, cancelOrderAdmin);

module.exports = router;