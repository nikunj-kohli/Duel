# Logic Arena - Quick Setup Script for Windows
# Run this in PowerShell to get started quickly

Write-Host "🚀 Setting up Logic Arena..." -ForegroundColor Green

# Check prerequisites
Write-Host "`nChecking prerequisites..." -ForegroundColor Yellow

# Check Docker
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+." -ForegroundColor Red
    exit 1
}

# Start infrastructure
Write-Host "`n🐳 Starting infrastructure services..." -ForegroundColor Green
docker-compose up -d postgres redis mongo

# Wait for services
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service health
Write-Host "`n🔍 Checking service health..." -ForegroundColor Yellow
docker-compose ps

# Install dependencies
Write-Host "`n📦 Installing code executor dependencies..." -ForegroundColor Green
Set-Location services/code-executor
npm install

# Create .env if not exists
if (-not (Test-Path .env)) {
    Write-Host "`n📝 Creating .env file..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ .env created. Edit if needed." -ForegroundColor Green
}

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`n🎯 Next steps:" -ForegroundColor Cyan
Write-Host "  1. cd services/code-executor"
Write-Host "  2. npm run dev"
Write-Host "  3. Test: curl http://localhost:3001/api/health"

Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "  - README.md - Project overview"
Write-Host "  - SETUP.md - Detailed setup guide"
Write-Host "  - TESTING.md - Test scenarios"
Write-Host "  - ARCHITECTURE.md - System design"

Write-Host "`n🚀 Ready to build Logic Arena!" -ForegroundColor Green
