// backend/src/utils/razorpayService.js
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay order
 * @param {Object} orderData - Order details
 * @param {number} orderData.amount - Amount in rupees (will be converted to paise)
 * @param {string} orderData.currency - Currency (default: INR)
 * @param {string} orderData.receipt - Receipt/Order ID
 * @param {Object} orderData.notes - Additional notes
 * @returns {Promise<Object>} Razorpay order object
 */
const createRazorpayOrder = async (orderData) => {
    try {
        const options = {
            amount: Math.round(orderData.amount * 100), // Convert to paise
            currency: orderData.currency || 'INR',
            receipt: orderData.receipt,
            notes: orderData.notes || {},
            payment_capture: 1 // Auto capture payment
        };

        const order = await razorpay.orders.create(options);
        
        console.log('Razorpay order created:', {
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt
        });

        return order;
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        throw new Error(`Failed to create Razorpay order: ${error.message}`);
    }
};

/**
 * Verify Razorpay payment signature
 * @param {Object} paymentData - Payment verification data
 * @param {string} paymentData.razorpay_order_id - Razorpay order ID
 * @param {string} paymentData.razorpay_payment_id - Razorpay payment ID
 * @param {string} paymentData.razorpay_signature - Razorpay signature
 * @returns {boolean} True if signature is valid
 */
const verifyRazorpayPayment = (paymentData) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = paymentData;

        // Create expected signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        // Compare signatures
        const isSignatureValid = expectedSignature === razorpay_signature;
        
        console.log('Payment verification:', {
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            isValid: isSignatureValid
        });

        return isSignatureValid;
    } catch (error) {
        console.error('Payment verification error:', error);
        return false;
    }
};

/**
 * Fetch payment details from Razorpay
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} Payment details
 */
const fetchPaymentDetails = async (paymentId) => {
    try {
        const payment = await razorpay.payments.fetch(paymentId);
        return payment;
    } catch (error) {
        console.error('Failed to fetch payment details:', error);
        throw new Error(`Failed to fetch payment details: ${error.message}`);
    }
};

/**
 * Initiate refund for a payment
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Refund amount in rupees (optional, full refund if not provided)
 * @param {Object} options - Additional refund options
 * @returns {Promise<Object>} Refund details
 */
const initiateRefund = async (paymentId, amount = null, options = {}) => {
    try {
        const refundData = {
            ...options
        };

        if (amount) {
            refundData.amount = Math.round(amount * 100); // Convert to paise
        }

        const refund = await razorpay.payments.refund(paymentId, refundData);
        
        console.log('Refund initiated:', {
            refundId: refund.id,
            paymentId: paymentId,
            amount: refund.amount,
            status: refund.status
        });

        return refund;
    } catch (error) {
        console.error('Refund initiation error:', error);
        throw new Error(`Failed to initiate refund: ${error.message}`);
    }
};

/**
 * Fetch refund details
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} refundId - Razorpay refund ID
 * @returns {Promise<Object>} Refund details
 */
const fetchRefundDetails = async (paymentId, refundId) => {
    try {
        const refund = await razorpay.payments.fetchRefund(paymentId, refundId);
        return refund;
    } catch (error) {
        console.error('Failed to fetch refund details:', error);
        throw new Error(`Failed to fetch refund details: ${error.message}`);
    }
};

/**
 * Verify webhook signature
 * @param {string} body - Webhook request body
 * @param {string} signature - Razorpay signature from headers
 * @param {string} secret - Webhook secret
 * @returns {boolean} True if signature is valid
 */
const verifyWebhookSignature = (body, signature, secret) => {
    try {
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body.toString())
            .digest('hex');

        return expectedSignature === signature;
    } catch (error) {
        console.error('Webhook signature verification error:', error);
        return false;
    }
};

/**
 * Handle payment success webhook
 * @param {Object} payload - Webhook payload
 * @returns {Promise<void>}
 */
const handlePaymentWebhook = async (payload) => {
    try {
        const { event, payload: eventPayload } = payload;
        
        console.log('Processing webhook event:', event);

        switch (event) {
            case 'payment.captured':
                // Handle successful payment
                console.log('Payment captured:', eventPayload.payment.entity);
                // Additional processing can be added here
                break;
                
            case 'payment.failed':
                // Handle failed payment
                console.log('Payment failed:', eventPayload.payment.entity);
                // Additional processing can be added here
                break;
                
            case 'refund.created':
                // Handle refund creation
                console.log('Refund created:', eventPayload.refund.entity);
                break;
                
            default:
                console.log('Unhandled webhook event:', event);
        }
    } catch (error) {
        console.error('Webhook handling error:', error);
        throw error;
    }
};

/**
 * Get all payments for an order
 * @param {string} orderId - Razorpay order ID
 * @returns {Promise<Array>} Array of payments
 */
const getOrderPayments = async (orderId) => {
    try {
        const payments = await razorpay.orders.fetchPayments(orderId);
        return payments.items || [];
    } catch (error) {
        console.error('Failed to fetch order payments:', error);
        throw new Error(`Failed to fetch order payments: ${error.message}`);
    }
};

/**
 * Validate Razorpay configuration
 * @returns {boolean} True if configuration is valid
 */
const validateRazorpayConfig = () => {
    const requiredEnvVars = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.error('Missing Razorpay configuration:', missingVars);
        return false;
    }
    
    return true;
};

/**
 * Format amount for display
 * @param {number} amountInPaise - Amount in paise
 * @returns {number} Amount in rupees
 */
const formatAmount = (amountInPaise) => {
    return amountInPaise / 100;
};

module.exports = {
    createRazorpayOrder,
    verifyRazorpayPayment,
    fetchPaymentDetails,
    initiateRefund,
    fetchRefundDetails,
    verifyWebhookSignature,
    handlePaymentWebhook,
    getOrderPayments,
    validateRazorpayConfig,
    formatAmount
};