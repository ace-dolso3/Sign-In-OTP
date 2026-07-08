#!/usr/bin/env node
/**
 * build-standalone.mjs
 * --------------------
 * Produce fully self-contained, colleague-shareable HTML files for each
 * tracked branch's sign-in.html. Each output file:
 *   • inlines Google Fonts (Roboto 400/500/700) as base64 WOFF2 @font-face
 *   • strips the /api/comments overlay (CSS + JS + toggle button)
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
  { name: 'wave-1-scaffolding',         gitRef: 'feature/wave-1-scaffolding' },
  // Wave2 also emits a `-review.html` variant with the comment overlay
  // kept and MODE forced to 'local' — shippable to colleagues for
  // sidecar-JSON review (no backend needed). See STANDALONE-BUILD.md.
  { name: 'heuristic-alignment-wave2',  gitRef: 'feature/heuristic-alignment-wave2', reviewVariant: true },
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

// ── Comment overlay stripping ─────────────────────────────────────
// The CSS block starts at a `/* ─── Comments overlay ... ─── */` sentinel
// inside <style>...</style> and ends just before </style>.
function stripCommentsCss(html) {
  const startRe = /\n[ \t]*\/\* ─── Comments overlay/;
  const startMatch = html.match(startRe);
  if (!startMatch) return { html, stripped: false };
  const startIdx = startMatch.index + 1; // keep the newline; start at the indent
  const styleClose = html.indexOf('</style>', startIdx);
  if (styleClose === -1) return { html, stripped: false };
  // Preserve indent + newline immediately before </style>
  const styleLineStart = html.lastIndexOf('\n', styleClose);
  return {
    html: html.slice(0, startIdx) + html.slice(styleLineStart + 1),
    stripped: true,
  };
}

// The JS block is a preamble comment `/* ─── Comments overlay ... */` followed
// by `(function commentsOverlay() { ... })();` — it is always the LAST IIFE
// in the script (immediately before `</script>`). We locate the last `})();`
// before `</script>` and slice back to the preamble comment.
function stripCommentsJs(html) {
  const iifeStart = html.indexOf('(function commentsOverlay()');
  if (iifeStart === -1) return { html, stripped: false };
  const preSentinelIdx = html.lastIndexOf('/* ─── Comments overlay', iifeStart);
  if (preSentinelIdx === -1) return { html, stripped: false };
  const blockStart = html.lastIndexOf('\n', preSentinelIdx - 1) + 1;

  // Find the last `})();` that appears before </script>
  const scriptClose = html.indexOf('</script>', iifeStart);
  if (scriptClose === -1) return { html, stripped: false };
  const iifeCloseIdx = html.lastIndexOf('})();', scriptClose);
  if (iifeCloseIdx === -1 || iifeCloseIdx < iifeStart) {
    return { html, stripped: false };
  }
  const afterIife = iifeCloseIdx + '})();'.length;

  // Preserve indent + newline immediately before </script>
  const scriptLineStart = html.lastIndexOf('\n', scriptClose);
  return {
    html: html.slice(0, blockStart) + html.slice(scriptLineStart + 1),
    stripped: true,
    // afterIife is not used in the slice — we just anchor to </script>'s line —
    // but we validate the IIFE terminator was actually found so we don't
    // silently slice across a malformed file.
    _guard: afterIife,
  };
}

// ── Pipeline ──────────────────────────────────────────────────────
function assertClean(html, branchName) {
  const checks = {
    '/api/comments': /\/api\/comments/g,
    commentsOverlay: /commentsOverlay/g,
    'comments-toast': /comments-toast/g,
    'fonts.googleapis.com': /fonts\.googleapis\.com/g,
    'fonts.gstatic.com': /fonts\.gstatic\.com/g,
  };
  const failures = [];
  for (const [label, re] of Object.entries(checks)) {
    const n = (html.match(re) || []).length;
    if (n > 0) failures.push(`${label}: ${n}`);
  }
  if (failures.length) {
    throw new Error(`leftover references in ${branchName} → ${failures.join(', ')}`);
  }
}

// ── Review variant ─────────────────────────────────────────
// Emit a copy of the branch's sign-in.html with the comment overlay KEPT
// (no strip) and window.__COMMENTS_MODE__='local' injected so the IIFE runs
// in reviewer mode against localStorage. Fonts are still inlined so it works
// offline. Colleague opens the file, comments, clicks Export → gets a
// sidecar JSON sent back to the owner for Import.
function injectCommentsMode(html, { mode, sourceHash, branch }) {
  const globalsScript =
    `<script>window.__COMMENTS_MODE__=${JSON.stringify(mode)};` +
    `window.__COMMENTS_SOURCE_HASH__=${JSON.stringify(sourceHash)};` +
    `window.__COMMENTS_BRANCH__=${JSON.stringify(branch)};</script>`;
  // Insert immediately after <head> so the constants are set before any
  // downstream <script> (including the IIFE) evaluates.
  const headOpenIdx = html.indexOf('<head>');
  if (headOpenIdx === -1) throw new Error('missing <head> tag');
  const insertAt = headOpenIdx + '<head>'.length;
  return html.slice(0, insertAt) + '\n  ' + globalsScript + html.slice(insertAt);
}

async function buildReviewVariant(branch, fontBlock, rawHtml) {
  // Inline fonts (same as the stripped standalone) but keep comment overlay.
  let html = replaceFontLinks(rawHtml, fontBlock.block);

  // Hash the *font-inlined* HTML — that's what actually ships to the
  // reviewer, so the owner's Import can detect drift against exactly what
  // was reviewed.
  const sourceHash = 'sha256:' + createHash('sha256').update(html).digest('hex').slice(0, 16);

  html = injectCommentsMode(html, {
    mode: 'local',
    sourceHash,
    branch: branch.gitRef,
  });

  // Sanity: comments code MUST still be present in the review variant.
  const iifePresent = html.includes('(function commentsOverlay()');
  const modeInjected = html.includes("window.__COMMENTS_MODE__=\"local\"");
  if (!iifePresent || !modeInjected) {
    throw new Error(
      `review variant integrity check failed for ${branch.name} ` +
      `(iife=${iifePresent}, mode=${modeInjected})`
    );
  }

  const outFile = join(OUT_DIR, `sign-in-${branch.name}-review.html`);
  writeFileSync(outFile, html);
  const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
  console.log(
    `  ✓ standalone/sign-in-${branch.name}-review.html  ` +
      `(${kb} KB, MODE=local, hash=${sourceHash.slice(7)}…)`
  );
}

async function buildOne(branch, fontBlock) {
  const { html: rawHtml, source } = loadSource(branch);
  let html = rawHtml;

  const beforeFonts = (html.match(/fonts\.googleapis\.com/g) || []).length;
  html = replaceFontLinks(html, fontBlock.block);

  const cssResult = stripCommentsCss(html);
  html = cssResult.html;

  const jsResult = stripCommentsJs(html);
  html = jsResult.html;

  assertClean(html, branch.name);

  const outFile = join(OUT_DIR, `sign-in-${branch.name}.html`);
  writeFileSync(outFile, html);

  const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
  console.log(
    `  ✓ standalone/sign-in-${branch.name}.html  ` +
      `(${kb} KB, source: ${source}, ` +
      `comments-css: ${cssResult.stripped ? 'stripped' : 'not-found'}, ` +
      `comments-js: ${jsResult.stripped ? 'stripped' : 'not-found'}, ` +
      `fonts: ${beforeFonts}→0)`
  );

  // Emit the paired -review.html variant when this branch opts in.
  if (branch.reviewVariant) {
    await buildReviewVariant(branch, fontBlock, rawHtml);
  }
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
