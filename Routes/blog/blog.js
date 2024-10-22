const express = require('express');
const BlogPost = require('../../Models/blog/blog'); // Adjust the path as necessary
const router = express.Router();
const mongoose = require('mongoose');
const authenticateToken = require('../../Middleware/authenticateToken');
const checkRole = require('../../Middleware/checkRole');
const { uploadBlog, uploadCkEditor } = require('../../uploadFile')
const multer = require('multer');
const asyncHandler = require('express-async-handler');




router.get('/', async (req, res) => {
    try {
        const header = [
            { Header: "TITLE", accessor: "title" },
            { Header: "IMAGE", accessor: "image" },
            { Header: "CATEGORY", accessor: "category.name" },
            { Header: "TAGS", accessor: "tags[0].name" },
            { Header: "STATUS", accessor: "status" },
            { Header: "ACTIONS", accessor: "action-multi" },

        ];


        const posts = await BlogPost.find({ isDeleted: false }).populate('category tags createdBy');
        res.status(200).json({ success: true, message: "Blog Retrieved Successful", data: posts, header: header });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


router.post('/upload-ckImage', authenticateToken, checkRole(['admin']), asyncHandler(async (req, res) => {
    uploadCkEditor.single('image')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File size is too large. Maximum file size is 5MB.'
                });
            }
            console.error(`Multer error: ${err.message}`);
            return res.status(400).json({
                success: false,
                message: err.message
            });
        } else if (err) {
            console.error(`Error: ${err.message}`);
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        let newImg = '';
        if (req.file) {
            newImg = req.file.filename;
        }

        try {
            res.json({
                uploaded: true,
                url: newImg // Assuming you're serving the uploads directory statically
            });
        } catch (error) {
            console.error('Image upload error:', error);
            res.status(500).json({
                uploaded: false,
                message: 'Failed to upload image.'
            });
        }
    });
}));



// Create a new Blog with image upload
router.post('/', authenticateToken, checkRole(['admin']), asyncHandler(async (req, res) => {
    uploadBlog.single('image')(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ success: false, message: 'File size is too large. Maximum file size is 5MB.' });
            }
            console.error(`Multer error: ${err.message}`);
            return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
            console.error(`Error: ${err.message}`);
            return res.status(400).json({ success: false, message: err.message });
        }

        const { title, content, category, status, tags } = req.body;
        let newImg = '';
        if (req.file) {
            newImg = req.file.filename;
        }

        console.log('Image:', req.file);

        try {
            const newPost = new BlogPost({
                title,
                content,
                category,
                image: newImg,
                status,
                tags,
                createdBy: req.user.id,
                updatedBy: req.user.id
            });
            await newPost.save();
            res.status(200).json({ success: true, message: 'Blog created successfully.', data: newPost });
        } catch (error) {
            console.error('Error creating Blog:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    });
}));

// Get a single post
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id).populate('category tags');
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
        res.status(200).json({ success: true, message: "Blog Post Retrieved Successful", data: post });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update a post
router.put('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {

    uploadBlog.single('image')(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ success: false, message: 'File size is too large. Maximum file size is 5MB.' });
            }
            console.error(`Multer error: ${err.message}`);
            return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
            console.error(`Error: ${err.message}`);
            return res.status(400).json({ success: false, message: err.message });
        }

        const { title, content, category, status, tags } = req.body;
        let newImg = '';
        if (req.file) {
            newImg = req.file.filename;
        }

        console.log('Image:', req.file);

        try {
            const updates = { ...req.body};

            if (req.file) {
                updates.image = newImg;
            }

            const updatedPost = await BlogPost.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    
            console.log("data body: ", updates);
            res.status(200).json({ success: true, message: "BlogPost Updated Successful", data: updatedPost });
        } catch (err) {
            res.status(400).json({ success: false, message: err.message });
        }
    });


   
});

// Delete a post
router.delete('/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        await BlogPost.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Post deleted Successful' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});




// update a isDeleted
router.patch('/isDeleted/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    const blogId = req.params.id;
    const { isDeleted } = req.body;
    console.log('IsDeleted: ', isDeleted);

    try {
        if (!mongoose.Types.ObjectId.isValid(blogId)) {
            return res.status(400).json({ success: false, message: "Invalid Blog ID." });
        }
        const updateIsDeleted = await BlogPost.findByIdAndUpdate(blogId, { isDeleted: isDeleted }, { new: true });

        if (!updateIsDeleted) {
            return res.status(404).json({ success: false, message: "Blog not found." });
        }

        res.status(200).json({ success: true, message: "Blog isDeleted updated successfully.", data: updateIsDeleted });

    } catch (error) {
        console.error("Error updating Blog isDeleted:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});


// update a status
router.patch('/status/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    const blogId = req.params.id;
    const { status } = req.body;
    console.log('status: ', status);

    try {
        if (!mongoose.Types.ObjectId.isValid(blogId)) {
            return res.status(400).json({ success: false, message: "Invalid Blog ID." });
        }
        const updateStatus = await BlogPost.findByIdAndUpdate(blogId, { status: status }, { new: true });

        if (!updateStatus) {
            return res.status(404).json({ success: false, message: "Blog not found." });
        }

        res.status(200).json({ success: true, message: "Blog status updated successfully.", data: updateStatus });

    } catch (error) {
        console.error("Error updating Blog Status:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});


module.exports = router;