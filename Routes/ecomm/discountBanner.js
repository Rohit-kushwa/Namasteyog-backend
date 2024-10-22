const express = require('express');
const router = express.Router();
const DiscountBanner = require('../../Models/ecomm/dicountBanner');
const { uploadDiscountBannerImage } = require('../../uploadFile'); // Assuming you have this upload function
const multer = require('multer');
const asyncHandler = require('express-async-handler');
const authenticateToken = require('../../Middleware/authenticateToken');
const checkRole = require('../../Middleware/checkRole');

const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// Get all discount banners
router.get('/', asyncHandler(async (req, res) => {
    try {
        const banners = await DiscountBanner.find();
        const header = [
            { Header: "IMAGE", accessor: "image" },
            { Header: "OFFER", accessor: "offer" },
            { Header: "TEXT", accessor: "text" },
            { Header: "BUTTON TEXT", accessor: "buttonText" },
            { Header: "START DATE", accessor: "startDate" },
            { Header: "END DATE", accessor: "endDate" },
            { Header: "STATUS", accessor: "status" },
            { Header: "ACTION", accessor: "action-multi" },
        ];

        res.status(200).json({ success: true, message: "Banners retrieved successfully.", data: banners, header: header });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));

// Get a discount banner by ID
router.get('/:id', asyncHandler(async (req, res) => {
    try {
        const bannerID = req.params.id;
        const banner = await DiscountBanner.findById(bannerID);
        if (!banner) {
            return res.status(404).json({ success: false, message: "Banner not found." });
        }
        res.json({ success: true, message: "Banner retrieved successfully.", data: banner });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));

// Create a new discount banner with image upload
router.post('/', authenticateToken, checkRole(['admin']), asyncHandler(async (req, res) => {
    uploadDiscountBannerImage.single('image')(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ success: false, message: 'File size is too large. Maximum file size is 5MB.' });
            }
            return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        const { text, offer, buttonText, startDate, endDate, status } = req.body;


        let newImage = '';
        if (req.file) {
            newImage = req.file.filename;
        }

        try {
            const newBanner = new DiscountBanner({
                image: newImage,
                offer: offer,
                text: text,
                buttonText: buttonText,
                startDate: startDate || Date.now(),
                endDate: endDate,
                status: status !== undefined ? status : true
            });
            await newBanner.save();
            res.status(201).json({ success: true, message: 'Banner created successfully.', data: newBanner });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });
}));

// Update a discount banner
router.put('/:id', authenticateToken, checkRole(['admin']), asyncHandler(async (req, res) => {
    const bannerID = req.params.id;

    uploadDiscountBannerImage.single('image')(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ success: false, message: 'File size is too large. Maximum file size is 5MB.' });
            }
            return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        const { text, offer, buttonText, startDate, endDate, status } = req.body;
        let updateData = { text, offer, buttonText, startDate, endDate, status };

        if (req.file) {
            updateData.image = req.file.filename;
        }

        try {
            const updatedBanner = await DiscountBanner.findByIdAndUpdate(bannerID, updateData, { new: true });
            if (!updatedBanner) {
                return res.status(404).json({ success: false, message: "Banner not found." });
            }
            res.json({ success: true, message: "Banner updated successfully.", data: updatedBanner });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });
}));

// Delete a discount banner
router.delete('/:id', authenticateToken, checkRole(['admin']), asyncHandler(async (req, res) => {
    const bannerID = req.params.id;

    try {
        const banner = await DiscountBanner.findByIdAndDelete(bannerID);
        if (!banner) {
            return res.status(404).json({ success: false, message: "Banner not found." });
        }
        res.json({ success: true, message: "Banner deleted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));

module.exports = router;
