// routes/faq.js
const express = require('express');
const router = express.Router();
const FAQ = require('../Models/yogFaqs');

// Create a new FAQ with multiple questions
router.post('/', async (req, res) => {
    const { section, questions } = req.body;

    // Validate section and questions
    if (!section || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ message: 'Section and questions are required.' });
    }

    // Create a new FAQ
    const newFAQ = new FAQ({
        section,
        questions
    });

    try {
        const savedFAQ = await newFAQ.save();
        res.status(201).json({ success: true, message: 'FAQ created successfully.', data: savedFAQ });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Add questions to an existing FAQ section
router.patch('/:id/questions', async (req, res) => {
    const { questions } = req.body;

    // Validate questions input
    if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ message: 'Questions are required.' });
    }

    try {
        const updatedFAQ = await FAQ.findByIdAndUpdate(
            req.params.id,
            { $push: { questions: { $each: questions } } },
            { new: true }
        );

        if (!updatedFAQ) return res.status(404).json({ message: 'FAQ not found' });

        res.json({ success: true, message: 'Questions added successfully.', data: updatedFAQ });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a specific question from a section
router.patch('/:id/questions/delete', async (req, res) => {
    const { question } = req.body;

    // Validate input
    if (!question) {
        return res.status(400).json({ message: 'Question text is required.' });
    }

    try {
        const updatedFAQ = await FAQ.findByIdAndUpdate(
            req.params.id,
            { $pull: { questions: { question: question } } },  // Pull by matching the question text
            { new: true }
        );

        if (!updatedFAQ) return res.status(404).json({ message: 'FAQ not found' });

        res.json({ success: true, message: 'Question deleted successfully.', data: updatedFAQ });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});




// Read all FAQs
router.get('/', async (req, res) => {
    try {
        const faqs = await FAQ.find();
        const header = [
            { Header: "SECTION", accessor: "section" },
            { Header: "QUESTIONS", accessor: "questions.length" },
            // { Header: "ANSWER", accessor: "answer" },
            { Header: "ACTION", accessor: "action-multi" },
        ];
        res.json({ success: true, message: 'FAQ retrieved successfully.', data: faqs, header: header });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Read a specific FAQ by ID
router.get('/:id', async (req, res) => {
    try {
        const faq = await FAQ.findById(req.params.id);
        if (!faq) return res.status(404).json({ message: 'FAQ not found' });
        res.json({ success: true, message: 'FAQ retrieved successfully.', data: faq });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a specific FAQ by ID
router.put('/:id', async (req, res) => {
    try {
        const updatedFAQ = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedFAQ) return res.status(404).json({ message: 'FAQ not found' });
        res.json({ success: true, message: 'FAQ updated successfully.', data: updatedFAQ });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a specific FAQ by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedFAQ = await FAQ.findByIdAndDelete(req.params.id);
        if (!deletedFAQ) return res.status(404).json({ message: 'FAQ not found' });
        res.json({ message: 'FAQ deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
