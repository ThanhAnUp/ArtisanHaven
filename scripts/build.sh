
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

# Create ES module entry point
echo "Creating ES module entry point..."
echo "import './server/index.js';" > dist/index.js

# Ensure production environment
echo "Setting up production environment..."
export NODE_ENV=production

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
