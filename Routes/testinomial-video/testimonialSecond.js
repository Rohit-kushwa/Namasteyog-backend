const express = require('express');
const router = express.Router();
const TestimonialSecond = require('../../Models/testinomial-video/testimonialSecond'); // TestimonialSecond Model
const { uploadTestimonialSecond } = require('../../uploadFile'); // Multer setup for handling image upload
const multer = require('multer');
const authenticateToken = require('../../Middleware/authenticateToken');
const checkRole = require('../../Middleware/checkRole');


// Create a new testimonial with image, description, name, and status (default: true)
router.post('/', authenticateToken, checkRole(['admin']), async (req, res) => {
    uploadTestimonialSecond.single('image')(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ success: false, message: 'File size is too large. Maximum file size is 5MB.' });
            }
            return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        const { description, name, status = true } = req.body;

        let newImg = '';
        if (req.file) {
            newImg = req.file.filename;
        }

        try {
            const testimonial = new TestimonialSecond({
                ...req.body,
                image: newImg,
                description,
                name,
                status  // Set status from request, default is true if not provided
            });

            await testimonial.save();
            res.status(201).json({ success: true, message: 'Testimonial created successfully', testimonial });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    });
});

// Get all testimonials
router.get('/', async (req, res) => {
    try {
        const header = [
            { Header: "PRIORITY", accessor: "priority" },
            { Header: "IMAGE", accessor: "image" },
            { Header: "NAME", accessor: "name" },
            { Header: "DESCRIPTION", accessor: "description" },
            { Header: "STATUS", accessor: "status" },  // Include status in the header
            { Header: "ACTION", accessor: "action-multi" },  // Include status in the header
        ];

        const testimonials = await TestimonialSecond.find({isdeleted: false}).sort({ priority: 1 });

        res.status(200).json({ success: true, data: testimonials, header: header });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Get a specific testimonial by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const testimonial = await TestimonialSecond.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ success: false, message: 'Testimonial not found' });
        }
        res.status(200).json({ success: true, testimonial });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Update a testimonial by ID (with status, image, description, and name)
router.put('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    uploadTestimonialSecond.single('image')(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ success: false, message: 'File size is too large. Maximum file size is 5MB.' });
            }
            return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        const { description, name, status } = req.body;
        let newImg = '';

        if (req.file) {
            newImg = req.file.filename;
        }

        try {
            const updates = {...req.body, description, name, status };
            if (req.file) {
                updates.image = newImg;
            }

            const testimonial = await TestimonialSecond.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
            if (!testimonial) {
                return res.status(404).json({ success: false, message: 'Testimonial not found' });
            }
            res.status(200).json({ success: true, message: 'Testimonial updated successfully', testimonial });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    });
});

// Delete a testimonial by ID
router.delete('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const testimonial = await TestimonialSecond.findByIdAndDelete(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ success: false, message: 'Testimonial not found' });
        }
        res.status(200).json({ success: true, message: 'Testimonial deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;
