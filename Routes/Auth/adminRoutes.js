const express = require('express');
const bcrypt = require('bcrypt');
const generateToken = require('../../Utils/jwtUtils');
const Admin = require('../../Models/auth/admin');
const authenticateToken = require('../../Middleware/authenticateToken');

const router = express.Router();

// Admin Registration
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const adminExists = await Admin.findOne({ email });
        if (adminExists) {
            return res.status(400).json({ success: false, message: 'Admin already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new Admin({ email, password: hashedPassword });

        await newAdmin.save();
        res.json({ success: true, message: 'Admin registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
});

// Admin Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(402).json({ success: false, message: 'Invalid email or password' });
        }

        const isPasswordMatch = await bcrypt.compare(password, admin.password);
        if (!isPasswordMatch) {
            return res.status(402).json({ success: false, message: 'Invalid email or password' });
        }

        // Add admin id to the payload
        const payload = { id: admin._id, email: admin.email, role: admin.role };
        const token = generateToken(payload);

        res.json({ success: true, message: 'Login successful', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});


// Admin Dashboard Example
router.get('/dashboard', authenticateToken, (req, res) => {
    res.json({ success: true, message: 'Welcome to the Admin Dashboard' });
});

module.exports = router;
