# Smart Start Kids 🎓

A comprehensive financial literacy learning platform for children with meaningful accounts for parents and facilitators to track progress.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Complete Setup Guide](#complete-setup-guide)
- [Deployment & Public URL](#deployment--public-url)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

Smart Start Kids is a full-stack web application that teaches children about financial literacy through interactive lessons, quizzes, and savings goals. It features three user roles:

- **Children**: Learn lessons, take quizzes, set savings goals
- **Parents**: Monitor their children's progress and achievements
- **Facilitators**: Manage classroom of students and track overall progress

**Tech Stack:**
- **Frontend**: Next.js 16 + React 19 + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with secure cookie storage
- **Deployment**: Vercel (Frontend) + Railway/Render (Backend)

---

## ✨ Features

### For Children
- 📓 Interactive lessons on financial topics
- 🎯 Knowledge-based quizzes with instant feedback
- 💰 Savings goal tracking
- 📊 Personal progress dashboard

### For Parents
- 👶 Link multiple children to monitor
- 📈 View child's lesson completion and quiz scores
- 💵 Track savings goals progress
- 📊 Detailed performance analytics

### For Facilitators
- 👨‍🏫 Manage entire class of students
- 📊 Class-wide statistics and metrics
- 🔍 Individual student performance tracking
- 📈 Progress trends and sorting options

---

## 🛠 Prerequisites

Before starting, ensure you have installed:

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **npm** or **yarn** (comes with Node.js)
- **PostgreSQL** v14+ ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))
- **VS Code** or your preferred code editor

### Verify Installation
```bash
node --version     # Should be v18 or higher
npm --version      # Should be v9 or higher
psql --version     # Should be v14 or higher
```

---

## 📚 Complete Setup Guide

Follow these steps **exactly in order** to get the project running:

### Step 1: Clone or Download the Project

```bash
# If you have a Git repository, clone it
git clone <your-repo-url>
cd smart-start-kids

# Or if you downloaded as ZIP, extract it and navigate to the folder
cd smart-start-kids
```

### Step 2: Set Up PostgreSQL Database

#### On Windows:

1. **Start PostgreSQL Service**
   - Open Task Manager → Services
   - Look for "postgresql-*" and ensure it's running
   - Or open PostgreSQL installer and select "Start the server"

2. **Create a New Database**
   ```bash
   # Open PowerShell as Administrator
   psql -U postgres
   
   # In the PostgreSQL prompt, run:
   CREATE DATABASE smart_start_kids;
   \q
   ```

#### On Mac:
```bash
# If using Homebrew
brew services start postgresql

# Create database
createdb smart_start_kids
```

#### On Linux:
```bash
# Start PostgreSQL service
sudo service postgresql start

# Connect and create database
sudo -u postgres psql
CREATE DATABASE smart_start_kids;
\q
```

### Step 3: Configure Environment Variables

#### Backend Setup

1. **Navigate to backend folder**
   ```bash
   cd backend
   ```

2. **Create `.env` file**
   ```bash
   # Windows (PowerShell)
   New-Item -Path ".env" -ItemType File
   
   # Mac/Linux
   touch .env
   ```

3. **Add environment variables to `.env`**
   ```env
   # Database Connection
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/smart_start_kids"
   
   # Server Configuration
   PORT=4000
   FRONTEND_URL="http://localhost:3000"
   
   # JWT Secret (create a random string)
   JWT_SECRET="your_random_jwt_secret_key_12345"
   ```

   **Important:** Replace `your_password` with your PostgreSQL password (default is often `postgres` or empty)

#### Frontend Setup

1. **Navigate to frontend folder**
   ```bash
   cd ../frontend
   ```

2. **Create `.env.local` file**
   ```bash
   # Windows (PowerShell)
   New-Item -Path ".env.local" -ItemType File
   
   # Mac/Linux
   touch .env.local
   ```

3. **Add environment variables to `.env.local`**
   ```env
   # Backend API URL
   NEXT_PUBLIC_API_URL="http://localhost:4000"
   ```

### Step 4: Install Backend Dependencies

