# 🔄 HOW TO RESTART SERVER FOR EMAIL TO WORK

## ❗ IMPORTANT

The email notification code is already implemented, but you need to RESTART your backend server to activate it!

---

## ✅ STEPS TO RESTART:

### Step 1: Stop Current Server

In the terminal where backend is running:
- Press: `Ctrl + C` (to stop the server)

### Step 2: Restart Server

```bash
npm start
```

### Step 3: Look for This Message

When server starts, you should see:

```
✅ Email server is ready to send messages
Server running on port 5000
MongoDB Connected
```

If you see "✅ Email server is ready" - emails will work!

---

## 🧪 TEST AFTER RESTART

1. Create a new booking as Manpreet
2. Owen accepts it
3. Check console logs for:
   ```
   ✅ Email sent to manpreet@gmail.com: Booking Confirmed
   ```
4. Check email inbox!

---

## 🔍 TROUBLESHOOTING

### Issue: Email still not sending after restart

Check backend console when mechanic clicks "Accept":
- Look for: `✅ Email sent to...`
- OR: `❌ Failed to send status update email`

### If you see errors:

Share the error message so I can help fix it!

---

**TL;DR:** Stop backend (`Ctrl+C`) and restart (`npm start`). Emails will work!

