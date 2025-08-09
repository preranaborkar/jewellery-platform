// controllers/orderController.js
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// Get all orders
exports.getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        
        const orders = await Order.find()
            .populate('user', 'firstName lastName email')
            .populate('products.product', 'name price')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const total = await Order.countDocuments();
        
        res.json({
            success: true,
            orders,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get order details
exports.getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'firstName lastName email phone')
            .populate('products.product', 'name price');
        
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus, trackingNumber } = req.body;
        
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { orderStatus, trackingNumber },
            { new: true }
        );
        
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Get admin dashboard statistics
exports.getStats = async (req, res) => {
    try {

        console.log('Fetching admin stats...');
        // Get current date and last month date
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        console.log('now:', now);
        console.log('lastMonth:', lastMonth);
        console.log('currentMonth:', currentMonth);

        // Total Revenue (all time)
        const totalRevenueResult = await Order.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        console.log('totalRevenueResult:', totalRevenueResult);
        const totalRevenue = totalRevenueResult[0]?.total || 0;

        // Monthly Revenue (current month)
        const monthlyRevenueResult = await Order.aggregate([
            { 
                $match: { 
                    paymentStatus: 'completed',
                    createdAt: { $gte: currentMonth }
                }
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        console.log('monthlyRevenueResult:', monthlyRevenueResult);
        const monthlyRevenue = monthlyRevenueResult[0]?.total || 0;

        // Last Month Revenue (for comparison)
        const lastMonthRevenueResult = await Order.aggregate([
            { 
                $match: { 
                    paymentStatus: 'completed',
                    createdAt: { 
                        $gte: lastMonth,
                        $lt: currentMonth
                    }
                }
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        console.log('lastMonthRevenueResult:', lastMonthRevenueResult);
        const lastMonthRevenue = lastMonthRevenueResult[0]?.total || 0;

        // Calculate revenue change percentage
        const revenueChange = lastMonthRevenue > 0 
            ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
            : monthlyRevenue > 0 ? 100 : 0;
        console.log('revenueChange:', revenueChange);

        // Total Orders
        const totalOrders = await Order.countDocuments();
        const monthlyOrders = await Order.countDocuments({
            createdAt: { $gte: currentMonth }
        });
        const lastMonthOrders = await Order.countDocuments({
            createdAt: { 
                $gte: lastMonth,
                $lt: currentMonth
            }
        });
        console.log('totalOrders:', totalOrders);
        console.log('monthlyOrders:', monthlyOrders);
        console.log('lastMonthOrders:', lastMonthOrders);
        
        const ordersChange = lastMonthOrders > 0 
            ? ((monthlyOrders - lastMonthOrders) / lastMonthOrders * 100).toFixed(1)
            : monthlyOrders > 0 ? 100 : 0;
        console.log('ordersChange:', ordersChange);

        // Total Customers
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const monthlyCustomers = await User.countDocuments({
            role: 'customer',
            createdAt: { $gte: currentMonth }
        });
        const lastMonthCustomers = await User.countDocuments({
            role: 'customer',
            createdAt: { 
                $gte: lastMonth,
                $lt: currentMonth
            }
        });
        console.log('totalCustomers:', totalCustomers);
        console.log('monthlyCustomers:', monthlyCustomers);
        console.log('lastMonthCustomers:', lastMonthCustomers);
        
        const customersChange = lastMonthCustomers > 0 
            ? ((monthlyCustomers - lastMonthCustomers) / lastMonthCustomers * 100).toFixed(1)
            : monthlyCustomers > 0 ? 100 : 0;
        console.log('customersChange:', customersChange);

        // Total Products
        const totalProducts = await Product.countDocuments();
        const monthlyProducts = await Product.countDocuments({
            createdAt: { $gte: currentMonth }
        });
        const lastMonthProducts = await Product.countDocuments({
            createdAt: { 
                $gte: lastMonth,
                $lt: currentMonth
            }
        });
        console.log('totalProducts:', totalProducts);
        console.log('monthlyProducts:', monthlyProducts);
        console.log('lastMonthProducts:', lastMonthProducts);
        
        const productsChange = lastMonthProducts > 0 
            ? ((monthlyProducts - lastMonthProducts) / lastMonthProducts * 100).toFixed(1)
            : monthlyProducts > 0 ? 100 : 0;
        console.log('productsChange:', productsChange);

        // Additional Stats
        const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
        const lowStockProducts = await Product.countDocuments({ stock: { $lte: 5 } });
        console.log('pendingOrders:', pendingOrders);
        console.log('lowStockProducts:', lowStockProducts);

        const stats = {
            totalRevenue: totalRevenue,
            totalOrders: totalOrders,
            totalCustomers: totalCustomers,
            totalProducts: totalProducts,
            pendingOrders: pendingOrders,
            lowStockProducts: lowStockProducts,
            monthlyRevenue: monthlyRevenue,
            revenueChange: parseFloat(revenueChange),
            ordersChange: parseFloat(ordersChange),
            customersChange: parseFloat(customersChange),
            productsChange: parseFloat(productsChange)
        };

        console.log('stats:', stats);

        res.json(stats);

    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Error fetching statistics' });
    }
};
