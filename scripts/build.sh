#!/bin/bash

# Install dependencies
npm install

# Build the application
npm run build

# Run database migrations
node scripts/run-migrations.js

# Seed initial data if needed
node scripts/seed-data.js