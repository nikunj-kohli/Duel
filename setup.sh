#!/bin/bash

# Logic Arena - Quick Setup Script
# Run this to get started quickly

echo "🚀 Setting up Logic Arena..."

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+."
    exit 1
fi

echo "✅ Docker found: $(docker --version)"
echo "✅ Node.js found: $(node --version)"

# Start infrastructure
echo ""
echo "🐳 Starting infrastructure services..."
docker-compose up -d postgres redis mongo

# Wait for services
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo ""
echo "🔍 Checking service health..."
docker-compose ps

# Install dependencies
echo ""
echo "📦 Installing code executor dependencies..."
cd services/code-executor
npm install

# Create .env if not exists
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env created. Edit if needed."
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "  1. cd services/code-executor"
echo "  2. npm run dev"
echo "  3. Test: curl http://localhost:3001/api/health"
echo ""
echo "📚 Documentation:"
echo "  - README.md - Project overview"
echo "  - SETUP.md - Detailed setup guide"
echo "  - TESTING.md - Test scenarios"
echo "  - ARCHITECTURE.md - System design"
echo ""
echo "🚀 Ready to build Logic Arena!"
