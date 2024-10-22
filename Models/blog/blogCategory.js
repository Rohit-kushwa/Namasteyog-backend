const mongoose = require('mongoose');

const BlogCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('BlogCategory', BlogCategorySchema);
