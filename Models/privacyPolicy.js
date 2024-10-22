const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PrivacyPolicySchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    }

});

const PrivacyPolicy = mongoose.model('PrivacyPolicy', PrivacyPolicySchema);
module.exports = PrivacyPolicy;

