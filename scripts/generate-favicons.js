/**
 * Favicon Generator Script
 * Converts storeicon.svg to various PNG sizes for favicons
 * 
 * Run: node scripts/generate-favicons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputSvg = path.join(__dirname, '../public/branding/storeicon.svg');
const outputDir = path.join(__dirname, '../public');

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

async function generateFavicons() {
  console.log('🎨 Generating favicons from storeicon.svg...\n');

  // Read SVG file
  const svgBuffer = fs.readFileSync(inputSvg);

  for (const { name, size } of sizes) {
    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, name));
      
      console.log(`✅ Created: ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Failed to create ${name}:`, error.message);
    }
  }

  // Generate favicon.ico (32x32 PNG as ICO alternative)
  try {
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(outputDir, 'favicon.ico'));
    
    console.log('✅ Created: favicon.ico (32x32)');
  } catch (error) {
    console.error('❌ Failed to create favicon.ico:', error.message);
  }

  console.log('\n🎉 Favicon generation complete!');
  console.log('\nFiles created in /public/:');
  sizes.forEach(({ name }) => console.log(`  - ${name}`));
  console.log('  - favicon.ico');
  console.log('\n📋 Next steps:');
  console.log('  1. Run: npm run build');
  console.log('  2. Deploy to production');
  console.log('  3. Wait 1-2 weeks for Google to update the favicon in search results');
}

generateFavicons().catch(console.error);
