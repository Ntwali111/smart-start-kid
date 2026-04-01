# 🚀 Deployment Guide - Get Your App Live!

This guide will help you deploy Smart Start Kids to the internet with a public URL in **less than 30 minutes**.

## Quick Start: 3-Step Deployment (15 minutes)

### Step 1: Push Code to GitHub (5 min)

```bash
# Initialize git (if not already done)
cd smart-start-kids
git init
git add .
git commit -m "Initial commit: Smart Start Kids"

# Create repo on GitHub and add remote
git remote add origin https://github.com/YOUR_USERNAME/smart-start-kids.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy Backend to Railway (5 min)

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `smart-start-kids` repository
4. Railway auto-detects and sets up PostgreSQL! 🎉
5. Go to **Settings** → **Variables** and add:
   ```
   JWT_SECRET=abc123def456ghi789jkl012mno345pqr  (any random string)
   FRONTEND_URL=https://your-vercel-url.vercel.app  (UPDATE AFTER STEP 3)
   ```
6. Click **"Deploy"** and wait ~2-3 min
7. Copy your Railway URL: `https://your-railway-app.railway.app`

### Step 3: Deploy Frontend to Vercel (5 min)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"New Project"** → Select your `smart-start-kids` repo
3. **Root Directory**: Set to `./frontend`
4. **Environment Variables** → Add:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app
   ```
5. Click **"Deploy"** and wait ~1-2 min
6. Get your Vercel URL: `https://smart-start-kids-[random].vercel.app` ✨
7. Go back to Railway and update `FRONTEND_URL` to your Vercel URL
8. Redeploy Railway

**DONE! 🎉 Your app is now live!**

---

## Full Deployment Options

### Option A: Railway + Vercel (Recommended - Free tier available)

**Why?** Easiest setup, great free tier, automatic deployments from Git

#### Backend on Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Click "Start New Project"
   - Sign in with GitHub (authorize Railway)

2. **Deploy Backend**
   - Select "Deploy from GitHub repo"
   - Choose your `smart-start-kids` repo
   - Railway shows:
     - Your backend service will be created
     - PostgreSQL database will be created automatically
   - Click "Deploy" and wait for build to complete (2-3 minutes)

3. **Get Backend URL**
   - Once deployed, copy your service URL
   - Will look like: `https://something-something.railway.app`
   - This is your `NEXT_PUBLIC_API_URL` for frontend

4. **Set Backend Environment Variables**
   - Click into your Railway project
   - Go to **Variables**
   - Add these:
     ```
     JWT_SECRET = (generate a random string, e.g., abc123xyz789)
     FRONTEND_URL = (will add after Vercel deployment)
     ```
   - The database URL is auto-configured! ✓

#### Frontend on Vercel

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Click "Sign Up"
   - Choose "Continue with GitHub"

2. **Deploy Frontend**
   - Click "New Project"
   - Select your GitHub repo
   - **Important**: Set **Root Directory** to `./frontend`
   - Click "Continue"

3. **Add Environment Variables**
   - Under "Environment Variables":
     ```
     NEXT_PUBLIC_API_URL = https://your-railway-backend-url.railway.app
     ```
   - Click "Deploy"

4. **Get Frontend URL**
   - After ~1-2 min: You get a URL like `https://smart-start-kids-xyz.vercel.app`
   - This is your public app URL! 🎉

5. **Update Railway Backend**
   - Go back to Railway dashboard
   - Update `FRONTEND_URL` variable to your Vercel URL
   - Redeploy Railway for CORS to work

#### How Deployments Work

```
GitHub Push
    ↓
Railway sees code update → Auto-rebuilds backend → Updates live
Vercel sees code update → Auto-rebuilds frontend → Updates live
```

---

### Option B: Render + Vercel (Alternative)

**Why?** Good free tier, simple dashboard

#### Backend on Render

