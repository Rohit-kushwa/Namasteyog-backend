const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming there's a User model
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // For tracking who last updated the document
    }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
