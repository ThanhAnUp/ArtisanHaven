
#!/bin/bash

# Install dependencies 
npm install

# Create dist directory
mkdir -p dist

# Build client
echo "Building client..."
npm i
npm run build

# Build server with esbuild
echo "Building server..."
npx esbuild server/index.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outfile=dist/index.js \
  --external:vite \
  --external:express

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
