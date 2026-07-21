const uploadService = require('../services/upload.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');

const getSignature = asyncHandler(async (req, res) => {
  const signaturePayload = uploadService.generateUploadSignature();
  sendSuccess(res, { data: signaturePayload });
});

module.exports = { getSignature };
