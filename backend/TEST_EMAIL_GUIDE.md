# 🧪 How to Test Email Functionality

## ❌ Current Status: Email Not Configured

The test shows: `📧 Email not configured - skipping email send`

This means you need to add email credentials to your `.env` file first.

---

## ✅ Step-by-Step Testing Guide

### **Step 1: Configure Email (Choose One Option)**

#### **Option A: Gmail (Easiest for Testing)**

1. **Get Gmail App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - You need 2-Factor Authentication enabled first
   - Create app password for "Car Service"
   - Copy the 16-character password

2. **Create `.env` file in backend folder:**

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop

# Email Display
EMAIL_FROM_NAME=Car Service Platform
EMAIL_FROM=your-email@gmail.com
EMAIL_REPLY_TO=your-email@gmail.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Other existing variables (keep your MongoDB, JWT, etc.)
MONGODB_URI=mongodb://localhost:27017/carservice
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

#### **Option B: Test with Mailtrap (For Development)**

Mailtrap catches all emails without actually sending them - perfect for testing!

1. Sign up at: https://mailtrap.io (free)
2. Get your SMTP credentials from the inbox
3. Add to `.env`:

```env
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_mailtrap_username
EMAIL_PASSWORD=your_mailtrap_password
EMAIL_FROM=test@carservice.com
EMAIL_FROM_NAME=Car Service Platform
FRONTEND_URL=http://localhost:3000
```

---

### **Step 2: Verify Configuration**

Run this command:

```bash
cd backend
node src/utils/testEmail.js
```

**What You Should See:**

✅ **Success:**
```
✅ Email server is ready to send messages
✅ Email sent to your@email.com: Booking Confirmation
✅ Email sent to your@email.com: Booking Confirmed
✅ Email sent to your@email.com: Service Completed
```

❌ **Failure:**
```
❌ Email send error: Invalid login
```
→ Check your credentials are correct

---

### **Step 3: Test with Real Booking**

#### **Method A: Through Frontend**

1. **Start Backend Server:**
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Create a Test Booking:**
   - Login as a customer
   - Go to "Book Service"
   - Select vehicle and service
   - Choose date/time
   - Submit booking

4. **Check Emails:**
   - Customer should receive booking confirmation
   - Mechanic should receive new booking notification

#### **Method B: Using Postman/API**

1. **Start Server:**
   ```bash
   npm start
   ```

2. **Login and Get Token:**
   ```http
   POST http://localhost:5000/api/auth/login
   Content-Type: application/json

   {
     "email": "owner@example.com",
     "password": "password123"
   }
   ```

3. **Create Booking:**
   ```http
   POST http://localhost:5000/api/bookings
   Authorization: Bearer YOUR_TOKEN
   Content-Type: application/json

   {
     "vehicle": "VEHICLE_ID",
     "service": "SERVICE_ID",
     "bookingDate": "2024-12-25",
     "bookingTime": "10:00",
     "serviceLocation": "at_garage"
   }
   ```

4. **Check Console Logs:**
   ```
   ✅ Email sent to customer@example.com: Booking Confirmation
   ✅ Email sent to mechanic@example.com: New Booking Request
   ```

---

### **Step 4: Monitor Email Logs**

Watch your backend console while testing. You'll see:

```bash
✅ Email server is ready to send messages      # On server start
✅ Email sent to john@example.com: Booking Confirmation - ${messageId}
✅ Email sent to mechanic@example.com: New Booking Request
```

---

## 🔍 Troubleshooting Checklist

### ❌ "Email not configured"
- [ ] `.env` file exists in `backend` folder
- [ ] `EMAIL_USER` is set in `.env`
- [ ] `EMAIL_PASSWORD` is set in `.env`
- [ ] No typos in variable names
- [ ] Server restarted after adding `.env`

### ❌ "Invalid login" (Gmail)
- [ ] 2-Factor Authentication is enabled
- [ ] Using **app password**, not regular Gmail password
- [ ] App password has no spaces (16 chars straight)
- [ ] Email address is correct

### ❌ "Connection timeout"
- [ ] Check internet connection
- [ ] Try port 465 instead of 587
- [ ] Check firewall settings
- [ ] Verify SMTP host is correct

