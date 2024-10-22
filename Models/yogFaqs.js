const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FAQSchema = new mongoose.Schema({
  section: {
    type: String,
    required: true
  },
  questions: [
    {
      question: {
        type: String,
        required: true
      },
      answer: {
        type: String,
        required: true
      }
    }
  ]
});

const YogFAQ = mongoose.model('YogFAQ', FAQSchema);
module.exports = YogFAQ;

