const mongoose = require('mongoose');

// Define the cart schema
const CartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            price: {
                type: Number,
                required: true
            },
            discountPrice: {
                type: Number,
                default: 0  // Ensure there's a default value
            },
            total: {
                type: Number,
                required: true,
                default: function () {
                    return this.quantity * this.price; // Calculate total based on price
                }
            },
            totalDiscount: {
                type: Number,
                required: true,
                default: function () {
                    // Ensure the discountPrice exists and is a valid number
                    return this.quantity * (this.discountPrice || this.price); // Calculate based on discount price, fallback to price
                }
            }
        }
    ],
    subTotal: {
        type: Number,
        required: true,
        default: 0
    },
    subTotalDiscount: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Pre-save middleware to calculate subtotal and subtotalDiscount
CartSchema.pre('save', function (next) {
    this.subTotal = this.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    this.subTotalDiscount = this.items.reduce((acc, item) => acc + (item.quantity * (item.discountPrice || item.price)), 0);
    next();
});

module.exports = mongoose.model('Cart', CartSchema);
