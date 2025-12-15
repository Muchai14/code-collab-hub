#!/bin/bash

# Run backend tests
# This script ensures tests run from the correct directory with proper dependencies

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
VENV_DIR="$SCRIPT_DIR/.venv"

# Check if virtual environment exists and activate it
if [ -d "$VENV_DIR" ]; then
    echo "🔧 Activating virtual environment..."
    source "$VENV_DIR/bin/activate"
elif [ -d "$BACKEND_DIR/.venv" ]; then
    echo "🔧 Activating backend virtual environment..."
    source "$BACKEND_DIR/.venv/bin/activate"
fi

cd "$BACKEND_DIR" || exit 1

echo "🧪 Running backend tests..."
echo ""

python -m pytest "$@"
