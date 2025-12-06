#!/usr/bin/env node

/**
 * Image Optimization Script for Monsbah.com
 * 
 * This script:
 * 1. Finds all images in the public folder
 * 2. Converts them to WebP format
 * 3. Compresses them to reduce file size
 * 4. Keeps file sizes under 150KB when possible
 * 
 * Usage: node scripts/optimize-images.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const MAX_SIZE_KB = 150;
const TARGET_SIZE_BYTES = MAX_SIZE_KB * 1024;

// Supported image extensions
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

/**
 * Get all image files recursively
 */
function getAllImageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllImageFiles(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (IMAGE_EXTENSIONS.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

/**
 * Optimize a single image
 */
async function optimizeImage(imagePath) {
  try {
    const ext = path.extname(imagePath).toLowerCase();
    const dir = path.dirname(imagePath);
    const basename = path.basename(imagePath, ext);
    const webpPath = path.join(dir, `${basename}.webp`);

    // Get original file size
    const originalStats = fs.statSync(imagePath);
    const originalSizeKB = (originalStats.size / 1024).toFixed(2);

    console.log(`\nProcessing: ${path.relative(PUBLIC_DIR, imagePath)}`);
    console.log(`Original size: ${originalSizeKB} KB`);

    // Skip if already WebP and small enough
    if (ext === '.webp' && originalStats.size <= TARGET_SIZE_BYTES) {
      console.log('✓ Already optimized');
      return;
    }

    // Calculate quality needed to reach target size
    let quality = 85;
    let attempts = 0;
    let outputBuffer;

    // Try different quality levels to get under target size
    while (attempts < 5) {
      outputBuffer = await sharp(imagePath)
        .webp({ quality, effort: 6 })
        .toBuffer();

      if (outputBuffer.length <= TARGET_SIZE_BYTES || quality <= 60) {
        break;
      }

      quality -= 10;
      attempts++;
    }

    const newSizeKB = (outputBuffer.length / 1024).toFixed(2);

    // Save optimized WebP
    fs.writeFileSync(webpPath, outputBuffer);

    console.log(`✓ Saved as WebP: ${newSizeKB} KB (quality: ${quality})`);
    console.log(`  Reduction: ${((1 - outputBuffer.length / originalStats.size) * 100).toFixed(1)}%`);

    // Delete original if it's not WebP
    if (ext !== '.webp') {
      fs.unlinkSync(imagePath);
      console.log(`  Deleted original ${ext.toUpperCase()}`);
    }

  } catch (error) {
    console.error(`✗ Error processing ${imagePath}:`, error.message);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🖼️  Starting image optimization...\n');
  console.log(`Target: Convert to WebP and keep under ${MAX_SIZE_KB}KB\n`);

  if (!fs.existsSync(PUBLIC_DIR)) {
    console.error('❌ Public directory not found!');
    process.exit(1);
  }

  const imageFiles = getAllImageFiles(PUBLIC_DIR);
  console.log(`Found ${imageFiles.length} images to process\n`);

  let processed = 0;
  for (const imagePath of imageFiles) {
    await optimizeImage(imagePath);
    processed++;
  }

  console.log(`\n✅ Optimization complete! Processed ${processed} images.`);
  console.log('\nNext steps:');
  console.log('1. Commit the optimized images');
  console.log('2. Deploy to production');
  console.log('3. Purge Cloudflare cache');
  console.log('4. Test with GTmetrix or PageSpeed Insights');
}

// Run the script
main().catch(console.error);
