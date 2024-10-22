const express = require('express');
const router = express.Router();
const Instructor = require('../../Models/instructor/instructor');
const { uploadInstructor } = require('../../uploadFile');
const multer = require('multer');
const authenticateToken = require('../../Middleware/authenticateToken');
const checkRole = require('../../Middleware/checkRole');



// Create a new instructor
router.post('/', authenticateToken, checkRole(['admin']), async (req, res) => {
    uploadInstructor.single('profileImage')(req, res, async function (err) {
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

        // Get all fields from the request body
        const { name, bio, experienceYears, certifications, specialization, level, contactInfo, socialMediaLinks, availability } = req.body;

        let newImg = '';
        if (req.file) {
            newImg = req.file.filename;
            console.log("Image: ", newImg);
        }

        console.log(req.body); // Log the entire request body for debugging

        try {
            // Parse JSON fields
            const parsedContactInfo = JSON.parse(contactInfo);
            const parsedSocialMediaLinks = JSON.parse(socialMediaLinks);
            const parsedCertifications = JSON.parse(certifications);
            const parsedAvailability = JSON.parse(availability);

            const existingInstructor = await Instructor.findOne({ name });
            if (existingInstructor) {
                return res.status(400).json({ success: false, message: 'Instructor with this name already exists.' });
            }

            // Create the new instructor
            const instructor = new Instructor({
                name,
                bio,
                experienceYears,
                certifications: parsedCertifications, // Set certifications
                specialization,
                level,
                profileImage: newImg, // Set the image
                contactInfo: parsedContactInfo, // Set contact info
                socialMediaLinks: parsedSocialMediaLinks, // Set social media links
                availability: parsedAvailability // Set availability
            });

            await instructor.save();
            res.status(201).json({ success: true, message: 'Instructor created successfully', instructor });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    });
});


// Get all instructors
router.get('/', async (req, res) => {
    try {
        const header = [
            { Header: "PROFILE", accessor: "image-round" },
            { Header: "NAME", accessor: "name" },
            { Header: "EXPERIENCE", accessor: "experienceYears" },
            { Header: "LEVEL", accessor: "level" },
            { Header: "SPECIALIZATION", accessor: "specialization" },
            { Header: "STATUS", accessor: "status-2" },
            { Header: "ACTIONS", accessor: "action-multi" },

        ];


        const instructors = await Instructor.find({ isDeleted: false });
        res.status(200).json({ success: true, data: instructors, header: header });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Get a specific instructor by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const instructor = await Instructor.findById(req.params.id);
        if (!instructor) {
            return res.status(404).json({ success: false, message: 'Instructor not found' });
        }
        res.status(200).json({ success: true, instructor });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});


// Update an instructor by ID
router.put('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    uploadInstructor.single('profileImage')(req, res, async function (err) {
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
            console.log("Image: ", newImg);
        }

        try {
            const updates = { ...req.body };

            // Parse JSON fields if they are sent as strings
            if (updates.contactInfo) {
                updates.contactInfo = JSON.parse(updates.contactInfo);
            }
            if (updates.socialMediaLinks) {
                updates.socialMediaLinks = JSON.parse(updates.socialMediaLinks);
            }
            if (updates.certifications) {
                updates.certifications = JSON.parse(updates.certifications);
            }
            if (updates.availability) {
                updates.availability = JSON.parse(updates.availability);
            }

            // If a new profile image is uploaded, update the profileImage field
            if (req.file) {
                updates.profileImage = newImg;
            }

            const instructor = await Instructor.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
            if (!instructor) {
                return res.status(404).json({ success: false, message: 'Instructor not found' });
            }

            res.status(200).json({ success: true, message: 'Instructor updated successfully', instructor });

        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    });
});


// Delete an instructor by ID
router.delete('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const instructor = await Instructor.findByIdAndDelete(req.params.id);
        if (!instructor) {
            return res.status(404).json({ success: false, message: 'Instructor not found' });
        }
        res.status(200).json({ success: true, message: 'Instructor deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;
