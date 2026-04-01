#!/bin/bash

# Smart Start Kids - Automated Setup Script (Mac/Linux)
# This script sets up everything automatically

set -e  # Exit on error

echo "🚀 Smart Start Kids Setup - Mac/Linux"
echo "======================================"

# Check prerequisites
echo "✓ Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install from https://nodejs.org/"
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL not found. Please install from https://www.postgresql.org/download/"
    exit 1
fi

echo "✓ Node.js: $(node --version)"
echo "✓ npm: $(npm --version)"
echo "✓ PostgreSQL: $(psql --version)"

# Create database
echo ""
echo "🔧 Setting up PostgreSQL database..."

# Check if database exists
if psql -lqt | cut -d \| -f 1 | grep -qw smart_start_kids; then
    echo "✓ Database smart_start_kids already exists"
else
    createdb smart_start_kids
    echo "✓ Database smart_start_kids created"
fi

# Backend setup
echo ""
echo "⚙️  Setting up backend..."
cd backend

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
DATABASE_URL="postgresql://$(whoami)@localhost:5432/smart_start_kids"
PORT=4000
FRONTEND_URL="http://localhost:3000"
JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
EOF
    echo "✓ .env created with random JWT_SECRET"
else
    echo "✓ .env already exists"
fi

# Install dependencies
echo "Installing backend dependencies..."
npm install
echo "✓ Backend dependencies installed"

# Run migrations
echo "Setting up database schema..."
npm run db:generate
npm run db:migrate
npm run db:seed
echo "✓ Database schema created and seeded"

# Build backend
echo "Building backend..."
npm run build
echo "✓ Backend built successfully"

# Frontend setup
echo ""
echo "⚙️  Setting up frontend..."
cd ../frontend

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL="http://localhost:4000"
EOF
    echo "✓ .env.local created"
else
    echo "✓ .env.local already exists"
fi

# Install dependencies
echo "Installing frontend dependencies..."
npm install
echo "✓ Frontend dependencies installed"

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📋 To start the application:"
echo ""
echo "   Terminal 1 (Backend):"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "🌐 Then open: http://localhost:3000"
echo ""
echo "🧪 Test Users:"
echo "   - Register as 'Child' to access lessons"
echo "   - Register as 'Parent' to monitor children"
echo "   - Register as 'Facilitator' to manage class"
