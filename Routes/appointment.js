const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Appointment = require('../Models/appointment'); // Adjust path as needed


router.post('/', async (req, res) => {
    try {
        const { name, email, phone, address, message } = req.body;

        // Create a new appointment object
        const appointmentData = {
            name,
            email,
            phone,
            address,
            message,
        };

        // Conditionally set createdBy if userId is available
        if (req.user && req.user.id) {
            appointmentData.createdBy = req.user.id; // Set createdBy if user is authenticated
        }

        // Create the new appointment
        const newAppointment = new Appointment(appointmentData);

        await newAppointment.save();
        res.status(201).json({ success: true, data: newAppointment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});



router.get('/', async (req, res) => {
    try {
        const header = [
            { Header: "NAME", accessor: "name" },
            { Header: "EMAIL", accessor: "email" },
            { Header: "PHONE", accessor: "phone" },
            { Header: "ADDRESS", accessor: "address" },
            { Header: "MESSAGE", accessor: "message" },
            { Header: "CREATED AT", accessor: "createdAt" }
        ];

        const appointments = await Appointment.find();
        res.status(200).json({ success: true, data: appointments, header: header });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        res.status(200).json({ success: true, data: appointment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { name, email, phone, address, message } = req.body;
        const userId = req.user.id; // Assuming user info is available via req.user (from authentication middleware)

        let appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // Update the appointment and set updatedBy to the current user
        appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            {
                name,
                email,
                phone,
                address,
                message,
                updatedBy: userId // Set updatedBy field to the user updating the document
            },
            { new: true } // Return the updated document
        );

        res.status(200).json({ success: true, data: appointment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        await appointment.remove();
        res.status(200).json({ success: true, message: 'Appointment removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

module.exports = router;
