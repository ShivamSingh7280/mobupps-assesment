function sendSuccess(res, { statusCode = 200, data = null, meta = undefined, message = undefined }) {
  const body = { success: true };
  if (message !== undefined) body.message = message;
  body.data = data;
  if (meta !== undefined) body.meta = meta;
  return res.status(statusCode).json(body);
}

module.exports = { sendSuccess };
