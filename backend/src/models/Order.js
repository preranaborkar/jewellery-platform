const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required for order']
    },
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Product is required']
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [1, 'Quantity must be at least 1']
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative']
        }
    }],
    subtotal: {
        type: Number,
        required: true,
        min: [0, 'Subtotal cannot be negative']
    },
    tax: {
        type: Number,
        default: 0
    },
    shipping: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: [0, 'Total amount cannot be negative']
    },
    billingAddress: {
        street: {
            type: String,
            required: [true, 'Street address is required'],
            minlength: [5, 'Street address must be at least 5 characters'],
            maxlength: [200, 'Street address must be at most 200 characters']
        },
        city: { type: String, required: [true, 'City is required'] },
        state: { type: String, required: [true, 'State is required'] },
        zipCode: {
            type: String,
            required: [true, 'Zip code is required'],
            match: [/^\d{6}$/, 'Zip code must be 6 digits']
        },
        country: { type: String, required: [true, 'Country is required'] }
    },
    paymentMethod: {
        type: String,
        enum: ['razorpay', 'cod', 'upi', 'card'],
        default: 'razorpay',
        required: true
    },
    transactionId: {
        type: String,
        default: null // not required upfront; will be set later
    },
    razorpayOrderId: {
        type: String,
        default: null
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Indexes
orderSchema.index({ user: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Order', orderSchema);
