# LLM Integration Instructions

> Audience: an AI coding agent (e.g., GitHub Copilot, Claude Code, Cursor)
> being asked to add this commenting feature to a new project. Follow this
> runbook top-to-bottom. Stop and ask the user if a step's preconditions
> don't hold.

## What you are integrating

A drop-in "click anywhere, leave a note" overlay for HTML prototypes,
backed by Vercel KV (Upstash Redis) and a single serverless function.
It's two things glued together:

1. **`api/comments.js`** — an ESM Vercel serverless function. Exposes
   `GET /api/comments` (public reads) and `POST | PATCH | DELETE
   /api/comments` (bearer-token writes). Storage is one Redis hash per
   git branch (key = `comments:<VERCEL_GIT_COMMIT_REF>`), so each preview
   URL has its own isolated comments.
2. **`frontend/comments.css` + `frontend/comments.js`** — a self-contained
   IIFE that injects a toggle button, manages dots, popovers, and a token
   modal. Reads optional config from `window.COMMENTS_CONFIG`.

Read `README.md` first if you haven't already. This document is the
implementation runbook.

---

## Step 0: Verify preconditions

Before touching anything, check:

- [ ] The target project is (or will be) deployed on **Vercel**. (If not,
      stop and ask the user. The backend assumes Vercel-style serverless
      handlers + Vercel KV. Porting to Cloudflare Workers / Netlify
      requires changes — see the porting notes at the bottom.)
- [ ] The host page is **HTML-based** with one or more "screens" that get
      swapped in/out of a parent container. The default config expects:
      - A stage container with id `screens-container`
      - Direct children of that stage are screens, each with a unique `id`
      - Screens are hidden via the HTML `hidden` attribute
- [ ] If the project uses a build tool (Vite, Next.js, Webpack), confirm
      with the user **where static assets go** so you place `comments.css`
      and `comments.js` correctly. For Next.js, the API function path is
      different — see "Next.js notes" below.

If the host page's screen structure differs from the defaults, you will
need to override selectors via `window.COMMENTS_CONFIG`. Don't modify
`comments.js` directly — use the config object.

---

## Step 1: Copy files

```
cp -r commenting-feature/api          <project-root>/api
cp -r commenting-feature/frontend     <project-root>/frontend
```

Where `<project-root>` is whatever directory holds the project's
`package.json` (or where it will live).

**Critical**: `api/comments.js` is ESM (`import { kv } from '@vercel/kv'`).
The project's root `package.json` MUST contain `"type": "module"` — or, if
the project is CommonJS-based, rename the file to `api/comments.mjs`.

---

## Step 2: Add the dependency

In the project's `package.json`:

```json
{
  "type": "module",
  "dependencies": {
    "@vercel/kv": "^3.0.0"
  }
}
```

Then run `npm install` (or `pnpm install` / `yarn`).

Note: `@vercel/kv` v3 shows a deprecation warning. It still works against
Upstash Redis. If the user wants the cleaner path, suggest migrating to
`@upstash/redis` directly — the command API is identical (`hgetall`,
`hget`, `hset`, `hdel`), only the import line changes.

---

## Step 3: Provision storage

This step requires the user to act in the Vercel dashboard. Do not
attempt to script it.

Tell the user:

1. Open the Vercel project → **Storage** tab → **Create Database**
2. Choose **Upstash for Redis** (the "Marketplace" option, not the legacy
   `@vercel/kv` integration if presented as separate options)
3. Name it (e.g. `comments`) and connect it to the project
4. Vercel will auto-inject `KV_REST_API_URL`, `KV_REST_API_TOKEN`, and a
   few siblings as env vars for all three environments
   (Production / Preview / Development)

---

## Step 4: Set the write token

```bash
# Have the user pick a strong random string. Example: openssl rand -hex 24
vercel env add COMMENT_WRITE_TOKEN production
vercel env add COMMENT_WRITE_TOKEN preview
vercel env add COMMENT_WRITE_TOKEN development
```

All three environments must have the same value (or different values, as
long as the user knows which to paste in each environment).

Then, for local dev:

```bash
vercel env pull .env.local --yes
```

Verify `.env.local` is gitignored. If not, add `.env*.local` to
`.gitignore`.

---

## Step 5: Wire the assets into the host page

Add to `<head>`:

```html
<link rel="stylesheet" href="/frontend/comments.css" />
```

Add **just before** `</body>`:

```html
<script src="/frontend/comments.js" defer></script>
```

If the project uses a build tool that bundles assets:

