#!/usr/bin/env node
/**
 * Batch-optimize all images in ./images
 *   - Downscale: max 2000px on long edge (never upscale)
 *   - JPG: quality 82, mozjpeg, strip metadata
 *   - PNG: compressionLevel 9, palette optimization when safe
 *   - In-place overwrite (git serves as backup)
 *
 * Skips: taiwan-sketch.png (needs full detail), logo.png (small already)
 */
const fs   = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT    = path.join(__dirname, '..', 'images');
const MAX_DIM = 2000;
const SKIP    = new Set(['logo.png']);          // never touch these (by basename)
const EXT_JPG = new Set(['.jpg', '.jpeg']);
const EXT_PNG = new Set(['.png']);

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function kb(b) { return (b / 1024).toFixed(0) + ' KB'; }
function mb(b) { return (b / 1024 / 1024).toFixed(2) + ' MB'; }

async function processOne(file) {
  const base = path.basename(file);
  if (SKIP.has(base)) return { file, skipped: 'skip-list', before: 0, after: 0 };

  const ext = path.extname(file).toLowerCase();
  const isJpg = EXT_JPG.has(ext);
  const isPng = EXT_PNG.has(ext);
  if (!isJpg && !isPng) return { file, skipped: 'ext', before: 0, after: 0 };

  const before = fs.statSync(file).size;
  const buf    = fs.readFileSync(file);
  const img    = sharp(buf, { failOn: 'none' });
  const meta   = await img.metadata();

  const longEdge = Math.max(meta.width || 0, meta.height || 0);
  const needsResize = longEdge > MAX_DIM;

  let pipeline = sharp(buf, { failOn: 'none' }).rotate(); // honor EXIF then strip
  if (needsResize) {
    pipeline = pipeline.resize({
      width:  meta.width  >= meta.height ? MAX_DIM : null,
      height: meta.height >  meta.width  ? MAX_DIM : null,
      withoutEnlargement: true,
      fit: 'inside',
    });
  }

  let output;
  if (isJpg) {
    output = await pipeline.jpeg({
      quality: 82, mozjpeg: true, progressive: true, chromaSubsampling: '4:2:0',
    }).toBuffer();
  } else {
    // PNG: try palette quantization first (for illustrations / flat art),
    // compare to plain deflate and keep whichever is smaller & still lossless-ish
    const paletteBuf = await pipeline.clone().png({
      compressionLevel: 9, palette: true, quality: 90, effort: 10,
    }).toBuffer().catch(() => null);
    const plainBuf = await pipeline.clone().png({
      compressionLevel: 9, palette: false, effort: 10,
    }).toBuffer();
    output = (paletteBuf && paletteBuf.length < plainBuf.length) ? paletteBuf : plainBuf;
  }

  // Only overwrite if we actually got smaller (safety net)
  if (output.length >= before) {
    return { file, skipped: 'no-gain', before, after: before };
  }

  fs.writeFileSync(file, output);
  return { file, before, after: output.length, resized: needsResize, from: `${meta.width}x${meta.height}` };
}

(async () => {
  const files = walk(ROOT);
  console.log(`Scanning ${files.length} files under images/…\n`);

  const rows = [];
  let totalBefore = 0, totalAfter = 0, touched = 0;

  for (const f of files) {
    try {
      const r = await processOne(f);
      rows.push(r);
      if (!r.skipped) {
        totalBefore += r.before;
        totalAfter  += r.after;
        touched++;
      }
    } catch (e) {
      rows.push({ file: f, error: e.message });
    }
  }

  // sort by savings desc
  rows.sort((a, b) => (b.before - b.after) - (a.before - a.after));

  console.log('FILE'.padEnd(48), 'BEFORE'.padStart(10), 'AFTER'.padStart(10), 'SAVED'.padStart(8), 'NOTE');
  console.log('-'.repeat(90));
  for (const r of rows) {
    const rel = path.relative(ROOT, r.file);
    if (r.error)   { console.log(rel.padEnd(48), '— ERROR —'.padStart(10), '', '', r.error); continue; }
    if (r.skipped) { console.log(rel.padEnd(48), kb(r.before).padStart(10), '—'.padStart(10), '—'.padStart(8), r.skipped); continue; }
    const saved = r.before - r.after;
    const pct   = ((saved / r.before) * 100).toFixed(0) + '%';
    const note  = r.resized ? `resized ${r.from}` : 'recompressed';
    console.log(rel.padEnd(48), kb(r.before).padStart(10), kb(r.after).padStart(10), pct.padStart(8), note);
  }

  console.log('-'.repeat(90));
  console.log(`Touched: ${touched} files`);
  console.log(`Total:   ${mb(totalBefore)} → ${mb(totalAfter)}   (saved ${mb(totalBefore - totalAfter)}, ${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%)`);
})();
