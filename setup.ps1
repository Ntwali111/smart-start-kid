# Smart Start Kids - Automated Setup Script (Windows)
# Run as: powershell -ExecutionPolicy Bypass -File setup.ps1

Write-Host "🚀 Smart Start Kids Setup - Windows" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if command exists
function Test-CommandExists {
    param($command)
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# Check prerequisites
Write-Host "✓ Checking prerequisites..." -ForegroundColor Green
Write-Host ""

if (-not (Test-CommandExists node)) {
    Write-Host "❌ Node.js not found" -ForegroundColor Red
    Write-Host "Please install from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-CommandExists psql)) {
    Write-Host "❌ PostgreSQL not found" -ForegroundColor Red
    Write-Host "Please install from: https://www.postgresql.org/download/" -ForegroundColor Yellow
    exit 1
}

$nodeVersion = node --version
$npmVersion = npm --version
$psqlVersion = psql --version

Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
Write-Host "✓ npm: $npmVersion" -ForegroundColor Green
Write-Host "✓ PostgreSQL: $psqlVersion" -ForegroundColor Green
Write-Host ""

# Create database
Write-Host "🔧 Setting up PostgreSQL database..." -ForegroundColor Cyan

try {
    $dbExists = psql -U postgres -lqt | Select-String "smart_start_kids"
    if ($dbExists) {
        Write-Host "✓ Database smart_start_kids already exists" -ForegroundColor Green
    } else {
        createdb -U postgres smart_start_kids
        Write-Host "✓ Database smart_start_kids created" -ForegroundColor Green
    }
}
catch {
    Write-Host "⚠️  Could not verify database. Continuing..." -ForegroundColor Yellow
}

Write-Host ""

# Backend setup
Write-Host "⚙️  Setting up backend..." -ForegroundColor Cyan

Set-Location backend

# Create .env if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    
    $jwtSecret = [System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
    
    @"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smart_start_kids"
PORT=4000
FRONTEND_URL="http://localhost:3000"
JWT_SECRET="$jwtSecret"
"@ | Out-File -Encoding UTF8 ".env"
    
    Write-Host "✓ .env created with random JWT_SECRET" -ForegroundColor Green
} else {
    Write-Host "✓ .env already exists" -ForegroundColor Green
}

# Install dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
npm install
Write-Host "✓ Backend dependencies installed" -ForegroundColor Green

# Run migrations
Write-Host "Setting up database schema..." -ForegroundColor Yellow
npm run db:generate
npm run db:migrate
npm run db:seed
Write-Host "✓ Database schema created and seeded" -ForegroundColor Green

# Build backend
Write-Host "Building backend..." -ForegroundColor Yellow
npm run build
Write-Host "✓ Backend built successfully" -ForegroundColor Green

# Frontend setup
Write-Host ""
Write-Host "⚙️  Setting up frontend..." -ForegroundColor Cyan

Set-Location ../frontend

# Create .env.local if it doesn't exist
if (-not (Test-Path ".env.local")) {
    Write-Host "Creating .env.local file..." -ForegroundColor Yellow
    @"
NEXT_PUBLIC_API_URL="http://localhost:4000"
"@ | Out-File -Encoding UTF8 ".env.local"
    
    Write-Host "✓ .env.local created" -ForegroundColor Green
} else {
    Write-Host "✓ .env.local already exists" -ForegroundColor Green
}

# Install dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
npm install
Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 To start the application:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Terminal 1 (Backend):" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "   Terminal 2 (Frontend):" -ForegroundColor Yellow
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Then open: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "🧪 Test Users:" -ForegroundColor Cyan
Write-Host "   - Register as 'Child' to access lessons" -ForegroundColor White
Write-Host "   - Register as 'Parent' to monitor children" -ForegroundColor White
Write-Host "   - Register as 'Facilitator' to manage class" -ForegroundColor White
