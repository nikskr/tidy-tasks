// Generates the Tidy Tasks icon set as PNGs with no dependencies.
// Design: blue→indigo diagonal gradient, white rounded "task card" with soft shadow,
// gradient checkmark inside the card.
// Usage: npm run icons  (writes into ./assets)
import { Buffer } from 'node:buffer';
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

// ---------- palette ----------
const GRAD_A = [0x3b, 0x82, 0xf6]; // top-left  (blue)
const GRAD_B = [0x4f, 0x46, 0xe5]; // bottom-right (indigo)
const WHITE = [0xff, 0xff, 0xff];
const SHADOW = [0x1e, 0x1b, 0x6b];

// ---------- PNG encoder ----------
const crcTable = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};

/** shader(u, v) → [r, g, b, a] (a in 0..1); u, v are normalised 0..1 coordinates. */
function png(size, shader, { alpha }) {
  const channels = alpha ? 4 : 3;
  const raw = Buffer.alloc((size * channels + 1) * size);
  const SS = 2; // 2×2 supersampling for smooth edges
  for (let y = 0; y < size; y++) {
    const row = y * (size * channels + 1);
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const p = shader((x + (sx + 0.5) / SS) / size, (y + (sy + 0.5) / SS) / size, size);
          // premultiply so transparent samples don't bleed colour
          r += p[0] * p[3]; g += p[1] * p[3]; b += p[2] * p[3]; a += p[3];
        }
      }
      const n = SS * SS;
      const o = row + 1 + x * channels;
      const A = a / n;
      const un = a > 0 ? 1 / a : 0;
      raw[o] = Math.round(alpha ? r * un : r / n);
      raw[o + 1] = Math.round(alpha ? g * un : g / n);
      raw[o + 2] = Math.round(alpha ? b * un : b / n);
      if (alpha) raw[o + 3] = Math.round(A * 255);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = alpha ? 6 : 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------- geometry (all in normalised units) ----------
const clamp01 = (t) => Math.max(0, Math.min(1, t));
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
/** Anti-aliased coverage from a signed distance (d < 0 inside → 1), px = one pixel. */
const smooth = (d, px) => clamp01(0.5 - d / px);

/** Signed distance to a rounded box centred at (cx, cy) with half-size h and radius r. */
function sdRoundBox(u, v, cx, cy, h, r) {
  const qx = Math.abs(u - cx) - h + r;
  const qy = Math.abs(v - cy) - h + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}

function sdSegment(u, v, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const t = clamp01(((u - ax) * dx + (v - ay) * dy) / (dx * dx + dy * dy));
  return Math.hypot(u - (ax + t * dx), v - (ay + t * dy));
}

/** Checkmark inside a card centred at (cx, cy) with half-size h. Returns signed distance. */
function sdCheck(u, v, cx, cy, h) {
  const p = (x, y) => [cx + (x - 0.5) * 2 * h, cy + (y - 0.5) * 2 * h];
  const [ax, ay] = p(0.24, 0.53);
  const [bx, by] = p(0.43, 0.71);
  const [ex, ey] = p(0.77, 0.3);
  const w = h * 0.115;
  return Math.min(sdSegment(u, v, ax, ay, bx, by), sdSegment(u, v, bx, by, ex, ey)) - w;
}

const gradient = (u, v) => mix(GRAD_A, GRAD_B, clamp01((u + v) / 2));

/**
 * Card emblem at (cx, cy) with half-size h, composited over `bg` (rgba).
 * Layers: shadow → white card → gradient check.
 */
function emblem(u, v, size, cx, cy, h, bg) {
  const px = 1 / size;
  let col = bg.slice(0, 3);
  let a = bg[3];

  // soft drop shadow (offset down, blurred by distance falloff)
  const ds = sdRoundBox(u, v, cx, cy + h * 0.08, h, h * 0.3);
  const shadow = 0.28 * clamp01(1 - Math.max(ds, 0) / (h * 0.22));
  if (a > 0) {
    col = mix(col, SHADOW, shadow); // darken the opaque background
  } else {
    col = SHADOW; // transparent layer: the shadow itself is the colour
    a = shadow;
  }

  // white card
  const card = smooth(sdRoundBox(u, v, cx, cy, h, h * 0.3), px);
  col = mix(col, WHITE, card);
  a = a + (1 - a) * card;

  // gradient checkmark
  const check = smooth(sdCheck(u, v, cx, cy, h), px);
  col = mix(col, gradient(u, v), check);

  return [...col, a];
}

/** Monochrome silhouette: card with check knocked out (for Android themed icons). */
function monochrome(u, v, size, cx, cy, h) {
  const px = 1 / size;
  const card = smooth(sdRoundBox(u, v, cx, cy, h, h * 0.3), px);
  const check = smooth(sdCheck(u, v, cx, cy, h), px);
  return [...WHITE, card * (1 - check)];
}

// ---------- outputs ----------
const out = (name, buf) => {
  writeFileSync(new URL(`../assets/${name}`, import.meta.url), buf);
  console.log(`assets/${name}`);
};

// iOS / store icon: full-bleed square, NO alpha (App Store rejects transparency).
// The OS applies its own corner mask.
out(
  'icon.png',
  png(1024, (u, v, s) => emblem(u, v, s, 0.5, 0.5, 0.29, [...gradient(u, v), 1]), { alpha: false }),
);

// Android adaptive icon: background layer = gradient; foreground = emblem inside the
// central safe zone (≈ 66% diameter circle), so keep the card small.
out('android-icon-background.png', png(1024, (u, v) => [...gradient(u, v), 1], { alpha: true }));
out(
  'android-icon-foreground.png',
  // half-size 0.22 → card diagonal 0.62 < 0.66 safe-zone diameter, so masks never clip it.
  png(1024, (u, v, s) => emblem(u, v, s, 0.5, 0.5, 0.22, [0, 0, 0, 0]), { alpha: true }),
);
out('android-icon-monochrome.png', png(1024, (u, v, s) => monochrome(u, v, s, 0.5, 0.5, 0.22), { alpha: true }));

// Splash: gradient rounded tile carrying the emblem, transparent around it.
out(
  'splash-icon.png',
  png(
    512,
    (u, v, s) => {
      const tile = smooth(sdRoundBox(u, v, 0.5, 0.5, 0.5, 0.22), 1 / s);
      if (tile <= 0) return [0, 0, 0, 0];
      const [r, g, b] = emblem(u, v, s, 0.5, 0.5, 0.27, [...gradient(u, v), 1]);
      return [r, g, b, tile];
    },
    { alpha: true },
  ),
);

// Favicon (web) and a 512 store-listing icon for Google Play / expo.dev dashboard.
out('favicon.png', png(48, (u, v, s) => emblem(u, v, s, 0.5, 0.5, 0.32, [...gradient(u, v), 1]), { alpha: false }));
out(
  'store-icon-512.png',
  png(512, (u, v, s) => emblem(u, v, s, 0.5, 0.5, 0.29, [...gradient(u, v), 1]), { alpha: false }),
);
