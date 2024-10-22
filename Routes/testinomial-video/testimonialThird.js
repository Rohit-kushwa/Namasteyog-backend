const express = require('express');
const router = express.Router();
const TestimonialThird = require('../../Models/testinomial-video/testimonialThird');
const authenticateToken = require('../../Middleware/authenticateToken');
const checkRole = require('../../Middleware/checkRole');

// Create a new testimonial with title, description, name, location, and status (default: true)
router.post('/', authenticateToken, checkRole(['admin']), async (req, res) => {
    const { title, description, name, location, status = true } = req.body;

    try {
        const testimonial = new TestimonialThird({
            ...req.body,
            title,
            description,
            name,
            location,
            status
        });

        console.log("req data: ", req.body);

        await testimonial.save();
        res.status(201).json({ success: true, message: 'Testimonial created successfully', testimonial });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Get all testimonials
router.get('/', async (req, res) => {
    try {
        const header = [
            { Header: "PRIORITY", accessor: "priority" },
            { Header: "TITLE", accessor: "title" },
            { Header: "DESCRIPTION", accessor: "description" },
            { Header: "NAME", accessor: "name" },
            { Header: "LOCATION", accessor: "location" },
            { Header: "STATUS", accessor: "status" },  // Include status in the header
            { Header: "ACTION", accessor: "action-multi" },  // Include status in the header
            
        ];

        const testimonials = await TestimonialThird.find({isDeleted: false}).sort({ priority: 1 });
        res.status(200).json({ success: true, data: testimonials, header: header });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Get a specific testimonial by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const testimonial = await TestimonialThird.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ success: false, message: 'Testimonial not found' });
        }
        res.status(200).json({ success: true, testimonial });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Update a testimonial by ID
router.put('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    const { title, description, name, location, status } = req.body;

    try {
        const updates = {...req.body, title, description, name, location, status };
        const testimonial = await TestimonialThird.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });

        if (!testimonial) {
            return res.status(404).json({ success: false, message: 'Testimonial not found' });
        }
        res.status(200).json({ success: true, message: 'Testimonial updated successfully', testimonial });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Delete a testimonial by ID
router.delete('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const testimonial = await TestimonialThird.findByIdAndDelete(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ success: false, message: 'Testimonial not found' });
        }
        res.status(200).json({ success: true, message: 'Testimonial deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;
