const mongoose = require('mongoose');

const EcomBGImageTextSchema = new mongoose.Schema({
    text1: {
        type: String,
        required: true
    },
    text2: {
        type: String,
        required: true
    },
    buttonText: {
        type: String,
        required: true
    },
    bgImage: {
        type: String,
        required: true // Set to false if it's optional
    }
}, { timestamps: true });

module.exports = mongoose.model('EcomBGImageText', EcomBGImageTextSchema);