```bash
# From the backend folder
cd backend

npm install
```

**Expected output:** Shows "added X packages" with no errors

### Step 5: Set Up Database Schema and Seed Data

```bash
# Still in backend folder

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed database with sample lessons and quizzes
npm run db:seed
```

**Expected output:** 
- Migration completes successfully
- Seed data created (10 sample lessons with quizzes)

### Step 6: Build and Start Backend

```bash
# Build TypeScript to JavaScript
npm run build

# Verify build succeeded (should show "dist/server.js" created)
ls dist/

# Check TypeScript compilation (should show exit code 0)
npx tsc --noEmit
```

**To keep backend running, use a new terminal:**
```bash
npm run dev
```

**Expected output:**
```
Server running on http://localhost:4000
```

### Step 7: Install Frontend Dependencies

```bash
# In a new terminal, navigate to frontend
cd frontend

npm install
```

### Step 8: Start Frontend Development Server

```bash
# From frontend folder
npm run dev
```

**Expected output:**
```
➜  Local:   http://localhost:3000
```

### Step 9: Verify Everything Works

1. **Open browser to:** `http://localhost:3000`
2. **Register a new account**
   - Choose role: **Child**
   - Create test account
3. **Test Child Features**
   - Go to Lessons → click a lesson
   - Complete the quiz
   - Set a savings goal
   - View Progress
4. **Register as Parent**
   - Create new account with role: **Parent**
   - Link the child account from step 2
   - View child's progress
5. **Register as Facilitator**
   - Create new account with role: **Facilitator**
   - Add children/students
   - View class statistics

---

## 🚀 Deployment & Public URL

### Option 1: Deploy with Vercel + Railway (Recommended)

#### Deploy Backend to Railway

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/smart-start-kids.git
   git push -u origin main
   ```

2. **Go to [Railway.app](https://railway.app)**
   - Sign in with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your `smart-start-kids` repository
   - Railway auto-detects the backend and creates a PostgreSQL database

3. **Add Environment Variables in Railway Dashboard**
   - Add `JWT_SECRET` → (generate random string)
   - Add `FRONTEND_URL` → (you'll get Vercel URL in next step)

4. **Get Backend URL**
   - Railway assigns: `https://your-railway-url.railway.app`
   - Note this for the frontend configuration

#### Deploy Frontend to Vercel

1. **Push frontend changes (with correct API URL)**
   - Update `.env.local` with Railway backend URL:
   ```env
   NEXT_PUBLIC_API_URL="https://your-railway-url.railway.app"
   ```

