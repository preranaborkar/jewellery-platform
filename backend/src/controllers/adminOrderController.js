// backend/src/controllers/adminOrderController.js
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendOrderStatusEmail } = require('../utils/emailService');

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
    try {
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { 
            page = 1, 
            limit = 20, 
            status, 
            search,
            dateFrom,
            dateTo,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        const query = {};
        
        if (status) {
            query.orderStatus = status;
        }
        
        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { transactionId: { $regex: search, $options: 'i' } }
            ];
        }

        // Date range filtering
        if (dateFrom || dateTo) {
            query.createdAt = {};
            if (dateFrom) {
                query.createdAt.$gte = new Date(dateFrom);
            }
            if (dateTo) {
                query.createdAt.$lte = new Date(dateTo);
            }
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const orders = await Order.find(query)
            .populate('user', 'firstName lastName email phone')
            .populate('products.product', 'name image price')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Order.countDocuments(query);

        // Calculate summary statistics
        const statusCounts = await Order.aggregate([
            { $match: query },
            { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
        ]);

        const totalRevenue = await Order.aggregate([
            { 
                $match: { 
                    ...query, 
                    paymentStatus: 'completed' 
                } 
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        res.status(200).json({
            success: true,
            message: 'Orders retrieved successfully',
            data: {
                orders,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalOrders: total,
                    hasNext: skip + orders.length < total,
                    hasPrev: parseInt(page) > 1
                },
                summary: {
                    statusCounts: statusCounts.reduce((acc, item) => {
                        acc[item._id] = item.count;
                        return acc;
                    }, {}),
                    totalRevenue: totalRevenue[0]?.total || 0
                }
            }
        });

    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve orders',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Get order details (Admin)
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
const getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id)
            .populate('user', 'firstName lastName email phone')
            .populate('products.product', 'name image price description metalType metalPurity');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order details retrieved successfully',
            data: { order }
        });

    } catch (error) {
        console.error('Get order details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve order details',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Update order status (Admin)
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const { status, notes } = req.body;

        const order = await Order.findById(id).session(session);
        if (!order) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if status transition is valid
        const validTransitions = {
            'pending': ['confirmed', 'cancelled'],
            'confirmed': ['processing', 'cancelled'],
            'processing': ['shipped', 'cancelled'],
            'shipped': ['delivered'],
            'delivered': [], // Cannot change from delivered
            'cancelled': [] // Cannot change from cancelled
        };

        if (!validTransitions[order.orderStatus].includes(status)) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: `Cannot change status from ${order.orderStatus} to ${status}`
            });
        }

        // Update order status
        const oldStatus = order.orderStatus;
        order.orderStatus = status;
        
        // Add status history
        if (!order.statusHistory) {
            order.statusHistory = [];
        }
        
        order.statusHistory.push({
            status: status,
            timestamp: new Date(),
            notes: notes || `Status changed from ${oldStatus} to ${status}`,
            updatedBy: req.user.id
        });

        // Handle specific status changes
        if (status === 'shipped') {
            order.shippedAt = new Date();
        } else if (status === 'delivered') {
            order.deliveredAt = new Date();
        }

        await order.save({ session });

        await session.commitTransaction();

        // Populate order details for response and email
        const populatedOrder = await Order.findById(order._id)
            .populate('user', 'firstName lastName email')
            .populate('products.product', 'name image price');

        // Send status update email (async)
        sendOrderStatusEmail(populatedOrder, status).catch(err => 
            console.error('Email sending failed:', err)
        );

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: { order: populatedOrder }
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    } finally {
        session.endSession();
    }
};