### ❌ Emails not arriving
- [ ] Check spam/junk folder
- [ ] Verify recipient email is correct
- [ ] Check console logs for "Email sent" message
- [ ] Test with different email address

### ❌ Emails sent but bookings work
✅ **This is normal!** Emails are non-blocking - if email fails, booking still succeeds.

---

## 📧 What Emails to Expect

### 1. **When Booking Created:**
- ✉️ **Customer:** "🎉 Booking Confirmed!"
  - Booking details
  - Mechanic info
  - Next steps
  
- ✉️ **Mechanic:** "🔔 New Booking Request"
  - Customer info
  - Service details
  - Action required

### 2. **When Mechanic Confirms:**
- ✉️ **Customer:** "✅ Booking Confirmed!"
  - Confirmed appointment details
  - Important reminders

### 3. **When Rescheduled:**
- ✉️ **Customer:** "🔄 Booking Rescheduled"
  - Old vs new schedule
  - Updated details

### 4. **When Cancelled:**
- ✉️ **Both:** "❌ Booking Cancelled"
  - Cancellation details
  - Rebooking options

### 5. **When Completed:**
- ✉️ **Customer:** "✨ Service Completed!"
  - Service summary
  - Review request

---

## 🎯 Quick Test Commands

```bash
# 1. Test email configuration
node src/utils/testEmail.js

# 2. Check environment variables
node -e "console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not Set')"

# 3. Verify email server
node -e "require('./src/config/email').verifyEmailConfig()"

# 4. Check if .env file exists
ls .env

# 5. View email config (without password)
node -e "require('dotenv').config(); console.log('Service:', process.env.EMAIL_SERVICE); console.log('User:', process.env.EMAIL_USER);"
```

---

## ✅ Success Indicators

You'll know it's working when:

1. **Console shows:**
   ```
   ✅ Email server is ready to send messages
   ✅ Email sent to user@example.com
   ```

2. **Test script succeeds:**
   ```
   ✅ Booking created emails sent successfully!
   ✅ Booking confirmed email sent successfully!
   ```

3. **Emails arrive in inbox**
   - Check inbox (and spam folder)
   - Look for sender: "Car Service Platform"

4. **Bookings work AND emails send**
   - Booking created successfully
   - Confirmation email received
   - Mechanic notification received

---

## 💡 Pro Tips

1. **Start with Mailtrap** for safe testing (no real emails sent)
2. **Check spam folder** - new senders often land there
3. **Use Gmail** for quick setup (easiest to configure)
4. **Monitor console logs** - they tell you everything
5. **Test each event** - create, confirm, reschedule, cancel, complete

---

## 📱 Mobile Testing

Emails are mobile-responsive! Test on:
- Gmail mobile app
- iPhone Mail
- Android email clients
- Outlook mobile

---

## 🆘 Still Not Working?

1. **Share console logs** - Look for error messages
2. **Verify .env contents** - Make sure variables are set
3. **Test with different email** - Rule out email-specific issues
4. **Check email service status** - Gmail/SMTP might be down
5. **Try Mailtrap first** - Eliminates real email delivery issues

---

## 📊 Example Test Results

### ✅ Working Configuration:
```bash
$ node src/utils/testEmail.js
🧪 Testing Email Configuration...
📧 Test emails will be sent to: john@example.com

1️⃣ Testing Booking Created Email...
✅ Booking created emails sent successfully!

2️⃣ Testing Booking Confirmed Email...
✅ Booking confirmed email sent successfully!

3️⃣ Testing Booking Completed Email...
✅ Booking completed email sent successfully!

🎉 Email tests completed!
📬 Check your inbox at: john@example.com
```

### ❌ Not Configured:
```bash
$ node src/utils/testEmail.js
📧 Email not configured - skipping email send
❌ Failed to send booking confirmed email: undefined
```
→ **Action:** Add EMAIL_USER and EMAIL_PASSWORD to .env

---

## 🎉 Next Steps After Success

1. ✅ Email working with test script
2. ✅ Test with real booking via frontend
3. ✅ Verify both customer and mechanic receive emails
4. ✅ Test all events: create, confirm, reschedule, cancel, complete
5. ✅ Check emails display correctly on mobile
6. ✅ Customize templates if needed

---

**Need Help?** Run: `node src/utils/testEmail.js` and share the output!

