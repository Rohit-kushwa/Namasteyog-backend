const express = require('express');
const router = express.Router();
const Order = require('../../Models/ecomm/order');
const authenticateToken = require('../../Middleware/authenticateToken');
const checkRole = require('../../Middleware/checkRole');
const OrderCounter = require('../../Models/ecomm/orderCounter');
const transporter = require('../../Utils/mailer'); // Import the transporter

// Function to send order confirmation email
async function sendOrderConfirmationEmail(to, orderId, customerName, status, template, subject) {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER, // Your email address
            to: to, // Recipient's email address
            subject: subject,
            template: template, // Name of the template file without extension
            context: {
                orderId: orderId,
                customerName: customerName,
                orderStatus: status,
            },
        });
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

// Creating next Order Id
async function getNextOrderId() {
    const orderCounter = await OrderCounter.findByIdAndUpdate(
        { _id: 'orderId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return orderCounter.seq.toString();
}

// Create Orders
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { paymentDetails, shippingDetails } = req.body;
        const orderId = await getNextOrderId();

        // Create a new order
        const newOrder = new Order({
            orderId: orderId,
            customerId: req.body.customerId,
            cartId: req.body.cartId, // Include cartId from the request
            paymentDetails,
            shippingDetails, // Include shipping details
        });

        // Save the order to the database
        const savedOrder = await newOrder.save();

        // Send order confirmation email
        await sendOrderConfirmationEmail(req.user.email, orderId, req.user.name, newOrder.status, 'orderConfirmation', 'Order Confirmation');

        res.status(200).json({ success: true, message: "Order created successfully", data: savedOrder });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get Particular Order
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customerId');

        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        res.status(200).json({ success: true, message: "Order retrieved successfully", data: order });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update status of Order
router.put('/status/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const { status } = req.body;

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status: status },
            { new: true }
        ).populate('customerId');

        if (!updatedOrder) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        // Send order status update email
        await sendOrderConfirmationEmail(updatedOrder.customerId.email, updatedOrder.orderId, updatedOrder.customerId.name, status, 'orderStatusUpdate', 'Order Status Updated');

        res.status(200).json({ success: true, message: "Order Status Updated successfully", status: updatedOrder.status });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get All Orders
router.get('/', authenticateToken, async (req, res) => {
    try {
        // Fetch all orders and populate the customerId field
        const orders = await Order.find()
            .populate('customerId cartId');

        const header = [
            { Header: "ORDER NO", accessor: "orderId" },
            { Header: "CUSTOMER", accessor: "customerId.username" },
            { Header: "STREET ADDRESS", accessor: "shippingDetails.streetAddress" },
            { Header: "SHIPPING CITY", accessor: "shippingDetails.city" },
            
            { Header: "PAYMENT MODE", accessor: "paymentDetails.paymentMethod" },
            { Header: "TOTAL", accessor: "cartId.subTotalDiscount" },
            { Header: "STATUS", accessor: "status" },
            { Header: "ACTION", accessor: "action-order" },
            { Header: "VIEW", accessor: "action-ic" },
        ];

        res.status(200).json({ success: true, message: "Orders retrieved successfully", data: orders, header: header });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
