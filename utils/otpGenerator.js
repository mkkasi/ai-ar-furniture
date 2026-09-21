const crypto = require('crypto');

/**
 * Generates a numeric OTP of the given length (default 6 digits)
 * using a cryptographically secure random source.
 */
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i += 1) {
    otp += digits[bytes[i] % 10];
  }
  return otp;
};

const otpExpiryDate = (minutes = 10) => new Date(Date.now() + minutes * 60 * 1000);

module.exports = { generateOTP, otpExpiryDate };
