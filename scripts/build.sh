#!/bin/bash

# Install dependencies
npm install

# Build the project using tsc
echo "Building the project..."
npx tsc

# Build client if needed (e.g., with Vite)
if [ "$NODE_ENV" = "production" ]; then
  echo "Building client..."
  npx vite build
fi

# Copy dist to Render's expected location
if [ -d "/opt/render/project/src" ]; then
  echo "Copying build files to Render path..."
  mkdir -p /opt/render/project/src/dist
  cp -r dist/* /opt/render/project/src/dist/
fi

# Run database migrations
node scripts/run-migrations.js

# Seed initial data if needed
node scripts/seed-data.js