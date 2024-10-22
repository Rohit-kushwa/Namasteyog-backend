const express = require('express');
const router = express.Router();
const HowItWorks = require('../../Models/dynamicData/howitworks');
const authenticateToken = require('../../Middleware/authenticateToken');
const checkRole = require('../../Middleware/checkRole');

// Create new "How It Works" data
router.post('/', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const { title, text, number } = req.body;
        const newHowItWorks = new HowItWorks({ title, text, number });
        await newHowItWorks.save();
        res.status(201).json({ success: true, message: 'How It Works data created successfully', data: newHowItWorks });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error creating How It Works data', error: error.message });
    }
});

// Get all "How It Works" data
router.get('/', async (req, res) => {
    try {
        const header = [
            { Header: "NO.", accessor: "number" },  // Accessing the 'buttonText' field from fetched data
            { Header: "TITLE", accessor: "title" },  // Accessing the 'buttonText' field from fetched data
            { Header: "ANSWER", accessor: "text" },  // Accessing the 'buttonText' field from fetched data
            { Header: "Action", accessor: "action-multi" }  // Define actions (e.g., edit, delete)
        ];
        
        const howItWorksList = await HowItWorks.find();
        res.status(200).json({ success: true, data: howItWorksList, header: header });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching How It Works data', error: error.message });
    }
});

// Get "How It Works" data by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const howItWorks = await HowItWorks.findById(req.params.id);
        if (!howItWorks) {
            return res.status(404).json({ success: false, message: 'How It Works data not found' });
        }
        res.status(200).json({ success: true, data: howItWorks });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching How It Works data', error: error.message });
    }
});

// Update "How It Works" data by ID
router.put('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const updatedHowItWorks = await HowItWorks.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedHowItWorks) {
            return res.status(404).json({ success: false, message: 'How It Works data not found' });
        }
        res.status(200).json({ success: true, message: 'How It Works data updated successfully', data: updatedHowItWorks });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error updating How It Works data', error: error.message });
    }
});

// Delete "How It Works" data by ID
router.delete('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const deletedHowItWorks = await HowItWorks.findByIdAndDelete(req.params.id);
        if (!deletedHowItWorks) {
            return res.status(404).json({ success: false, message: 'How It Works data not found' });
        }
        res.status(200).json({ success: true, message: 'How It Works data deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting How It Works data', error: error.message });
    }
});

module.exports = router;
