import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Standard Modern Blue "SA" App Icon SVG
const createSvg = (isMaskable = false) => {
  const padding = isMaskable ? 48 : 0;
  const size = 512;
  const innerSize = size - padding * 2;
  const rx = isMaskable ? 0 : 112; // Rounded squircle for standalone, full bleed for maskable

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <!-- Background Gradient: Premium Royal Blue to Deep Sapphire -->
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="25%" stop-color="#2563eb" />
      <stop offset="70%" stop-color="#1d4ed8" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>

    <!-- Inner Radial Glow -->
    <radialGradient id="centerGlow" cx="50%" cy="38%" r="60%">
      <stop offset="0%" stop-color="#60a5fa" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#1e3a8a" stop-opacity="0" />
    </radialGradient>

    <!-- Text Metallic White Gradient -->
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="85%" stop-color="#f0f9ff" />
      <stop offset="100%" stop-color="#bae6fd" />
    </linearGradient>

    <!-- Sparkle Accent Gradient -->
    <linearGradient id="sparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>

    <!-- Subtle Drop Shadow Filter -->
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#030712" flood-opacity="0.65" />
    </filter>
    
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#38bdf8" flood-opacity="0.8" />
    </filter>
  </defs>

  <!-- Base Background -->
  <rect x="${padding}" y="${padding}" width="${innerSize}" height="${innerSize}" rx="${rx}" fill="url(#bgGradient)" />
  <rect x="${padding}" y="${padding}" width="${innerSize}" height="${innerSize}" rx="${rx}" fill="url(#centerGlow)" />
  
  ${!isMaskable ? `<rect x="${padding + 2}" y="${padding + 2}" width="${innerSize - 4}" height="${innerSize - 4}" rx="${rx - 2}" fill="none" stroke="#60a5fa" stroke-width="3.5" stroke-opacity="0.5" />` : ''}

  <!-- Geometric Grid Accent Line (Subtle Glass Tech Touch) -->
  <path d="M ${padding} ${size * 0.72} Q ${size * 0.5} ${size * 0.64} ${size - padding} ${size * 0.72}" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-opacity="0.3" />

  <!-- Center Monogram "SA" -->
  <g filter="url(#dropShadow)">
    <text 
      x="${size / 2}" 
      y="${size * 0.63}" 
      font-family="-apple-system, BlinkMacSystemFont, 'Outfit', 'Inter', 'Montserrat', 'Plus Jakarta Sans', 'Segoe UI', sans-serif" 
      font-size="${isMaskable ? '210' : '230'}" 
      font-weight="900" 
      letter-spacing="2"
      text-anchor="middle" 
      fill="url(#textGrad)"
    >SA</text>
  </g>

  <!-- Modern Dynamic Sparkle/Badge Dot -->
  <g transform="translate(${isMaskable ? size * 0.74 : size * 0.76}, ${isMaskable ? size * 0.28 : size * 0.25})">
    <circle cx="0" cy="0" r="16" fill="#38bdf8" filter="url(#softGlow)" />
    <circle cx="0" cy="0" r="10" fill="#ffffff" />
  </g>
</svg>`;
};

async function generateAll() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const standardSvg = createSvg(false);
  const maskableSvg = createSvg(true);

  // Save SVG files
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), standardSvg);
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), standardSvg);
  fs.writeFileSync(path.join(publicDir, 'icon-maskable.svg'), maskableSvg);

  const sizes = [
    { size: 512, name: 'pwa-512x512.png', maskable: false },
    { size: 192, name: 'pwa-192x192.png', maskable: false },
    { size: 512, name: 'pwa-maskable-512x512.png', maskable: true },
    { size: 192, name: 'pwa-maskable-192x192.png', maskable: true },
    { size: 180, name: 'apple-touch-icon.png', maskable: false },
    { size: 64, name: 'favicon-64x64.png', maskable: false },
    { size: 32, name: 'favicon-32x32.png', maskable: false },
    { size: 16, name: 'favicon-16x16.png', maskable: false },
    { size: 48, name: 'favicon.ico', maskable: false },
  ];

  for (const item of sizes) {
    const svgToRender = item.maskable ? maskableSvg : standardSvg;
    await sharp(Buffer.from(svgToRender))
      .resize(item.size, item.size)
      .png()
      .toFile(path.join(publicDir, item.name));
    console.log(`Generated ${item.name} (${item.size}x${item.size})`);
  }

  console.log('All icons generated successfully in /public!');
}

generateAll().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
