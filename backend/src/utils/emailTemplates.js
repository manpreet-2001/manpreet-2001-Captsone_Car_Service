// Email template helpers
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatTime = (time) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

// Base email styles
const emailStyles = `
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #1e3c72 0%, #2c5282 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      background: white;
      padding: 30px;
      border: 1px solid #e2e8f0;
      border-top: none;
    }
    .booking-details {
      background: #f7fafc;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #1e3c72;
    }
    .detail-row {
      display: flex;
      padding: 8px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .label {
      font-weight: bold;
      width: 150px;
      color: #4a5568;
    }
    .value {
      color: #2d3748;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #1e3c72;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
    .footer {
      background: #f7fafc;
      padding: 20px;
      text-align: center;
      color: #718096;
      font-size: 14px;
      border-radius: 0 0 10px 10px;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: bold;
    }
    .status-confirmed {
      background: #d1fae5;
      color: #065f46;
    }
    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }
    .status-cancelled {
      background: #fee2e2;
      color: #991b1b;
    }
    .status-rescheduled {
      background: #dbeafe;
      color: #1e40af;
    }
  </style>
`;

// 1. Booking Created - Email to Customer
const bookingCreatedCustomerEmail = (booking) => {
  return {
    subject: `Booking Confirmation - ${booking.service.serviceName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        ${emailStyles}
      </head>
      <body>
        <div class="header">
          <h1>🎉 Booking Confirmed!</h1>
        </div>
        <div class="content">
          <p>Dear ${booking.owner.name},</p>
          <p>Thank you for booking with us! Your service appointment has been successfully created.</p>
          
          <div class="booking-details">
            <h3 style="margin-top: 0;">Booking Details</h3>
            <div class="detail-row">
              <span class="label">Service:</span>
              <span class="value">${booking.service.serviceName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${formatDate(booking.bookingDate)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">${formatTime(booking.bookingTime)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Duration:</span>
              <span class="value">${booking.estimatedDuration} minutes</span>
            </div>
            <div class="detail-row">
              <span class="label">Mechanic:</span>
              <span class="value">${booking.mechanic.name}</span>
            </div>
            <div class="detail-row">
              <span class="label">Vehicle:</span>
              <span class="value">${booking.vehicle.make} ${booking.vehicle.model} (${booking.vehicle.licensePlate})</span>
            </div>
            <div class="detail-row">
              <span class="label">Estimated Cost:</span>
              <span class="value">$${booking.estimatedCost}</span>
            </div>
            <div class="detail-row">
              <span class="label">Status:</span>
              <span class="value"><span class="status-badge status-${booking.status}">${booking.status.toUpperCase()}</span></span>
            </div>
          </div>

          ${booking.specialInstructions ? `
            <div style="background: #fffbeb; padding: 15px; border-radius: 6px; border-left: 3px solid #f59e0b;">
              <strong>Special Instructions:</strong>
              <p style="margin: 5px 0 0 0;">${booking.specialInstructions}</p>
            </div>
          ` : ''}

          <p><strong>What's Next?</strong></p>
          <ul>
            <li>Your mechanic will review and confirm your booking</li>
            <li>You'll receive a confirmation email once approved</li>
            <li>Please arrive 5 minutes before your scheduled time</li>
          </ul>

          <p>If you need to reschedule or cancel, please log in to your dashboard.</p>
        </div>
        <div class="footer">
          <p>Car Service Platform - Your trusted automotive service partner</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `
  };
};

