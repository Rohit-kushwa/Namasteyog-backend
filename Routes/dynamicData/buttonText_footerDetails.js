const express = require('express');
const router = express.Router();
const buttomTextFooterDetails = require('../../Models/dynamicData/buttonText_footerDetails');
const authenticateToken = require('../../Middleware/authenticateToken');
const checkRole = require('../../Middleware/checkRole');

// Create new form data
router.post('/', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const { buttonText, footerDetails } = req.body;
        const newFormData = new buttomTextFooterDetails({ buttonText, footerDetails });
        await newFormData.save();
        res.status(201).json({ success: true, message: 'Form data created successfully', data: newFormData });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error creating form data', error: error.message });
    }
});

// Get all form data
router.get('/', async (req, res) => {
    try {

        const header = [
            { Header: "BUTTON TEXT", accessor: "buttonText" },  // Accessing the 'buttonText' field from fetched data
            { Header: "EMAIL", accessor: "footerDetails.email" },  // Accessing the 'buttonText' field from fetched data
            { Header: "CONTACT", accessor: "footerDetails.contact" },  // Accessing the 'buttonText' field from fetched data
            { Header: "LOCATION", accessor: "footerDetails.address" },  // Accessing the 'buttonText' field from fetched data
            { Header: "Action", accessor: "action-multi" }  // Define actions (e.g., edit, delete)
        ];

        const formDataList = await buttomTextFooterDetails.find();
        res.status(200).json({ success: true, data: formDataList, header: header });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching form data', error: error.message });
    }
});

// Get form data by ID
router.get('/:id', async (req, res) => {
    try {
        const formData = await buttomTextFooterDetails.findById(req.params.id);
        if (!formData) {
            return res.status(404).json({ success: false, message: 'Form data not found' });
        }
        res.status(200).json({ success: true, data: formData });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching form data', error: error.message });
    }
});

// Update form data by ID
router.put('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const updatedFormData = await buttomTextFooterDetails.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedFormData) {
            return res.status(404).json({ success: false, message: 'Form data not found' });
        }
        res.status(200).json({ success: true, message: 'Form data updated successfully', data: updatedFormData });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error updating form data', error: error.message });
    }
});

// Delete form data by ID
router.delete('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const deletedFormData = await buttomTextFooterDetails.findByIdAndDelete(req.params.id);
        if (!deletedFormData) {
            return res.status(404).json({ success: false, message: 'Form data not found' });
        }
        res.status(200).json({ success: true, message: 'Form data deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting form data', error: error.message });
    }
});

module.exports = router;
