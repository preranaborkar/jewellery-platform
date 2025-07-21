// backend/src/controllers/wishlistController.js
const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { validationResult } = require('express-validator');

// ADD TO WISHLIST
const addToWishlist = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { productId } = req.body;
        const userId = req.user.userId;

        // Validate product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Find user and populate wishlist
        const user = await User.findById(userId).populate({
            path: 'wishlist',
            select: 'name price image stock metalType category ratingsAverage',
            populate: {
                path: 'category',
                select: 'name'
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if product already in wishlist
        const isAlreadyInWishlist = user.wishlist.some(
            item => item._id.toString() === productId
        );

        if (isAlreadyInWishlist) {
            return res.status(400).json({
                success: false,
                message: 'Product is already in wishlist'
            });
        }

        // Add to wishlist
        user.wishlist.push(productId);
        await user.save();

        // Populate the newly added product
        await user.populate({
            path: 'wishlist',
            select: 'name price image stock metalType category ratingsAverage',
            populate: {
                path: 'category',
                select: 'name'
            }
        });

        res.status(200).json({
            success: true,
            message: 'Product added to wishlist successfully',
            data: {
                wishlist: user.wishlist,
                itemCount: user.wishlist.length
            }
        });

    } catch (error) {
        console.error('Add to wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add product to wishlist',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// GET USER'S WISHLIST
const getWishlist = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId).populate({
            path: 'wishlist',
            select: 'name price image stock metalType category ratingsAverage',
            populate: {
                path: 'category',
                select: 'name'
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Add stock availability info
        const wishlistWithStock = user.wishlist.map(product => ({
            ...product.toObject(),
            inStock: product.stock > 0,
            stockStatus: product.stock > 0 ? 'In Stock' : 'Out of Stock'
        }));

        res.status(200).json({
            success: true,
            message: 'Wishlist retrieved successfully',
            data: {
                wishlist: wishlistWithStock,
                itemCount: wishlistWithStock.length
            }
        });

    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve wishlist',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// REMOVE FROM WISHLIST
const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.userId;

        // Validate product ID format
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if product is in wishlist
        const productIndex = user.wishlist.findIndex(
            item => item.toString() === productId
        );

        if (productIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Product not found in wishlist'
            });
        }

        // Remove from wishlist
        user.wishlist.splice(productIndex, 1);
        await user.save();

        // Populate remaining wishlist items
        await user.populate({
            path: 'wishlist',
            select: 'name price image stock metalType category ratingsAverage',
            populate: {
                path: 'category',
                select: 'name'
            }
        });

        res.status(200).json({
            success: true,
            message: 'Product removed from wishlist successfully',
            data: {
                wishlist: user.wishlist,
                itemCount: user.wishlist.length
            }
        });

    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove product from wishlist',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// MOVE FROM WISHLIST TO CART
const moveToCart = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { productId, quantity = 1 } = req.body;
        const userId = req.user.userId;

        // Validate product exists and get details
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check stock availability
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} items available in stock`,
                availableQuantity: product.stock
            });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if product is in wishlist
        const productIndex = user.wishlist.findIndex(
            item => item.toString() === productId
        );

        if (productIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Product not found in wishlist'
            });
        }

        // Find or create user's cart
        let cart = await Cart.findOne({ user: userId });
        
        if (!cart) {
            cart = new Cart({
                user: userId,
                items: [],
                totalAmount: 0
            });
        }

        // Check if product already exists in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (existingItemIndex > -1) {
            // Update existing cart item
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;
            
            if (product.stock < newQuantity) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add ${quantity} more items. Only ${product.stock} items available, you already have ${cart.items[existingItemIndex].quantity} in cart`,
                    availableQuantity: product.stock,
                    currentQuantityInCart: cart.items[existingItemIndex].quantity
                });
            }
            
            cart.items[existingItemIndex].quantity = newQuantity;
        } else {
            // Add new item to cart
            cart.items.push({ product: productId, quantity });
        }

        // Remove from wishlist
        user.wishlist.splice(productIndex, 1);

        // Save both user and cart
        await Promise.all([user.save(), cart.save()]);

        // Populate cart for response
        await cart.populate({
            path: 'items.product',
            select: 'name price stock image metalType category',
            populate: {
                path: 'category',
                select: 'name'
            }
        });

        // Populate remaining wishlist
        await user.populate({
            path: 'wishlist',
            select: 'name price image stock metalType category ratingsAverage',
            populate: {
                path: 'category',
                select: 'name'
            }
        });

        // Calculate cart totals
        const subtotal = cart.items.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);
        
        const tax = subtotal * 0.18; // 18% GST
        const shipping = subtotal > 5000 ? 0 : 100;
        const total = subtotal + tax + shipping;

        const totals = {
            subtotal: Math.round(subtotal * 100) / 100,
            tax: Math.round(tax * 100) / 100,
            shipping,
            total: Math.round(total * 100) / 100
        };

        cart.totalAmount = totals.total;
        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Product moved to cart successfully',
            data: {
                cart: {
                    _id: cart._id,
                    items: cart.items,
                    itemCount: cart.items.length,
                    totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
                    ...totals,
                    updatedAt: cart.updatedAt
                },
                wishlist: user.wishlist,
                wishlistCount: user.wishlist.length
            }
        });

    } catch (error) {
        console.error('Move to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to move product to cart',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// CLEAR WISHLIST
const clearWishlist = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.wishlist = [];
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Wishlist cleared successfully',
            data: {
                wishlist: [],
                itemCount: 0
            }
        });

    } catch (error) {
        console.error('Clear wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear wishlist',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
    moveToCart,
    clearWishlist
};