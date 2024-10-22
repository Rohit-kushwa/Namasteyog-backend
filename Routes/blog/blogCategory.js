const BlogCategory = require('../../Models/blog/blogCategory');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authenticateToken = require('../../Middleware/authenticateToken');
const checkRole = require('../../Middleware/checkRole');

// Fetch all categories
router.get('/', async (req, res) => {
    try {
        const categories = await BlogCategory.find();
        const header = [
            { Header: "NAME", accessor: "name" },
            { Header: "ACTION", accessor: "action-multi" },
        ];
        res.status(200).json({ success: true, message: "Categories Retrieved Successfully", data: categories, header: header });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Create a new category
router.post('/', authenticateToken, checkRole(['admin']), async (req, res) => {
    const { name } = req.body;

    const newCategory = new BlogCategory({ name });

    try {
        const savedCategory = await newCategory.save();
        res.status(200).json({ success: true, message: "Category Created Successfully", data: savedCategory });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Update category by name
router.put('/updateByName', authenticateToken, checkRole(['admin']), async (req, res) => {
    const { name } = req.body;

    try {
        const updatedCategory = await BlogCategory.findOneAndUpdate({ name }, { name }, { new: true });

        if (!updatedCategory) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.status(200).json({ success: true, message: "Category Updated Successfully", data: updatedCategory });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update category by ID
router.put('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {

        console.log("Request data: ", req.body);
        const updatedCategory = await BlogCategory.findByIdAndUpdate(
            id,
            { name: name },
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.status(200).json({ success: true, message: "Category Updated Successfully", data: updatedCategory });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});



// Delete a category
router.delete('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    const { id } = req.params;

    try {
        const deletedCategory = await BlogCategory.findByIdAndDelete(id);

        if (!deletedCategory) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.status(200).json({ success: true, message: "Category Deleted Successfully", data: deletedCategory });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
