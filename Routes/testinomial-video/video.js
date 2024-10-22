const express = require('express');
const multer = require('multer');
const Video = require('../../Models/testinomial-video/video'); // Assuming the model is in the models folder
const router = express.Router();
const path = require('path');
const asyncHandler = require('express-async-handler');
const authenticateToken = require('../../Middleware/authenticateToken');
const checkRole = require('../../Middleware/checkRole');


// Define storage for uploaded videos
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Public/video'); // Path where video files will be stored
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Generate unique name with original extension
  }
});

// Set up multer middleware for handling video uploads
const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Limit to 100MB
  fileFilter: (req, file, cb) => {
    const allowedFileTypes = /mp4|avi|mkv|mov/;
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'));
    }
  }
});

// API route for uploading video
router.post('/uploadVideo', authenticateToken, checkRole(['admin']),videoUpload.single('videoPath'), asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video uploaded or wrong file type.' });
    }

    const video = new Video({
      videoPath: `/video/${req.file.filename}` // Save with correct path
    });

    const savedVideo = await video.save(); // Save video to MongoDB

    res.status(200).json({
      message: 'Video uploaded successfully!',
      video: savedVideo
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to upload video.' });
  }
}));

// API route for retrieving all videos
router.get('/', asyncHandler(async (req, res) => {
  try {
    const header = [
      { Header: "VIDEO", accessor: "forVideo" },
      { Header: "STATUS", accessor: "status" },
      { Header: "ACTION", accessor: "action-multi" }
    ];

    const videos = await Video.find();

    res.status(200).json({ success: true, message: "Videos retrieved successfully.", data: videos, header: header });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}));

// API route for updating a video
router.put('/:id', authenticateToken, checkRole(['admin']), videoUpload.single('videoPath'), asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Extract status from request body

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found.' });
    }

    if (req.file) {
      video.videoPath = `/${req.file.filename}`; // Save new path
    }

    // Update status if provided
    if (status !== undefined) {
      video.status = status; // Update the status field
    }

    console.log("body data: ", req.body);

    const updatedVideo = await video.save();

    res.status(200).json({
      message: 'Video updated successfully!',
      video: updatedVideo
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update video.' });
  }
}));


module.exports = router;
