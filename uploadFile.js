const multer = require('multer');
const path = require('path');

const storageCategory = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './Public/category');
  },
  filename: function(req, file, cb) {
    // Check file type based on its extension
    const filetypes = /jpeg|jpg|png|webp|avif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (extname) {
      cb(null, Date.now() + "_" + Math.floor(Math.random() * 1000) + path.extname(file.originalname));
    } else {
      cb("Error: only .jpeg, .jpg, .png files are allowed!");
    }
  }
});

const uploadCategory = multer({
  storage: storageCategory,
  limits: {
    fileSize: 1024 * 1024 * 5 // limit filesize to 5MB
  },
});



const storageProduct = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, './Public/product');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp|avif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (extname) {
      cb(null, `${Date.now()}_${file.originalname}`);
    } else {
      cb(new Error('Error: only .jpeg, .jpg, .png files are allowed!'));
    }
  }
});

const uploadProduct = multer({
  storage: storageProduct,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB limit
  }
});



const storageBlog = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, './Public/blog');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp|avif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (extname) {
      cb(null, `${Date.now()}_${file.originalname}`);
    } else {
      cb(new Error('Error: only .jpeg, .jpg, .png files are allowed!'));
    }
  }
});

const uploadBlog = multer({
  storage: storageBlog,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB limit
  }
});

const storageInstructor = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, './Public/instructor');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp|avif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (extname) {
      cb(null, `${Date.now()}_${file.originalname}`);
    } else {
      cb(new Error('Error: only .jpeg, .jpg, .png files are allowed!'));
    }
  }
});

const uploadInstructor = multer({
  storage: storageInstructor,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB limit
  }
});

const storageCkEditor = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, './Public/ckEditor');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp|avif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (extname) {
      cb(null, `${Date.now()}_${file.originalname}`);
    } else {
      cb(new Error('Error: only .jpeg, .jpg, .png files are allowed!'));
    }
  }
});

const uploadCkEditor = multer({
  storage: storageCkEditor,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB limit
  }
});


const storageTestimonialFirst = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, './Public/testimonialFirst');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp|avif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (extname) {
      cb(null, `${Date.now()}_${file.originalname}`);
    } else {
      cb(new Error('Error: only .jpeg, .jpg, .png files are allowed!'));
    }
  }
});

const uploadTestimonial = multer({
  storage: storageTestimonialFirst,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB limit
  }
});
 

const storageTestimonialSecond = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, './Public/testimonialSecond');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp|avif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (extname) {
      cb(null, `${Date.now()}_${file.originalname}`);
    } else {
      cb(new Error('Error: only .jpeg, .jpg, .png files are allowed!'));
    }
  }
});

const uploadTestimonialSecond = multer({
  storage: storageTestimonialSecond,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB limit
  }
});

const storageDiscountBanner = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, './Public/discountBannerImage');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp|avif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (extname) {
      cb(null, `${Date.now()}_${file.originalname}`);
    } else {
      cb(new Error('Error: only .jpeg, .jpg, .png files are allowed!'));
    }
  }
});

const uploadDiscountBannerImage = multer({
  storage: storageDiscountBanner,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB limit
  }
});

module.exports = {
    uploadCategory, 
    uploadProduct,
    uploadBlog,
    uploadCkEditor,
    uploadInstructor,
    uploadTestimonial,
    uploadTestimonialSecond,
    uploadDiscountBannerImage
};