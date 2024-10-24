const express = require('express');
const router = express.Router();
const bgText = require('../../Models/ecomm/bg_text'); 
const { uploadEcomBGImage } = require('../../uploadFile'); // Multer setup for handling image upload 
const authenticateToken = require('../../Middleware/authenticateToken');
const checkRole = require('../../Middleware/checkRole');
const multer = require('multer');



// Create a new background text entry with image
router.post('/', authenticateToken, checkRole(['admin']), async (req, res) => {
    uploadEcomBGImage.single('bgImage')(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ success: false, message: 'File size is too large. Maximum file size is 5MB.' });
            }
            return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        const { text1, text2, buttonText } = req.body;

        let bgImage = '';
        if (req.file) {
            bgImage = req.file.filename; // Store the file path if uploaded
        }

        try {
            const newBgText = new bgText({
                text1,
                text2,
                buttonText,
                bgImage
            });

            await newBgText.save();
            res.status(201).json({ success: true, message: 'Background text created successfully', data: newBgText });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    });
});

// Get all background text entries
router.get('/', async (req, res) => {
    try {
        const bgTexts = await bgText.find();
        res.status(200).json({ success: true, data: bgTexts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update a background text entry by ID
router.put('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    uploadEcomBGImage.single('bgImage')(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ success: false, message: 'File size is too large. Maximum file size is 5MB.' });
            }
            return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        const { text1, text2, buttonText } = req.body;
        const updateData = { text1, text2, buttonText };

        if (req.file) {
            updateData.bgImage = req.file.path; // Update the file path if a new image is uploaded
        }

        try {
            const updatedBgText = await bgText.findByIdAndUpdate(req.params.id, updateData, { new: true });

            if (!updatedBgText) {
                return res.status(404).json({ success: false, message: 'Background text not found' });
            }

            res.status(200).json({ success: true, data: updatedBgText });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    });
});

// Delete a background text entry by ID
router.delete('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const deletedBgText = await bgText.findByIdAndDelete(req.params.id);

        if (!deletedBgText) {
            return res.status(404).json({ success: false, message: 'Background text not found' });
        }

        res.status(200).json({ success: true, message: 'Background text deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
