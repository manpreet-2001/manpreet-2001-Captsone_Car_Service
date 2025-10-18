# 🖥️ STEP 3: DEPLOY BACKEND (Render.com)

## 🎯 FREE Backend Hosting

Render.com offers **FREE tier** perfect for your Node.js backend!

**Time needed: 15 minutes**

---

## 📋 STEP-BY-STEP:

### **STEP 1: Sign Up for Render**

1. Go to: **https://render.com**

2. Click: **"Get Started"**

3. **Sign up with GitHub** (easiest):
   - Click: "GitHub"
   - Authorize Render
   - ✅ This allows Render to access your repositories

---

### **STEP 2: Create Web Service**

1. **Dashboard** → Click: **"New +"**

2. Select: **"Web Service"**

3. **Connect Repository:**
   - Find: `car-service-mern`
   - Click: **"Connect"**

---

### **STEP 3: Configure Service**

Fill in these settings:

```
Name: car-service-api
(or any name you like)

Region: Oregon (US West) or closest to you

Branch: main

Root Directory: backend
(Important: tells Render where backend code is)

Runtime: Node

Build Command: npm install

Start Command: node src/server.js

Instance Type: Free
```

---

### **STEP 4: Add Environment Variables**

**CRITICAL:** Click **"Advanced"** → **"Add Environment Variable"**

Add each of these:

```
MONGODB_URI
mongodb+srv://username:password@cluster.mongodb.net/carservice

JWT_SECRET
your_super_secret_jwt_key_change_this_to_something_random

JWT_EXPIRE
7d

PORT
5000

NODE_ENV
production

EMAIL_SERVICE
gmail

EMAIL_USER
manpreet123singh987@gmail.com

EMAIL_PASSWORD
plsohynfxgbdkapo

EMAIL_FROM_NAME
Car Service Platform

EMAIL_FROM
manpreet123singh987@gmail.com

EMAIL_REPLY_TO
manpreet123singh987@gmail.com

FRONTEND_URL
https://your-app-name.vercel.app
(Leave as http://localhost:3000 for now, update after frontend deployment)
```

**How to add:**
- Click "+ Add Environment Variable"
- Key: [Variable name]
- Value: [Variable value]
- Repeat for each variable

---

### **STEP 5: Deploy!**

1. **Click:** **"Create Web Service"**

2. **Wait for deployment** (5-10 minutes)

3. **Watch logs:**
   ```
   ==> Building...
   ==> Installing dependencies...
   ==> Build successful
   ==> Starting server...
   ✅ MongoDB Connected
   ✅ Email server is ready
   Server running on port 5000
   ==> Your service is live!
   ```

4. **Get your URL:**
   ```
   https://car-service-api.onrender.com
   ```

---

### **STEP 6: Test Backend API**

Open in browser:
```
https://car-service-api.onrender.com/api/health
```

Should show:
```json
{
  "message": "Car Service API is running!",
  "status": "OK"
}
```

✅ Backend is live!

---

### **STEP 7: Seed Production Data**

You need to add services and admin user.

**Option A: Use Render Shell**

1. In Render dashboard → Your service
2. Click: **"Shell"** tab
3. Run commands:
   ```bash
   node src/utils/createAdmin.js
   node src/utils/seedServices.js
   ```

**Option B: Import via MongoDB Atlas**

1. Connect to Atlas using MongoDB Compass
2. Import your local data

---

## ⚠️ FREE TIER LIMITATIONS:

**Render Free Tier:**
```
✅ Unlimited bandwidth
⚠️ Spins down after 15 min inactivity
   (First request after sleep takes 30-60 seconds)
✅ 512MB RAM
✅ Shared CPU
✅ Automatic HTTPS
```

**Workaround for spin-down:**
- Use UptimeRobot (free service) to ping every 14 minutes
- Or upgrade to Starter plan ($7/month) for always-on

---

## 🔧 CORS CONFIGURATION:

Make sure your `backend/src/server.js` has:

```javascript
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'https://your-app.vercel.app'
  ],
  credentials: true
}));
```

---

## ✅ SUCCESS INDICATORS:

1. **Render dashboard shows:**
   ```
   ✅ Deploy succeeded
   ✅ Your service is live
   ```

2. **Backend logs show:**
   ```
   ✅ MongoDB Connected
   ✅ Email server is ready
   Server running on port 5000
   ```

3. **Health check works:**
   ```
   https://car-service-api.onrender.com/api/health
   Returns: {"status": "OK"}
   ```

4. **No errors in logs**

---

## 🎯 YOUR BACKEND URL:

After deployment, your API will be at:
```
https://car-service-api.onrender.com
```

**API endpoints:**
```
https://car-service-api.onrender.com/api/auth/login
https://car-service-api.onrender.com/api/bookings
https://car-service-api.onrender.com/api/services
etc.
```

---

## 📝 SAVE THESE:

```
Backend URL: https://car-service-api.onrender.com
MongoDB URI: mongodb+srv://...
Environment: Production
Status: ✅ Live
```

---

## 🚀 NEXT STEPS:

1. ✅ Backend deployed on Render
2. ✅ Connected to MongoDB Atlas
3. ✅ API endpoints live

**Continue to:** `STEP_4_DEPLOY_FRONTEND.md`

---

**Your backend API is now live and accessible worldwide!** 🌍✨

