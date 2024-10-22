// utils/mailer.js

const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');

// Configure the email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // or use another email service
    auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email password or app password
    }
});

// Configure Handlebars template engine
const handlebarOptions = {
    viewEngine: {
        extName: '.hbs',
        partialsDir: path.resolve(__dirname, '../Views/'), // Path to your email templates directory
        defaultLayout: false,
    },
    viewPath: path.resolve(__dirname, '../Views/'), // Path to your email templates directory
    extName: '.hbs',
};

transporter.use('compile', hbs(handlebarOptions));

module.exports = transporter;
