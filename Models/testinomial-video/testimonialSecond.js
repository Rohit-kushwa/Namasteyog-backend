// Models/TestimonialSecond.js

const mongoose = require('mongoose');

const TestimonialSecondSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true // Default status is true
    },
    priority: {
        type: Number,
        default: 0, // Default priority value
        required: true // Ensure a priority is always set
    },
    isdeleted: {
        type: Boolean,
        default: false // Default status is true
    }
}, { timestamps: true });

module.exports = mongoose.model('TestimonialSecond', TestimonialSecondSchema);
