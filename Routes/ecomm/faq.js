const express = require('express');
const router = express.Router();
const FAQ = require('../../Models/ecomm/faq'); // Assuming your model is in models/faq.js
const asyncHandler = require('express-async-handler');
const authenticateToken = require('../../Middleware/authenticateToken');
const checkRole = require('../../Middleware/checkRole');

const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// Get all FAQs
router.get('/', asyncHandler(async (req, res) => {
    try {
        const faqs = await FAQ.find();
        const header = [
            { Header: "QUESTION NO", accessor: "questionNo" },
            { Header: "QUESTION", accessor: "question" },
            { Header: "ANSWER", accessor: "answer" },
            { Header: "ACTION", accessor: "action-multi" },
        ];

        res.status(200).json({ success: true, message: "FAQs retrieved successfully.", data: faqs, header });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));

// Get a specific FAQ by ID
router.get('/:id', checkRole(['admin']), asyncHandler(async (req, res) => {
    try {
        const faq = await FAQ.findById(req.params.id);
        if (!faq) {
            return res.status(404).json({ success: false, message: "FAQ not found." });
        }
        res.json({ success: true, message: "FAQ retrieved successfully.", data: faq });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));

// Create a new FAQ
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    const { questionNo, question, answer, points } = req.body;

    if (!questionNo || !question || !answer || !points) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    try {
        const newFAQ = new FAQ({
            questionNo,
            question,
            answer,
            points
        });
        await newFAQ.save();
        res.status(201).json({ success: true, message: "FAQ created successfully.", data: newFAQ });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));

// Update an FAQ by ID
router.put('/:id', authenticateToken, checkRole(['admin']), asyncHandler(async (req, res) => {
    const { questionNo, question, answer, points } = req.body;

    try {
        const updatedFAQ = await FAQ.findByIdAndUpdate(req.params.id, {
            questionNo,
            question,
            answer,
            points
        }, { new: true });

        if (!updatedFAQ) {
            return res.status(404).json({ success: false, message: "FAQ not found." });
        }

        res.json({ success: true, message: "FAQ updated successfully.", data: updatedFAQ });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));

// Delete an FAQ by ID
router.delete('/:id', authenticateToken, checkRole(['admin']), asyncHandler(async (req, res) => {
    try {
        const faq = await FAQ.findByIdAndDelete(req.params.id);
        if (!faq) {
            return res.status(404).json({ success: false, message: "FAQ not found." });
        }
        res.json({ success: true, message: "FAQ deleted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));

module.exports = router;
