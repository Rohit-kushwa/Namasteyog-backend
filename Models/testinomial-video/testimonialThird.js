// Models/TestimonialThird.js

const mongoose = require('mongoose');

const TestimonialThirdSchema = new mongoose.Schema({
    title: {
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
    location: {
        type: String,
        required: false
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
    isDeleted: {
        type: Boolean,
        default: false // Default status is true
    }
}, { timestamps: true });

module.exports = mongoose.model('TestimonialThird', TestimonialThirdSchema);
