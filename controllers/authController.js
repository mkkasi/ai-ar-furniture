const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError, success } = require('../utils/apiResponse');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const { generateOTP, otpExpiryDate } = require('../utils/otpGenerator');
const { sendEmail, otpEmailTemplate } = require('../utils/sendEmail');

/**
 * @desc    Register a new user and send an email-verification OTP
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const otp = generateOTP();
  const user = await User.create({
    name,
    email,
    password,
    phone,
    otp: { code: otp, expiresAt: otpExpiryDate(10), purpose: 'email_verification' },
  });

  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify your AR Furniture Studio account',
      html: otpEmailTemplate(user.name, otp, 'email_verification'),
    });
  } catch (err) {
    console.error('[Email] Failed to send verification OTP:', err.message);
  }

  return success(res, 201, 'Registration successful. Please verify the OTP sent to your email.', {
    userId: user._id,
    email: user.email,
  });
});

/**
 * @desc    Verify OTP for email verification or password reset
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp, purpose } = req.body;

  const user = await User.findOne({ email }).select('+otp.code +otp.expiresAt +otp.purpose');
  if (!user) throw new ApiError(404, 'No account found with this email');

  if (!user.otp || !user.otp.code) {
    throw new ApiError(400, 'No OTP was requested for this account');
  }
  if (user.otp.purpose !== purpose) {
    throw new ApiError(400, 'OTP purpose mismatch');
  }
  if (user.otp.expiresAt < new Date()) {
    throw new ApiError(400, 'OTP has expired, please request a new one');
  }
  if (user.otp.code !== otp) {
    throw new ApiError(400, 'Incorrect OTP');
  }

  if (purpose === 'email_verification') {
    user.isEmailVerified = true;
    user.otp = undefined;
    await user.save();
    return success(res, 200, 'Email verified successfully');
  }

  // purpose === 'password_reset' -> issue a short-lived reset token
  const resetToken = jwt.sign({ id: user._id, purpose: 'password_reset' }, process.env.JWT_SECRET, {
    expiresIn: '10m',
  });
  user.otp = undefined;
  await user.save();

  return success(res, 200, 'OTP verified. Use the reset token to set a new password.', { resetToken });
});

/**
 * @desc    Resend an OTP (email verification or password reset) — for
 *          when the original code expired or never arrived.
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
const resendOTP = asyncHandler(async (req, res) => {
  const { email, purpose } = req.body;

  const user = await User.findOne({ email });
  // Respond identically whether or not the account exists / needs it, to
  // avoid leaking account existence or verification status.
  if (user && (purpose !== 'email_verification' || !user.isEmailVerified)) {
    const otp = generateOTP();
    user.otp = { code: otp, expiresAt: otpExpiryDate(10), purpose };
    await user.save();

    try {
      await sendEmail({
        to: user.email,
        subject:
          purpose === 'password_reset'
            ? 'Reset your AR Furniture Studio password'
            : 'Verify your AR Furniture Studio account',
        html: otpEmailTemplate(user.name, otp, purpose),
      });
    } catch (err) {
      console.error('[Email] Failed to resend OTP:', err.message);
    }
  }

  return success(res, 200, 'If an account matches this request, a new code has been sent.');
});

/**
 * @desc    Log in a user with email + password
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password, fcmToken } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (user.isDisabled) {
    throw new ApiError(403, 'This account has been disabled. Contact support.');
  }

  user.lastLoginAt = new Date();
  if (fcmToken && !user.fcmTokens.includes(fcmToken)) {
    user.fcmTokens.push(fcmToken);
  }
  await user.save();

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  return success(res, 200, 'Login successful', {
    user: user.toPublicJSON(),
    accessToken,
    refreshToken,
  });
});

/**
 * @desc    Request a password reset OTP
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  // Respond identically whether or not the account exists, to avoid user enumeration
  if (user) {
    const otp = generateOTP();
    user.otp = { code: otp, expiresAt: otpExpiryDate(10), purpose: 'password_reset' };
    await user.save();

    try {
      await sendEmail({
        to: user.email,
        subject: 'Reset your AR Furniture Studio password',
        html: otpEmailTemplate(user.name, otp, 'password_reset'),
      });
    } catch (err) {
      console.error('[Email] Failed to send reset OTP:', err.message);
    }
  }

  return success(res, 200, 'If an account exists for this email, a reset code has been sent.');
});

/**
 * @desc    Reset password using the token issued after OTP verification
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken, newPassword } = req.body;

  let decoded;
  try {
    decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(400, 'Reset token is invalid or has expired');
  }
  if (decoded.purpose !== 'password_reset') {
    throw new ApiError(400, 'Invalid reset token');
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(404, 'User not found');

  user.password = newPassword;
  await user.save();

  return success(res, 200, 'Password reset successfully. Please log in with your new password.');
});

/**
 * @desc    Exchange a valid refresh token for a new access token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) throw new ApiError(400, 'Refresh token is required');

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new ApiError(401, 'Refresh token is invalid or has expired');
  }

  const user = await User.findById(decoded.id);
  if (!user || user.isDisabled) throw new ApiError(401, 'User not found or disabled');

  const accessToken = generateAccessToken(user._id, user.role);
  return success(res, 200, 'Token refreshed', { accessToken });
});

/**
 * @desc    Get the authenticated user's profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  return success(res, 200, 'Profile fetched', { user: req.user.toPublicJSON() });
});

/**
 * @desc    Update the authenticated user's profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, preferences } = req.body;

  if (name !== undefined) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;
  if (preferences !== undefined) {
    req.user.preferences = { ...req.user.preferences.toObject(), ...preferences };
  }
  if (req.file) {
    req.user.avatar = { url: req.file.path, publicId: req.file.filename };
  }

  await req.user.save();
  return success(res, 200, 'Profile updated', { user: req.user.toPublicJSON() });
});

/**
 * @desc    Change password while logged in
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();
  return success(res, 200, 'Password changed successfully');
});

/**
 * @desc    Log out — removes the provided FCM token from the user's device list
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  const { fcmToken } = req.body;
  if (fcmToken) {
    req.user.fcmTokens = req.user.fcmTokens.filter((t) => t !== fcmToken);
    await req.user.save();
  }
  return success(res, 200, 'Logged out successfully');
});

module.exports = {
  register,
  verifyOTP,
  resendOTP,
  login,
  forgotPassword,
  resetPassword,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  logout,
};
