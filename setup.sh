#!/bin/bash

# Setup script for Code Collaboration Hub development environment
# This script installs all necessary dependencies

set -e

echo "🚀 Code Collaboration Hub - Development Setup"
echo "=============================================="
echo ""

# Check Python version
PYTHON_VERSION=$(python --version 2>&1 | awk '{print $2}')
echo "✅ Python version: $PYTHON_VERSION"

# Setup virtual environment
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv .venv
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source .venv/bin/activate

# Install backend dependencies
echo "📥 Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Activate the virtual environment:"
echo "      source .venv/bin/activate"
echo ""
echo "   2. Run tests:"
echo "      make test-local"
echo ""
echo "   3. Start with Docker:"
echo "      make dev"
echo ""
echo "   4. Or run backend locally:"
echo "      cd backend && uvicorn main:app --reload"
echo ""
