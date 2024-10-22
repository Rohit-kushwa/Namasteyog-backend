// models/FormData.js
const mongoose = require('mongoose');

// Define the schema for form data
const buttonTextFooterDetailsSchema = new mongoose.Schema({
    buttonText: {
        type: String,
        required: true
    },
    footerDetails: {  // Object for footer details
        address: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        contact: {
            type: String,
            required: true
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('buttonTextFooterDetails', buttonTextFooterDetailsSchema);
