// food-picture-01 entry for make.fun (Node 22, standard library only).
//
// What it does: copy the burger photo sitting next to this file
// (entry.png) into /output/entry.png, then prove the copy is a complete
// image inside the competition's caps before it exits.
//
// The photo: an extreme close-up of a double smash cheeseburger filling
// the whole frame — molten cheddar and glossy burger sauce cascading
// down two crispy-edged patties, a shiny sesame brioche bun, steam
// rising, warm golden light on a dark background. No hands, no text:
// one hero dish, readable at 300 pixels, melt and gloss doing the
// talking. Round 1's ramen (91.1%) proved steam plus gloss wins;
// round 2's pizza proved a single melt moment wins; this one stacks
// both on the most craveable subject there is.
//
// Local run: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// The copy is byte-for-byte deterministic, so the grader's two runs
// write identical bytes. PNG or JPEG, told apart by magic bytes;
// the file keeps the name entry.png either way.

import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG_MAGIC = [0xff, 0xd8, 0xff];
const MAX_BYTES = 1048576; // 1 MiB, the competition's size cap
const MAX_DIMENSION = 1024; // pixels, either side

function startsWith(bytes: Buffer, magic: number[]): boolean {
  return magic.every((byte, i) => bytes[i] === byte);
}

function isWhole(bytes: Buffer, isPng: boolean): boolean {
  if (isPng) {
    // A PNG is whole only when its IEND chunk sits at the very end.
    return bytes.subarray(bytes.length - 12).includes(Buffer.from('IEND'));
  }
  // A JPEG is whole only when it ends with the FF D9 end marker.
  return bytes[bytes.length - 2] === 0xff && bytes[bytes.length - 1] === 0xd9;
}

function readDimensions(bytes: Buffer, isPng: boolean): { width: number; height: number } {
  if (isPng) {
    // PNG: the IHDR chunk names itself at bytes 12-15, then width
    // (bytes 16-19) and height (20-23), both big-endian.
    if (bytes.length < 24 || bytes.toString('ascii', 12, 16) !== 'IHDR') {
      throw new Error('entry.png is a PNG without a readable IHDR chunk');
    }
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  // JPEG: walk the segments until a Start Of Frame marker (C0, C1, C2);
  // its payload holds 1 precision byte, then height, then width.
  let offset = 2; // skip the SOI marker
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      throw new Error('entry.png is a JPEG with a broken segment marker');
    }
    const marker = bytes[offset + 1];
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    const length = bytes.readUInt16BE(offset + 2);
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      return { width: bytes.readUInt16BE(offset + 7), height: bytes.readUInt16BE(offset + 5) };
    }
    offset += 2 + length;
  }
  throw new Error('entry.png is a JPEG without a Start Of Frame segment');
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const dest = join(outDir, 'entry.png');

mkdirSync(outDir, { recursive: true });
copyFileSync(new URL('./entry.png', import.meta.url), dest);

// Verify the copy: non-empty, within the cap, PNG or JPEG by magic,
// whole — not a truncated file — and within the dimension cap.
const bytes = readFileSync(dest);
const size = statSync(dest).size;
if (size === 0) {
  throw new Error('entry.png is empty');
}
if (size > MAX_BYTES) {
  throw new Error(`entry.png is ${size} bytes, over the ${MAX_BYTES} byte cap`);
}
const isPng = startsWith(bytes, PNG_MAGIC);
const isJpeg = startsWith(bytes, JPEG_MAGIC);
// PNG and JPEG share no magic prefix, so exactly one of these can be true.
if (!isPng && !isJpeg) {
  throw new Error('entry.png is neither a PNG nor a JPEG by its first bytes');
}
if (!isWhole(bytes, isPng)) {
  throw new Error(`entry.png is a truncated ${isPng ? 'PNG' : 'JPEG'}`);
}
// Read the real dimensions from the image header and enforce the cap.
const { width, height } = readDimensions(bytes, isPng);
if (width === 0 || height === 0) {
  throw new Error('entry.png has a zero dimension — its header is corrupt');
}
if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
  throw new Error(`entry.png is ${width}x${height}, over the ${MAX_DIMENSION}px cap`);
}

console.log(`entry.png OK: ${isPng ? 'PNG' : 'JPEG'} ${width}x${height}, ${size} bytes`);