2. **Go to [Vercel.com](https://vercel.com)**
   - Click "New Project"
   - Import your GitHub repository
   - Select the `frontend` folder as root directory
   - Add environment variable:
     ```
     NEXT_PUBLIC_API_URL=https://your-railway-url.railway.app
     ```
   - Click "Deploy"

3. **Your app is now live!**
   - Vercel gives you: `https://smart-start-kids.vercel.app`
   - Update Railway `FRONTEND_URL` to this URL

### Option 2: Deploy Backend to Render

1. **Go to [Render.com](https://render.com)**
2. **New PostgreSQL** → Create database
3. **New Web Service** → Connect your GitHub repo
4. **Configuration**
   - Build Command: `npm run build`
   - Start Command: `npm run start`
   - Add environment variables (PORT, DATABASE_URL, JWT_SECRET, FRONTEND_URL)
5. **Get your Render URL** → Update Vercel frontend config

### Option 3: Deploy Everything to Docker (Advanced)

```bash
# Create docker-compose.yml for local deployment
docker-compose up -d

# Frontend available at http://localhost:3000
# Backend available at http://localhost:4000
```

---

## 📡 API Documentation

### Authentication Endpoints

**POST /register**
```bash
curl -X POST http://localhost:4000/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Child",
    "email": "child@example.com",
    "password": "SecurePass123",
    "role": "child"
  }'
```

**POST /login**
```bash
curl -X POST http://localhost:4000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "child@example.com",
    "password": "SecurePass123"
  }'
```

**GET /me** (Get current user)
```bash
curl http://localhost:4000/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Lesson Endpoints

**GET /lessons** - List all lessons
```bash
curl http://localhost:4000/lessons
```

**GET /lessons/:id** - Get single lesson
```bash
curl http://localhost:4000/lessons/LESSON_ID
```

### Progress Endpoints

**GET /progress** - Current user's progress
```bash
curl http://localhost:4000/progress \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Parent/Facilitator Endpoints

**POST /link-child** - Parent links child
```bash
curl -X POST http://localhost:4000/link-child \
  -H "Authorization: Bearer PARENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"childEmail": "child@example.com"}'
```

---

## 📁 Project Structure

```
smart-start-kids/
├── backend/                          # Express.js API server
│   ├── src/
│   │   ├── server.ts                # Main server file
│   │   └── lib/
│   │       ├── auth.ts              # JWT & password hashing
│   │       └── prisma.ts            # Database client
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema
│   │   ├── seed.ts                  # Sample data
│   │   └── migrations/              # Database migrations
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                         # Environment variables (create this)
│
├── frontend/                         # Next.js React app
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx             # Home page
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── dashboard/           # Child dashboard
│   │   │   ├── parent-dashboard/    # Parent dashboard
│   │   │   ├── facilitator-dashboard/
│   │   │   ├── lessons/             # Lessons list
│   │   │   ├── goals/               # Savings goals
│   │   │   ├── progress/            # Progress tracking
│   │   │   └── quiz/                # Quiz pages
│   │   ├── components/
│   │   │   └── AppNav.tsx           # Navigation
│   │   └── lib/
│   │       └── api.ts               # API client
│   ├── public/                       # Static files
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── .env.local                   # Environment variables (create this)
│
└── README.md                         # This file
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'express'"
**Solution:**
```bash
cd backend
npm install
```

### Issue: "Database connection failed"
**Solution:**
1. Verify PostgreSQL is running:
   ```bash
   psql -U postgres -d smart_start_kids
   # Should show psql prompt, then \q to exit
   ```
2. Check `DATABASE_URL` in `.env` matches your PostgreSQL credentials
3. Verify database exists:
   ```bash
   psql -U postgres -l | grep smart_start_kids
   ```

### Issue: "Port 3000 already in use"
**Solution:**
```bash
# Use different port
npm run dev -- -p 3001

# Or kill process using the port
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -i :3000
```

### Issue: "CORS error" when frontend calls backend
**Solution:**
1. Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
2. Ensure backend is running on port 4000
3. Check frontend `.env.local` has correct `NEXT_PUBLIC_API_URL`

### Issue: Migrations fail
**Solution:**
```bash
# Reset database (deletes all data!)
npx prisma migrate reset

# Then reseed
npm run db:seed
```

### Issue: "JWT_SECRET not found"
**Solution:**
1. Generate a random secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Add to backend `.env`:
   ```env
   JWT_SECRET=YOUR_GENERATED_SECRET
   ```

### Issue: Frontend won't connect to backend on deployment
**Solution:**
1. Verify `NEXT_PUBLIC_API_URL` is set correctly in deployment
2. Check backend CORS allows the frontend domain
3. Ensure backend environment variables are set in deployment platform

---

## 📞 Support & Questions

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Express Docs**: https://expressjs.com
- **PostgreSQL Docs**: https://www.postgresql.org/docs

---

## 📄 License

This project is under ISC License.

---

## ✅ Verification Checklist

Before considering setup complete, verify:

- [ ] PostgreSQL database created and running
- [ ] Both `.env` files created with correct values
- [ ] `npm install` completed in both folders
- [ ] `npm run db:migrate` ran successfully
- [ ] `npm run db:seed` created sample data
- [ ] Backend starts with `npm run dev` (port 4000)
- [ ] Frontend starts with `npm run dev` (port 3000)
- [ ] Can register and login in browser
- [ ] Can see lessons and quizzes
- [ ] Can create savings goals
- [ ] Child/Parent/Facilitator roles work correctly

---

**Happy Learning! 🎉**
