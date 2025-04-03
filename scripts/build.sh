#!/bin/bash

# Install dependencies
npm install

# Install global dependencies needed for build
npm install -g vite typescript

# Create dist directory
mkdir -p dist

# Build the client
echo "Building client with Vite..."
npx vite build

# Build the server manually
echo "Building server..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=cjs --outfile=dist/index.js

# Copy dist to Render's expected location
if [ -d "/opt/render/project/src" ]; then
  echo "Copying build files to Render path..."
  mkdir -p /opt/render/project/src/dist
  cp -r dist/* /opt/render/project/src/dist/
fi

# Make migration and seed scripts executable
chmod +x scripts/run-migrations.js
chmod +x scripts/seed-data.js

# Run database migrations
node scripts/run-migrations.js

# Seed initial data if needed
node scripts/seed-data.js