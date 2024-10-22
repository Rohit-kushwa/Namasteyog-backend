const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Product Schema
const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  discountPrice: {
    type: Number,
    required: true,
    default: function () {
      return this.price; // Default discountPrice to price
    }
  },
  stock: {
    type: Number,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Category',
  },
  images: [{
    type: String
  }],
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  status: {
    type: Boolean,
    enum: ['true', 'false'],
    default: 'true'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  thumbnail: {
    type: String,
    default: null
  }
});

// Pre-save hook to update the updated_at field
productSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  if (!this.thumbnail && this.images.length > 0) {
    this.thumbnail = this.images[0];
  }
  next();
});

// Create and export the Product model
const Product = mongoose.model('Product', productSchema);
module.exports = Product;
