#!/usr/bin/env node
/**
 * bake-comments.mjs
 * -----------------
 * Reads an exported comments JSON sidecar (or raw JSON array) and embeds
 * the comments directly into sign-in.html AND all standalone/*.html files
 * so they persist across browsers, file transfers, and localStorage clears.
 *
 * Usage:
 *   node scripts/bake-comments.mjs <comments.json>
 *   npm run bake-comments -- <comments.json>
 *
 * The script replaces the `window.__EMBEDDED_COMMENTS__ = [...];` block
 * (between the header comment and the %%EMBEDDED_COMMENTS_END%% sentinel)
 * in every file that contains the markers.
 *
 * To clear all embedded comments:
 *   npm run bake-comments -- --clear
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = dirname(dirname(__filename));
const HTML_FILE = join(REPO_ROOT, 'sign-in.html');

const START_MARKER = 'window.__EMBEDDED_COMMENTS__';
const END_MARKER = '// %%EMBEDDED_COMMENTS_END%%';

/** Collect all HTML files that contain the embedded-comments markers. */
function findTargetFiles() {
  const files = [HTML_FILE];
  const standaloneDir = join(REPO_ROOT, 'standalone');
  if (existsSync(standaloneDir)) {
    for (const name of readdirSync(standaloneDir)) {
      if (name.endsWith('.html')) files.push(join(standaloneDir, name));
    }
  }
  // Only return files that actually have the markers
  return files.filter(f => {
    try {
      const content = readFileSync(f, 'utf-8');
      return content.includes(START_MARKER) && content.includes(END_MARKER);
    } catch { return false; }
  });
}

/** Bake comments into a single HTML file. Returns true on success. */
function bakeIntoFile(filePath, comments) {
  const html = readFileSync(filePath, 'utf-8');
  const startIdx = html.indexOf(START_MARKER);
  const endIdx = html.indexOf(END_MARKER);
  if (startIdx === -1 || endIdx === -1) return false;

  const lineStart = html.lastIndexOf('\n', startIdx) + 1;
  const lineEnd = html.indexOf('\n', endIdx);

  const indent = '    ';
  const jsonStr = comments.length === 0
    ? '[]'
    : JSON.stringify(comments, null, 2).split('\n').map((line, i) => i === 0 ? line : indent + line).join('\n');

  const newBlock = indent + START_MARKER + ' = ' + jsonStr + ';\n' + indent + END_MARKER;
  const newHtml = html.slice(0, lineStart) + newBlock + html.slice(lineEnd);

  writeFileSync(filePath, newHtml, 'utf-8');
  return true;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`Usage:
  node scripts/bake-comments.mjs <comments.json>   Embed comments into all HTML files
  node scripts/bake-comments.mjs --clear            Remove all embedded comments
  node scripts/bake-comments.mjs --show             Show currently embedded comments`);
    process.exit(0);
  }

  if (args[0] === '--show') {
    const html = readFileSync(HTML_FILE, 'utf-8');
    const startIdx = html.indexOf(START_MARKER);
    const endIdx = html.indexOf(END_MARKER);
    if (startIdx === -1 || endIdx === -1) {
      console.error('ERROR: markers not found in sign-in.html');
      process.exit(1);
    }
    const lineStart = html.lastIndexOf('\n', startIdx) + 1;
    const lineEnd = html.indexOf('\n', endIdx);
    console.log(html.slice(lineStart, lineEnd));
    process.exit(0);
  }

  let comments;

  if (args[0] === '--clear') {
    comments = [];
    console.log('Clearing all embedded comments.');
  } else {
    const jsonPath = resolve(args[0]);
    let raw;
    try {
      raw = readFileSync(jsonPath, 'utf-8');
    } catch (err) {
      console.error('ERROR: Could not read file:', jsonPath);
      console.error(err.message);
      process.exit(1);
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error('ERROR: Invalid JSON:', err.message);
      process.exit(1);
    }

    // Accept either a sidecar { schema, comments: [...] } or a raw array
    if (Array.isArray(parsed)) {
      comments = parsed;
    } else if (parsed && Array.isArray(parsed.comments)) {
      comments = parsed.comments;
      if (parsed.branch) console.log('  Branch:', parsed.branch);
      if (parsed.sourceHash) console.log('  Source hash:', parsed.sourceHash);
      if (parsed.reviewer?.name) console.log('  Reviewer:', parsed.reviewer.name);
    } else {
      console.error('ERROR: JSON must be an array of comments or a sidecar { comments: [...] }');
      process.exit(1);
    }

    // Basic validation
    for (const c of comments) {
      if (!c || !c.id) {
        console.error('ERROR: Every comment must have an "id" field.');
        process.exit(1);
      }
    }
  }

  // Find all target files (sign-in.html + standalone/*.html)
  const targets = findTargetFiles();
  console.log('Embedding ' + comments.length + ' comment' + (comments.length === 1 ? '' : 's') + ' into ' + targets.length + ' file(s):');

  for (const filePath of targets) {
    const relPath = filePath.replace(REPO_ROOT + '/', '');
    if (bakeIntoFile(filePath, comments)) {
      console.log('  ✓ ' + relPath);
    } else {
      console.error('  ✗ ' + relPath + ' (markers not found)');
    }
  }

  console.log('Done.');

  if (comments.length > 0) {
    const byScreen = {};
    for (const c of comments) {
      const key = c.screenId || '(unknown)';
      byScreen[key] = (byScreen[key] || 0) + 1;
    }
    console.log('\nComments by screen:');
    for (const [screen, count] of Object.entries(byScreen).sort((a, b) => b[1] - a[1])) {
      console.log('  ' + screen + ': ' + count);
    }
  }
}

main();
