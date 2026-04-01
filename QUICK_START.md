# ⚡ Quick Start (5 Minutes)

Get Smart Start Kids running on your computer in minutes!

## Prerequisites

Make sure you have:
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/download/)

## Automatic Setup (Recommended)

### Windows
```powershell
powershell -ExecutionPolicy Bypass -File setup.ps1
```

### Mac/Linux
```bash
chmod +x setup.sh
./setup.sh
```

The script will:
- ✅ Create PostgreSQL database
- ✅ Set up environment variables
- ✅ Install dependencies
- ✅ Set up database schema
- ✅ Seed sample lessons

## Manual Setup (If scripts don't work)

### 1. Create Database
```bash
# Windows Command Prompt
psql -U postgres
CREATE DATABASE smart_start_kids;
\q

# Mac/Linux Terminal
createdb smart_start_kids
```

### 2. Backend Setup
```bash
cd backend

# Create .env file with these variables:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smart_start_kids"
# PORT=4000
# FRONTEND_URL="http://localhost:3000"
# JWT_SECRET="abc123xyz789"

npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run build
```

### 3. Frontend Setup
```bash
cd frontend

# Create .env.local file:
# NEXT_PUBLIC_API_URL="http://localhost:4000"

npm install
```

## 🚀 Run the App

**Terminal 1 - Backend**
```bash
cd backend
npm run dev
```
You should see: `Server running on http://localhost:4000`

**Terminal 2 - Frontend**
```bash
cd frontend
npm run dev
```
You should see: `➜  Local: http://localhost:3000`

## 🌐 Open App

Visit: **http://localhost:3000**

## 🧪 Test It

1. **Register as Child**
   - Email: `child@test.com`
   - Password: `Test123!`
   - Role: Child

2. **View Lessons**
   - Go to "Lessons" tab
   - Click a lesson (Savings, Budgeting, etc.)
   - Complete the quiz

3. **Register as Parent** (new account)
   - Email: `parent@test.com`
   - Role: Parent
   - Link the child account you created above

4. **View Parent Dashboard**
   - You'll see the child's progress
   - View completed lessons and quiz scores

## ✅ You're Done!

Your app is now running locally. See [README.md](README.md) for deployment instructions to make it publicly accessible.

## 🆘 Troubleshooting

**Port 3000 already in use?**
```bash
npm run dev -- -p 3001
```

**PostgreSQL connection error?**
```bash
# Verify PostgreSQL is running
psql -U postgres -d smart_start_kids
\q
```

**Migrations failed?**
```bash
cd backend
npx prisma migrate reset
npm run db:seed
```

See [README.md](README.md) for more help.
