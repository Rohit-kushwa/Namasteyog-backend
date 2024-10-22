const express = require('express');
const router = express.Router();
const VideoText = require('../../Models/testinomial-video/videoText');
const authenticateToken = require('../../Middleware/authenticateToken');
const checkRole = require('../../Middleware/checkRole');

// Get all video texts
router.get('/', async (req, res) => {
    try {

        const header = [
            { Header: "HEADING", accessor: "heading" },
            { Header: "TITLE", accessor: "title" },
            { Header: "DESCRIPTION", accessor: "description" },
            { Header: "PRICE", accessor: "price" },
            { Header: "STATUS", accessor: "status" },         // You can add this if you have a status field
            { Header: "ACTION", accessor: "action-multi" }          // For edit/delete actions
        ];



        const videoTexts = await VideoText.find();
        res.status(200).json({
            success: true,
            data: videoTexts,
            header: header
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching video texts",
            error: error.message
        });
    }
});

// Get a specific video text by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const videoText = await VideoText.findById(req.params.id);
        if (!videoText) {
            return res.status(404).json({
                success: false,
                message: "Video text not found"
            });
        }
        res.status(200).json({
            success: true,
            data: videoText
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching video text",
            error: error.message
        });
    }
});

// Create a new video text
router.post('/', authenticateToken, checkRole(['admin']), async (req, res) => {
    const { heading, title, description, price, createdBy } = req.body;
    try {
        const videoText = new VideoText({
            heading,
            title,
            description,
            price,
            createdBy: req.user.id,
            updatedBy: req.user.id
        });
        await videoText.save();
        res.status(201).json({
            success: true,
            message: "Video text created successfully",
            data: videoText
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating video text",
            error: error.message
        });
    }
});

// Update an existing video text
router.put('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    const { heading, title, description, price, status } = req.body;
    try {
        const videoText = await VideoText.findByIdAndUpdate(
            req.params.id,
            {
                heading, title, description, price, status,
                updatedBy: req.user.id
            },
            { new: true }
        );
        if (!videoText) {
            return res.status(404).json({
                success: false,
                message: "Video text not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Video text updated successfully",
            data: videoText
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating video text",
            error: error.message
        });
    }
});


// Delete a video text
router.delete('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const videoText = await VideoText.findByIdAndDelete(req.params.id);
        if (!videoText) {
            return res.status(404).json({
                success: false,
                message: "Video text not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Video text deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting video text",
            error: error.message
        });
    }
});

module.exports = router;

