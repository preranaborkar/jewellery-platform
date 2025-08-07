// controllers/orderController.js
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD${timestamp}${random}`;
};

// Create order from cart
exports.createOrderFromCart = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.userId;
    const { billingAddress, paymentMethod = 'stripe' } = req.body;

    // Validate billing address
    if (!billingAddress || !billingAddress.street || !billingAddress.city || 
        !billingAddress.state || !billingAddress.zipCode || !billingAddress.country) {
      return res.status(400).json({
        success: false,
        message: 'Complete billing address is required'
      });
    }

    console.log('Creating order for user:', userId);

    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate stock availability and calculate totals
    let subtotal = 0;
    const orderProducts = [];

    for (const item of cart.items) {
      const product = item.product;
      
      if (!product) {
        throw new Error(`Product not found for cart item`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderProducts.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });

      // Update product stock (will be committed only if entire transaction succeeds)
      await Product.findByIdAndUpdate(
        product._id, 
        { $inc: { stock: -item.quantity } },
        { session }
      );
    }

    // Calculate tax (you can customize this logic)
    const tax = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST
    
    // Free shipping for now
    const shipping = 0;
    
    const totalAmount = subtotal + tax + shipping;

    // Create order
    const orderData = {
      user: userId,
      orderNumber: generateOrderNumber(),
      products: orderProducts,
      subtotal: Math.round(subtotal * 100) / 100,
      tax: tax,
      shipping: shipping,
      totalAmount: Math.round(totalAmount * 100) / 100,
      billingAddress: billingAddress,
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      orderStatus: paymentMethod === 'cod' ? 'confirmed' : 'pending'
    };

    const order = new Order(orderData);
    await order.save({ session });

    // If payment method is COD, clear cart immediately
    if (paymentMethod === 'cod') {
      await Cart.findOneAndUpdate(
        { user: userId },
        { $set: { items: [] } },
        { session }
      );
    }

    await session.commitTransaction();

    // Populate order for response
    const populatedOrder = await Order.findById(order._id).populate('products.product');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order: populatedOrder
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Create order error:', error);

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create order'
    });
  } finally {
    session.endSession();
  }
};

// Create Stripe Checkout Session
exports.createStripeCheckout = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderId } = req.body;

    console.log('Creating Stripe checkout for order:', orderId, 'for user:', userId);


    // Get the order
    const order = await Order.findOne({ _id: orderId, user: userId }).populate('products.product');

    console.log('Order details:', order);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Create line items for Stripe
    const lineItems = order.products.map(item => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: item.product.name,
          description: item.product.description || '',
          images: item.product.image && item.product.image.length > 0 ? 
            [item.product.image[0]?.url || item.product.image[0]] : []
        },
        unit_amount: Math.round(item.price * 100), // Convert to paise/cents
      },
      quantity: item.quantity,
    }));

    // Add tax as a separate line item if applicable
    if (order.tax > 0) {
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: {
            name: 'Tax (GST)',
            description: '18% GST'
          },
          unit_amount: Math.round(order.tax * 100),
        },
        quantity: 1,
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/order-success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
      cancel_url: `${process.env.FRONTEND_URL}/order-cancelled?order_id=${order._id}`,
      metadata: {
        orderId: order._id.toString(),
        userId: userId,
        orderNumber: order.orderNumber
      },
      
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['IN'] // Adjust based on your shipping countries
      }
    });

    // Update order with Stripe session ID
    order.stripeSessionId = session.id;
    await order.save();

    res.json({
      success: true,
      message: 'Checkout session created successfully',
      data: {
        sessionId: session.id,
        sessionUrl: session.url
      }
    });

  } catch (error) {
    console.error('Stripe checkout creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session'
    });
  }
};

// Verify Stripe payment
exports.verifyStripePayment = async (req, res) => {
  try {
    const { sessionId } = req.body;

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Get the order from metadata
    const orderId = session.metadata.orderId;
    const order = await Order.findById(orderId).populate('products.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check payment status
    if (session.payment_status === 'paid') {
      // Payment successful
      order.paymentStatus = 'completed';
      order.orderStatus = 'confirmed';
      order.stripePaymentIntentId = session.payment_intent;
      order.paymentVerifiedAt = new Date();

      await order.save();

      // Clear the user's cart
      await Cart.findOneAndUpdate(
        { user: order.user },
        { $set: { items: [] } }
      );

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: { order }
      });
    } else {
      // Payment failed or pending
      order.paymentStatus = 'failed';
      await order.save();

      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed'
    });
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, status } = req.query;

    const filter = { user: userId };
    if (status) {
      filter.orderStatus = status;
    }

    const orders = await Order.find(filter)
      .populate('products.product')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: {
        orders,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// Get single order
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;

    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate('products.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: { order }
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
};

// Cancel order (only if pending)
exports.cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId } = req.params;
    const userId = req.user.userId;

    const order = await Order.findOne({ _id: orderId, user: userId }).populate('products.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.orderStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled'
      });
    }

    // Restore product stock
    for (const item of order.products) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stock: item.quantity } },
        { session }
      );
    }

    // Update order status
    order.orderStatus = 'cancelled';
    await order.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Cancel order error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  } finally {
    session.endSession();
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus, stripePaymentIntentId, stripeSessionId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update payment details
    order.paymentStatus = paymentStatus;
    if (stripePaymentIntentId) order.stripePaymentIntentId = stripePaymentIntentId;
    if (stripeSessionId) order.stripeSessionId = stripeSessionId;

    // If payment completed, update order status
    if (paymentStatus === 'completed') {
      order.orderStatus = 'confirmed';
    }

    await order.save();

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status'
    });
  }
};