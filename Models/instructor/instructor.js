const mongoose = require('mongoose');

const InstructorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    bio: {
        type: String,
        required: true
    },
    experienceYears: {
        type: Number,
        required: true,
        min: 0
    },
    certifications: {
        type: [String],  // Array of certification names
        required: true
    },
    specialization: {
        type: String,    // E.g., "Hatha Yoga", "Vinyasa Yoga"
        required: true
    },
    level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Master'],  // Defined levels for instructors
        required: true
    },
    profileImage: {
        type: String,    // URL or path to image
        required: true
    },
    contactInfo: {
        email: {
            type: String,
            required: true,
            match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']
        },
        phone: {
            type: String,
            required: true,
            match: [/^\d{10}$/, 'Please use a valid phone number.']
        }
    },
    socialMediaLinks: {
        facebook: {
            type: String
        },
        instagram: {
            type: String
        },
        linkedin: {
            type: String
        }
    },
    availability: {
        type: [String],  // E.g., ["Monday 9 AM - 11 AM", "Wednesday 2 PM - 4 PM"]
        required: true
    },
    status: {
        type: Boolean,
        default: true // Default status is true
    },
    isDeleted: {
        type: Boolean,
        default: false // Default isDeleted is false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Instructor', InstructorSchema);
