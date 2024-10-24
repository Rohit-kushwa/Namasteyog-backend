const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
const asyncHandler = require('express-async-handler');
dotenv.config();


// Middlewares
app.use(cors({
    origin: '*',      // Allow specific HTTP methods
    // allowedHeaders: 'Content-Type,Authorization' ,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
}));// Allow specific headers }));


app.use(bodyParser.json());

// DB Connection
const URL = process.env.MONGO_URL;
mongoose.connect(URL)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));


// Setting static folder path
app.use('/image/user', express.static('Public/userImages'));
app.use('/image/category', express.static('Public/category'))
app.use('/image/product', express.static('Public/product'))
app.use('/image/ckEditor', express.static('Public/ckEditor'))
app.use('/image/blog', express.static('Public/blog'))
app.use('/image/instructor', express.static('Public/instructor'))
app.use('/video/videos', express.static('Public/video'))
app.use('/image/testimonialFirst', express.static('Public/testimonialFirst'))
app.use('/image/testimonialSecond', express.static('Public/testimonialSecond'))
app.use('/image/discountBannerImage', express.static('Public/discountBannerImage'))
app.use('/image/ecomBGImage', express.static('Public/ecomBGImage'))


// Routes
app.use('/user', require('./Routes/Auth/userRoutes'));
app.use('/admin', require('./Routes/Auth/adminRoutes'));
app.use('/ecomm/category', require('./Routes/ecomm/category'));
app.use('/ecomm/product', require('./Routes/ecomm/product'));
app.use('/package', require('./Routes/package'));
app.use('/userSubscription', require('./Routes/user_subscription'));
app.use('/ecomm/order', require('./Routes/ecomm/order'));
app.use('/blog', require('./Routes/blog/blog'));
app.use('/blogCategory', require('./Routes/blog/blogCategory'));
app.use('/blogTags', require('./Routes/blog/blogTags'));
app.use('/instructor', require('./Routes/instructor/instructor'));
app.use('/video', require('./Routes/testinomial-video/video'));
app.use('/testimonialFirst', require('./Routes/testinomial-video/testimonialFirst'));
app.use('/testimonialSecond', require('./Routes/testinomial-video/testimonialSecond'));
app.use('/testimonialThird', require('./Routes/testinomial-video/testimonialThird'));
app.use('/classes', require('./Routes/classes/classes'));
app.use('/videoText', require('./Routes/testinomial-video/videoText'));
app.use('/upcomingClasses', require('./Routes/classes/upcomingClasses'));
app.use('/buttonTextFooter', require('./Routes/dynamicData/buttonText_footerDetails'));
app.use('/howItWorks', require('./Routes/dynamicData/howitworks'));
// app.use('/comparisonTable', require('./Routes/dynamicData/comparisonTable'));
app.use('/discountBanner', require('./Routes/ecomm/discountBanner'));
app.use('/faq', require('./Routes/ecomm/faq'));
app.use('/ecomm/cart', require('./Routes/ecomm/cart'));
app.use('/yogFaq', require('./Routes/yogFaqs'));
app.use('/termsAndCondition', require('./Routes/termsAndCondition'));
app.use('/privacyPolicy', require('./Routes/privacyPolicy'));
app.use('/comparisonTable', require('./Routes/dynamicData/ComparisonTable/CT'));
app.use('/appointments', require('./Routes/appointment'));
app.use('/ecomm/bg-text', require('./Routes/ecomm/bg_text'));



// Example route using asyncHandler
app.get('/', asyncHandler(async (req, res) => {
    res.json({ success: true, message: 'API working successfully', data: null });
}));

// Global error handler
app.use((error, req, res, next) => {
    res.status(500).json({ success: false, message: error.message, data: null });
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
