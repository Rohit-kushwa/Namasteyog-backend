const express = require('express');
const UserSubscriber = require('../Models/user_subscription'); // Adjust the path as necessary
const Package = require('../Models/package'); // Adjust the path as necessary
const router = express.Router();
const mongoose = require('mongoose');
const authenticateToken = require('../Middleware/authenticateToken');
const checkRole = require('../Middleware/checkRole');



// Create a new subscription
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { subscriberId, packageId, paymentDetails } = req.body;
    const package = await Package.findById(packageId);

    if (!package) {
      return res.status(400).json({ message: 'Invalid package ID' });
    }

    const newSubscription = new UserSubscriber({
      subscriberId,
      packageId,
      paymentDetails,
      startDate: new Date(),
    });

    newSubscription.endDate = new Date(newSubscription.startDate);
    newSubscription.endDate.setMonth(newSubscription.endDate.getMonth() + package.durationMonths);

    await newSubscription.save();
    res.status(201).json({ success: true, message: "New Subscriber allocated", data: newSubscription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all subscriptions
router.get('/', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {

    const subscriptions = await UserSubscriber.find({ isDeleted: false })
      .populate('subscriberId packageId');

    const header = [
      { Header: "NAME", accessor: "subscriberId.name" },
      { Header: "START DATE", accessor: "startDate" },
      { Header: "END DATE", accessor: "endDate" },
      { Header: "STATUS", accessor: "status-2" },
      // { Header: "PLAN", accessor: "plan" },
      { Header: "ACTION", accessor: "action-subscriber" },
    ];

    res.status(200).json({
      success: true,
      message: "Subscribers Retrieved Successfully",
      data: subscriptions,
      header: header
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// Get a single subscription by ID
router.get('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const subscription = await UserSubscriber.findById(req.params.id).populate('subscriberId packageId');
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    res.status(200).json({ success: true, message: "Subscriber Retrieved Successful", data: subscription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update a subscription
router.put('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const subscription = await UserSubscriber.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    const { paymentDetails, status } = req.body;
    if (paymentDetails) subscription.paymentDetails = paymentDetails;
    if (status) subscription.status = status;

    await subscription.save();
    res.status(200).json({ success: true, message: "Subscriber Updated Successful", data: subscription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// update a isDeleted
router.patch('/isDeleted/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
  const subscriberId = req.params.id;
  const { isDeleted } = req.body;

  console.log('IsDeleted: ', isDeleted);


  try {
    if (!mongoose.Types.ObjectId.isValid(subscriberId)) {
      return res.status(400).json({ success: false, message: "Invalid Subscriber ID." });
    }

    const updateIsDeleted = await UserSubscriber.findByIdAndUpdate(subscriberId, { isDeleted: isDeleted }, { new: true });

    if (!updateIsDeleted) {
      return res.status(404).json({ success: false, message: "Subscriber not found." });
    }

    res.status(200).json({ success: true, message: "Subscriber isDeleted updated successfully.", data: updateIsDeleted });

  } catch (error) {
    console.error("Error updating Subscriber isDeleted:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});


// Update a Status
router.patch('/status/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
  const suscriptionId = req.params.id;
  const { status } = req.body;

  console.log('Response Status: ', status);

  try {
    if (!mongoose.Types.ObjectId.isValid(suscriptionId)) {
      return res.status(400).json({ success: false, message: "Invalid Subscription ID." });
    }

    const updatedStatus = await UserSubscriber.findByIdAndUpdate(suscriptionId, { status: status }, { new: true });

    if (!updatedStatus) {
      return res.status(404).json({ success: false, message: "Subscriber not found." });
    }

    res.status(200).json({ success: true, message: "Status updated successfully.", data: updatedStatus });

  } catch (error) {
    console.error("Error updating Subscription Status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});


// Update a Plans
router.patch('/plan/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
  const suscriptionId = req.params.id;
  const { packageId } = req.body;

  console.log('Response Status: ', packageId);

  try {
    if (!mongoose.Types.ObjectId.isValid(suscriptionId)) {
      return res.status(400).json({ success: false, message: "Invalid Subscription ID." });
    }

    const updatedPlan = await UserSubscriber.findByIdAndUpdate(suscriptionId, { packageId: packageId }, { new: true });

    if (!updatedPlan) {
      return res.status(404).json({ success: false, message: "Subscriber not found." });
    }

    res.status(200).json({ success: true, message: "Plan updated successfully.", data: updatedPlan });

  } catch (error) {
    console.error("Error updating Subscription Plan:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a subscription
router.delete('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const subscription = await UserSubscriber.findByIdAndDelete(req.params.id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    res.status(200).json({ success: true, message: 'Subscription deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
