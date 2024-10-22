const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TermAndConditionSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    }

});

const TermAndCondition = mongoose.model('TermAndCondition', TermAndConditionSchema);
module.exports = TermAndCondition;

