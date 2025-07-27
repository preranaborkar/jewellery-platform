// routes/orders.js
const express = require('express');
const router = express.Router();
const { getAllOrders, getOrderById, updateOrderStatus, getOrdersByUser } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// GET /api/orders - Fetch all orders (Admin only)
router.get('/', protect, authorize('admin'), getAllOrders);

// GET /api/orders/:id - Get specific order (Admin only)
router.get('/:id', protect, authorize('admin'), getOrderById);

// PATCH /api/orders/:id/status - Update order status (Admin only)
router.patch('/:id/status', protect, authorize('admin'), updateOrderStatus);

// GET /api/orders/user/:userId - Get orders by user (Admin only)
router.get('/user/:userId', protect, authorize('admin'), getOrdersByUser);

module.exports = router;