// 2. Booking Created - Email to Mechanic
const bookingCreatedMechanicEmail = (booking) => {
  return {
    subject: `New Booking Request - ${booking.service.serviceName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        ${emailStyles}
      </head>
      <body>
        <div class="header">
          <h1>🔔 New Booking Request</h1>
        </div>
        <div class="content">
          <p>Dear ${booking.mechanic.name},</p>
          <p>You have received a new booking request that requires your attention.</p>
          
          <div class="booking-details">
            <h3 style="margin-top: 0;">Booking Details</h3>
            <div class="detail-row">
              <span class="label">Customer:</span>
              <span class="value">${booking.owner.name}</span>
            </div>
            <div class="detail-row">
              <span class="label">Service:</span>
              <span class="value">${booking.service.serviceName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${formatDate(booking.bookingDate)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">${formatTime(booking.bookingTime)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Duration:</span>
              <span class="value">${booking.estimatedDuration} minutes</span>
            </div>
            <div class="detail-row">
              <span class="label">Vehicle:</span>
              <span class="value">${booking.vehicle.make} ${booking.vehicle.model} (${booking.vehicle.year})</span>
            </div>
            <div class="detail-row">
              <span class="label">License Plate:</span>
              <span class="value">${booking.vehicle.licensePlate}</span>
            </div>
            <div class="detail-row">
              <span class="label">Phone:</span>
              <span class="value">${booking.owner.phone || 'Not provided'}</span>
            </div>
          </div>

          ${booking.specialInstructions ? `
            <div style="background: #fffbeb; padding: 15px; border-radius: 6px; border-left: 3px solid #f59e0b;">
              <strong>Customer Notes:</strong>
              <p style="margin: 5px 0 0 0;">${booking.specialInstructions}</p>
            </div>
          ` : ''}

          <p><strong>Action Required:</strong></p>
          <p>Please log in to your dashboard to confirm or reschedule this booking.</p>
          
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/mechanic-dashboard" class="button">
            View Booking
          </a>
        </div>
        <div class="footer">
          <p>Car Service Platform - Mechanic Portal</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `
  };
};

// 3. Booking Confirmed
const bookingConfirmedEmail = (booking) => {
  return {
    subject: `✅ Booking Confirmed - ${booking.service.serviceName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        ${emailStyles}
      </head>
      <body>
        <div class="header">
          <h1>✅ Booking Confirmed!</h1>
        </div>
        <div class="content">
          <p>Dear ${booking.owner.name},</p>
          <p>Great news! Your booking has been confirmed by ${booking.mechanic.name}.</p>
          
          <div class="booking-details">
            <h3 style="margin-top: 0;">Confirmed Appointment</h3>
            <div class="detail-row">
              <span class="label">Service:</span>
              <span class="value">${booking.service.serviceName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${formatDate(booking.bookingDate)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">${formatTime(booking.bookingTime)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Location:</span>
              <span class="value">${booking.serviceLocation === 'at_garage' ? 'At Garage' : 'Mobile Service'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Estimated Cost:</span>
              <span class="value">$${booking.estimatedCost}</span>
            </div>
          </div>

          <div style="background: #d1fae5; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <strong style="color: #065f46;">📍 Important Reminders:</strong>
            <ul style="margin: 10px 0 0 0; color: #047857;">
              <li>Please arrive 5 minutes before your scheduled time</li>
              <li>Bring your vehicle documents</li>
              <li>Have any questions? Contact your mechanic directly</li>
            </ul>
          </div>

          <p>We look forward to serving you!</p>
        </div>
        <div class="footer">
          <p>Car Service Platform</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `
  };
};

// 4. Booking Rescheduled
const bookingRescheduledEmail = (booking, oldDate, oldTime) => {
  return {
    subject: `🔄 Booking Rescheduled - ${booking.service.serviceName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        ${emailStyles}
      </head>
      <body>
        <div class="header">
          <h1>🔄 Booking Rescheduled</h1>
        </div>
        <div class="content">
          <p>Dear ${booking.owner.name},</p>
          <p>Your booking has been rescheduled. Here are the updated details:</p>
          
          <div style="background: #fee2e2; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <strong style="color: #991b1b;">Previous Schedule:</strong>
            <p style="margin: 5px 0 0 0; color: #dc2626;">
              📅 ${formatDate(oldDate)} at ${formatTime(oldTime)}
            </p>
          </div>

          <div style="background: #d1fae5; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <strong style="color: #065f46;">New Schedule:</strong>
            <p style="margin: 5px 0 0 0; color: #047857;">
              📅 ${formatDate(booking.bookingDate)} at ${formatTime(booking.bookingTime)}
            </p>
          </div>
          
          <div class="booking-details">
            <h3 style="margin-top: 20px;">Booking Details</h3>
            <div class="detail-row">
              <span class="label">Service:</span>
              <span class="value">${booking.service.serviceName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Mechanic:</span>
              <span class="value">${booking.mechanic.name}</span>
            </div>
            <div class="detail-row">
              <span class="label">Duration:</span>
              <span class="value">${booking.estimatedDuration} minutes</span>
            </div>
            <div class="detail-row">
              <span class="label">Status:</span>
              <span class="value"><span class="status-badge status-rescheduled">RESCHEDULED</span></span>
            </div>
          </div>

          <p>If you have any questions about this change, please contact us.</p>
        </div>
        <div class="footer">
          <p>Car Service Platform</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `
  };
};

