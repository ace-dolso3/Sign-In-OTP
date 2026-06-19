// api/comments.js
//
// Shared commenting backend for the sign-in prototype.
// Storage: Vercel KV (Upstash Redis under the hood).
// Layout : one Redis hash per deployed branch — key = `comments:<branch>`,
//          field = comment id, value = JSON-serialized comment object.
//
// Forward-compatible schema (v1 ships fields; UI surfaces a subset):
//   {
//     id, schemaVersion: 1,
//     screenId, stateAttrs, xPct, yPct,
//     text,
//     authorId, authorLabel,
//     status: "open" | "resolved", resolvedAt, resolvedBy,
//     mentions: string[],
//     replies: Array<{ id, text, authorId, authorLabel, mentions, createdAt, updatedAt }>,
//     createdAt, updatedAt
//   }
//
// API surface:
//   GET    /api/comments              → 200 { comments: [...] }   (no auth)
//   POST   /api/comments              → 201 { comment }           (auth) body = full comment
//   PATCH  /api/comments?id=<id>      → 200 { comment }           (auth) body = partial fields
//   DELETE /api/comments?id=<id>      → 204                       (auth)
//
// Auth: writers send `Authorization: Bearer <COMMENT_WRITE_TOKEN>` where
// COMMENT_WRITE_TOKEN is a project-level env var. Future multi-user upgrade
// path: replace `isAuthorized()` with magic-link / per-user token check —
// nothing else in this file needs to change.

import { kv as defaultKv } from '@vercel/kv';

// ─── Config ───────────────────────────────────────────────────────────────
const SCHEMA_VERSION = 1;

const ALLOWED_FIELDS_ON_CREATE = new Set([
  'id', 'screenId', 'stateAttrs', 'xPct', 'yPct', 'text',
  'authorId', 'authorLabel', 'status', 'mentions', 'replies',
]);

const ALLOWED_FIELDS_ON_PATCH = new Set([
  'text', 'xPct', 'yPct', 'status', 'resolvedAt', 'resolvedBy',
  'mentions', 'replies', 'stateAttrs',
]);

// ─── Helpers ──────────────────────────────────────────────────────────────
function branchKey() {
  // Vercel auto-injects VERCEL_GIT_COMMIT_REF for git-linked deployments.
  // Falls back to a stable "local" namespace for `vercel dev`.
  const ref = process.env.VERCEL_GIT_COMMIT_REF || 'local';
  // Sanitize: slashes are fine in Redis keys but make logs noisier.
  const safe = ref.replace(/[^a-zA-Z0-9._/-]/g, '_');
  return `comments:${safe}`;
}

function isAuthorized(req) {
  const expected = process.env.COMMENT_WRITE_TOKEN;
  if (!expected) return false; // fail closed if misconfigured
  const header = req.headers?.authorization || req.headers?.Authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (!match) return false;
  // Constant-time-ish compare. These tokens are short; timing leakage is
  // minimal for this prototype, but use a length check first.
  const got = match[1];
  if (got.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < got.length; i++) {
    diff |= got.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

function setCors(res) {
  // Reads are public; writes are gated by the bearer token, not by origin.
  // Same-origin browser calls don't need CORS, but allowing GET from
  // anywhere makes ad-hoc curl + multi-domain previews painless.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(body));
}

async function readBody(req) {
  // Vercel parses JSON bodies automatically when Content-Type is set.
  if (req.body && typeof req.body === 'object') return req.body;
  // Fallback for raw streams.
  return await new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      if (!data) return resolve({});
      try { resolve(JSON.parse(data)); } catch (err) { reject(err); }
    });
    req.on('error', reject);
  });
}

function nowMs() { return Date.now(); }

function pick(obj, allowed) {
  const out = {};
  for (const k of Object.keys(obj || {})) {
    if (allowed.has(k)) out[k] = obj[k];
  }
  return out;
}

