const mongoose = require('mongoose');

// Define the Header schema
const HeaderSchema = new mongoose.Schema({
    Header: { type: String, required: true },
    accessor: { type: String, required: true }
});

module.exports = mongoose.model('Header', HeaderSchema);
