const mongoose = require('mongoose');

const UpcomingClassSchema = new mongoose.Schema({
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class', // Reference to the Class model
        required: true
    },  
    priority: {
        type: Number,
        default: 0, // Default priority value
        required: true // Ensure a priority is always set
    },
    status: {
        type: Boolean,
        default: true // true = active, false = inactive/cancelled
    }
}, { timestamps: true });

module.exports = mongoose.model('UpcomingClass', UpcomingClassSchema);
