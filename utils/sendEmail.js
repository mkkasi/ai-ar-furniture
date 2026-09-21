const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends a transactional email.
 * @param {{to: string, subject: string, html: string}} options
 */
const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

const otpEmailTemplate = (name, otp, purpose) => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
    <h2 style="color:#2E3A59;">AR Furniture Studio</h2>
    <p>Hi ${name},</p>
    <p>${purpose === 'password_reset'
      ? 'Use the code below to reset your password.'
      : 'Use the code below to verify your email address.'}</p>
    <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background:#F1F3F9; padding: 16px; text-align:center; border-radius: 8px;">
      ${otp}
    </div>
    <p>This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
  </div>
`;

module.exports = { sendEmail, otpEmailTemplate };
