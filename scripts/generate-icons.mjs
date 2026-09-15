import fs from 'node:fs';
import zlib from 'node:zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
}
const crcTable = createCRC32Table();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crcTarget = buf.subarray(4, 8 + len);
  const crcVal = crc32(crcTarget);
  buf.writeUInt32BE(crcVal, 8 + len);
  return buf;
}

function generatePNG(width, height, isMaskable = false) {
  // Create RGBA buffer
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  const cx = width / 2;
  const cy = height / 2;
  const rOuter = width * 0.45;
  const rInner = width * 0.42;

  // Navy: #003366 -> rgb(0, 51, 102)
  // Gold: #FFC300 -> rgb(255, 195, 0)
  // Teal: #00A896 -> rgb(0, 168, 150)
  // White: rgb(255, 255, 255)

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter byte: None
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let r = 0, g = 51, b = 102, a = 255; // Background navy

      if (isMaskable) {
        // Solid navy with inner gold shield
        if (dist <= width * 0.38) {
          // Inside emblem
          const normY = (y - (cy - width * 0.2)) / (width * 0.4);
          if (normY > 0 && normY < 1 && Math.abs(dx) < (width * 0.25) * (1 - normY * 0.3)) {
            r = 255; g = 195; b = 0;
          }
          // White letter S or cap
          if (dist <= width * 0.18) {
            r = 255; g = 255; b = 255;
          }
        }
      } else {
        // Rounded badge
        if (dist > rOuter) {
          // Transparent outside circle
          r = 0; g = 0; b = 0; a = 0;
        } else if (dist > rInner) {
          // Gold border
          r = 255; g = 195; b = 0; a = 255;
        } else {
          // Navy interior with gold graduation cap / shield
          const relY = y - cy;
          const relX = x - cx;
          // Simple stylized graduation cap diamond
          const diamond = Math.abs(relX) / (width * 0.25) + Math.abs(relY + width * 0.05) / (width * 0.12);
          if (diamond <= 1.0) {
            r = 255; g = 195; b = 0; // Gold cap
          } else if (relY > width * 0.05 && relY < width * 0.22 && Math.abs(relX) < width * 0.18) {
            // Book / pedestal
            r = 255; g = 255; b = 255; // White book
          }
        }
      }

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // Bit depth: 8
  ihdrData.writeUInt8(6, 9); // Color type: 6 (RGBA)
  ihdrData.writeUInt8(0, 10); // Compression method: 0
  ihdrData.writeUInt8(0, 11); // Filter method: 0
  ihdrData.writeUInt8(0, 12); // Interlace method: 0
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT
  const idatChunk = createChunk('IDAT', deflated);

  // IEND
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate files
if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public', { recursive: true });
}

fs.writeFileSync('./public/pwa-192x192.png', generatePNG(192, 192, false));
fs.writeFileSync('./public/pwa-512x512.png', generatePNG(512, 512, false));
fs.writeFileSync('./public/pwa-maskable-512x512.png', generatePNG(512, 512, true));
fs.writeFileSync('./public/apple-touch-icon.png', generatePNG(180, 180, false));

const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#003366"/>
      <stop offset="100%" stop-color="#001F3F"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFD140"/>
      <stop offset="100%" stop-color="#FFC300"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#navyGrad)"/>
  <circle cx="256" cy="256" r="210" fill="none" stroke="url(#goldGrad)" stroke-width="12"/>
  <g transform="translate(256, 220)">
    <!-- Graduation Cap -->
    <path d="M 0 -70 L 140 -20 L 0 30 L -140 -20 Z" fill="url(#goldGrad)"/>
    <path d="M -70 0 L -70 50 C -70 85 70 85 70 50 L 70 0" fill="none" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round"/>
    <path d="M 100 -5 L 125 45 L 115 50" fill="none" stroke="#FFC300" stroke-width="8" stroke-linecap="round"/>
    <circle cx="125" cy="55" r="10" fill="#FFC300"/>
    <!-- Book below -->
    <path d="M -110 90 Q 0 65 110 90 L 110 130 Q 0 105 -110 130 Z" fill="#FFFFFF"/>
    <path d="M 0 75 L 0 115" stroke="#003366" stroke-width="6"/>
  </g>
</svg>`;

fs.writeFileSync('./public/icon.svg', svgIcon);
console.log('PWA icons created successfully');
