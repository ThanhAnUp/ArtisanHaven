#!/bin/bash

# Install dependencies 
npm install

# Create build directory
mkdir -p dist

# Build directly from the source files without relying on complex build tools
echo "Building server directly from source..."
node -e "
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Compile TypeScript files with minimal configuration
console.log('Compiling TypeScript files...');
try {
  execSync('npx tsc --esModuleInterop --skipLibCheck --module commonjs --target es2020 --outDir ./dist/server server/index.ts', {stdio: 'inherit'});
} catch (error) {
  console.error('Failed to compile TypeScript files. Trying backup method...');
  
  // Read the server/index.ts file as a backup
  const serverContent = fs.readFileSync('server/index.ts', 'utf8');
  
  // Transform to simple nodejs CommonJS
  const transformed = serverContent
    .replace(/import {([^}]+)} from ['\"]([@\.\/_a-zA-Z0-9-]+)['\"];?/g, 'const {$1} = require(\"$2\");')
    .replace(/import ([a-zA-Z0-9_]+) from ['\"]([@\.\/_a-zA-Z0-9-]+)['\"];?/g, 'const $1 = require(\"$2\");')
    .replace(/export function/g, 'function')
    .replace(/export const/g, 'const')
    .replace(/export default/g, 'module.exports =');
  
  // Create server directory in dist
  if (!fs.existsSync('./dist/server')) {
    fs.mkdirSync('./dist/server', { recursive: true });
  }
  
  // Write the transformed content to dist
  fs.writeFileSync('./dist/server/index.js', transformed);
  console.log('Server code processed with backup method.');
}

// Copy the necessary files
console.log('Copying dist/server to dist root...');
const distServerFiles = fs.readdirSync('./dist/server');
distServerFiles.forEach(file => {
  fs.copyFileSync(path.join('./dist/server', file), path.join('./dist', file));
});

// Create a simple entry point to avoid import.meta issues
const mainJs = 'require(\"./index.js\");';
fs.writeFileSync('./dist/main.js', mainJs);
console.log('Created main.js entry point.');

// Build client if needed
if (process.env.NODE_ENV === 'production') {
  try {
    console.log('Building client...');
    execSync('npx vite build', {stdio: 'inherit'});
  } catch (error) {
    console.error('Client build failed, but server build might still be usable:', error);
  }
}
"

# Copy dist to Render's expected location
if [ -d "/opt/render/project/src" ]; then
  echo "Copying build files to Render path..."
  mkdir -p /opt/render/project/src/dist
  cp -r dist/* /opt/render/project/src/dist/
  # Create a server-only version if client build failed
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