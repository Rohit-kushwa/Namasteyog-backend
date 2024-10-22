const express = require('express');
const router = express.Router();

// In-memory storage for headers and features
let headers = [];
let features = [];

// Create dynamic headers
router.post('/headers', (req, res) => {
    const newHeaders = req.body.headers;
    if (!newHeaders || !Array.isArray(newHeaders)) {
        return res.status(400).json({ message: "Invalid headers format" });
    }

    headers = newHeaders;
    return res.status(201).json({ message: "Headers created successfully", headers });
});

// Get all headers
router.get('/headers', (req, res) => {
    return res.status(200).json({ message: "Headers retrieved successfully", headers });
});

// Update (edit) a header by index
router.put('/headers/:index', (req, res) => {
    const index = parseInt(req.params.index, 10);
    const updatedHeader = req.body.header;

    if (isNaN(index) || index < 0 || index >= headers.length) {
        return res.status(400).json({ message: "Invalid header index" });
    }

    if (!updatedHeader || typeof updatedHeader !== 'object') {
        return res.status(400).json({ message: "Invalid header format" });
    }

    headers[index] = updatedHeader;
    return res.status(200).json({ message: "Header updated successfully", headers });
});

// Delete a header and its corresponding feature
router.delete('/headers/:index', (req, res) => {
    const index = parseInt(req.params.index, 10);

    if (isNaN(index) || index < 0 || index >= headers.length) {
        return res.status(400).json({ message: "Invalid header index" });
    }

    headers.splice(index, 1); // Remove the header at the specified index

    // Remove the corresponding features for that header
    features.forEach(feature => {
        if (feature[headers[index].accessor]) {
            delete feature[headers[index].accessor];
        }
    });

    return res.status(200).json({ message: "Header and corresponding features deleted successfully", headers, features });
});

// Create dynamic features
router.post('/features', (req, res) => {
    const newFeatures = req.body.features;
    if (!newFeatures || !Array.isArray(newFeatures)) {
        return res.status(400).json({ message: "Invalid features format" });
    }

    features = newFeatures;
    return res.status(201).json({ message: "Features created successfully", features });
});

// Get all features
router.get('/features', (req, res) => {
    return res.status(200).json({ message: "Features retrieved successfully", features });
});

// Update (edit) a feature by name
router.put('/features/:name', (req, res) => {
    const name = req.params.name;
    const updatedFeature = req.body.feature;

    const featureIndex = features.findIndex(f => f.name === name);

    if (featureIndex === -1) {
        return res.status(404).json({ message: "Feature not found" });
    }

    if (!updatedFeature || typeof updatedFeature !== 'object') {
        return res.status(400).json({ message: "Invalid feature format" });
    }

    features[featureIndex] = { ...features[featureIndex], ...updatedFeature };
    return res.status(200).json({ message: "Feature updated successfully", features });
});

// Delete a feature by name
router.delete('/features/:name', (req, res) => {
    const name = req.params.name;

    const featureIndex = features.findIndex(f => f.name === name);

    if (featureIndex === -1) {
        return res.status(404).json({ message: "Feature not found" });
    }

    features.splice(featureIndex, 1); // Remove the feature

    return res.status(200).json({ message: "Feature deleted successfully", features });
});

// Get both headers and features in a single response
router.get('/headers-features', (req, res) => {
    return res.status(200).json({
        message: "Headers and Features retrieved successfully",
        headers,
        features
    });
});

module.exports = router;
