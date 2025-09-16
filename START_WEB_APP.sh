#!/bin/bash

echo "========================================"
echo "MHT Assessment - Web App Launcher"
echo "========================================"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "Node.js version:"
node --version
echo

echo "Starting Metro bundler with web support..."
echo
echo "Expected behavior:"
echo "- Metro will start bundling"
echo "- Browser should open automatically at http://localhost:19006"
echo "- You'll see the complete MHT Assessment app"
echo "- All 8 medical features should be clickable"
echo
echo "If browser doesn't open automatically, manually go to:"
echo "http://localhost:19006"
echo
echo "Press Ctrl+C to stop the server"
echo "========================================"
echo

npx expo start --web