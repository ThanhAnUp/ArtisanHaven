#!/bin/bash

# Install dependencies 
npm install

# Create dist directory
mkdir -p dist

# Build client
echo "Building client..."
npm run build

# Build server with tsc
echo "Building server..."
npx tsc --project tsconfig.json

# Ensure production environment
echo "Setting up production environment..."
export NODE_ENV=production

# Copy dist to Render's expected location
if [ -d "/opt/render/project/src" ]; then
  echo "Copying build files to Render path..."
  mkdir -p /opt/render/project/src/dist
  cp -r dist/* /opt/render/project/src/dist/
  # Create a server-only version if client build failed.  This is a safeguard, though less likely to be needed with the new build process.
  if [ ! -f "/opt/render/project/src/dist/index.js" ]; then
    echo "Creating backup index.js..."
    echo "require('./server/index.js');" > /opt/render/project/src/dist/index.js
  fi
fi

# Make migration and seed scripts executable
chmod +x scripts/run-migrations.js
chmod +x scripts/seed-data.js

# Run database migrations
node scripts/run-migrations.js

# Seed initial data if needed
node scripts/seed-data.js