// @desc    Cancel order (Admin)
// @route   PUT /api/admin/orders/:id/cancel
// @access  Private/Admin
const cancelOrderAdmin = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const { reason, refundAmount } = req.body;

        const order = await Order.findById(id).session(session);
        if (!order) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order can be cancelled
        if (['delivered', 'cancelled'].includes(order.orderStatus)) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled at this stage'
            });
        }

        // Update order status
        order.orderStatus = 'cancelled';
        order.cancellationReason = reason;
        order.cancelledAt = new Date();
        order.cancelledBy = req.user.id;

        // Handle refund
        if (order.paymentStatus === 'completed') {
            order.paymentStatus = 'refunded';
            order.refundAmount = refundAmount || order.totalAmount;
            order.refundDate = new Date();
        }

        // Add to status history
        if (!order.statusHistory) {
            order.statusHistory = [];
        }
        
        order.statusHistory.push({
            status: 'cancelled',
            timestamp: new Date(),
            notes: `Order cancelled by admin. Reason: ${reason}`,
            updatedBy: req.user.id
        });

        await order.save({ session });

        // Release stock back to inventory
        for (const item of order.products) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: item.quantity } },
                { session }
            );
        }

        await session.commitTransaction();

        // Populate order details for response and email
        const populatedOrder = await Order.findById(order._id)
            .populate('user', 'firstName lastName email')
            .populate('products.product', 'name image price');

        // Send cancellation email (async)
        sendOrderStatusEmail(populatedOrder, 'cancelled').catch(err => 
            console.error('Email sending failed:', err)
        );

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            data: { order: populatedOrder }
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Cancel order admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel order',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    } finally {
        session.endSession();
    }
};

// @desc    Get order analytics (Admin)
// @route   GET /api/admin/orders/analytics
// @access  Private/Admin
const getOrderAnalytics = async (req, res) => {
    try {
        const { dateFrom, dateTo } = req.query;

        // Build date filter
        const dateFilter = {};
        if (dateFrom || dateTo) {
            dateFilter.createdAt = {};
            if (dateFrom) {
                dateFilter.createdAt.$gte = new Date(dateFrom);
            }
            if (dateTo) {
                dateFilter.createdAt.$lte = new Date(dateTo);
            }
        }

        // Total orders and revenue
        const totalStats = await Order.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' },
                    completedRevenue: {
                        $sum: {
                            $cond: [
                                { $eq: ['$paymentStatus', 'completed'] },
                                '$totalAmount',
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        // Orders by status
        const ordersByStatus = await Order.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: '$orderStatus',
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' }
                }
            }
        ]);

        // Orders by payment method
        const ordersByPayment = await Order.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: '$paymentMethod',
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' }
                }
            }
        ]);

        // Daily orders trend (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailyTrend = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    orders: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
            }
        ]);

        // Top selling products
        const topProducts = await Order.aggregate([
            { $match: { ...dateFilter, orderStatus: { $ne: 'cancelled' } } },
            { $unwind: '$products' },
            {
                $group: {
                    _id: '$products.product',
                    totalQuantity: { $sum: '$products.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$products.quantity', '$products.price'] } }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $project: {
                    productName: { $arrayElemAt: ['$product.name', 0] },
                    productImage: { $arrayElemAt: ['$product.image', 0] },
                    totalQuantity: 1,
                    totalRevenue: 1
                }
            }
        ]);

        // Average order value
        const avgOrderValue = await Order.aggregate([
            { 
                $match: { 
                    ...dateFilter, 
                    orderStatus: { $ne: 'cancelled' } 
                } 
            },
            {
                $group: {
                    _id: null,
                    averageValue: { $avg: '$totalAmount' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            message: 'Analytics retrieved successfully',
            data: {
                overview: {
                    totalOrders: totalStats[0]?.totalOrders || 0,
                    totalRevenue: totalStats[0]?.totalRevenue || 0,
                    completedRevenue: totalStats[0]?.completedRevenue || 0,
                    averageOrderValue: avgOrderValue[0]?.averageValue || 0
                },
                ordersByStatus: ordersByStatus.reduce((acc, item) => {
                    acc[item._id] = { count: item.count, revenue: item.revenue };
                    return acc;
                }, {}),
                ordersByPayment: ordersByPayment.reduce((acc, item) => {
                    acc[item._id] = { count: item.count, revenue: item.revenue };
                    return acc;
                }, {}),
                dailyTrend,
                topProducts
            }
        });

    } catch (error) {
        console.error('Get order analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve analytics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
    getAllOrders,
    getOrderDetails,
    updateOrderStatus,
    cancelOrderAdmin,
    getOrderAnalytics
};