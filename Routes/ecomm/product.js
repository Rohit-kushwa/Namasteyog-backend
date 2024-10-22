const express = require("express");
const router = express.Router();
const multer = require("multer");
const Product = require("../../Models/ecomm/product");
const { uploadProduct } = require("../../uploadFile");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Review = require('../../Models/review');
const authenticateToken = require('../../Middleware/authenticateToken');
const checkRole = require('../../Middleware/checkRole');


// Create a new review
router.post('/:id/reviews', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { user_name, email, reviewInText, rating } = req.body;

  try {
    // Find the product by its ID
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Create a new review
    const newReview = new Review({
      product: id,
      user_name,
      email,
      reviewInText,
      rating,
    });

    // Save the review
    await newReview.save();

    // Add the review to the product
    product.reviews.push(newReview._id);
    await product.save();

    res.status(201).json({ message: 'Review added successfully', data: newReview });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});


// Get all reviews for a product
router.get('/:productId/reviews', async (req, res) => {
  const { productId } = req.params;

  try {

    const header = [
      { Header: "REVIEWER NAME", accessor: "user_name" },
      { Header: "RATING", accessor: "rating" },
      { Header: "REVIEW", accessor: "reviewInText" },
      { Header: "EMAIL", accessor: "email" },
      { Header: "STATUS", accessor: "status" },
      { Header: "ACTION", accessor: "action-multi" },
    ];

    const product = await Product.findById(productId).populate('reviews');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Reviews retrieved successfully', reviews: product.reviews, header: header });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});


router.put('/reviews/:reviewId', authenticateToken, checkRole(['admin']), async (req, res) => {
  const { reviewId } = req.params;
  const { user_name, email, reviewInText, rating, status } = req.body;

  console.log('Received status:', status); // Log the received status value

  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Update the review fields
    review.user_name = user_name !== undefined ? user_name : review.user_name;
    review.email = email !== undefined ? email : review.email;
    review.reviewInText = reviewInText !== undefined ? reviewInText : review.reviewInText;
    review.rating = rating !== undefined ? rating : review.rating;

    // Handle status: Ensure it’s a boolean
    if (status !== undefined) {
      review.status = status === true; // Convert string 'true'/'false' to boolean
    }

    await review.save();

    res.status(200).json({ message: 'Review updated successfully', review });
  } catch (error) {
    console.error('Error updating review:', error); // Log the error for debugging
    res.status(500).json({ message: 'Server error', error });
  }
});



router.delete('/reviews/:reviewId', authenticateToken, checkRole(['admin']), async (req, res) => {
  const { reviewId } = req.params;

  if (!mongoose.isValidObjectId(reviewId)) {
    return res.status(400).json({ message: 'Invalid review ID' });
  }

  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Remove the review from the product
    await Product.updateOne({ _id: review.product }, { $pull: { reviews: reviewId } });

    // Delete the review using deleteOne or findByIdAndDelete
    await Review.deleteOne({ _id: reviewId });
    // Or alternatively:
    // await Review.findByIdAndDelete(reviewId);

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});





// Get all products
router.get(
  "/",
  asyncHandler(async (req, res) => {
    try {
      const products = await Product.find().populate("category reviews");

      const header = [
        { Header: "#", accessor: "id" },
        { Header: "PRODUCT DETAIL", accessor: "product-details" },
        { Header: "NAME", accessor: "name" },
        { Header: "CATEGORIES", accessor: "category.name" },
        { Header: "PRICE", accessor: "price" },
        { Header: "DISCOUNT PRICE", accessor: "discountPrice" },
        { Header: "QTY", accessor: "stock" },
        { Header: "STATUS", accessor: "status" },
        { Header: "ACTION", accessor: "action-multi" },

      ];

      res.json({
        success: true,
        message: "Products retrieved successfully.",
        data: products,
        header: header
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

// Get a product by ID
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    try {
      const productID = req.params.id;
      const product = await Product.findById(productID).populate("category reviews");
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found." });
      }
      res.json({
        success: true,
        message: "Product retrieved successfully.",
        data: product,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

// Create a new product
router.post(
  "/",
  authenticateToken, checkRole(['admin']),
  uploadProduct.array("images", 20),
  asyncHandler(async (req, res) => {
    try {
      const { name, description, price, stock, category, status, content, discountPrice } = req.body;
      console.log("Req body: ", req.body);

      // Validate required fields
      if (!name || !description || !price || !stock || !category) {
        return res
          .status(400)
          .json({ success: false, message: "Required fields are missing." });
      }

      // Validate file uploads
      if (!req.files || req.files.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "At least one image is required." });
      }

      // Check for existing product with the same name
      const existingProduct = await Product.findOne({ name: name });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: "Product with this name already exists.",
        });
      }

      // Map uploaded files to an array of filenames
      const imagesList = req.files.map((file) => file.filename);

      // Set discountPrice to price if not provided
      const newProduct = new Product({
        name,
        description,
        price,
        stock,
        category,
        images: imagesList,
        status,
        content,
        discountPrice: discountPrice ? discountPrice : price, // Set discountPrice to price if not provided
      });

      console.log(newProduct);

      // Save the new product to the database
      await newProduct.save();

      res.json({
        success: true,
        message: "Product created successfully.",
        data: newProduct,
      });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  })
);


// Set thumbnail of Product
router.patch(
  "/thumbnail/:id",
  authenticateToken, checkRole(['admin']),
  asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const { thumbnail } = req.body;

    // const thumbnail = "1722066581314_pngegg.png";

    console.log("productId: ", productId);
    console.log("thumbnail: ", thumbnail);

    try {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid product ID." });
      }

      const product = await Product.findById(productId);

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found." });
      }

      // Check if the provided imageId exists in the images array
      if (thumbnail && !product.images.includes(thumbnail)) {
        return res.status(400).json({
          success: false,
          message: "Image ID not found in product images.",
        });
      }

      // If imageId is provided and valid, set it as the thumbnail
      if (thumbnail) {
        product.thumbnail = thumbnail;
      } else if (!thumbnail && product.images.length > 0) {
        // If no imageId is provided, default to the first image in the array
        product.thumbnail = product.images[0];
      }

      await product.save();

      res.status(200).json({
        success: true,
        message: "Product thumbnail updated successfully.",
        data: product,
      });
    } catch (error) {
      console.error("Error updating product thumbnail:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

// Update Status of Product
router.patch(
  "/status/:id",
  authenticateToken, checkRole(['admin']),
  asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const { status } = req.body;

    console.log("productId: ", productId);
    console.log("status: ", status);

    try {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid product ID." });
      }

      const updatedStatus = await Product.findByIdAndUpdate(
        productId,
        { status: status },
        { new: true }
      );

      if (!updatedStatus) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found." });
      }

      res.status(200).json({
        success: true,
        message: "Product status updated successfully.",
        data: updatedStatus,
      });
    } catch (error) {
      console.error("Error updating Product Status:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

// Update a product
router.put(
  "/:id",
  authenticateToken, checkRole(['admin']),
  uploadProduct.array("images", 20),
  asyncHandler(async (req, res) => {
    const productId = req.params.id;
    try {
      const { name, description, price, stock, category, status, content, discountPrice } = req.body;

      const productToUpdate = await Product.findById(productId);
      if (!productToUpdate) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found." });
      }

      // Update fields, maintaining existing values if not provided
      productToUpdate.name = name || productToUpdate.name;
      productToUpdate.description = description || productToUpdate.description;
      productToUpdate.price = price || productToUpdate.price;
      productToUpdate.stock = stock || productToUpdate.stock;
      productToUpdate.category = category || productToUpdate.category;
      productToUpdate.status = status || productToUpdate.status;
      productToUpdate.content = content || productToUpdate.content;
      productToUpdate.discountPrice = discountPrice !== undefined ? discountPrice : productToUpdate.price; // Set discountPrice to price if not provided

      // Process new images
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map((file) => `${file.filename}`);
        productToUpdate.images.push(...newImages);
      }

      await productToUpdate.save();
      res.json({
        success: true,
        message: "Product updated successfully.",
        data: productToUpdate,
      });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  })
);


router.delete(
  '/:id/images/:filename',
  authenticateToken, checkRole(['admin']),
  asyncHandler(async (req, res) => {
    const { id, filename } = req.params;

    try {
      // Find the product by its ID
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }

      // Check if the image exists in the product's images array
      const imageIndex = product.images.indexOf(filename);
      if (imageIndex === -1) {
        return res.status(404).json({ message: 'Image not found in product.' });
      }

      // Remove the image from the images array
      product.images.splice(imageIndex, 1);

      // If the image being deleted is the thumbnail, update the thumbnail
      if (product.thumbnail === filename) {
        product.thumbnail = product.images.length > 0 ? product.images[0] : null; // Set to first image or null if no images are left
      }

      // Save the updated product
      await product.save();

      res.status(200).json({
        success: true,
        message: 'Image deleted successfully.',
        data: product,
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  })
);



// Delete a product
router.delete(
  "/:id",
  authenticateToken, checkRole(['admin']),
  asyncHandler(async (req, res) => {
    const productID = req.params.id;
    try {
      const product = await Product.findByIdAndDelete(productID);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found." });
      }
      res.json({ success: true, message: "Product deleted successfully." });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

module.exports = router;
