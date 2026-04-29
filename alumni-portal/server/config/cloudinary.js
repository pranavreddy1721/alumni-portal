const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Avatar / Profile Image Storage ──────────────────────
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'alumni-portal/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }],
  },
});

// ─── Resume PDF Storage ───────────────────────────────────
const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'alumni-portal/resumes',
    resource_type: 'raw',
    allowed_formats: ['pdf'],
    public_id: `resume_${req.user.id}_${Date.now()}`,
  }),
});

// ─── Event Banner Storage ─────────────────────────────────
const bannerStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'alumni-portal/banners',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 600, crop: 'fill' }],
  },
});

// ─── Multer Instances ─────────────────────────────────────
const uploadAvatar = multer({
  storage: imageStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

const uploadResume = multer({
  storage: resumeStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'), false);
  },
});

const uploadBanner = multer({
  storage: bannerStorage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

module.exports = { cloudinary, uploadAvatar, uploadResume, uploadBanner };
