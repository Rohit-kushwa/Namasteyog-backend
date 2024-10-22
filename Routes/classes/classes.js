// Routes/classRoutes.js
const express = require('express');
const router = express.Router();
const Class = require('../../Models/classes/classes'); // Adjust path based on your folder structure
const authenticateToken = require('../../Middleware/authenticateToken');
const checkRole = require('../../Middleware/checkRole');

// Create a new class
router.post('/', authenticateToken, checkRole(['admin']), async (req, res) => {
    const { title, description, instructor, date, time, duration, level, location, status = true } = req.body;

    try {
        const yogaClass = new Class({
            title,
            description,
            instructor,
            date,
            time,
            duration,
            level,
            location,
            status
        });

        await yogaClass.save();
        res.status(201).json({ success: true, message: 'Class created successfully', yogaClass });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Get all classes
router.get('/', authenticateToken, async (req, res) => {
    try {

        const header = [
            { Header: "Title", accessor: "title" },  // Title of the class
            // { Header: "Description", accessor: "description" },  // Short description of the class
            { Header: "Date", accessor: "date" },  // Class date
            { Header: "Time", accessor: "time" },  // Class time
            { Header: "Duration (mins)", accessor: "duration" },  // Duration in minutes
            { Header: "Level", accessor: "level" },  // Class level (Beginner, Intermediate, etc.)
            { Header: "Status", accessor: "status" },  // Class status (Active or Inactive)
            { Header: "Action", accessor: "action-multi" },  // Actions like Edit/Delete
        ];
        

        const classes = await Class.find({isdeleted: false}).populate('instructor'); // Populate instructor's name field
        res.status(200).json({ success: true, data: classes, header: header });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Get a specific class by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const yogaClass = await Class.findById(req.params.id).populate('instructor', 'name');
        if (!yogaClass) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }
        res.status(200).json({ success: true, yogaClass });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Update a class by ID
router.put('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    const { title, description, instructor, date, time, duration, level, location, status } = req.body;

    try {
        const updates = { title, description, instructor, date, time, duration, level, location, status };
        const yogaClass = await Class.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });

        if (!yogaClass) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }
        res.status(200).json({ success: true, message: 'Class updated successfully', yogaClass });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Delete a class by ID
router.delete('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const yogaClass = await Class.findByIdAndDelete(req.params.id);
        if (!yogaClass) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }
        res.status(200).json({ success: true, message: 'Class deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;