// 5. Booking Cancelled
const bookingCancelledEmail = (booking, cancelledBy) => {
  return {
    subject: `❌ Booking Cancelled - ${booking.service.serviceName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        ${emailStyles}
      </head>
      <body>
        <div class="header" style="background: linear-gradient(135deg, #991b1b 0%, #dc2626 100%);">
          <h1>❌ Booking Cancelled</h1>
        </div>
        <div class="content">
          <p>Dear ${booking.owner.name},</p>
          <p>Your booking has been cancelled ${cancelledBy === 'customer' ? 'as per your request' : 'by the service provider'}.</p>
          
          <div class="booking-details">
            <h3 style="margin-top: 0;">Cancelled Booking</h3>
            <div class="detail-row">
              <span class="label">Service:</span>
              <span class="value">${booking.service.serviceName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${formatDate(booking.bookingDate)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">${formatTime(booking.bookingTime)}</span>
            </div>
            ${booking.cancellationReason ? `
            <div class="detail-row">
              <span class="label">Reason:</span>
              <span class="value">${booking.cancellationReason}</span>
            </div>
            ` : ''}
          </div>

          <p>Would you like to book another appointment? Visit our services page to schedule a new service.</p>
          
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/services" class="button">
            Browse Services
          </a>
        </div>
        <div class="footer">
          <p>Car Service Platform</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `
  };
};

// 6. Booking Completed
const bookingCompletedEmail = (booking) => {
  return {
    subject: `✨ Service Completed - ${booking.service.serviceName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        ${emailStyles}
      </head>
      <body>
        <div class="header" style="background: linear-gradient(135deg, #065f46 0%, #059669 100%);">
          <h1>✨ Service Completed!</h1>
        </div>
        <div class="content">
          <p>Dear ${booking.owner.name},</p>
          <p>Your service has been successfully completed. Thank you for choosing our service!</p>
          
          <div class="booking-details">
            <h3 style="margin-top: 0;">Service Summary</h3>
            <div class="detail-row">
              <span class="label">Service:</span>
              <span class="value">${booking.service.serviceName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Completed On:</span>
              <span class="value">${formatDate(booking.bookingDate)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Mechanic:</span>
              <span class="value">${booking.mechanic.name}</span>
            </div>
            <div class="detail-row">
              <span class="label">Total Cost:</span>
              <span class="value">$${booking.actualCost || booking.estimatedCost}</span>
            </div>
          </div>

          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="margin-top: 0; color: #1e40af;">⭐ How was your experience?</h3>
            <p>Your feedback helps us improve our services</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">
              Leave a Review
            </a>
          </div>

          <p>We hope to serve you again soon!</p>
        </div>
        <div class="footer">
          <p>Car Service Platform</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `
  };
};

