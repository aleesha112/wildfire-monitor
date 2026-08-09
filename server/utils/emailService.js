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

module.exports = sendFireAlert;