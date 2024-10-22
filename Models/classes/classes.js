// Models/Class.js
const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Instructor', // Assuming you have an Instructor model
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    duration: {
        type: Number, // Duration in minutes
        required: true
    },
    level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Master'], // Define difficulty levels
        required: true
    },
    location: {
        type: String, // Either a physical location or an online link
        required: true
    },
    status: {
        type: Boolean,
        default: true // true = active, false = inactive/cancelled
    },
    isdeleted: {
        type: Boolean,
        default: false // true = active, false = inactive/cancelled
    }
}, { timestamps: true });

module.exports = mongoose.model('Class', ClassSchema);
