#!/usr/bin/env node

import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Get the directory where this script is located
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path to the project root
const projectRoot = path.join(__dirname, '..');

// Build client 
console.log('Building client...');
exec('npm run build', { cwd: projectRoot }, (err, stdout, stderr) => {
  if (err) {
    console.error('Error building client:', err);
    console.error(stderr);
    process.exit(1);
  }

  console.log(stdout);
  console.log('Client built successfully.');

  // Define paths for server build
  const renderBuildPath = '/opt/render/project/src';
  const distPath = path.join(renderBuildPath, 'dist');

  // Create dist directory if it doesn't exist
  if (!fs.existsSync(distPath)) {
    try {
      fs.mkdirSync(distPath, { recursive: true });
      console.log(`Created directory: ${distPath}`);
    } catch (err) {
      console.error(`Error creating directory ${distPath}:`, err);
    }
  }

  // Build server
  console.log('Building server...');
  exec(
    'esbuild server/index.ts --platform=node --packages=external --bundle --format=cjs --outfile=dist/index.js',
    { cwd: projectRoot },
    (err, stdout, stderr) => {
      if (err) {
        console.error('Error building server:', err);
        console.error(stderr);
        process.exit(1);
      }

      console.log(stdout);
      console.log('Server built successfully.');

      // Copy dist folder to Render's expected path
      console.log(`Copying build files to ${renderBuildPath}...`);
      try {
        if (fs.existsSync(distPath)) {
          // Copy the dist folder from project root to Render's path
          fs.cpSync(path.join(projectRoot, 'dist'), distPath, { recursive: true });
          console.log('Build files copied successfully.');
        } else {
          console.log('No dist folder found to copy.');
        }
      } catch (err) {
        console.error('Error copying build files:', err);
      }
    }
  );
});