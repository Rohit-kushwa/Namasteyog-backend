const mongoose = require('mongoose');
const Package = require('./package'); // Adjust the path as necessary

const userSubscriberSchema = new mongoose.Schema({
    subscriberId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    packageId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Package',
    },
    startDate: {
        type: Date,
        default: Date.now,
    },
    endDate: {
        type: Date,
        required: true,
    },
    status: {
        type: Boolean,
        enum: ['true', 'false'],
        default: 'true'
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
            enum: ['credit_card', 'paypal', 'bank_transfer', 'razorpay', 'manual'],
            required: true,
        },
        paymentId:{
            type: String,
            required: true
        }
    },
    isDeleted: {
        type: Boolean,
        enum: ['true', 'false'],
        default: 'false'
    },
    paidAmount: {
        type: Number,
        default: 0,
    },
    dueAmount: {
        type: Number,
        default: function () {
            return this.paymentDetails.amount - this.paidAmount;
        },
    },
}, { timestamps: true });

const UserSubscriber = mongoose.model('UserSubscriber', userSubscriberSchema);

module.exports = UserSubscriber;
