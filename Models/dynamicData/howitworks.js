// models/FormData.js
const mongoose = require('mongoose');

// Define the schema for form data
const howItWorksSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    number: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('howItWorks', howItWorksSchema);
