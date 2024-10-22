const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true,
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    cartId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Cart', // Assuming you have a Cart model
    },
    paymentDetails: {
        amount: {
            type: Number,
            required: true,
        },
        paymentDate: {
            type: Date,
            default: Date.now,
        },
        paymentMethod: {
            type: String,
            enum: ['credit_card', 'paypal', 'bank_transfer'],
            required: true,
        },
    },
    status: {
        type: String,
        enum: ['Delivered', 'Pending', 'Processing', 'Canceled'],
        default: 'Processing',
    },
    shippingDetails: { // Shipping details subdocument
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        streetAddress: {
            type: String,
            required: true,
        },
        landmark: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        zip: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            match: /.+\@.+\..+/, // Simple email validation
        },
    },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
