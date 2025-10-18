# 📧 Email Configuration Guide

## Overview
This guide will help you set up email notifications for booking confirmations in your Car Service application.

## 🚀 Quick Setup (Gmail - Recommended for Testing)

### Step 1: Create Gmail App Password

1. **Enable 2-Factor Authentication** on your Gmail account
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" as the app
   - Select "Other" as the device and name it "Car Service App"
   - Click "Generate"
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 2: Configure Environment Variables

Create a `.env` file in the `backend` directory (copy from `.env.example`):

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop  # 16-character app password (no spaces)

EMAIL_FROM_NAME=Car Service Platform
EMAIL_FROM=your-email@gmail.com
EMAIL_REPLY_TO=your-email@gmail.com

FRONTEND_URL=http://localhost:3000
```

### Step 3: Test Email Configuration

Run this command from the `backend` directory:

```bash
node -e "require('./src/config/email').verifyEmailConfig()"
```

You should see: ✅ Email server is ready to send messages

## 📝 What Emails Are Sent?

The system automatically sends emails for these events:

### 1. **Booking Created** 📅
- **To Customer**: Confirmation with booking details
- **To Mechanic**: New booking notification

### 2. **Booking Confirmed** ✅
- **To Customer**: Mechanic has confirmed the appointment

### 3. **Booking Rescheduled** 🔄
- **To Customer**: Updated booking details
- **To Mechanic**: Rescheduled appointment notification

### 4. **Booking Cancelled** ❌
- **To Customer**: Cancellation confirmation
- **To Mechanic**: Cancellation notification

### 5. **Booking Completed** ✨
- **To Customer**: Service completion with review request

## 🏢 Production Setup (Custom SMTP)

For production, use a professional email service:

### Option 1: SendGrid
```env
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com
```

### Option 2: AWS SES
```env
EMAIL_SERVICE=smtp
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your_aws_ses_username
EMAIL_PASSWORD=your_aws_ses_password
EMAIL_FROM=noreply@yourdomain.com
```

### Option 3: Mailgun
```env
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@yourdomain.com
EMAIL_PASSWORD=your_mailgun_password
EMAIL_FROM=noreply@yourdomain.com
```

## 🧪 Testing Email Functionality

### Test Email Service
```javascript
// backend/src/utils/testEmail.js
const emailService = require('./emailService');

const testBooking = {
  owner: { name: 'John Doe', email: 'customer@example.com' },
  mechanic: { name: 'Mike Smith', email: 'mechanic@example.com' },
  service: { serviceName: 'Oil Change' },
  vehicle: { make: 'Toyota', model: 'Camry', licensePlate: 'ABC123' },
  bookingDate: new Date(),
  bookingTime: '10:00',
  estimatedDuration: 60,
  estimatedCost: 50,
  status: 'pending'
};

emailService.sendBookingCreatedEmails(testBooking)
  .then(() => console.log('Test email sent!'))
  .catch(err => console.error('Test failed:', err));
```

## 🔒 Security Best Practices

1. **Never commit `.env` file** - Add it to `.gitignore`
2. **Use app-specific passwords** - Never use your actual Gmail password
3. **Rotate credentials regularly** in production
4. **Use environment-specific configs** - Different for dev/staging/production
5. **Enable email rate limiting** to prevent spam

## 🐛 Troubleshooting

### Issue: "Email not configured" message
**Solution**: Make sure `EMAIL_USER` and `EMAIL_PASSWORD` are set in `.env`

### Issue: "Invalid login" error with Gmail
**Solution**: 
- Make sure 2FA is enabled
- Use app-specific password, not regular password
- Remove spaces from the 16-character password

### Issue: "Connection timeout"
**Solution**: 
- Check firewall settings
- Try port 465 instead of 587
- Verify SMTP server address

### Issue: Emails going to spam
**Solution**:
- Set up SPF and DKIM records for your domain
- Use a verified sending domain
- Avoid spam trigger words in email content

## 📊 Email Logs

Email sending is logged in the console:
- ✅ Success: "Email sent to user@example.com: Subject"
- ❌ Failure: "Email send error: [error message]"

Note: Booking operations continue even if email fails - emails are non-blocking.

## 🎨 Customizing Email Templates

Email templates are in `backend/src/utils/emailTemplates.js`

You can customize:
- Colors and styles (inline CSS)
- Email content and wording
- Logo and branding
- Button links

## 🌐 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `EMAIL_SERVICE` | No | Email service type | `gmail` or `smtp` |
| `EMAIL_HOST` | Yes* | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | No | SMTP port | `587` or `465` |
| `EMAIL_USER` | Yes | Email username | `your@email.com` |
| `EMAIL_PASSWORD` | Yes | Email password/key | `your-app-password` |
| `EMAIL_FROM_NAME` | No | Sender name | `Car Service Platform` |
| `EMAIL_FROM` | No | From email address | `noreply@carservice.com` |
| `EMAIL_REPLY_TO` | No | Reply-to address | `support@carservice.com` |
| `FRONTEND_URL` | No | Frontend URL for links | `http://localhost:3000` |

*Required when `EMAIL_SERVICE=smtp`

## 📚 Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail App Passwords Guide](https://support.google.com/accounts/answer/185833)
- [SendGrid Setup](https://sendgrid.com/docs/)
- [AWS SES Setup](https://docs.aws.amazon.com/ses/)

## 🆘 Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with a simple email service first (Gmail)
4. Check your email service dashboard for delivery issues

