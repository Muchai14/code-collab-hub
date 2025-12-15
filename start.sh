#!/bin/bash

# Code Collaboration Hub - Quick Start Script
# This script helps you get started with the Docker Compose setup

set -e

echo "🚀 Code Collaboration Hub - Quick Start"
echo "======================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker daemon is running"
echo ""

# Function to stop services
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    docker-compose down
    echo "✅ Services stopped"
}

# Register cleanup on script exit
trap cleanup EXIT INT TERM

# Ask user what they want to do
echo "What would you like to do?"
echo "1) Start the application (build and run)"
echo "2) Start with existing images (no build)"
echo "3) View logs"
echo "4) Stop and clean up"
echo "5) Run tests"
echo "6) Exit"
echo ""
read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        echo ""
        echo "🔨 Building and starting services..."
        docker-compose up --build -d
        
        echo ""
        echo "⏳ Waiting for services to be ready..."
        sleep 5
        
        echo ""
        echo "✅ Services are starting up!"
        echo ""
        echo "📊 Service Status:"
        docker-compose ps
        
        echo ""
        echo "🌐 Access the application:"
        echo "   - Frontend: http://localhost"
        echo "   - Backend API Docs: http://localhost/api/docs"
        echo "   - Health Check: http://localhost/health"
        echo ""
        echo "📝 View logs:"
        echo "   docker-compose logs -f"
        echo ""
        echo "🛑 Stop services:"
        echo "   docker-compose down"
        echo ""
        
        read -p "Would you like to view logs now? (y/n): " view_logs
        if [[ $view_logs == "y" || $view_logs == "Y" ]]; then
            docker-compose logs -f
        fi
        ;;
        
    2)
        echo ""
        echo "🚀 Starting services..."
        docker-compose up -d
        
        echo ""
        echo "✅ Services started!"
        docker-compose ps
        ;;
        
    3)
        echo ""
        echo "📝 Viewing logs (Ctrl+C to exit)..."
        docker-compose logs -f
        ;;
        
    4)
        echo ""
        read -p "Remove volumes (database data)? (y/n): " remove_volumes
        if [[ $remove_volumes == "y" || $remove_volumes == "Y" ]]; then
            docker-compose down -v
            echo "✅ Services stopped and volumes removed"
        else
            docker-compose down
            echo "✅ Services stopped (volumes preserved)"
        fi
        trap - EXIT INT TERM  # Remove cleanup trap
        ;;
        
    5)
        echo ""
        echo "🧪 Running backend tests..."
        docker-compose exec backend pytest
        ;;
        
    6)
        echo ""
        echo "👋 Goodbye!"
        trap - EXIT INT TERM  # Remove cleanup trap
        exit 0
        ;;
        
    *)
        echo ""
        echo "❌ Invalid choice"
        exit 1
        ;;
esac
