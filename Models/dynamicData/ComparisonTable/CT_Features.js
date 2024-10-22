const mongoose = require('mongoose');

// Define the Feature schema with dynamic fields
const FeatureSchema = new mongoose.Schema({
    name: { type: String, required: true },
    attributes: { type: mongoose.Schema.Types.Mixed } // Allows dynamic key-value pairs
});

module.exports = mongoose.model('Feature', FeatureSchema);
