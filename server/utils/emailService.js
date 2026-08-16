const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendFireAlert(toEmail, regionName, fireCount, radiusKm) {
  try {
    await transporter.sendMail({
      from: `"Wildfire Monitor" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `🔥 Fire Alert: ${regionName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #7a1f1f;">🔥 Fire Activity Detected</h2>
          <p>We detected <strong>${fireCount} new fire detection(s)</strong> within ${radiusKm}km of your watchlisted region: <strong>${regionName}</strong>.</p>
          <p>Log in to your dashboard to view details on the map.</p>
          <p style="color: #888; font-size: 12px; margin-top: 20px;">This alert was generated automatically by Wildfire Monitor based on NASA VIIRS satellite data.</p>
        </div>
      `
    });
    console.log(`✅ Alert email sent to ${toEmail} for ${regionName}`);
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
  }
}

async function sendVerificationEmail(toEmail, name, verifyUrl) {
  try {
    await transporter.sendMail({
      from: `"Wildfire Monitor" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Verify your Wildfire Monitor account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #7a1f1f;">Welcome, ${name}!</h2>
          <p>Please verify your email address to activate your Wildfire Monitor account.</p>
          <a href="${verifyUrl}" style="display: inline-block; background: #7a1f1f; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">Verify Email</a>
          <p style="color: #888; font-size: 12px;">If you didn't create this account, you can ignore this email.</p>
        </div>
      `
    });
    console.log(`✅ Verification email sent to ${toEmail}`);
  } catch (error) {
    console.error('❌ Verification email error:', error.message);
  }
}

async function sendPasswordResetEmail(toEmail, name, resetUrl) {
  try {
    await transporter.sendMail({
      from: `"Wildfire Monitor" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Reset your Wildfire Monitor password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #7a1f1f;">Password Reset Request</h2>
          <p>Hi ${name}, we received a request to reset your password. Click below to set a new one:</p>
          <a href="${resetUrl}" style="display: inline-block; background: #7a1f1f; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">Reset Password</a>
          <p style="color: #888; font-size: 12px;">This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
        </div>
      `
    });
    console.log(`✅ Password reset email sent to ${toEmail}`);
  } catch (error) {
    console.error('❌ Password reset email error:', error.message);
  }
}

module.exports = { sendFireAlert, sendVerificationEmail, sendPasswordResetEmail };