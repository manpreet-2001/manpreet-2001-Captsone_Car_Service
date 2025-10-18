const { createTransporter, emailConfig } = require('../config/email');
const {
  bookingCreatedCustomerEmail,
  bookingCreatedMechanicEmail,
  bookingConfirmedEmail,
  bookingRescheduledEmail,
  bookingCancelledEmail,
  bookingCompletedEmail,
  welcomeEmail,
  loginNotificationEmail
} = require('./emailTemplates');

// Main email sending function
const sendEmail = async (to, subject, html) => {
  try {
    // Skip if email is not configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('📧 Email not configured - skipping email send');
      return { success: false, message: 'Email not configured' };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `${emailConfig.from.name} <${emailConfig.from.address}>`,
      to,
      subject,
      html,
      replyTo: emailConfig.replyTo
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${subject}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

// Booking event email functions
const emailService = {
  // Send booking created emails (to both customer and mechanic)
  sendBookingCreatedEmails: async (booking) => {
    try {
      const customerEmail = booking.owner.email;
      const mechanicEmail = booking.mechanic.email;

      // Send to customer
      const customerTemplate = bookingCreatedCustomerEmail(booking);
      const customerResult = await sendEmail(
        customerEmail,
        customerTemplate.subject,
        customerTemplate.html
      );

      // Send to mechanic
      const mechanicTemplate = bookingCreatedMechanicEmail(booking);
      const mechanicResult = await sendEmail(
        mechanicEmail,
        mechanicTemplate.subject,
        mechanicTemplate.html
      );

      return {
        success: true,
        customer: customerResult,
        mechanic: mechanicResult
      };
    } catch (error) {
      console.error('Error sending booking created emails:', error);
      return { success: false, error: error.message };
    }
  },

  // Send booking confirmed email (to customer)
  sendBookingConfirmedEmail: async (booking) => {
    try {
      const template = bookingConfirmedEmail(booking);
      const result = await sendEmail(
        booking.owner.email,
        template.subject,
        template.html
      );
      return result;
    } catch (error) {
      console.error('Error sending booking confirmed email:', error);
      return { success: false, error: error.message };
    }
  },

  // Send booking rescheduled email (to customer)
  sendBookingRescheduledEmail: async (booking, oldDate, oldTime) => {
    try {
      const template = bookingRescheduledEmail(booking, oldDate, oldTime);
      const result = await sendEmail(
        booking.owner.email,
        template.subject,
        template.html
      );
      
      // Also notify mechanic
      await sendEmail(
        booking.mechanic.email,
        `Booking Rescheduled - ${booking.service.serviceName}`,
        `<p>A booking has been rescheduled:</p>
         <p><strong>Customer:</strong> ${booking.owner.name}</p>
         <p><strong>Service:</strong> ${booking.service.serviceName}</p>
         <p><strong>New Date:</strong> ${new Date(booking.bookingDate).toLocaleDateString()}</p>
         <p><strong>New Time:</strong> ${booking.bookingTime}</p>`
      );

      return result;
    } catch (error) {
      console.error('Error sending booking rescheduled email:', error);
      return { success: false, error: error.message };
    }
  },

  // Send booking cancelled email (to both customer and mechanic)
  sendBookingCancelledEmail: async (booking, cancelledBy = 'customer') => {
    try {
      const template = bookingCancelledEmail(booking, cancelledBy);
      
      // Send to customer
      const customerResult = await sendEmail(
        booking.owner.email,
        template.subject,
        template.html
      );

      // Notify mechanic
      const mechanicResult = await sendEmail(
        booking.mechanic.email,
        `Booking Cancelled - ${booking.service.serviceName}`,
        `<p>A booking has been cancelled:</p>
         <p><strong>Customer:</strong> ${booking.owner.name}</p>
         <p><strong>Service:</strong> ${booking.service.serviceName}</p>
         <p><strong>Date:</strong> ${new Date(booking.bookingDate).toLocaleDateString()}</p>
         <p><strong>Time:</strong> ${booking.bookingTime}</p>
         ${booking.cancellationReason ? `<p><strong>Reason:</strong> ${booking.cancellationReason}</p>` : ''}`
      );

      return {
        success: true,
        customer: customerResult,
        mechanic: mechanicResult
      };
    } catch (error) {
      console.error('Error sending booking cancelled email:', error);
      return { success: false, error: error.message };
    }
  },

  // Send booking completed email (to customer)
  sendBookingCompletedEmail: async (booking) => {
    try {
      const template = bookingCompletedEmail(booking);
      const result = await sendEmail(
        booking.owner.email,
        template.subject,
        template.html
      );
      return result;
    } catch (error) {
      console.error('Error sending booking completed email:', error);
      return { success: false, error: error.message };
    }
  },

  // Send custom email
  sendCustomEmail: async (to, subject, html) => {
    return await sendEmail(to, subject, html);
  },

  // Send welcome email (on registration)
  sendWelcomeEmail: async (user) => {
    try {
      const template = welcomeEmail(user);
      const result = await sendEmail(
        user.email,
        template.subject,
        template.html
      );
      return result;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  },

  // Send login notification (optional security feature)
  sendLoginNotification: async (user, req) => {
    try {
      const loginInfo = {
        timestamp: new Date(),
        ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
      };
      
      const template = loginNotificationEmail(user, loginInfo);
      const result = await sendEmail(
        user.email,
        template.subject,
        template.html
      );
      return result;
    } catch (error) {
      console.error('Error sending login notification:', error);
      return { success: false, error: error.message };
    }
  }
};

module.exports = emailService;

