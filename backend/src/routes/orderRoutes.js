// routes/orderRoutes.js - FINAL FIXED VERSION
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Order = require('../models/Order'); // Adjust path as needed
const Cart = require('../models/Cart');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);    
router.use(protect);

router.post('/create-stripe-checkout', async (req, res) => {
  const { items } = req.body;
  console.log('Creating Stripe checkout session with items:', items);
  
  try {
    // Validate that items exist and are not empty
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' });
    }

    // Handle the nested product structure from your cart
    const lineItems = items.map((item, index) => {
      console.log(`Processing item ${index}:`, JSON.stringify(item, null, 2));
      
      // Extract product details from the nested structure
      const product = item.product;
      
      if (!product) {
        throw new Error(`Product data is missing from cart item ${index}`);
      }
      
      // Validate price
      if (!product.price || isNaN(product.price) || product.price <= 0) {
        console.error(`Invalid price for product ${product.name}:`, product.price);
        throw new Error(`Invalid price for product: ${product.name}`);
      }
      
      // Handle image URL extraction
      let productImage = null;
      if (product.image && Array.isArray(product.image) && product.image.length > 0) {
        const imageData = product.image[0];
        productImage = imageData?.url || imageData;
        console.log(`Product image for ${product.name}:`, productImage);
      }

      // Create line item
      const lineItem = {
        price_data: {
          currency: 'inr', // Indian Rupees
          product_data: {
            name: product.name || 'Unknown Product',
            images: productImage ? [productImage] : [],
            description: product.shortDescription || `${product.metalType || ''} jewelry`.trim(),
          },
          unit_amount: Math.round(product.price * 100), // Convert to paisa (smallest INR unit)
        },
        quantity: item.quantity || 1,
      };
      
      console.log(`Line item ${index}:`, JSON.stringify(lineItem, null, 2));
      console.log(`Price calculation: ${product.price} * 100 = ${Math.round(product.price * 100)}`);
      
      return lineItem;
    });

    console.log('All line items created successfully:', lineItems.length);

    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/cart`,
      metadata: {
        userId: req.user?.id || 'unknown',
        itemCount: items.length.toString(),
      },
    };

    console.log('Creating Stripe session with config:', JSON.stringify(sessionConfig, null, 2));

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('Stripe session created successfully:', session.id);
    res.json({ id: session.id });
    
  } catch (error) {
    console.error('Stripe Checkout Error:', error.message);
    console.error('Full error:', error);
    
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message 
    });
  }
});

router.post('/verify-payment', async (req, res) => {
  const { sessionId } = req.body;
  const userId = req.user.id || req.user.userId;

  try {
    console.log("   at verification userId:", userId);

    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    console.log('Stripe session retrieved:', {
      id: session.id,
      payment_status: session.payment_status,
      payment_intent: session.payment_intent
    });

    if (session.payment_status !== 'paid') {
      return res.json({
        success: false,
        message: 'Payment was not completed successfully'
      });
    }

    // FIRST: Check if order already exists for this session
    const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
    if (existingOrder) {
      console.log('Order already exists for this session:', existingOrder.orderNumber);
      await existingOrder.populate('products.product');
      
      return res.json({
        success: true,
        message: 'Payment already verified',
        data: {
          order: {
            _id: existingOrder._id,
            orderNumber: existingOrder.orderNumber,
            totalAmount: existingOrder.totalAmount,
            paymentStatus: existingOrder.paymentStatus,
            orderStatus: existingOrder.orderStatus,
            stripePaymentIntentId: existingOrder.stripePaymentIntentId,
            products: existingOrder.products,
            createdAt: existingOrder.createdAt
          }
        }
      });
    }

    // Get line items from the session to create order
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
    console.log('Session line items:', lineItems.data);

    // Get user's cart to match products
    const userCart = await Cart.findOne({ user: userId }).populate('items.product');
    
    if (!userCart) {
      return res.json({
        success: false,
        message: 'Cart not found - order may have already been processed'
      });
    }

    // Calculate total from session
    const totalAmount = session.amount_total / 100; // Convert from paise to rupees

    // Create order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Prepare order products from cart items
    const orderProducts = userCart.items.map(cartItem => ({
      product: cartItem.product._id,
      quantity: cartItem.quantity,
      price: cartItem.product.price,
      name: cartItem.product.name
    }));

    // Add required billing address and subtotal
    const billingAddress = {
      street: "Address collected via Stripe",
      city: "TBD",
      state: "TBD",
      zipCode: "000000",
      country: "India"
    };

    // Create new order with ALL required fields
    const newOrder = new Order({
      user: userId,
      orderNumber: orderNumber,
      products: orderProducts,
      totalAmount: totalAmount,
      subtotal: totalAmount,
      billingAddress: billingAddress,
      paymentMethod: 'stripe',
      paymentStatus: 'completed',
      stripePaymentIntentId: session.payment_intent,
      stripeSessionId: sessionId,
      orderStatus: 'confirmed',
      shippingStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedOrder = await newOrder.save();
    
    // Populate the order with product details for response
    await savedOrder.populate('products.product');

    console.log('Order created successfully:', savedOrder.orderNumber);

    // Clear user's cart
    await Cart.findOneAndDelete({ user: userId });
    console.log('Cart cleared for user:', userId);

    res.json({
      success: true,
      message: 'Payment verified and order created successfully',
      data: {
        order: {
          _id: savedOrder._id,
          orderNumber: savedOrder.orderNumber,
          totalAmount: savedOrder.totalAmount,
          paymentStatus: savedOrder.paymentStatus,
          orderStatus: savedOrder.orderStatus,
          stripePaymentIntentId: savedOrder.stripePaymentIntentId,
          products: savedOrder.products,
          createdAt: savedOrder.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
});


// Also add a route to clear cart (used in frontend)
router.delete('/cart/clear', async (req, res) => {
  try {
    const userId = req.user.id;
    await Cart.findOneAndDelete({ user: userId });
    res.json({ success: true, message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ success: false, message: 'Failed to clear cart' });
  }
});

module.exports = router;