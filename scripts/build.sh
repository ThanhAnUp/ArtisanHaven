#!/bin/bash

# Install dependencies
npm install

# Make build-render.js executable
chmod +x scripts/build-render.js

# Build the application (using our custom build script)
node scripts/build-render.js

# Make migration and seed scripts executable
chmod +x scripts/run-migrations.js
chmod +x scripts/seed-data.js

# Run database migrations
node scripts/run-migrations.js

# Seed initial data if needed
node scripts/seed-data.js