const express = require('express');
const router = express.Router();
const PrivacyPolicy = require('../Models/privacyPolicy');

// Create new Terms and Conditions
router.post('/', async (req, res) => {
    try {
        const newTerm = new PrivacyPolicy({
            content: req.body.content
        });
        const savedTerm = await newTerm.save();
        res.status(201).json({ success: true, data: savedTerm });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Get all Terms and Conditions
router.get('/', async (req, res) => {
    try {
        const terms = await PrivacyPolicy.find();
        res.status(200).json({ success: true, data: terms });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get Terms and Conditions by ID
router.get('/:id', async (req, res) => {
    try {
        const term = await PrivacyPolicy.findById(req.params.id);
        if (!term) return res.status(404).json({ success: false, message: 'Term not found' });
        res.status(200).json({ success: true, data: term });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update Terms and Conditions by ID
router.put('/:id', async (req, res) => {
    try {
        const updatedTerm = await PrivacyPolicy.findByIdAndUpdate(
            req.params.id,
            { content: req.body.content },
            { new: true }
        );
        if (!updatedTerm) return res.status(404).json({ success: false, message: 'Term not found' });
        res.status(200).json({ success: true, data: updatedTerm });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Delete Terms and Conditions by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedTerm = await PrivacyPolicy.findByIdAndDelete(req.params.id);
        if (!deletedTerm) return res.status(404).json({ success: false, message: 'Term not found' });
        res.status(200).json({ success: true, message: 'Term deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
