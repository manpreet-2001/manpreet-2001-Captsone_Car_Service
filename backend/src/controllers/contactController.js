const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');

// @desc    Send contact message
// @route   POST /api/contact
// @access  Public
const sendContactMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, subject, message, phone } = req.body;

    // Create transporter (you can configure with your email service)
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || 'your-app-password'
      }
    });

    // Email content
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@carservice.com',
      to: process.env.CONTACT_EMAIL || 'admin@carservice.com',
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3c72;">New Contact Form Submission</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Contact Details</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h3 style="color: #374151; margin-top: 0;">Message</h3>
            <p style="line-height: 1.6; color: #64748b;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #eff6ff; border-radius: 8px;">
            <p style="margin: 0; color: #1e40af; font-size: 14px;">
              <strong>Submitted:</strong> ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Log the contact submission (in production, you might want to store in database)
    console.log(`Contact form submission from ${name} (${email}): ${subject}`);

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.',
      error: error.message
    });
  }
};

// @desc    Get contact information
// @route   GET /api/contact/info
// @access  Public
const getContactInfo = async (req, res) => {
  try {
    const contactInfo = {
      phone: process.env.CONTACT_PHONE || '+1 (555) 123-4567',
      email: process.env.CONTACT_EMAIL || 'contact@carservice.com',
      address: process.env.CONTACT_ADDRESS || '123 Main Street, City, State 12345',
      hours: {
        weekdays: 'Monday - Friday: 8:00 AM - 6:00 PM',
        saturday: 'Saturday: 9:00 AM - 4:00 PM',
        sunday: 'Sunday: Closed'
      },
      socialMedia: {
        facebook: process.env.FACEBOOK_URL || 'https://facebook.com/carservice',
        twitter: process.env.TWITTER_URL || 'https://twitter.com/carservice',
        instagram: process.env.INSTAGRAM_URL || 'https://instagram.com/carservice',
        linkedin: process.env.LINKEDIN_URL || 'https://linkedin.com/company/carservice'
      }
    };

    res.json({
      success: true,
      data: contactInfo
    });
  } catch (error) {
    console.error('Get contact info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get contact information',
      error: error.message
    });
  }
};

module.exports = {
  sendContactMessage,
  getContactInfo
};

