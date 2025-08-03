// backend/src/controllers/cartController.js
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// Helper function to calculate cart totals
const calculateCartTotals = (items) => {
    const subtotal = items.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
    }, 0);
    
    const tax = subtotal * 0.18; // 18% GST
    const shipping = subtotal > 5000 ? 0 : 100; // Free shipping above ₹5000
    const total = subtotal + tax + shipping;
    
    return {
        subtotal: Math.round(subtotal * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        shipping,
        total: Math.round(total * 100) / 100
    };
};

// Helper function to check stock availability
const checkStockAvailability = (product, requestedQuantity) => {
    if (product.stock < requestedQuantity) {
        return {
            available: false,
            message: `Only ${product.stock} items available in stock`,
            availableQuantity: product.stock
        };
    }
    return { available: true };
};

// ADD ITEM TO CART
const addToCart = async (req, res) => {
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

        const { productId, quantity  } = req.body;
       
        const userId = req.user.userId;
        console.log('Adding to cart:', { productId, quantity, userId });

        // Validate product exists and get product details
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check stock availability
        const stockCheck = checkStockAvailability(product, quantity);
        if (!stockCheck.available) {
            return res.status(400).json({
                success: false,
                message: stockCheck.message,
                availableQuantity: stockCheck.availableQuantity
            });
        }

        // Find or create user's cart
        let cart = await Cart.findOne({ user: userId }).populate({
            path: 'items.product',
            select: 'name price stock image metalType category',
            populate: {
                path: 'category',
                select: 'name'
            }
        });

        if (!cart) {
            // Create new cart
            cart = new Cart({
                user: userId,
                items: [{ product: productId, quantity }],
                totalAmount: 0
            });
        } else {
            // Check if product already exists in cart
            const existingItemIndex = cart.items.findIndex(
                item => item.product._id.toString() === productId
            );

            if (existingItemIndex > -1) {
                // Update existing item
                const newQuantity = cart.items[existingItemIndex].quantity + quantity;
                
                // Check stock for new quantity
                const newStockCheck = checkStockAvailability(product, newQuantity);
                if (!newStockCheck.available) {
                    return res.status(400).json({
                        success: false,
                        message: `Cannot add ${quantity} more items. ${newStockCheck.message}`,
                        currentQuantityInCart: cart.items[existingItemIndex].quantity,
                        availableQuantity: newStockCheck.availableQuantity
                    });
                }

                cart.items[existingItemIndex].quantity = newQuantity;
            } else {
                // Add new item to cart
                cart.items.push({ product: productId, quantity });
            }
        }

        // Populate the cart to calculate totals
        await cart.populate({
            path: 'items.product',
            select: 'name price stock image metalType category',
            populate: {
                path: 'category',
                select: 'name'
            }
        });

        // Calculate and update total amount
        const totals = calculateCartTotals(cart.items);
        cart.totalAmount = totals.total;

        // Save cart
        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Item added to cart successfully',
            data: {
                cart: {
                    _id: cart._id,
                    items: cart.items,
                    itemCount: cart.items.length,
                    totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
                    ...totals,
                    updatedAt: cart.updatedAt
                }
            }
        });

    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add item to cart',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// GET USER'S CART
const getCart = async (req, res) => {
    try {
        const userId = req.user.userId;

        const cart = await Cart.findOne({ user: userId }).populate({
            path: 'items.product',
            select: 'name price stock image metalType category ratingsAverage',
            populate: {
                path: 'category',
                select: 'name'
            }
        });

        if (!cart) {
            return res.status(200).json({
                success: true,
                message: 'Cart is empty',
                data: {
                    cart: {
                        items: [],
                        itemCount: 0,
                        totalItems: 0,
                        subtotal: 0,
                        tax: 0,
                        shipping: 0,
                        total: 0
                    }
                }
            });
        }

        // Check stock availability for all items
        const itemsWithStockCheck = cart.items.map(item => {
            const stockCheck = checkStockAvailability(item.product, item.quantity);
            return {
                ...item.toObject(),
                stockAvailable: stockCheck.available,
                stockMessage: stockCheck.message || null,
                availableQuantity: item.product.stock
            };
        });

        // Calculate totals
        const totals = calculateCartTotals(cart.items);

        res.status(200).json({
            success: true,
            message: 'Cart retrieved successfully',
            data: {
                cart: {
                    _id: cart._id,
                    items: itemsWithStockCheck,
                    itemCount: cart.items.length,
                    totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
                    ...totals,
                    updatedAt: cart.updatedAt
                }
            }
        });

    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve cart',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// UPDATE CART ITEM
const updateCartItem = async (req, res) => {
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

        const { productId, quantity } = req.body;
        const userId = req.user.userId;

        // Validate quantity
        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1'
            });
        }

        // Find user's cart
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        // Find the item in cart
        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        // Get product details to check stock
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check stock availability
        const stockCheck = checkStockAvailability(product, quantity);
        if (!stockCheck.available) {
            return res.status(400).json({
                success: false,
                message: stockCheck.message,
                availableQuantity: stockCheck.availableQuantity
            });
        }

        // Update quantity
        cart.items[itemIndex].quantity = quantity;

        // Populate and calculate totals
        await cart.populate({
            path: 'items.product',
            select: 'name price stock image metalType category',
            populate: {
                path: 'category',
                select: 'name'
            }
        });

        const totals = calculateCartTotals(cart.items);
        cart.totalAmount = totals.total;

        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Cart item updated successfully',
            data: {
                cart: {
                    _id: cart._id,
                    items: cart.items,
                    itemCount: cart.items.length,
                    totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
                    ...totals,
                    updatedAt: cart.updatedAt
                }
            }
        });

    } catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update cart item',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// REMOVE ITEM FROM CART
const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.userId;

        // Find user's cart
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        // Find and remove the item
        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        cart.items.splice(itemIndex, 1);

        // Recalculate totals if items exist
        if (cart.items.length > 0) {
            await cart.populate({
                path: 'items.product',
                select: 'name price stock image metalType category',
                populate: {
                    path: 'category',
                    select: 'name'
                }
            });

            const totals = calculateCartTotals(cart.items);
            cart.totalAmount = totals.total;
        } else {
            cart.totalAmount = 0;
        }

        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Item removed from cart successfully',
            data: {
                cart: {
                    _id: cart._id,
                    items: cart.items,
                    itemCount: cart.items.length,
                    totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
                    ...(cart.items.length > 0 ? calculateCartTotals(cart.items) : {
                        subtotal: 0,
                        tax: 0,
                        shipping: 0,
                        total: 0
                    }),
                    updatedAt: cart.updatedAt
                }
            }
        });

    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove item from cart',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// CLEAR CART
const clearCart = async (req, res) => {
    try {
        const userId = req.user.userId;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully',
            data: {
                cart: {
                    _id: cart._id,
                    items: [],
                    itemCount: 0,
                    totalItems: 0,
                    subtotal: 0,
                    tax: 0,
                    shipping: 0,
                    total: 0,
                    updatedAt: cart.updatedAt
                }
            }
        });

    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear cart',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart
};