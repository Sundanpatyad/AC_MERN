const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { uploadImage } = require('../controllers/uploadController');

// POST /api/v1/upload/image  — generic image upload to Cloudinary
router.post('/image', auth, uploadImage);

module.exports = router;
