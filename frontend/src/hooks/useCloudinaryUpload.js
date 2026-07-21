import { useState, useCallback } from 'react';
import axios from 'axios';
import { uploadApi } from '../api/uploadApi';
import { validateImageFile } from '../utils/imageValidation';

// Plain axios instance: Cloudinary is a third-party host and must never
// receive our app's JWT (which axiosClient would otherwise attach).
const cloudinaryClient = axios.create();

export function useCloudinaryUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const upload = useCallback(async (file) => {
    setError('');

    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      throw new Error(validationError);
    }

    setIsUploading(true);
    try {
      const { data } = await uploadApi.getSignature();
      const { timestamp, signature, folder, apiKey, cloudName } = data.data;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', folder);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const { data: cloudinaryResponse } = await cloudinaryClient.post(uploadUrl, formData);

      return { url: cloudinaryResponse.secure_url, publicId: cloudinaryResponse.public_id };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Image upload failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { upload, isUploading, error };
}
