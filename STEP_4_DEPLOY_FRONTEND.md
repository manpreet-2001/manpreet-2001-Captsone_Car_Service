# 🎨 STEP 4: DEPLOY FRONTEND (Vercel)

## 🎯 FREE Frontend Hosting

Vercel is **100% FREE** for frontend apps with unlimited bandwidth!

**Time needed: 10 minutes**

---

## 📋 STEP-BY-STEP:

### **STEP 1: Sign Up for Vercel**

1. Go to: **https://vercel.com/signup**

2. **Click:** "Continue with GitHub"

3. **Authorize** Vercel to access your repositories

---

### **STEP 2: Import Project**

1. **Dashboard** → Click: **"Add New..."** → **"Project"**

2. **Import Git Repository:**
   - Find: `car-service-mern`
   - Click: **"Import"**

---

### **STEP 3: Configure Project**

```
Framework Preset: Create React App ✅
(Vercel auto-detects this)

Root Directory: frontend
(Important! Your React app is in /frontend folder)

Build Command: npm run build
(Default is correct)

Output Directory: build
(Default is correct)

Install Command: npm install
(Default is correct)
```

---

### **STEP 4: Add Environment Variables**

**Click:** "Environment Variables" section

**Add this variable:**

```
Key: REACT_APP_API_URL
Value: https://car-service-api.onrender.com
(Your backend URL from Step 3)
```

**Important:** React requires `REACT_APP_` prefix!

---

### **STEP 5: Deploy!**

1. **Click:** **"Deploy"**

2. **Wait for build** (3-5 minutes)
   ```
   Building...
   ✅ Build completed
   Deploying...
   ✅ Deployment ready
   ```

3. **Get your URL:**
   ```
   https://car-service-mern.vercel.app
   (or custom domain you chose)
   ```

---

### **STEP 6: Update Backend FRONTEND_URL**

1. Go back to **Render dashboard**

2. **Your backend service** → **Environment**

3. **Edit** `FRONTEND_URL`:
   ```
   Old: http://localhost:3000
   New: https://car-service-mern.vercel.app
   ```

4. **Click:** "Save Changes"

5. Backend will auto-redeploy

---

### **STEP 7: Configure Axios in Frontend**

**Option A: Update index.js**

Edit `frontend/src/index.js`:

```javascript
import axios from 'axios';

// Set API base URL
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Intercept requests to add auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

Then commit and push:
```bash
git add frontend/src/index.js
git commit -m "Configure API URL for production"
git push
```

Vercel will auto-redeploy!

---

## ✅ TEST YOUR LIVE APP:

### **Step 1: Open Your App**
```
https://car-service-mern.vercel.app
```

### **Step 2: Test Features:**

1. **Register new user**
   - Should work ✅
   - Email should arrive ✅

2. **Login**
   - Should authenticate ✅

3. **Add vehicle**
   - Should save to cloud DB ✅

4. **Book service**
   - Should create booking ✅
   - Emails should send ✅

5. **Login as mechanic**
   - Should see bookings ✅

---

## 🎯 YOUR LIVE URLs:

```
Frontend: https://car-service-mern.vercel.app
Backend API: https://car-service-api.onrender.com
Database: MongoDB Atlas (cloud)
```

---

## 🔧 AUTOMATIC DEPLOYMENTS:

**Every time you push to GitHub:**

```
git push
    ↓
GitHub receives code
    ↓
Vercel detects changes
    ↓
Auto-builds and deploys
    ↓
Live site updated! ✅
```

**Same for Render:**
- Push to GitHub → Backend auto-deploys

---

## 📊 DEPLOYMENT CHECKLIST:

- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Root directory set to `frontend`
- [ ] REACT_APP_API_URL added
- [ ] Deployment successful
- [ ] Live URL works
- [ ] Can register/login
- [ ] Backend connected
- [ ] Emails working

---

## 🐛 TROUBLESHOOTING:

### Issue: "API requests fail"
**Check:**
- REACT_APP_API_URL is set correctly
- Backend URL is correct
- CORS configured in backend
- No typos in environment variable

### Issue: "Build failed"
**Check Vercel logs:**
- Look for error message
- Usually missing dependencies
- Run `npm install` locally first

### Issue: "White screen"
**Solution:**
- Check browser console for errors
- Verify all routes work locally first
- Check React Router configuration

---

## ⚡ VERCEL FREE TIER:

```
✅ Unlimited deployments
✅ Unlimited bandwidth
✅ Automatic HTTPS/SSL
✅ Global CDN (fast worldwide)
✅ Auto-scaling
✅ Zero configuration
✅ Preview deployments
```

**No credit card required!**

---

## 🎨 CUSTOM DOMAIN (Optional):

Want custom domain like `carservice.com`?

1. Buy domain ($10-15/year)
2. Vercel → Settings → Domains
3. Add your domain
4. Update DNS records
5. Automatic HTTPS!

---

## 📝 SAVE THESE VALUES:

```
Frontend URL: https://car-service-mern.vercel.app
Backend URL: https://car-service-api.onrender.com
Database: MongoDB Atlas
```

---

## 🎉 YOU'RE LIVE!

Your car service platform is now:
- ✅ Deployed and accessible worldwide
- ✅ Using cloud database
- ✅ Sending emails
- ✅ 100% FREE hosting
- ✅ Auto-deploys on code changes

---

**Share your live URL:** `https://car-service-mern.vercel.app` 🌍✨

**Continue to:** `STEP_5_POST_DEPLOYMENT.md` for final setup!

