const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  // Check if we're using Gmail or custom SMTP
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  
  // Custom SMTP configuration
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false // For development only
    }
  });
};

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('❌ Email server configuration error:', error.message);
    return false;
  }
};

// Email configuration object
const emailConfig = {
  from: {
    name: process.env.EMAIL_FROM_NAME || 'Car Service Platform',
    address: process.env.EMAIL_FROM || process.env.EMAIL_USER
  },
  replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_USER
};

module.exports = {
  createTransporter,
  verifyEmailConfig,
  emailConfig
};

