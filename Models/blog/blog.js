const mongoose = require('mongoose');

const BlogPostSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    image: { type: String, require: true, },
    isDeleted: {
        type: Boolean,
        enum: ['true', 'false'],
        default: 'false'
    },
    status: {
        type: Boolean,
        enum: ['true', 'false'],
        default: 'true'
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogCategory', required: true },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BlogTag' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('BlogPost', BlogPostSchema);