1. Go to [render.com](https://render.com) → "New +" → "Web Service"
2. Connect GitHub
3. Fill in:
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm run start`
4. Add Environment Variables:
   ```
   PORT = 4000
   JWT_SECRET = your_random_secret_here
   FRONTEND_URL = https://your-vercel-url.vercel.app
   DATABASE_URL = provided by Render PostgreSQL
   ```
5. Click "Create Web Service"
6. Get your URL (looks like https://app-name.onrender.com)

#### Frontend still on Vercel (same as above)

---

### Option C: Docker Compose (For Local Production Testing)

```bash
# Create docker-compose.yml
version: '3.8'
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: smart_start_kids
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: ./backend
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: "postgresql://postgres:postgres@db:5432/smart_start_kids"
      FRONTEND_URL: "http://localhost:3000"
      JWT_SECRET: "dev-secret-123"
    depends_on:
      - db

  frontend:
    build:
      context: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: "http://localhost:4000"

volumes:
  postgres_data:

# Run with:
docker-compose up
```

---

## Environment Variables Reference

### Backend (.env)
```env
# PostgreSQL Connection
DATABASE_URL="postgresql://postgres:password@localhost:5432/smart_start_kids"

# Server Settings
PORT=4000
FRONTEND_URL="http://localhost:3000"  # or your deployed frontend URL

# Security
JWT_SECRET="your-super-secret-key-12345"
```

### Frontend (.env.local)
```env
# Backend API
NEXT_PUBLIC_API_URL="http://localhost:4000"  # or your deployed backend URL
```

---

## Continuous Deployment Setup

Both Railway and Vercel auto-deploy on Git push:

1. Make changes locally
2. Commit and push to GitHub
   ```bash
   git add .
   git commit -m "Fix bug"
   git push
   ```
3. Both services detect the push
4. Backend rebuilds on Railway (~2 min) ✓
5. Frontend rebuilds on Vercel (~1 min) ✓
6. Your live app updates automatically! 🚀

---

## Custom Domain (Optional)

### Add Domain to Vercel
1. Buy domain from GoDaddy, Namecheap, etc.
2. In Vercel dashboard → Project Settings → Domains
3. Add your domain
4. Follow DNS setup instructions
5. Your app is now at: `https://myapp.com`

### Add Domain to Railway
Similar process in Railway dashboard → Domain settings

---

## Monitoring & Troubleshooting

### Check Backend Logs
- **Railway**: Dashboard → Services → Logs
- **Render**: Check "Logs" tab

### Check Frontend Logs
- **Vercel**: Dashboard → Deployments → View logs

### Common Issues

**Frontend shows blank page**
- Check browser console (F12)
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Restart frontend build

**API errors on frontend**
- Verify backend URL is correct
- Check backend CORS settings
- Look at backend logs

**Database not found**
- Railway/Render auto-creates database
- Run migrations: `npx prisma migrate deploy`

---

## Free Tier Limits

| Service | Free Tier | Good For |
|---------|-----------|----------|
| Railway | $5 monthly | Perfect for hobby projects |
| Vercel | Unlimited deployments | Frontend hosting included free |
| Render | Free tier with limits | Backend good for starting out |
| PostgreSQL | Included (Railway/Render) | Excellent for education projects |

---

## Security Checklist Before Going Public

- [ ] JWT_SECRET is not committed to Git
- [ ] Database URL not in Git
- [ ] HTTPS enabled (all platforms do this)
- [ ] CORS only allows your frontend domain
- [ ] Passwords hashed in database
- [ ] No sensitive data in .env files

---

## Example Live Deployment URLs

After following this guide, your URLs will look like:

```
Frontend: https://smart-start-kids-abc123.vercel.app
Backend:  https://smart-start-kids-prod.railway.app
```

**These are your public URLs to share! 🎉**

---

## Rollback to Previous Version

```bash
# Railway/Vercel both keep deployment history
# Just click "Redeploy" on a previous version in the dashboard
```

---

## Next Steps

1. ✅ Deploy to Railway + Vercel (this guide)
2. 📧 Add email notifications
3. 👥 Add teachers management
4. 📊 Add analytics dashboard
5. 🌍 Add multi-language support

---

**You're ready to go live! Deploy now and share your app! 🚀**
