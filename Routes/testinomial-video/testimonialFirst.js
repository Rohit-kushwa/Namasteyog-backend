const express = require('express');
const router = express.Router();
const TestimonialFirst = require('../../Models/testinomial-video/testimonialFirst'); // Your Testimonial model
const { uploadTestimonial } = require('../../uploadFile'); // Image upload middleware
const multer = require('multer');
const authenticateToken = require('../../Middleware/authenticateToken');
const checkRole = require('../../Middleware/checkRole');


// Create a new testimonial with an image
router.post('/', authenticateToken, checkRole(['admin']), async (req, res) => {
    uploadTestimonial.single('image')(req, res, async function (err) {
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

        let newImg = '';
        if (req.file) {
            newImg = req.file.filename;
            console.log("Uploaded Image: ", newImg);
        }

        console.log("data: ", req.body);
        

        try {
            const testimonial = new TestimonialFirst({
                ...req.body,
                image: newImg // Save only the image URL (or filename)

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
            { Header: "PRIORITY", accessor: "priority" },  // Display the image path/URL
            { Header: "IMAGE", accessor: "image" },  // Display the image path/URL
            { Header: "STATUS", accessor: "status" },  // Display the status (true/false)
            { Header: "ACTION", accessor: "action-multi" },  // Define actions (e.g., edit, delete)
        ];
        
        // Fetch all testimonials that are not deleted, ordered by priority (ascending)
        const testimonials = await TestimonialFirst.find({ isdeleted: false }).sort({ priority: 1 });
        
        // Return testimonials along with the headers
        res.status(200).json({ success: true, data: testimonials, header: header });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});


// Get a specific testimonial by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const testimonial = await TestimonialFirst.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ success: false, message: 'Testimonial not found' });
        }
        res.status(200).json({ success: true, testimonial });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Update a testimonial by ID (image upload included)
router.put('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    uploadTestimonial.single('image')(req, res, async function (err) {
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

        let newImg = '';
        if (req.file) {
            newImg = req.file.filename;
            console.log("Updated Image: ", newImg);
        }

        console.log("status: ", req.body);
        

        try {
            const updates = {...req.body};
            if (req.file) {
                updates.image = newImg;
            }

            console.log("Updates: ", updates);

            const testimonial = await TestimonialFirst.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
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
        const testimonial = await TestimonialFirst.findByIdAndDelete(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ success: false, message: 'Testimonial not found' });
        }
        res.status(200).json({ success: true, message: 'Testimonial deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;
