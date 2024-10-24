// routes/subscriptionRoutes.js
const express = require('express');
const router = express.Router();
const Package = require('../Models/package');
const authenticateToken = require('../Middleware/authenticateToken');
const checkRole = require('../Middleware/checkRole');

// Create a new package
router.post('/', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const newPackage = new Package({
      ...req.body,
      createdBy: req.user.id, // Update to req.user.id
      updatedBy: req.user.id  // Update to req.user.id
    });
    const savedPackage = await newPackage.save();
    res.status(201).json({ status: 'Package Created successfully', data: savedPackage });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all packages
router.get('/', async (req, res) => {
  try {
    const packages = await Package.find();
    res.status(200).json({ success: 'Retrieved Data Successful', data: packages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single package
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const getPackage = await Package.findById(req.params.id);
    if (getPackage) {
      res.status(200).json({ status: 'Retrieved Data Successful', data: getPackage });
    } else {
      res.status(404).json({ message: 'Package not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a package
router.put('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user.id },
      { new: true }
    );
    if (updatedPackage) {
      res.status(200).json({ success: 'Package Updated successful', data: updatedPackage });
    } else {
      res.status(404).json({ message: 'Package not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a Package
router.delete('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const deletedPackage = await Package.findByIdAndDelete(req.params.id);
    if (deletedPackage) {
      res.status(200).json({ message: 'Package Deleted successful', data: null });
    } else {
      res.status(404).json({ message: 'Package not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
