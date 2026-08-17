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

async function sendVerificationEmail(toEmail, name, code) {
  try {
    await transporter.sendMail({
      from: `"Wildfire Monitor" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Your Wildfire Monitor verification code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #7a1f1f;">Welcome, ${name}!</h2>
          <p>Use the code below to verify your email address:</p>
          <div style="background: #f4f2f0; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #7a1f1f;">${code}</span>
          </div>
          <p style="color: #888; font-size: 12px;">This code expires in 15 minutes. If you didn't create this account, you can ignore this email.</p>
        </div>
      `
    });
    console.log(`✅ Verification code sent to ${toEmail}`);
  } catch (error) {
    console.error('❌ Verification email error:', error.message);
  }
}

async function sendPasswordResetEmail(toEmail, name, code) {
  try {
    await transporter.sendMail({
      from: `"Wildfire Monitor" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Your Wildfire Monitor password reset code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #7a1f1f;">Password Reset Request</h2>
          <p>Hi ${name}, use the code below to reset your password:</p>
          <div style="background: #f4f2f0; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #7a1f1f;">${code}</span>
          </div>
          <p style="color: #888; font-size: 12px;">This code expires in 15 minutes. If you didn't request this, you can ignore this email.</p>
        </div>
      `
    });
    console.log(`✅ Password reset code sent to ${toEmail}`);
  } catch (error) {
    console.error('❌ Password reset email error:', error.message);
  }
}

module.exports = { sendFireAlert, sendVerificationEmail, sendPasswordResetEmail };