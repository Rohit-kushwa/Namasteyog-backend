const express = require('express');
const Feature = require('../../../Models/dynamicData/ComparisonTable/CT_Features');
const router = express.Router();

// Add a new feature with dynamic fields
router.post('/features', async (req, res) => {
    const { name, attributes } = req.body;
    try {
        const newFeature = new Feature({ name, attributes });
        await newFeature.save();
        res.status(201).json({ message: 'Feature added successfully', feature: newFeature });
    } catch (error) {
        res.status(500).json({ message: 'Error adding feature', error });
    }
});

// Get all features
router.get('/features', async (req, res) => {
    try {
        const features = await Feature.find();
        res.json(features);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching features', error });
    }
});

// Update a feature dynamically
router.put('/features/:id', async (req, res) => {
    const { id } = req.params;
    const { name, attributes } = req.body;
    try {
        const updatedFeature = await Feature.findByIdAndUpdate(id, { name, attributes }, { new: true });
        res.json({ message: 'Feature updated successfully', feature: updatedFeature });
    } catch (error) {
        res.status(500).json({ message: 'Error updating feature', error });
    }
});

module.exports = router;
