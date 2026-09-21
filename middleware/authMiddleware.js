const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { ApiError } = require('../utils/apiResponse');

/**
 * Verifies the JWT in the Authorization header and attaches
 * the authenticated user (without password) to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(401, 'User belonging to this token no longer exists');
    }
    if (user.isDisabled) {
      throw new ApiError(403, 'This account has been disabled. Contact support.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Session expired, please log in again');
    }
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, 'Not authorized, token invalid');
  }
});

/**
 * Restricts access to admin users only. Must run after `protect`.
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  throw new ApiError(403, 'Admin access required');
};

/**
 * Attaches req.user if a valid token is present, but does not
 * fail the request when no token / an invalid token is provided.
 * Useful for public endpoints that personalize output when logged in.
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user && !user.isDisabled) req.user = user;
  } catch {
    // Silently ignore invalid tokens on optional-auth routes
  }
  next();
});

module.exports = { protect, adminOnly, optionalAuth };
