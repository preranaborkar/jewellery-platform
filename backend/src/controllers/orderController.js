// backend/src/routes/orderRoutes.js
const express = require('express');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');

// Get user's orders
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get orders with basic product info
    const orders = await Order.find({ user: userId })
      .populate({
        path: 'products.product',
        select: 'name image price'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments({ user: userId });

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasNext: page < Math.ceil(totalOrders / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error in getMyOrders:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get single order details
const getOrderDetails = async (req, res) => {
  try {
    
    const { orderId } = req.params;
    const userId = req.user.userId;

    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate({
        path: 'products.product',
        select: 'name image price description metalType metalPurity'
      })
      .populate('user', 'fullName email firstName lastName');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or unauthorized'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Error in getOrderDetails:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Track order status
const trackOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, user: userId })
      .select('orderNumber orderStatus paymentStatus trackingNumber estimatedDelivery createdAt updatedAt')
      .populate('user', 'fullName email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or unauthorized'
      });
    }

    // Create status timeline
    const statusTimeline = [];
    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentStatusIndex = statusOrder.indexOf(order.orderStatus);

    statusOrder.forEach((status, index) => {
      statusTimeline.push({
        status,
        label: status.charAt(0).toUpperCase() + status.slice(1),
        completed: index <= currentStatusIndex,
        current: index === currentStatusIndex,
        date: index <= currentStatusIndex ? order.updatedAt : null
      });
    });

    res.json({
      success: true,
      data: {
        order,
        timeline: statusTimeline
      }
    });

  } catch (error) {
    console.error('Error in trackOrder:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Cancel order (if not yet shipped)
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or unauthorized'
      });
    }

    // Check if order can be cancelled
    if (['shipped', 'delivered', 'cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled as it is already ${order.orderStatus}`
      });
    }

    // Update order status
    order.orderStatus = 'cancelled';
    await order.save();

    // Here you might want to:
    // 1. Restore product stock
    // 2. Process refund if payment was completed
    // 3. Send cancellation email

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });

  } catch (error) {
    console.error('Error in cancelOrder:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get order statistics for user
const getOrderStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Order.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments({ user: userId });
    const totalSpent = await Order.aggregate([
      { $match: { user: userId, paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalSpent: totalSpent[0]?.total || 0,
        statusBreakdown: stats
      }
    });

  } catch (error) {
    console.error('Error in getOrderStats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getMyOrders,
  getOrderDetails,
  trackOrder,
  cancelOrder,
  getOrderStats
};