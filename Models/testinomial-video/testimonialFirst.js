const mongoose = require('mongoose');

const TestimonialFirstSchema = new mongoose.Schema({
    image: {
        type: String,  // Store the image file path or URL
        required: true
    },
    status: {
        type: Boolean,
        default: true // Default status is true
    },
    isdeleted: {
        type: Boolean,
        default: false // Default status is true
    },
    priority: {
        type: Number,
        default: 0, // Default priority value
        required: true // Ensure a priority is always set
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('TestimonialFirst', TestimonialFirstSchema);