- **Vite / static**: place files in `public/` (so they're served from `/`).
- **Next.js**: place files in `public/` and add `import` of the CSS into
  the root layout. Move `api/comments.js` to `pages/api/comments.js` or
  `app/api/comments/route.js` — and adapt the handler signature (see
  "Next.js notes").
- **Plain HTML on Vercel**: copy verbatim into the project root. No build
  step needed.

### Configure if your selectors differ

If the host page doesn't use `#screens-container` as its stage, add this
BEFORE the comments script tag:

```html
<script>
  window.COMMENTS_CONFIG = {
    stageSelector:        '#my-stage',                // required
    screenSelector:       '#my-stage > section',      // required
    apiUrl:               '/api/comments',            // optional
    flowsGlobal:          '__myFlows',                // optional, for flow pills
    navItemSelector:      '.my-nav-item[data-target]',// optional
    flowButtonSelector:   '.my-flow-btn[data-flow-id]', // optional
  };
</script>
<script src="/frontend/comments.js" defer></script>
```

All keys are optional. Defaults match the original prototype this was
extracted from. If your project has no flow/nav-pill DOM, just leave
those keys unset — the feature degrades silently.

---

## Step 6: Smoke test locally

```bash
vercel dev
# In another shell:
curl -i http://localhost:3000/api/comments
# Expect: 200 OK with {"comments": [], "branch": "local"}

curl -i -X POST http://localhost:3000/api/comments
# Expect: 401 unauthorized (no token)

curl -i -X POST http://localhost:3000/api/comments \
  -H "Authorization: Bearer $COMMENT_WRITE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"screenId":"smoke-test","xPct":0.5,"yPct":0.5,"text":"hello"}'
# Expect: 201 with the created comment

curl http://localhost:3000/api/comments
# Expect: 200 with the comment you just created
```

Then open the host page in a browser:

- Click the floating comment toggle (top-right, looks like a chat box).
  The cursor should become a crosshair.
- Click anywhere on a screen — a popover appears.
- Type a note, click Save. You'll be prompted for the bearer token.
- Paste your `COMMENT_WRITE_TOKEN`. The dot should appear; reload to
  confirm persistence.

If any of these fail, see "Troubleshooting" below.

---

## Step 7: Deploy

```bash
git add api/comments.js frontend/ package.json package-lock.json
git commit -m "Add prototype commenting feature"
git push
vercel deploy   # or let the git integration auto-deploy
```

Each new Vercel preview URL = a fresh `comments:<branch>` bucket. Merging
to `main` does NOT migrate comments; the `main` deployment has its own
empty bucket the first time it runs.

---

## Critical "do not break" rules

When integrating, DO NOT:

- **Modify `api/comments.js`** unless the user explicitly wants schema
  changes. The schema is versioned and forward-compatible — extend, don't
  mutate.
- **Modify `frontend/comments.js`** beyond changing the config block.
  Almost every change you might be tempted to make (selectors, API URL,
  toggle position, optional integrations) is already configurable via
  `window.COMMENTS_CONFIG` or CSS overrides.
- **Inline the CSS/JS into the host page** unless the user specifically
  requests a single-file deliverable. Keeping them as separate files
  makes future syncs / re-extracts trivial.
- **Add `comments` to the `switchScreen` / router code** of the host
  page. The IIFE installs a `MutationObserver` on the stage container and
  reacts to `hidden` attribute changes on its own. If the host uses a
  different visibility mechanism (`display:none`, class toggles, React
  state, etc.), the observer needs adjustment — see "Custom visibility
  mechanisms" below.

---

## Custom visibility mechanisms

The default IIFE detects the active screen as: "child of `STAGE_SELECTOR`
that does NOT have the `hidden` attribute, and (during animation)
preferably the one without inline `pointer-events: none`."

If your host uses `display: none` toggles instead, you have two options:

1. **Easiest**: keep the existing `hidden` attribute toggling in addition
   to whatever else you do. The browser treats `hidden` and `display:
   none` identically by default, so you can use both.
2. **Surgical**: change two lines in `comments.js`'s `getActiveScreen()`
   to check `el.style.display !== 'none'` (or your own class). This is
   the only place in the file that needs to change to support a
   different visibility model.

For React / Vue / Svelte hosts where screens mount/unmount: the
`MutationObserver` already handles that path — children appearing and
disappearing fires the same callback. No change required.

---

## Multi-variant screens (data-* state)

The IIFE captures all `data-*` attributes on a screen at the moment a
comment is placed. When rendering, it shows a comment only when the
screen's current `data-*` attributes match the stored ones. This means
you can have one screen `id` that represents multiple visual variants
(e.g. `data-state="default"` vs `data-state="error"`) and comments stay
scoped to their variant.

If you don't need this, do nothing — screens without `data-*` attrs
behave exactly as if everything is one variant.

---

## Adding flow-aware navigation pills (optional)

If your host page has a "demo nav" that lists screens or grouped flows,
you can get red/grey count badges on each row for free. Two conditions:

1. Expose your flow registry on `window.__protoFlows` (or whatever you
   pass to `flowsGlobal` in the config). Shape:
   ```js
   [
     { id: 'flow-1', steps: [{ screen: 'screen-foo', state: 'default' }, ...] },
     ...
   ]
   ```
2. Tag your nav DOM:
   - Screen rows: `<button class="proto-nav-item" data-nav-target="screen-foo" data-nav-state="default">`
   - Flow rows:   `<button class="proto-flow-btn" data-flow-id="flow-1">`

Both selectors are overridable via `navItemSelector` / `flowButtonSelector`
in `COMMENTS_CONFIG`. If you don't have nav DOM, omit everything —
nothing breaks.

---

## Next.js notes

If the target is a Next.js project:

1. Move `api/comments.js` →
   - **Pages router**: `pages/api/comments.js` — handler signature is
     already correct (`(req, res) => {}`).
   - **App router**: `app/api/comments/route.js` — wrap each method as
     a named export (`export async function GET(req) { ... }` etc.) and
     replace `res.status(...).send(...)` with `return NextResponse.json(...)`.
     Move `setCors()` into a `middleware.ts` if you need it.
2. Move `frontend/comments.css` import into `app/layout.tsx` or
   `pages/_app.tsx`.
3. Move `frontend/comments.js` to `public/comments.js` and load via
   `<Script src="/comments.js" strategy="afterInteractive" />` — or
   convert it to a client component (`'use client'`) and import it.

The KV calls and schema do NOT change.

---

## Troubleshooting

| Symptom                                       | Likely cause                                                         | Fix |
| --------------------------------------------- | -------------------------------------------------------------------- | --- |
| Toggle doesn't appear                          | `comments.js` not loaded, or 404 on the script URL                  | Check Network tab; confirm path. |
| Toggle appears, but click does nothing         | `STAGE_SELECTOR` doesn't match the host DOM                          | Set `window.COMMENTS_CONFIG.stageSelector` to the right id. |
| `GET /api/comments` returns 500                | `KV_REST_API_URL` / `KV_REST_API_TOKEN` not set, or wrong store     | Check Vercel env vars; re-run `vercel env pull`. |
| `POST` returns 401 even with token             | Token in the modal != `COMMENT_WRITE_TOKEN` env var, or var unset    | Re-set env var; clear `localStorage['comments.token']` and re-enter. |
| Dots show but float at wrong position          | Active-screen detection picked the wrong screen                      | Check that `STAGE_SELECTOR` child has the `hidden` attribute on inactive screens. |
| Dots clipped at screen edges                   | Old build of the IIFE used per-screen overlays. Current build uses a body-level layer | Confirm `#comments-dots-layer` exists in the DOM after init. |
| Comments survive across branches               | Branch detection failed; everything wrote to `comments:local`        | Confirm `VERCEL_GIT_COMMIT_REF` is set in the deployed env. |
| `vercel dev` works locally but not deployed    | Missing env vars in production/preview                               | `vercel env ls` to verify all three envs have `KV_*` and `COMMENT_WRITE_TOKEN`. |
| Modal won't take focus / can't paste token     | An ancestor has `inert` or `aria-hidden="true"`                      | Move the modal append target to `<body>` (already the default) or remove the inert ancestor. |

---

## Porting to non-Vercel hosts

The backend has three Vercel-specific dependencies, in order of
difficulty to remove:

1. **`@vercel/kv` SDK** — swap for any Redis client (`@upstash/redis`,
   `ioredis`, etc.). All four hash commands are standard Redis.
2. **`VERCEL_GIT_COMMIT_REF` env var** for branch isolation — pass any
   per-deploy identifier (e.g. Cloudflare's `CF_PAGES_BRANCH`, Netlify's
   `BRANCH`, or a build-time injected `GIT_COMMIT_REF`).
3. **Handler signature** — Vercel uses Node-style `(req, res)`.
   Cloudflare Workers / Netlify Edge / Next.js App Router all use the
   web `Request`/`Response` model. The handler is small enough (~70
   lines of routing) that a full rewrite is faster than adapting.

The frontend is host-agnostic — it just needs the API to honor the
contract documented at the top of `api/comments.js`.

---

## When the user asks to extend the feature

Common extensions and where to make the change:

- **Multi-user auth** → `api/comments.js` → replace `isAuthorized()` with
  per-user verification. The schema already has `authorId` /
  `authorLabel` fields populated on every write — just start using them.
- **Replies / threads** → schema has `replies: []` already. Add UI to the
  popover's "view" branch in `comments.js` (`openPopoverForComment`).
  Backend already accepts the field on create and patch.
- **Mentions** → `mentions: []` in schema. Tokenize on `@` in textarea,
  store ids, render as styled spans.
- **Export to Markdown/JSON** → call `GET /api/comments`, format
  client-side. Add a button to the toggle's hover menu.
- **Annotation tools (arrows, boxes)** → larger lift. The current point
  model (`xPct`, `yPct`) would need to expand to shapes. Bump
  `schemaVersion` and add a discriminator field.

---

## What to tell the user when you're done

A good handoff message includes:

1. The Vercel env vars that need to be set (and which are already set).
2. The write token they need to paste into the modal (or where they can
   find it — usually `vercel env pull` then read `.env.local`).
3. The Debug API: `window.__comments.{list, reload, enter, exit,
   clearToken}` for sanity checking.
4. The branch isolation behavior — so they're not surprised when
   comments don't appear on a freshly-deployed branch.
