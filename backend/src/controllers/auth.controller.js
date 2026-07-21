const authService = require('../services/auth.service');
const env = require('../config/env');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_PATH = '/api/v1/auth';

function setRefreshCookie(res, refreshToken, expiresAt) {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: REFRESH_COOKIE_PATH,
    expires: expiresAt,
  });
}

const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken, refreshTokenExpiresAt } = await authService.register(req.body);
  setRefreshCookie(res, refreshToken, refreshTokenExpiresAt);
  sendSuccess(res, { statusCode: 201, data: { user, accessToken } });
});

const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken, refreshTokenExpiresAt } = await authService.login(req.body);
  setRefreshCookie(res, refreshToken, refreshTokenExpiresAt);
  sendSuccess(res, { data: { user, accessToken } });
});

const refresh = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, refreshTokenExpiresAt } = await authService.refreshTokens(
    req.cookies?.[REFRESH_COOKIE_NAME]
  );
  setRefreshCookie(res, refreshToken, refreshTokenExpiresAt);
  sendSuccess(res, { data: { accessToken } });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.cookies?.[REFRESH_COOKIE_NAME]);
  res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
  sendSuccess(res, { data: null, message: 'Logged out' });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.userId);
  sendSuccess(res, { data: { user } });
});

module.exports = { register, login, refresh, logout, me };
