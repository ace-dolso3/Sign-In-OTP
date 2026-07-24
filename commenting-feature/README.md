# Prototype Commenting Feature — Portable Package

A self-contained "stick a sticky-note on the screen" commenting layer for HTML
prototypes. Originally built for the Ace Hardware sign-in prototype; extracted
here so it can be dropped into any similar HTML-based prototype that swaps
between screens inside a single stage container.

## What it gives you

- A floating **comment toggle** (top-right by default) that turns the cursor
  into a crosshair. Click anywhere to drop a numbered dot.
- A **popover** for composing, editing, resolving/reopening, and deleting
  comments. Inline two-step delete confirmation (no native `confirm()`).
- **Per-screen / per-flow nav badges** (optional — only renders if your
  project exposes matching nav DOM).
- **Public read, owner write** — anyone with the URL sees the dots; only
  someone with the write token can create/edit/resolve/delete.
- **Branch isolation** — each Vercel preview branch gets its own comment
  bucket, so merging code doesn't merge comments.
- **State-aware dots** — if a screen has multiple variants represented by
  `data-*` attributes (e.g. `data-state="passkey-first"`), comments are
  scoped to the variant they were placed on.
- **Resilient to layout** — dots live on a body-level layer with
  page-coordinate positioning, so ancestor `overflow:hidden` never clips
  them. Dots reflow on resize/scroll.

## Architecture

```
┌──────────────────────────────┐         ┌────────────────────────────┐
│ Browser (host prototype)     │  HTTP   │ Vercel serverless function │
│                              │ ──────► │  /api/comments             │
│  - comments.css              │         │  - GET (public)            │
│  - comments.js (IIFE)        │ ◄────── │  - POST/PATCH/DELETE       │
│  - host page (any HTML)      │         │    (Bearer token)          │
└──────────────────────────────┘         └────────────┬───────────────┘
                                                      │
                                                      ▼
                                            ┌──────────────────────┐
                                            │ Upstash Redis        │
                                            │ (via Vercel KV)      │
                                            │ key = comments:<ref> │
                                            └──────────────────────┘
```

- **Storage**: One Redis hash per git branch. Key = `comments:<VERCEL_GIT_COMMIT_REF>`,
  field = comment id, value = JSON-serialized comment object.
- **Auth**: A single shared `COMMENT_WRITE_TOKEN` env var. Reads are open.
- **Schema** is versioned (`schemaVersion: 1`) with a forward-compatible
  superset of fields (replies, mentions, resolved metadata) so you can
  extend the UI without touching the backend.

## Host page contract

Your prototype must have:

1. A **stage container** that holds switchable screen children. By default
   the package looks for `#screens-container` with direct children that are
   shown/hidden via the `hidden` attribute (or are removed entirely).
2. Each screen child should have a stable `id` attribute — that's what
   anchors comments to a screen.

If your selectors are different, override them via `window.COMMENTS_CONFIG`
(see `LLM-INTEGRATION.md`).

## Quick install

```bash
# 1. Copy package files into your project
cp -r commenting-feature/api ./api
cp -r commenting-feature/frontend ./frontend

# 2. Merge package.json deps (or copy whole file if you have none)
#    Adds:  "@vercel/kv": "^3.0.0"
#    Note:  "type": "module" is required at the root because api/comments.js
#           is ESM.

# 3. Link CSS + JS in your HTML, before </head> and </body> respectively:
#    <link rel="stylesheet" href="/frontend/comments.css" />
#    <script src="/frontend/comments.js" defer></script>

# 4. Provision Upstash Redis via Vercel dashboard
#    Vercel → Storage → Create → Upstash for Redis → name it (e.g. "comments")
#    Connect it to the project. Vercel injects KV_REST_API_URL +
#    KV_REST_API_TOKEN automatically.

# 5. Set COMMENT_WRITE_TOKEN
vercel env add COMMENT_WRITE_TOKEN production
vercel env add COMMENT_WRITE_TOKEN preview
vercel env add COMMENT_WRITE_TOKEN development

# 6. Deploy
vercel deploy
```

For local dev:

```bash
vercel env pull .env.local --yes  # gitignored
vercel dev
# Open http://localhost:3000
# Click the comment toggle (top-right), then click anywhere to add a note.
# When prompted, paste your COMMENT_WRITE_TOKEN.
```

## Files in this package

| Path                       | Purpose                                          |
| -------------------------- | ------------------------------------------------ |
| `api/comments.js`          | Vercel serverless function, ESM. The backend.    |
| `frontend/comments.css`    | All styling for toggle, dots, popover, modal, toast. |
| `frontend/comments.js`     | The IIFE. Self-bootstrapping; reads optional `window.COMMENTS_CONFIG`. |
| `package.json`             | Minimal deps (`@vercel/kv`) + `"type": "module"`. |
| `vercel.json.example`      | Optional rewrite hint.                            |
| `.env.example`             | Documents the required env vars.                 |
| `LLM-INTEGRATION.md`       | Step-by-step instructions written for an AI agent integrating this into a new project. |

## Debug API

While the page is loaded, `window.__comments` exposes:

- `list()` — array of all loaded comments
- `reload()` — re-fetch from backend
- `enter()` / `exit()` — toggle comment mode programmatically
- `clearToken()` — wipe the locally stored bearer token

## Limitations / future work

- Single-token auth model. To upgrade to multi-user, replace `isAuthorized()`
  in `api/comments.js` with magic-link / per-user token verification.
  Nothing in the frontend or schema has to change — `authorId` /
  `authorLabel` are already on every comment.
- `@vercel/kv` v3 is deprecated upstream but still works. A future cleanup
  would migrate to `@upstash/redis` directly (same Redis command API).
- Replies and `mentions` fields exist in the schema but the UI doesn't
  surface them yet.

See `LLM-INTEGRATION.md` for the detailed integration runbook.
