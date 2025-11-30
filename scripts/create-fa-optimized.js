/**
 * Font Awesome Optimizer Script
 * Creates an optimized version of Font Awesome CSS
 * Removes unused font weights (duotone, thin, brands)
 * 
 * Run: node scripts/create-fa-optimized.js
 */

const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'src', 'assets', 'styles', 'all.min.css');
const outputPath = path.join(__dirname, '..', 'src', 'assets', 'styles', 'fa-optimized.min.css');

console.log('Font Awesome Optimizer');
console.log('======================\n');

// Read the original file
let css = fs.readFileSync(inputPath, 'utf-8');
const originalSize = Buffer.byteLength(css, 'utf8');

// Patterns to remove (unused font weights)
const removals = [
  // Remove fa-thin and fat classes
  /\.fa-thin[^{]*\{[^}]+\}/g,
  /\.fat[^{]*\{[^}]+\}/g,
  
  // Remove fa-duotone and fad classes  
  /\.fa-duotone[^{]*\{[^}]+\}/g,
  /\.fad[^{]*\{[^}]+\}/g,
  
  // Remove fa-brands and fab classes
  /\.fa-brands[^{]*\{[^}]+\}/g,
  /\.fab[^{]*\{[^}]+\}/g,
  
  // Remove thin font-face
  /@font-face\s*\{[^}]*fa-thin-100[^}]*\}/g,
  
  // Remove duotone font-face
  /@font-face\s*\{[^}]*fa-duotone-900[^}]*\}/g,
  
  // Remove brands font-face  
  /@font-face\s*\{[^}]*fa-brands-400[^}]*\}/g,
  
  // Remove v4 compatibility
  /@font-face\s*\{[^}]*fa-v4compatibility[^}]*\}/g,
  
  // Remove CSS variables for unused weights
  /--fa-font-thin:[^;]+;/g,
  /--fa-font-duotone:[^;]+;/g,
  /--fa-font-brands:[^;]+;/g,
];

// Apply removals
removals.forEach(pattern => {
  css = css.replace(pattern, '');
});

// Clean up empty rules and extra whitespace
css = css
  .replace(/\s*\{\s*\}/g, '')           // Remove empty rules
  .replace(/\n{3,}/g, '\n\n')           // Reduce multiple newlines
  .replace(/,\s*,/g, ',')               // Remove double commas
  .replace(/,\s*\{/g, '{')              // Remove trailing commas before {
  .replace(/;\s*;/g, ';');              // Remove double semicolons

// Write optimized file
fs.writeFileSync(outputPath, css);
const newSize = Buffer.byteLength(css, 'utf8');

console.log(`Original size: ${(originalSize / 1024).toFixed(1)} KB`);
console.log(`Optimized size: ${(newSize / 1024).toFixed(1)} KB`);
console.log(`Saved: ${((originalSize - newSize) / 1024).toFixed(1)} KB (${((1 - newSize / originalSize) * 100).toFixed(1)}%)`);
console.log(`\nOutput written to: ${outputPath}`);

// Create a report of what was removed
console.log('\n📋 Removed font weights:');
console.log('  - fa-thin-100.woff2 (420KB)');
console.log('  - fa-duotone-900.woff2 (396KB)');
console.log('  - fa-brands-400.woff2 (104KB)');
console.log('  - fa-v4compatibility.woff2 (8KB)');
console.log('\n💡 Total potential font savings: ~928KB');

console.log('\n⚠️  Next steps:');
console.log('1. Update layout.jsx to import fa-optimized.min.css instead of all.min.css');
console.log('2. Delete unused font files from src/assets/webfonts/');
console.log('3. Rebuild and test the application');
