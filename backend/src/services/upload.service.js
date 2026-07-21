const cloudinary = require('../config/cloudinaryClient');
const logger = require('../utils/logger');

const UPLOAD_FOLDER = 'product-store/products';

function generateUploadSignature() {
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { timestamp, folder: UPLOAD_FOLDER };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, cloudinary.config().api_secret);

  return {
    timestamp,
    signature,
    folder: UPLOAD_FOLDER,
    apiKey: cloudinary.config().api_key,
    cloudName: cloudinary.config().cloud_name,
  };
}


async function destroyImageBestEffort(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    logger.error('Failed to delete Cloudinary asset', { publicId, message: err.message });
  }
}

module.exports = { generateUploadSignature, destroyImageBestEffort };
