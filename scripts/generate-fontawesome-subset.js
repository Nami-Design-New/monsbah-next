/**
 * Font Awesome Subset Generator
 * This script identifies and documents the Font Awesome icons used in the project.
 * For production, consider using a Font Awesome kit or subsetting tool.
 */

const fs = require('fs');
const path = require('path');

// Icons identified from grep search
const usedIcons = [
  // Light icons (fa-light)
  'location-dot',
  'clock',
  'rectangle-list',
  'clothes-hanger',
  'pencil',
  'user-group',
  
  // Regular icons (fa-regular)
  'plus',
  'trash',
  'xmark',
  'copy',
  'flag',
  'user-check',
  'arrow-right-from-bracket',
  'pen-to-square',
  
  // Solid icons (fa-solid)
  'house-chimney',
  'grid-2',
  'store',
  'message',
  'star',
  'heart',
  'share-nodes',
  'ellipsis-vertical',
  'arrow-right',
  'arrow-right-long',
  'video',
  'image',
  'comment-dots',
  'spinner',
  'cloud-arrow-up',
  'paper-plane-top',
  'gear',
  'filter',
  'bullhorn',
  'building',
  'bell',
  'bars',
  'ban',
  'badge-check',
  'arrow-up-wide-short',
  'arrow-down-wide-short',
  'angle-down',
  'calendar',
  'calendar-days',
  'magnifying-glass',
  'user',
  'user-plus',
  'user-minus',
  'circle-plus',
  'times',
  'message-question',
  'arrow-up-left',
];

// Create a CSS subset with only critical icon definitions
const criticalCSS = `
/* Font Awesome Pro 6.1.1 - Subset for Monsbah */
/* Only essential base styles and commonly used icons */

.fa, .fa-brands, .fa-light, .fa-regular, .fa-solid, .fab, .fal, .far, .fas {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  display: var(--fa-display, inline-block);
  font-style: normal;
  font-variant: normal;
  line-height: 1;
  text-rendering: auto;
}

.fa-light { font-family: "Font Awesome 6 Pro"; font-weight: 300; }
.fa-regular { font-family: "Font Awesome 6 Pro"; font-weight: 400; }
.fa-solid { font-family: "Font Awesome 6 Pro"; font-weight: 900; }

/* Animations */
.fa-spin { animation: fa-spin 2s infinite linear; }
.fa-pulse { animation: fa-spin 1s infinite steps(8); }
@keyframes fa-spin { 0% { transform: rotate(0); } 100% { transform: rotate(360deg); } }

/* Total unique icons used: ${usedIcons.length} */
`;

console.log('Font Awesome Subset Analysis');
console.log('============================');
console.log(`Total unique icons identified: ${usedIcons.length}`);
console.log('\nIcons by style:');
console.log('- fa-light: 6 icons');
console.log('- fa-regular: 8 icons');
console.log('- fa-solid: ~40 icons');
console.log('\nRecommendation:');
console.log('The full Font Awesome CSS is ~600KB+ minified.');
console.log('Consider using Font Awesome Kit (https://fontawesome.com/kits) to reduce to ~20KB');
console.log('\nAlternatively, use react-icons which supports tree-shaking.');

// Write the icon list to a JSON file for reference
const outputPath = path.join(__dirname, '..', 'fontawesome-icons-used.json');
fs.writeFileSync(outputPath, JSON.stringify({
  generated: new Date().toISOString(),
  totalIcons: usedIcons.length,
  icons: usedIcons.sort(),
  note: 'These icons are used in the project. Consider using a Font Awesome Kit or react-icons for tree-shaking.'
}, null, 2));

console.log(`\nIcon list saved to: fontawesome-icons-used.json`);
