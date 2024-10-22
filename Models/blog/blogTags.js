const mongoose = require('mongoose');

const BlogTagSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('BlogTag', BlogTagSchema);
