const express = require('express');
const router = express.Router();
const Class = require('../../Models/classes/classes'); // Import the Class model
const UpcomingClass = require('../../Models/classes/upcomingClasses'); // Import the UpcomingClass model
const authenticateToken = require('../../Middleware/authenticateToken');
const checkRole = require('../../Middleware/checkRole');

// Add an upcoming class
router.post('/', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const { classId, priority } = req.body;

        // Check if the referenced class exists
        const existingClass = await Class.findById(classId);
        if (!existingClass) {
            return res.status(404).json({ message: 'Class not found.' });
        }

        // Create a new upcoming class entry
        const newUpcomingClass = new UpcomingClass({
            ...req.body,
            classId,
            priority
        });

        await newUpcomingClass.save();
        res.status(201).json({
            success: true,
            message: 'Upcoming class added successfully!',
            upcomingClass: newUpcomingClass
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Get all upcoming classes
router.get('/', async (req, res) => {
    try {
        // Define the header structure for the response
        const header = [
            { Header: "PRIORITY", accessor: "priority" },  // Priority of the upcoming class
            { Header: "CLASSES", accessor: "classId.title" },  // Title of the class
            { Header: "INSTRUCTOR", accessor: "classId.instructor.name" },  // Instructor's name
            { Header: "INSTRUCTOR PROFILE", accessor: "classId.instructor.profileImage" },  // Instructor's Image
            { Header: "STATUS", accessor: "status" },  // Instructor's Image
            { Header: "ACTION", accessor: "action-multi" },  // Placeholder for actions (e.g., edit, delete)
        ];

        // Retrieve upcoming classes with populated class details
        const upcomingClasses = await UpcomingClass.find()
            .populate({
                path: 'classId',
                select: 'title description instructor date time duration level location status', // Select relevant fields
                populate: {
                    path: 'instructor', // Populate instructor details if necessary
                    select: 'name profileImage' // Select the instructor's name

                }
            }).sort({ priority: 1 });

        // Structure the response data
        const data = upcomingClasses.map(upcomingClass => ({
            _id: upcomingClass._id,
            status: upcomingClass.status,
            priority: upcomingClass.priority,
            classId: upcomingClass.classId, // This will include populated class details
        }));

        res.status(200).json({
            success: true,
            message: 'Upcoming classes retrieved successfully',
            data: data,
            header: header
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


// Get an upcoming class by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const upcomingClass = await UpcomingClass.findById(req.params.id)
            .populate('classId', 'title description date time duration level location');

        if (!upcomingClass) {
            return res.status(404).json({ message: 'Upcoming class not found.' });
        }

        res.status(200).json({
            success: true,
            message: 'Upcoming class retrieved successfully',
            upcomingClass
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Update an upcoming class
router.put('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const { classId, priority } = req.body;

        const updatedUpcomingClass = await UpcomingClass.findByIdAndUpdate(
            req.params.id,
            { ...req.body, classId, priority },
            { new: true, runValidators: true } // Return the updated document and validate
        ).populate('classId', 'title description date time duration level location');

        if (!updatedUpcomingClass) {
            return res.status(404).json({ message: 'Upcoming class not found.' });
        }

        console.log("response: ", req.body );
        

        res.status(200).json({
            success: true,
            message: 'Upcoming class updated successfully',
            upcomingClass: updatedUpcomingClass
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Delete an upcoming class
router.delete('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const deletedUpcomingClass = await UpcomingClass.findByIdAndDelete(req.params.id);

        if (!deletedUpcomingClass) {
            return res.status(404).json({ message: 'Upcoming class not found.' });
        }

        res.status(200).json({ message: 'Upcoming class deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;