// 6. Welcome Email - New User Registration
const welcomeEmail = (user) => {
  const roleMessages = {
    owner: {
      title: 'Welcome to Car Service Platform!',
      message: 'Start by adding your vehicles and booking your first service.',
      nextSteps: [
        'Add your vehicle details',
        'Browse available services',
        'Book your first appointment',
        'Leave reviews after service completion'
      ]
    },
    mechanic: {
      title: 'Welcome Mechanic!',
      message: 'Start offering your services to customers today.',
      nextSteps: [
        'Add your specializations and services',
        'Set your availability schedule',
        'Manage booking requests',
        'Build your reputation with great reviews'
      ]
    },
    admin: {
      title: 'Admin Access Granted',
      message: 'You now have full administrative access to the platform.',
      nextSteps: [
        'Monitor all bookings and users',
        'View analytics and reports',
        'Manage platform settings',
        'Support customers and mechanics'
      ]
    }
  };

  const roleInfo = roleMessages[user.role] || roleMessages.owner;

  return {
    subject: `🎉 ${roleInfo.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        ${emailStyles}
      </head>
      <body>
        <div class="header">
          <h1>🎉 Welcome to Car Service!</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.name}! 👋</h2>
          <p>${roleInfo.message}</p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0284c7;">
            <h3 style="margin-top: 0; color: #0c4a6e;">Your Account Details</h3>
            <div class="detail-row">
              <span class="label">Name:</span>
              <span class="value">${user.name}</span>
            </div>
            <div class="detail-row">
              <span class="label">Email:</span>
              <span class="value">${user.email}</span>
            </div>
            <div class="detail-row">
              <span class="label">Role:</span>
              <span class="value"><span class="status-badge status-confirmed">${user.role.toUpperCase()}</span></span>
            </div>
            <div class="detail-row">
              <span class="label">Account Status:</span>
              <span class="value"><span class="status-badge status-confirmed">ACTIVE</span></span>
            </div>
          </div>

          <h3>🚀 Getting Started:</h3>
          <ul style="line-height: 2;">
            ${roleInfo.nextSteps.map(step => `<li>${step}</li>`).join('')}
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">
              Go to Dashboard
            </a>
          </div>

          <div style="background: #fffbeb; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <strong>🔐 Security Tips:</strong>
            <ul style="margin: 10px 0 0 0; color: #92400e;">
              <li>Never share your password with anyone</li>
              <li>Use a strong, unique password</li>
              <li>Log out when using shared devices</li>
            </ul>
          </div>

          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Happy servicing! 🚗</p>
        </div>
        <div class="footer">
          <p>Car Service Platform - Your Trusted Automotive Partner</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `
  };
};

// 7. Login Notification Email (Optional - for security)
const loginNotificationEmail = (user, loginInfo) => {
  return {
    subject: `🔐 New Login to Your Account`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        ${emailStyles}
      </head>
      <body>
        <div class="header" style="background: linear-gradient(135deg, #0c4a6e 0%, #0284c7 100%);">
          <h1>🔐 Account Login Detected</h1>
        </div>
        <div class="content">
          <p>Hello ${user.name},</p>
          <p>We detected a new login to your Car Service account.</p>
          
          <div class="booking-details">
            <h3 style="margin-top: 0;">Login Details</h3>
            <div class="detail-row">
              <span class="label">Account:</span>
              <span class="value">${user.email}</span>
            </div>
            <div class="detail-row">
              <span class="label">Role:</span>
              <span class="value">${user.role}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">${new Date(loginInfo.timestamp).toLocaleString()}</span>
            </div>
            <div class="detail-row">
              <span class="label">IP Address:</span>
              <span class="value">${loginInfo.ip || 'Unknown'}</span>
            </div>
          </div>

          <div style="background: #d1fae5; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <strong style="color: #065f46;">✅ Was this you?</strong>
            <p style="margin: 8px 0 0 0; color: #047857;">
              If you recognize this login, no action is needed. Welcome back!
            </p>
          </div>

          <div style="background: #fee2e2; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <strong style="color: #991b1b;">⚠️ Didn't recognize this login?</strong>
            <p style="margin: 8px 0 0 0; color: #dc2626;">
              If this wasn't you, please change your password immediately and contact our support team.
            </p>
          </div>

          <p>Thank you for using Car Service Platform!</p>
        </div>
        <div class="footer">
          <p>Car Service Platform - Security Notification</p>
          <p>This is an automated security message.</p>
        </div>
      </body>
      </html>
    `
  };
};

module.exports = {
  bookingCreatedCustomerEmail,
  bookingCreatedMechanicEmail,
  bookingConfirmedEmail,
  bookingRescheduledEmail,
  bookingCancelledEmail,
  bookingCompletedEmail,
  welcomeEmail,
  loginNotificationEmail
};

