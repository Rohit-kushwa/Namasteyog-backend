const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto'); // For generating OTP
const generateToken = require('../../Utils/jwtUtils');
const User = require('../../Models/auth/user');
const router = express.Router();
const transporter = require('../../Utils/mailer'); // Import the transporter

// Function to send OTP email
const sendOtpEmail = async (email, customerName, otp) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP for Registration',
            template: 'otpVerification', // Assuming you use handlebars templates
            context: {
                customerName,
                otp,
            },
        };

        await transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully.');
    } catch (error) {
        console.error('Error sending OTP email:', error);
    }
};

// Helper function to generate OTP
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// User Registration with OTP
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        const otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            otp,
            otpExpires,
        });

        await newUser.save();
        await sendOtpEmail(email, username, otp); // Await to ensure email is sent

        res.json({ success: true, message: 'User registered. OTP sent to email.' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // Clear OTP after successful verification
        user.emailVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
        console.error('OTP verification failed:', error);
        res.status(500).json({ success: false, message: 'OTP verification failed' });
    }
});

// User Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Check if email is verified
        if (!user.emailVerified) {
            return res.status(403).json({ success: false, message: 'Email not verified' });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Generate JWT token and include user ID
        const payload = { id: user._id, email: user.email, role: user.role };
        const token = generateToken(payload);

        res.json({ success: true, message: 'Login successful', token, data: user });
    } catch (error) {
        console.error('Login failed:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

module.exports = router;
