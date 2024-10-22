const express = require('express');
const router = express.Router();
const Category = require('../../Models/ecomm/category');
// const SubCategory = require('../model/subCategory');
// const Product = require('../model/product');
const { uploadCategory } = require('../../uploadFile');
const multer = require('multer');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const authenticateToken = require('../../Middleware/authenticateToken');
const checkRole = require('../../Middleware/checkRole');
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());



// Get all categories
router.get('/', asyncHandler(async (req, res) => {
    try {
        const categories = await Category.find();

        const header = [
            { Header: "#", accessor: "id" },
            { Header: "IMAGE", accessor: "image" },
            { Header: "NAME", accessor: "name" },
            { Header: "STATUS", accessor: "status" },
            { Header: "ACTION", accessor: "action-multi" },

        ];

        res.status(200).json({ success: true, message: "Categories retrieved successfully.", data: categories, header: header });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));

// Get a category by ID
router.get('/:id', asyncHandler(async (req, res) => {
    try {
        const categoryID = req.params.id;
        const category = await Category.findById(categoryID);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found." });
        }
        res.json({ success: true, message: "Category retrieved successfully.", data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));


// Create a new category with image upload
router.post('/', authenticateToken, checkRole(['admin']), asyncHandler(async (req, res) => {
    uploadCategory.single('image')(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ success: false, message: 'File size is too large. Maximum file size is 5MB.' });
            }
            console.error(`Multer error: ${err.message}`);
            return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
            console.error(`Error: ${err.message}`);
            return res.status(400).json({ success: false, message: err.message });
        }

        const { name } = req.body;
        let newImg = '';
        if (req.file) {
            newImg = req.file.filename;
            console.log("Image: ", newImg);
        }

        if (!name) {
            return res.status(400).json({ success: false, message: 'Name is required.' });
        }

        try {
            // Check if a category with the same name already exists
            const existingCategory = await Category.findOne({ name: name });
            if (existingCategory) {
                return res.status(400).json({ success: false, message: 'Category with this name already exists.' });
            }

            const newCategory = new Category({
                name: name,
                image: newImg,
                createdBy: req.user.id,
                updatedBy: req.user.id
            });
            await newCategory.save();
            res.status(201).json({ success: true, message: 'Category created successfully.', data: null });
        } catch (error) {
            console.error('Error creating category:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    });
}));


// Update a category
router.put('/:id', authenticateToken, checkRole(['admin']), asyncHandler(async (req, res) => {
    try {
        const categoryID = req.params.id;
        uploadCategory.single('image')(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    err.message = 'File size is too large. Maximum filesize is 5MB.';
                }
                console.log(`Update category: ${err.message}`);
                return res.json({ success: false, message: err.message });
            } else if (err) {
                console.log(`Update category: ${err.message}`);
                return res.json({ success: false, message: err.message });
            }

            const { name } = req.body;
            let updateData = { name };

            if (req.file) {
                updateData.image = req.file.filename;
            }

            if (!name) {
                return res.status(400).json({ success: false, message: "Name is required." });
            }



            try {
                const updatedCategory = await Category.findByIdAndUpdate(categoryID, updateData, { new: true });
                if (!updatedCategory) {
                    return res.status(404).json({ success: false, message: "Category not found." });
                }
                res.json({ success: true, message: "Category updated successfully.", data: null });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }

        });

    } catch (err) {
        console.log(`Error updating category: ${err.message}`);
        return res.status(500).json({ success: false, message: err.message });
    }
}));



// Update a status for category
router.patch('/status/:id', authenticateToken, checkRole(['admin']), asyncHandler(async (req, res) => {
    const categoryId = req.params.id;
    const { status } = req.body;

    console.log('categoryId: ', categoryId);
    console.log('status: ', status);

    try {
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ success: false, message: "Invalid Category ID." });
        }

        const updatedCategory = await Category.findByIdAndUpdate(categoryId, { status: status }, { new: true });

        if (!updatedCategory) {
            return res.status(404).json({ success: false, message: "Category not found." });
        }

        res.json({ success: true, message: "Category status updated successfully.", data: updatedCategory });

    } catch (error) {
        console.error("Error updating Category Status:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}));




// Delete a category
router.delete('/:id', authenticateToken, checkRole(['admin']), asyncHandler(async (req, res) => {
    try {
        const categoryID = req.params.id;

        // Check if any subcategories reference this category
        // const subcategories = await SubCategory.find({ categoryId: categoryID });
        // if (subcategories.length > 0) {
        //     return res.status(400).json({ success: false, message: "Cannot delete category. Subcategories are referencing it." });
        // }

        // Check if any products reference this category
        // const products = await Product.find({ proCategoryId: categoryID });
        // if (products.length > 0) {
        //     return res.status(400).json({ success: false, message: "Cannot delete category. Products are referencing it." });
        // }

        // If no subcategories or products are referencing the category, proceed with deletion
        const category = await Category.findByIdAndDelete(categoryID);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found." });
        }
        res.json({ success: true, message: "Category deleted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));






module.exports = router;
