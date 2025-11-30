/**
 * Font Awesome Subset Extractor
 * Extracts only the CSS needed for icons used in the project
 * Run: node scripts/extract-fontawesome-subset.js
 */

const fs = require('fs');
const path = require('path');

// Icons used in the project (from grep analysis)
const usedIcons = [
  'angle-down',
  'arrow-down-wide-short',
  'arrow-right',
  'arrow-right-from-bracket',
  'arrow-right-long',
  'arrow-up-left',
  'arrow-up-wide-short',
  'badge-check',
  'ban',
  'bars',
  'bell',
  'building',
  'bullhorn',
  'calendar',
  'calendar-days',
  'circle-plus',
  'clock',
  'clothes-hanger',
  'cloud-arrow-up',
  'comment-dots',
  'copy',
  'ellipsis-vertical',
  'filter',
  'flag',
  'gear',
  'grid-2',
  'heart',
  'home',
  'house-chimney',
  'image',
  'location-dot',
  'magnifying-glass',
  'message',
  'message-question',
  'paper-plane-top',
  'pen-to-square',
  'pencil',
  'plus',
  'rectangle-list',
  'share-nodes',
  'spinner',
  'star',
  'store',
  'times',
  'trash',
  'user',
  'user-check',
  'user-group',
  'user-minus',
  'user-plus',
  'video',
  'xmark',
];

const fullCssPath = path.join(__dirname, '..', 'src', 'assets', 'styles', 'all.min.css');
const outputPath = path.join(__dirname, '..', 'src', 'assets', 'styles', 'fontawesome-subset.css');

// Read the full Font Awesome CSS
const fullCss = fs.readFileSync(fullCssPath, 'utf-8');

// Extract base styles (font-face, base classes)
const baseStyles = [];

// Match @font-face rules
const fontFaceRegex = /@font-face\s*\{[^}]+\}/g;
let fontFaceMatch;
while ((fontFaceMatch = fontFaceRegex.exec(fullCss)) !== null) {
  baseStyles.push(fontFaceMatch[0]);
}

// Extract base FA classes
const baseClassesRegex = /\.fa[\s,][^{]+\{[^}]+\}/g;
let baseClassMatch;
while ((baseClassMatch = baseClassesRegex.exec(fullCss)) !== null) {
  baseStyles.push(baseClassMatch[0]);
}

// Extract icon-specific rules
const iconStyles = [];
usedIcons.forEach(icon => {
  // Match both .fa-ICON and .fa-ICON:before patterns
  const iconRegex = new RegExp(`\\.fa-${icon}[^{]*\\{[^}]+\\}`, 'g');
  let match;
  while ((match = iconRegex.exec(fullCss)) !== null) {
    if (!iconStyles.includes(match[0])) {
      iconStyles.push(match[0]);
    }
  }
});

// Create subset CSS
const subsetCss = `/*!
 * Font Awesome Pro 6.1.1 - Subset for Monsbah
 * Contains only ${usedIcons.length} icons actually used in the project
 * Original size: ~600KB, Subset size: ~50KB estimated
 */

/* Base Font Faces */
${baseStyles.slice(0, 10).join('\n\n')}

/* Base Classes */
.fa, .fa-solid, .fa-regular, .fa-light, .fa-brands {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  display: var(--fa-display, inline-block);
  font-style: normal;
  font-variant: normal;
  line-height: 1;
  text-rendering: auto;
}

.fa-solid, .fas { font-family: "Font Awesome 6 Pro"; font-weight: 900; }
.fa-regular, .far { font-family: "Font Awesome 6 Pro"; font-weight: 400; }
.fa-light, .fal { font-family: "Font Awesome 6 Pro"; font-weight: 300; }

/* Animations */
.fa-spin { animation: fa-spin 2s infinite linear; }
.fa-pulse { animation: fa-spin 1s infinite steps(8); }
@keyframes fa-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* Icon Definitions */
${iconStyles.join('\n')}
`;

console.log('Font Awesome Subset Generator');
console.log('=============================');
console.log(`Total icons needed: ${usedIcons.length}`);
console.log(`Base styles extracted: ${baseStyles.length}`);
console.log(`Icon styles extracted: ${iconStyles.length}`);
console.log('');
console.log('⚠️  Note: This is a reference script.');
console.log('For best results, use Font Awesome Kit at https://fontawesome.com/kits');
console.log('Or use react-icons for tree-shaking support.');

// Write info file
const infoPath = path.join(__dirname, '..', 'fontawesome-usage-report.json');
fs.writeFileSync(infoPath, JSON.stringify({
  generatedAt: new Date().toISOString(),
  totalIconsUsed: usedIcons.length,
  icons: usedIcons.sort(),
  recommendations: [
    'Use Font Awesome Kit for production subset (~20-30KB instead of 600KB)',
    'Consider migrating to react-icons for better tree-shaking',
    'Remove unused font weights (duotone, thin) if not needed'
  ]
}, null, 2));

console.log(`\nReport saved to: fontawesome-usage-report.json`);
