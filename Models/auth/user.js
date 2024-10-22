const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    phone: {
        type: String,
        unique: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    otp: {
        type: String
    },
    otpExpires: {
        type: Date
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },

    // Payment History
    paymentHistory: [{
        amount: Number,
        paymentMethod: String,
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending'
        },
        paymentDate: {
            type: Date,
            default: Date.now
        },
        orderId: String // Tracking order for payment
    }],

    // Package Details - Tracking purchased packages
    purchasedPackages: [{
        packageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Package' // Reference to the Package model
        },
        purchaseDate: {
            type: Date,
            default: Date.now
        },
        expiryDate: Date
    }],

    // Booked Classes
    bookedClasses: [{
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class' // Reference to the Class model
        },
        bookingDate: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['booked', 'completed', 'cancelled'],
            default: 'booked'
        }
    }],

    // Order IDs for tracking orders made by the user
    orderIds: [{
        type: String
    }]
});

// Middleware to update `updatedAt` field
UserSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('User', UserSchema);
