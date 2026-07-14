#!/usr/bin/env node
/**
 * build-standalone.mjs
 * --------------------
 * Produce fully self-contained, shareable HTML files for each tracked
 * branch's sign-in.html. Each output file:
 *   • inlines Google Fonts (Roboto 400/500/700) as base64 WOFF2 @font-face
 *   • keeps the click-to-comment overlay intact (localStorage-only)
 *   • stamps window.__COMMENTS_SOURCE_HASH__ + __COMMENTS_BRANCH__ so
 *     exported comment sidecar JSONs can be traced back to this build
 *   • preserves everything else verbatim
 *
 * Sources per branch:
 *   • currently-checked-out branch → working-tree sign-in.html (uncommitted edits count)
 *   • all other branches           → tip commit via `git show <ref>:sign-in.html`
 *
 * Output → standalone/sign-in-<branch>.html (gitignored)
 * Font blobs cached in .font-cache/ (gitignored)
 *
 * Zero external deps. Requires Node 18+ (uses global fetch).
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = dirname(dirname(__filename)); // scripts/ is one level down
process.chdir(REPO_ROOT);

const OUT_DIR = join(REPO_ROOT, 'standalone');
const FONT_CACHE = join(REPO_ROOT, '.font-cache');
const SOURCE_FILE = 'sign-in.html';

const BRANCHES = [
  { name: 'main',                       gitRef: 'main' },
  { name: 'faceid-passkey',             gitRef: 'feature/faceid-passkey' },
  { name: 'heuristic-alignment-wave2',  gitRef: 'feature/heuristic-alignment-wave2' },
  { name: 'ux-best-practices',          gitRef: 'sign-in-ux-best-practices' },
  { name: 'ux',                         gitRef: 'sign-in-ux-best-practices' },
];

// ── Load source HTML ──────────────────────────────────────────────
const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();

function loadSource(branch) {
  if (branch.gitRef === currentBranch) {
    return { html: readFileSync(SOURCE_FILE, 'utf8'), source: 'working-tree' };
  }
  const html = execSync(`git show ${branch.gitRef}:${SOURCE_FILE}`, {
    encoding: 'utf8',
    maxBuffer: 100 * 1024 * 1024,
  });
  return { html, source: `git:${branch.gitRef}` };
}

// ── Font inlining ─────────────────────────────────────────────────
const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

// Keep only these subsets from the Google Fonts CSS. Latin covers en-US;
// latin-ext covers common Western European accents. Drop cyrillic/greek/
// vietnamese/math/symbols to keep file size shippable-by-email (~150 KB
// instead of ~900 KB).
const KEEP_SUBSETS = new Set(['latin', 'latin-ext']);

function filterFontSubsets(css) {
  // Google's response is a stream of `/* <subset> */\n@font-face { ... }`
  // blocks. Split on the subset comment and keep only allowed subsets.
  const blocks = css.split(/(?=\/\*\s*[a-z0-9-]+\s*\*\/\s*@font-face)/i);
  const kept = blocks.filter((block, i) => {
    // First chunk before any @font-face is whitespace — drop it (or keep, empty is harmless).
    if (i === 0 && !/@font-face/.test(block)) return false;
    const m = block.match(/^\/\*\s*([a-z0-9-]+)\s*\*\//i);
    if (!m) return false;
    return KEEP_SUBSETS.has(m[1].toLowerCase());
  });
  return kept.join('');
}

async function buildInlineFontCss() {
  const cssUrl = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap';
  const cssRes = await fetch(cssUrl, { headers: { 'User-Agent': CHROME_UA } });
  if (!cssRes.ok) throw new Error(`Fonts CSS fetch failed: ${cssRes.status}`);
  let css = await cssRes.text();
  css = filterFontSubsets(css);

  mkdirSync(FONT_CACHE, { recursive: true });
  const urlRe = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/g;
  const urls = [...new Set([...css.matchAll(urlRe)].map((m) => m[1]))];

  let inlined = 0;
  for (const url of urls) {
    const hash = createHash('sha1').update(url).digest('hex').slice(0, 16);
    const cachePath = join(FONT_CACHE, `${hash}.woff2`);
    let buf;
    if (existsSync(cachePath)) {
      buf = readFileSync(cachePath);
    } else {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`Font fetch failed ${r.status}: ${url}`);
      buf = Buffer.from(await r.arrayBuffer());
      writeFileSync(cachePath, buf);
    }
    const dataUri = `data:font/woff2;base64,${buf.toString('base64')}`;
    css = css.split(url).join(dataUri);
    inlined++;
  }

  return {
    block: `<style data-inlined-fonts>\n${css}\n  </style>`,
    fontCount: inlined,
  };
}

function replaceFontLinks(html, inlineBlock) {
  const linkPreconnectApis = /[ \t]*<link\s+rel="preconnect"\s+href="https:\/\/fonts\.googleapis\.com"[^>]*>[ \t]*\n?/g;
  const linkPreconnectStatic = /[ \t]*<link\s+rel="preconnect"\s+href="https:\/\/fonts\.gstatic\.com"[^>]*>[ \t]*\n?/g;
  const linkStylesheet = /[ \t]*<link\s+href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]+"\s+rel="stylesheet"[^>]*>/g;
  return html
    .replace(linkPreconnectApis, '')
    .replace(linkPreconnectStatic, '')
    .replace(linkStylesheet, `  ${inlineBlock}`);
}

// ── Metadata injection ─────────────────────────────────────────────
// Stamp __COMMENTS_SOURCE_HASH__ + __COMMENTS_BRANCH__ into the file so
// an exported sidecar JSON can be traced back to the exact build a
// reviewer commented on. Read by the comment IIFE in sign-in.html.
function injectStandaloneMetadata(html, { sourceHash, branch }) {
  const globalsScript =
    `<script>window.__COMMENTS_SOURCE_HASH__=${JSON.stringify(sourceHash)};` +
    `window.__COMMENTS_BRANCH__=${JSON.stringify(branch)};</script>`;
  // Insert immediately after <head> so the constants are set before any
  // downstream <script> (including the IIFE) evaluates.
  const headOpenIdx = html.indexOf('<head>');
  if (headOpenIdx === -1) throw new Error('missing <head> tag');
  const insertAt = headOpenIdx + '<head>'.length;
  return html.slice(0, insertAt) + '\n  ' + globalsScript + html.slice(insertAt);
}

// ── Pipeline ──────────────────────────────────────────────────────
// Post-build assertions. The comment overlay MUST be present (this is
// what makes standalones commentable). Font URLs MUST be gone (they
// should all be inlined as data: URIs).
function assertClean(html, branchName) {
  const failures = [];
  const iifePresent = html.includes('(function commentsOverlay()');
  if (!iifePresent) failures.push('comment overlay IIFE missing');
  const externalFontCount =
    (html.match(/fonts\.googleapis\.com/g) || []).length +
    (html.match(/fonts\.gstatic\.com/g) || []).length;
  if (externalFontCount > 0) {
    failures.push(`external font URLs: ${externalFontCount}`);
  }
  if (failures.length) {
    throw new Error(`${branchName} → ${failures.join(', ')}`);
  }
}

async function buildOne(branch, fontBlock) {
  const { html: rawHtml, source } = loadSource(branch);

  const beforeFonts = (rawHtml.match(/fonts\.googleapis\.com/g) || []).length;
  let html = replaceFontLinks(rawHtml, fontBlock.block);

  // Hash the font-inlined HTML — that's what actually ships, so exports
  // can detect drift against exactly the build a reviewer used.
  const sourceHash = 'sha256:' + createHash('sha256').update(html).digest('hex').slice(0, 16);

  html = injectStandaloneMetadata(html, {
    sourceHash,
    branch: branch.gitRef,
  });

  assertClean(html, branch.name);

  const outFile = join(OUT_DIR, `sign-in-${branch.name}.html`);
  writeFileSync(outFile, html);

  const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
  console.log(
    `  ✓ standalone/sign-in-${branch.name}.html  ` +
      `(${kb} KB, source: ${source}, fonts: ${beforeFonts}→0, ` +
      `hash=${sourceHash.slice(7, 15)}…)`
  );
}

async function main() {
  console.log(`Repo: ${REPO_ROOT}`);
  console.log(`Current branch: ${currentBranch}`);
  mkdirSync(OUT_DIR, { recursive: true });

  console.log('Fetching + inlining Google Fonts (Roboto 400/500/700)...');
  const fontBlock = await buildInlineFontCss();
  const cssKb = (Buffer.byteLength(fontBlock.block) / 1024).toFixed(1);
  console.log(`  ✓ ${fontBlock.fontCount} WOFF2 file(s) inlined (${cssKb} KB CSS block)`);

  console.log('Building standalone HTML per branch:');
  let ok = true;
  for (const branch of BRANCHES) {
    try {
      await buildOne(branch, fontBlock);
    } catch (err) {
      console.error(`  ✗ ${branch.name}: ${err.message}`);
      ok = false;
    }
  }
  if (!ok) {
    console.error('\nOne or more branches failed. See errors above.');
    process.exit(1);
  }
  console.log('\nDone. Open any file in standalone/ or email it directly.');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
