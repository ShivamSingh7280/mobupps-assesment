const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const supabase = require('../config/supabaseClient');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const { generateRefreshToken, hashToken, parseDurationToMs } = require('../utils/token');

const BCRYPT_COST = 12;
const USER_PUBLIC_FIELDS = 'id, name, email, created_at';

async function issueTokens(userId) {
  const accessToken = jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });

  const rawRefreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN));

  const { error } = await supabase.from('refresh_tokens').insert({
    user_id: userId,
    token_hash: hashToken(rawRefreshToken),
    expires_at: expiresAt.toISOString(),
  });
  if (error) throw ApiError.internal('Failed to create session');

  return { accessToken, refreshToken: rawRefreshToken, refreshTokenExpiresAt: expiresAt };
}

async function register({ name, email, password }) {
  const { data: existing, error: lookupError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (lookupError) throw ApiError.internal('Failed to verify account availability');
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

  const { data: user, error } = await supabase
    .from('users')
    .insert({ name, email, password_hash: passwordHash })
    .select(USER_PUBLIC_FIELDS)
    .single();
  if (error) throw ApiError.internal('Failed to create account');

  const tokens = await issueTokens(user.id);
  return { user, ...tokens };
}

async function login({ email, password }) {
  const { data: user, error: lookupError } = await supabase
    .from('users')
    .select(`${USER_PUBLIC_FIELDS}, password_hash`)
    .eq('email', email)
    .maybeSingle();

  if (lookupError) throw ApiError.internal('Failed to verify credentials');

  if (!user) throw ApiError.unauthorized('Invalid credentials');

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) throw ApiError.unauthorized('Invalid credentials');

  const tokens = await issueTokens(user.id);
  const { password_hash, ...publicUser } = user;
  return { user: publicUser, ...tokens };
}

async function refreshTokens(rawRefreshToken) {
  if (!rawRefreshToken) throw ApiError.unauthorized('Missing refresh token');

  const tokenHash = hashToken(rawRefreshToken);
  const { data: row, error: lookupError } = await supabase
    .from('refresh_tokens')
    .select('id, user_id, expires_at, revoked_at')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (lookupError) throw ApiError.internal('Failed to verify session');
  if (!row) throw ApiError.unauthorized('Invalid or expired refresh token');

  if (row.revoked_at) {
    // This exact token was already rotated away once — a reuse attempt
    // signals possible theft, so kill every active session for this user.
    await supabase
      .from('refresh_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('user_id', row.user_id)
      .is('revoked_at', null);
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  if (new Date(row.expires_at) < new Date()) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const { error: revokeError } = await supabase
    .from('refresh_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', row.id);
  if (revokeError) throw ApiError.internal('Failed to rotate session');

  return issueTokens(row.user_id);
}

async function logout(rawRefreshToken) {
  if (!rawRefreshToken) return;
  const tokenHash = hashToken(rawRefreshToken);
  await supabase
    .from('refresh_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('token_hash', tokenHash)
    .is('revoked_at', null);
}

async function getUserById(userId) {
  const { data: user, error } = await supabase
    .from('users')
    .select(USER_PUBLIC_FIELDS)
    .eq('id', userId)
    .maybeSingle();
  if (error) throw ApiError.internal('Failed to fetch user');
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

module.exports = { register, login, refreshTokens, logout, getUserById };
