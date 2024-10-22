const blogTags = require('../../Models/blog/blogTags');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authenticateToken = require('../../Middleware/authenticateToken');
const checkRole = require('../../Middleware/checkRole');

// Fetch all tags
router.get('/', async (req, res) => {
    try {
        const tags = await blogTags.find();
        const header = [
            { Header: "NAME", accessor: "name" },
            { Header: "ACTION", accessor: "action-multi" },
        ];
        res.status(200).json({success: true, message: "Tags Retrieved Successful", data: tags, header: header});
    } catch (err) {
        res.status(500).json({success: false, message: err.message });
    }
});

// Create a new tag
router.post('/', authenticateToken, checkRole(['admin']), async (req, res) => {
    const { name } = req.body;

    const newTag = new blogTags({ name });

    try {
        const savedTag = await newTag.save();
        res.status(200).json({success: true, message: "Tags Created Successful", data: savedTag});
    } catch (err) {
        res.status(400).json({success: false, message: err.message });
    }
});

// Update a tag
router.put('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const updatedTag = await blogTags.findByIdAndUpdate(
            id,
            { name },
            { new: true } // Return the updated document
        );

        if (!updatedTag) {
            return res.status(404).json({ success: false, message: "Tag not found" });
        }

        res.status(200).json({ success: true, message: "Tag Updated Successfully", data: updatedTag });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Delete a tag
router.delete('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    const { id } = req.params;

    try {
        const deletedTag = await blogTags.findByIdAndDelete(id);

        if (!deletedTag) {
            return res.status(404).json({ success: false, message: "Tag not found" });
        }

        res.status(200).json({ success: true, message: "Tag Deleted Successfully", data: deletedTag });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});



module.exports = router;