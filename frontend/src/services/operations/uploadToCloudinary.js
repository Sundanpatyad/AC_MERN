import { apiConnector } from '../apiConnector';
import { uploadEndpoints } from '../apis';

/**
 * Uploads a single image File to Cloudinary via the backend.
 * @param {File} file  — a browser File object
 * @param {string} token  — auth token
 * @returns {Promise<string>} secure_url of the uploaded image
 */
export const uploadImageToCloudinary = async (file, token) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiConnector(
    'POST',
    uploadEndpoints.UPLOAD_IMAGE_API,
    formData,
    {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    }
  );

  if (!response?.data?.success) {
    throw new Error(response?.data?.message || 'Image upload failed');
  }

  return response.data.secure_url;
};
