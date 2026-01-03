const nodemailer = require('nodemailer');

// Helper to get location name (matches client-side logic)
const getLocationName = (locationId) => {
  const locationMap = {
    cafe: 'Café',
    library: 'Library',
    clinic: 'Clinic',
    male_dorm_1: 'Male Dormitory 1',
    male_dorm_2: 'Male Dormitory 2',
    female_dorm: 'Female Dormitory',
    registrar: 'Registrar',
    main_building: 'Main Building',
    launch: 'Launch Area',
    other: 'Other Location',
  };
  return locationMap[locationId] || locationId;
};

// Create transporter (non-blocking, fire and forget)
let transporter = null;

const initializeEmailService = () => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  // Only initialize if SMTP config is provided
  if (smtpHost && smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: smtpPort === '465', // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
    console.log('✓ Email service initialized');
  } else {
    console.log('⚠️  Email service not configured (SMTP env vars missing)');
  }
};

// Send emergency email (non-blocking)
const sendEmergencyEmail = async (alert) => {
  if (!transporter) {
    console.log('⚠️  Email service not available, skipping email notification');
    return;
  }

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()).filter(Boolean);
  if (!adminEmails || adminEmails.length === 0) {
    console.log('⚠️  No admin emails configured, skipping email notification');
    return;
  }

  const locationName = alert.location?.locationId 
    ? getLocationName(alert.location.locationId) 
    : alert.location?.building || 'Unknown Location';

  const emergencyTypeLabels = {
    medical: 'Medical Emergency',
    fire: 'Fire',
    security: 'Security Threat',
    natural_disaster: 'Natural Disaster',
    other: 'Other Emergency',
  };

  const mailOptions = {
    from: `"Campus Safety Hub" <${process.env.SMTP_USER}>`,
    to: adminEmails.join(', '),
    subject: '🚨 Emergency Alert',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ff4757; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">🚨 Emergency Alert</h1>
        </div>
        <div style="padding: 20px; background: #f8f9fa;">
          <h2 style="color: #1a1a2e; margin-top: 0;">Emergency Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Type:</td>
              <td style="padding: 8px 0; color: #1a1a2e;">${emergencyTypeLabels[alert.emergencyType] || alert.emergencyType}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Location:</td>
              <td style="padding: 8px 0; color: #1a1a2e;">${locationName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Time:</td>
              <td style="padding: 8px 0; color: #1a1a2e;">${new Date(alert.timestamp).toLocaleString()}</td>
            </tr>
            ${alert.description ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Description:</td>
              <td style="padding: 8px 0; color: #1a1a2e;">${alert.description}</td>
            </tr>
            ` : ''}
          </table>
          <div style="margin-top: 20px; padding: 15px; background: white; border-left: 4px solid #2563eb;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin" 
               style="display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
              View in Admin Dashboard
            </a>
          </div>
        </div>
      </div>
    `,
  };

  // Fire and forget - don't block the request
  transporter.sendMail(mailOptions).catch((error) => {
    console.error('Email sending failed (non-critical):', error.message);
  });
};

module.exports = {
  initializeEmailService,
  sendEmergencyEmail,
};

