const { uploadImageToCloudinary } = require('../utils/imageUploader');

/**
 * Generic image upload — returns the Cloudinary secure_url.
 * Used by the admin panel to upload question & option images.
 *
 * POST /api/v1/upload/image
 * Body: multipart/form-data  { file: <image> }
 */
exports.uploadImage = async (req, res) => {
  try {
    const file = req.files?.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ success: false, message: 'Only image files are allowed (jpeg, png, webp, gif)' });
    }

    const uploaded = await uploadImageToCloudinary(file, process.env.FOLDER_NAME, 1200, 1200);

    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      secure_url: uploaded.secure_url,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({
      success: false,
      message: 'Image upload failed',
      error: error.message,
    });
  }
};
