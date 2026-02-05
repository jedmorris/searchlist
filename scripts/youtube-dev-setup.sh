#!/bin/bash

# YouTube Auto-Blog Development Setup
# This script helps set up local webhook testing with ngrok

echo "==================================="
echo "YouTube Auto-Blog Development Setup"
echo "==================================="
echo ""

# Check if ngrok is authenticated
if ! ngrok config check &>/dev/null; then
  echo "ngrok is not authenticated."
  echo "1. Sign up at https://ngrok.com and get your auth token"
  echo "2. Run: ngrok config add-authtoken YOUR_AUTH_TOKEN"
  echo ""
  exit 1
fi

# Start ngrok tunnel
echo "Starting ngrok tunnel on port 3000..."
echo ""
echo "Once ngrok starts, you'll see a forwarding URL like:"
echo "  https://xxxx-xx-xx-xxx-xxx.ngrok-free.app"
echo ""
echo "Update your .env.local with this URL:"
echo "  NEXT_PUBLIC_SITE_URL=https://xxxx-xx-xx-xxx-xxx.ngrok-free.app"
echo ""
echo "Then restart your Next.js dev server."
echo ""
echo "Press Ctrl+C to stop ngrok when done."
echo ""

ngrok http 3000
