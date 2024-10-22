const mongoose = require('mongoose');

const DiscountBannerSchema = new mongoose.Schema({
    image: {
        type: String,  // URL or file path to the image
        required: true
    },
    offer: {
        type: String,  // Banner text, such as discount details
        required: true
    },
    text: {
        type: String,  // Banner text, such as discount details
        required: true
    },
    buttonText: {
        type: String,
        default: "Shop Now"
    },
    startDate: {
        type: Date,  // Optional: when the discount starts
        default: Date.now
    },
    endDate: {
        type: Date,  // Optional: when the discount ends
    },
    status: {
        type: Boolean,  // To activate or deactivate the banner
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('DiscountBanner', DiscountBannerSchema);
