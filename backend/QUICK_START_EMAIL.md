# ⚡ Quick Start - Email Notifications

## 🎯 What You Get
✅ Automatic email confirmations for all bookings
✅ Professional HTML email templates  
✅ Notifications to both customers and mechanics
✅ Support for Gmail and custom SMTP servers

---

## 🚀 Setup in 3 Minutes

### **Step 1: Get Gmail App Password** (2 minutes)

1. Go to your Gmail account → **Security Settings**
2. Enable **2-Factor Authentication** (if not already enabled)
3. Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. Create app password:
   - App: **Mail**
   - Device: **Other** (name it "Car Service")
5. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

### **Step 2: Configure Environment** (30 seconds)

Create/Edit `backend/.env` file and add:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop  # Your 16-char app password (no spaces!)

# Email Display Settings
EMAIL_FROM_NAME=Car Service Platform
EMAIL_FROM=your-email@gmail.com
EMAIL_REPLY_TO=your-email@gmail.com

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

### **Step 3: Test It!** (30 seconds)

```bash
cd backend
node src/utils/testEmail.js
```

You should see: ✅ Email sent successfully!
Check your inbox for 3 test emails.

---

## 📧 Emails That Get Sent Automatically

### When Customer Books Service:
- ✉️ Customer gets: **Booking confirmation** with details
- ✉️ Mechanic gets: **New booking notification**

### When Mechanic Confirms:
- ✉️ Customer gets: **Confirmed appointment** details

### When Booking Rescheduled:
- ✉️ Customer gets: **Updated schedule** (old vs new)
- ✉️ Mechanic gets: **Rescheduled notification**

### When Booking Cancelled:
- ✉️ Both get: **Cancellation confirmation**

### When Service Completed:
- ✉️ Customer gets: **Completion email** + review request

---

## 🔧 Troubleshooting

### ❌ "Invalid login" error
- Make sure you're using **app password**, not Gmail password
- Remove spaces from the 16-character password
- Verify 2FA is enabled

### ❌ "Email not configured"
- Check `.env` file exists in `backend` folder
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` are set
- Restart your server after adding env variables

### ❌ Emails not arriving
- Check spam/junk folder
- Verify email address is correct
- Run test script: `node src/utils/testEmail.js`
- Check console logs for errors

---

## 🎨 Customize Email Templates

Edit: `backend/src/utils/emailTemplates.js`

Change:
- Colors and styling
- Email content and wording  
- Company branding
- Button links

---

## 🏢 For Production

Use a professional email service like:

### SendGrid (Recommended)
```env
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com
```

### AWS SES
```env
EMAIL_SERVICE=smtp
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your_aws_ses_username
EMAIL_PASSWORD=your_aws_ses_password
EMAIL_FROM=noreply@yourdomain.com
```

---

## ✅ Verification Checklist

- [ ] `.env` file created with email settings
- [ ] Gmail app password generated (16 characters)
- [ ] Test script runs successfully
- [ ] Test emails received in inbox
- [ ] Server logs show: "✅ Email server is ready"
- [ ] Bookings trigger email notifications

---

## 📞 Need Help?

1. Read full guide: `backend/EMAIL_SETUP_GUIDE.md`
2. Check console logs for detailed errors
3. Run test: `node src/utils/testEmail.js`
4. Verify all environment variables are set

**Pro Tip:** Start with Gmail for testing, then switch to SendGrid/AWS SES for production!

---

## 🎉 You're Done!

Your car service platform now sends professional email confirmations automatically! 

**Test it:** Create a booking and check both customer and mechanic email inboxes.

