const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto'); // For generating OTP
const generateToken = require('../../Utils/jwtUtils');
const User = require('../../Models/auth/user');
const router = express.Router();
const transporter = require('../../Utils/mailer'); // Import your mailer transporter
// Middleware for protecting routes (authorization)
const authenticateToken = require('../../middleware/authenticateToken');

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
        // Check if the user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP
        const otp = generateOTP();
        const otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            otp,
            otpExpires,
        });

        // Save user and send OTP email
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

        // Check if OTP matches and has not expired
        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // Mark email as verified and clear OTP
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

        // Check if password matches
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Generate JWT token
        const payload = { id: user._id, email: user.email, role: user.role };
        const token = generateToken(payload);

        res.json({ success: true, message: 'Login successful', token, data: user });
    } catch (error) {
        console.error('Login failed:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// Update Profile
router.put('/update-profile', authenticateToken, async (req, res) => {
    const userId = req.user.id; // Assuming `authenticateToken` middleware adds user info to the request
    const { firstName, lastName, address, phone } = req.body;

    try {
        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update the user details
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.phone = phone || user.phone;

        // Update address if provided
        if (address) {
            user.address.street = address.street || user.address.street;
            user.address.city = address.city || user.address.city;
            user.address.state = address.state || user.address.state;
            user.address.zipCode = address.zipCode || user.address.zipCode;
            user.address.country = address.country || user.address.country;
        }

        // Save the updated user
        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Profile update failed' });
    }
});


// Update Packages, Payment History, and Classes
router.put('/update-user-info', authenticateToken, async (req, res) => {
    const userId = req.user.id; // Assuming `authenticateToken` middleware adds user info to the request
    const { purchasedPackages, paymentHistory, bookedClasses } = req.body;

    try {
        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update purchased packages if provided
        if (purchasedPackages) {
            purchasedPackages.forEach((pkg) => {
                user.purchasedPackages.push({
                    packageId: pkg.packageId,
                    purchaseDate: pkg.purchaseDate || Date.now(),
                    expiryDate: pkg.expiryDate,
                });
            });
        }

        // Update payment history if provided
        if (paymentHistory) {
            paymentHistory.forEach((payment) => {
                user.paymentHistory.push({
                    amount: payment.amount,
                    paymentMethod: payment.paymentMethod,
                    status: payment.status || 'pending',
                    paymentDate: payment.paymentDate || Date.now(),
                    orderId: payment.orderId,
                });
            });
        }

        // Update booked classes if provided
        if (bookedClasses) {
            bookedClasses.forEach((cls) => {
                user.bookedClasses.push({
                    classId: cls.classId,
                    bookingDate: cls.bookingDate || Date.now(),
                    status: cls.status || 'booked',
                });
            });
        }

        // Save the updated user
        await user.save();

        res.json({
            success: true,
            message: 'User information updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Error updating user information:', error);
        res.status(500).json({ success: false, message: 'Update failed' });
    }
});

router.get('/users', async (req, res) => {
    try {
        // const header = [
        //     { Header: "TITLE", accessor: "title" },
        //     { Header: "IMAGE", accessor: "image" },
        //     { Header: "CATEGORY", accessor: "category.name" },
        //     { Header: "TAGS", accessor: "tags[0].name" },
        //     { Header: "STATUS", accessor: "status" },
        //     { Header: "ACTIONS", accessor: "action-multi" },

        // ];

        const users = await User.find();
        res.status(200).json({ success: true, message: "User Retrieved Successful", data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


// Get a single post
router.get('/profile/:id', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, message: "User retrieved successful", data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
