const mongoose = require('mongoose');

const OrderCounterSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    seq: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('OrderCounter', OrderCounterSchema);