function normalizeOnCreate(input) {
  const id = typeof input.id === 'string' && input.id.length > 0
    ? input.id
    : `c_${nowMs().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const ts = nowMs();
  const fields = pick(input, ALLOWED_FIELDS_ON_CREATE);
  return {
    id,
    schemaVersion: SCHEMA_VERSION,
    screenId: String(fields.screenId || ''),
    stateAttrs: fields.stateAttrs && typeof fields.stateAttrs === 'object' ? fields.stateAttrs : {},
    xPct: Number.isFinite(fields.xPct) ? fields.xPct : 0,
    yPct: Number.isFinite(fields.yPct) ? fields.yPct : 0,
    text: typeof fields.text === 'string' ? fields.text : '',
    authorId: typeof fields.authorId === 'string' ? fields.authorId : 'owner',
    authorLabel: typeof fields.authorLabel === 'string' ? fields.authorLabel : null,
    status: fields.status === 'resolved' ? 'resolved' : 'open',
    resolvedAt: null,
    resolvedBy: null,
    mentions: Array.isArray(fields.mentions) ? fields.mentions : [],
    replies: Array.isArray(fields.replies) ? fields.replies : [],
    createdAt: ts,
    updatedAt: ts,
  };
}

function validateCreate(c) {
  if (!c.screenId) return 'screenId is required';
  // xPct/yPct are screen-relative percentages, but a click outside the
  // screen card (gutter, narrative caption, etc.) is allowed and produces
  // values outside [0,1]. Clamp to a generous sanity range so we still
  // catch NaN/Infinity/runaway coordinates.
  if (!Number.isFinite(c.xPct) || c.xPct < -5 || c.xPct > 5) return 'xPct out of range';
  if (!Number.isFinite(c.yPct) || c.yPct < -5 || c.yPct > 5) return 'yPct out of range';
  if (typeof c.text !== 'string') return 'text must be a string';
  if (c.text.length > 4000) return 'text exceeds 4000 chars';
  return null;
}

// ─── Handler ──────────────────────────────────────────────────────────────
//
// Exported as a factory so tests can inject an in-memory KV. The default
// export uses the real @vercel/kv singleton.
export function createHandler({ kv } = { kv: defaultKv }) {
  return async function handler(req, res) {
    setCors(res);

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    const key = branchKey();

    try {
      if (req.method === 'GET') {
        const entries = await kv.hgetall(key); // { id: commentObj } or null
        const comments = entries
          ? Object.values(entries).map((v) => (typeof v === 'string' ? JSON.parse(v) : v))
          : [];
        comments.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        return json(res, 200, { comments, branch: key.slice('comments:'.length) });
      }

      if (req.method === 'POST') {
        if (!isAuthorized(req)) return json(res, 401, { error: 'unauthorized' });
        const body = await readBody(req);
        const comment = normalizeOnCreate(body);
        const err = validateCreate(comment);
        if (err) return json(res, 400, { error: err });
        await kv.hset(key, { [comment.id]: JSON.stringify(comment) });
        return json(res, 201, { comment });
      }

      if (req.method === 'PATCH') {
        if (!isAuthorized(req)) return json(res, 401, { error: 'unauthorized' });
        const id = req.query?.id;
        if (!id) return json(res, 400, { error: 'id query param required' });
        const existing = await kv.hget(key, id);
        if (!existing) return json(res, 404, { error: 'not found' });
        const current = typeof existing === 'string' ? JSON.parse(existing) : existing;
        const body = await readBody(req);
        const patch = pick(body, ALLOWED_FIELDS_ON_PATCH);
        const updated = { ...current, ...patch, id: current.id, updatedAt: nowMs() };
        // Maintain resolved metadata invariants.
        if (patch.status === 'resolved' && current.status !== 'resolved') {
          updated.resolvedAt = nowMs();
          updated.resolvedBy = typeof patch.resolvedBy === 'string' ? patch.resolvedBy : (current.authorId || 'owner');
        } else if (patch.status === 'open' && current.status === 'resolved') {
          updated.resolvedAt = null;
          updated.resolvedBy = null;
        }
        await kv.hset(key, { [id]: JSON.stringify(updated) });
        return json(res, 200, { comment: updated });
      }

      if (req.method === 'DELETE') {
        if (!isAuthorized(req)) return json(res, 401, { error: 'unauthorized' });
        const id = req.query?.id;
        if (!id) return json(res, 400, { error: 'id query param required' });
        const removed = await kv.hdel(key, id);
        if (!removed) return json(res, 404, { error: 'not found' });
        res.status(204).end();
        return;
      }

      res.setHeader('Allow', 'GET, POST, PATCH, DELETE, OPTIONS');
      return json(res, 405, { error: 'method not allowed' });
    } catch (err) {
      // Surface the message but not the full stack to clients.
      console.error('[api/comments] error:', err);
      return json(res, 500, { error: 'internal error', message: err?.message || String(err) });
    }
  };
}

export default createHandler();
