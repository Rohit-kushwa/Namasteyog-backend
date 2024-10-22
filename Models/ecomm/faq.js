const mongoose = require('mongoose');

const FAQSchema = new mongoose.Schema({
    questionNo: {
        type: Number,
        required: true,
        unique: true
    },
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    points: {
        type: [String], // Array of strings to store multiple points related to the answer
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('FAQ', FAQSchema);
