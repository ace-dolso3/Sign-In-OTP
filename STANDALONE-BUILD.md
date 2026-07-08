# Standalone HTML build

Portable, self-contained snapshots of the sign-in prototype — one per branch — that a colleague can open in any modern browser (including offline) without a server, Node, or internet connection.

## Output

Running `npm run standalone` produces the following files in `standalone/` (gitignored):

| File | Source branch | Purpose | Typical size |
| --- | --- | --- | --- |
| `sign-in-main.html` | `main` | Read-only snapshot (comments stripped) | ~330 KB |
| `sign-in-faceid-passkey.html` | `feature/faceid-passkey` | Read-only snapshot | ~600 KB |
| `sign-in-wave-1-scaffolding.html` | `feature/wave-1-scaffolding` | Read-only snapshot | ~690 KB |
| `sign-in-heuristic-alignment-wave2.html` | `feature/heuristic-alignment-wave2` | Read-only snapshot | ~705 KB |
| `sign-in-heuristic-alignment-wave2-review.html` | `feature/heuristic-alignment-wave2` | **Review copy** — colleague can comment offline, then Export JSON | ~760 KB |

Read-only snapshots go to stakeholders who just need to see the prototype. The `-review.html` variant goes to reviewers who need to leave feedback. See [Review workflow](#review-workflow) below.

## What gets transformed

The build script ([scripts/build-standalone.mjs](scripts/build-standalone.mjs)) does exactly two surgical transforms to each branch's `sign-in.html`:

1. **Inlines Google Fonts.** The three `<link>` tags for `fonts.googleapis.com` / `fonts.gstatic.com` are replaced by one `<style data-inlined-fonts>` block containing every Roboto 400/500/700 `@font-face` rule. Font binaries are downloaded as WOFF2 and base64-embedded as `data:font/woff2;base64,...`. Only the `latin` and `latin-ext` subsets are kept (cyrillic/greek/vietnamese/math are dropped — ~600 KB smaller).
2. **Strips the comment overlay.** The `/* ─── Comments overlay ... ─── */` CSS block and the `(function commentsOverlay() { ... })();` JS IIFE are both removed, along with the toggle button they inject. Standalone files have no comment feature — they are share-ready snapshots, not review tools. Colleagues who need to comment should use the Vercel preview URLs.

Everything else — screens, transitions, demo controls, keyboard shortcuts, images — is preserved byte-for-byte.

After each transform the script hard-asserts zero remaining references to `/api/comments`, `commentsOverlay`, `comments-toast`, `fonts.googleapis.com`, or `fonts.gstatic.com`. If any leak through, the build fails and no file is written for that branch.

## Source of truth per branch

- **The currently-checked-out branch** → uses the on-disk working tree `sign-in.html` (uncommitted edits count).
- **All other branches** → uses `git show <ref>:sign-in.html` (tip commit only).

This means you can preview an edit-in-progress by rebuilding on your branch, and the other three files always reflect what's committed on their branches.

## Regenerate

```bash
npm run standalone
```

- Runs in a few seconds.
- Font binaries cached in `.font-cache/` (gitignored) — reruns skip network fetches.
- Delete `.font-cache/` to force a fresh font download.

## Automatic rebuild on commit

A local `post-commit` hook auto-rebuilds `standalone/` whenever a commit touches `sign-in.html` on any branch. Install once per clone:

```bash
npm run install-hooks
```

The hook is idempotent and non-fatal — a failed rebuild logs a warning but does not block the commit. Uninstall with `rm .git/hooks/post-commit`.

## Adding or removing a tracked branch

Edit the `BRANCHES` array at the top of [scripts/build-standalone.mjs](scripts/build-standalone.mjs):

```js
const BRANCHES = [
  { name: 'main',                       gitRef: 'main' },
  { name: 'faceid-passkey',             gitRef: 'feature/faceid-passkey' },
  // { name: 'my-new-branch', gitRef: 'feature/my-new-branch' },
];
```

`name` becomes the filename suffix (`sign-in-<name>.html`); `gitRef` is any valid git ref (branch, tag, or commit).

## Verify offline

1. Open `standalone/sign-in-main.html` in Chrome/Safari/Firefox.
2. Open DevTools → Network → toggle "Offline".
3. Reload. The page still renders — Roboto font, tabs, form, everything.
4. There should be zero failed network requests.

## Why not just send the Vercel preview URL?

The preview URLs work great and are the recommended review path — but:

- They require internet.
- They require access to the `ace-dolso3s-projects` Vercel team (or, once merged into `main`, at least reachability to `sign-in-otp.vercel.app`).
- Some corporate mail filters strip or blocklist unfamiliar `*.vercel.app` links.
- An HTML file can be dragged into a Slack DM, forwarded, opened on a plane, or archived alongside a design deliverable.

Standalone files fill that last gap.

## Files this touches

- [scripts/build-standalone.mjs](scripts/build-standalone.mjs) — the build script.
- [scripts/install-hooks.sh](scripts/install-hooks.sh) — installs `.git/hooks/post-commit`.
- [package.json](package.json) — adds `standalone` and `install-hooks` npm scripts.
- [.gitignore](.gitignore) — ignores `standalone/` and `.font-cache/`.
- `standalone/` — build output (gitignored).
- `.font-cache/` — WOFF2 blob cache (gitignored).
- `.git/hooks/post-commit` — optional auto-rebuild hook (local, per-clone, not tracked).

---

## Review workflow

Only the `heuristic-alignment-wave2` branch currently emits a `-review.html` variant. To opt other branches in, add `reviewVariant: true` to their entry in the `BRANCHES` array.

The review variant keeps the comment overlay in place and forces it into **local mode** via three build-time globals injected right after `<head>`:

```html
<script>
  window.__COMMENTS_MODE__="local";
  window.__COMMENTS_SOURCE_HASH__="sha256:<first-16-hex>";
  window.__COMMENTS_BRANCH__="feature/heuristic-alignment-wave2";
</script>
```

At runtime this makes the IIFE bypass `/api/comments` entirely and read/write `localStorage['comments.data']` instead.

### For the reviewer (your colleague)

1. Double-click the `-review.html` file. A yellow “Review copy” banner appears at the top.
2. Click the amber toggle button (top-right) → enter comment mode.
3. Click anywhere on the prototype to place a dot and leave a note. On the first save they’re asked once for their name.
4. Click **Export** in the toolbar. A file downloads named `comments-<branch>-<reviewer>-<yyyymmddhhmm>.json`.
5. Email/Slack/OneDrive that JSON back to the owner.

Optional: **Import** in the toolbar accepts a previously-exported JSON so a reviewer can resume across machines. It merges by comment `id` (upsert) — no work is lost.

### For the owner (you)

1. Save the reviewer’s JSON somewhere convenient (Downloads is fine).
2. Open your working prototype (`sign-in.html` via `vercel dev`, or the deployed preview URL).
3. Click **Import review** in the toolbar (top-right, next to the amber toggle).
4. Pick the JSON. Sign in with `COMMENT_WRITE_TOKEN` if prompted.
5. Every comment is upserted into the current branch’s KV bucket. Reviewer dots render in **purple** so they’re instantly distinguishable from your own amber dots.

A completion toast summarises: `Imported N/M from Jane Doe.` If the reviewer’s `sourceHash` doesn’t match your current build, the toast appends `(source drift: reviewed a different build)` — the import still succeeds, but you’ll want to eyeball anything that moved since the snapshot was sent.

### Sidecar JSON schema (v1)

```json
{
  "schema": 1,
  "exportedAt": "2026-07-08T14:22:00.000Z",
  "branch": "feature/heuristic-alignment-wave2",
  "sourceHash": "sha256:abfbbb7c9afc1974",
  "reviewer": { "name": "Jane Doe" },
  "comments": [
    {
      "id": "c_kx0abc_xyz123",
      "screenId": "screenPassword",
      "stateAttrs": { "data-state": "…" },
      "xPct": 0.42, "yPct": 0.71,
      "text": "…",
      "status": "open",
      "source": "review",
      "reviewer": { "name": "Jane Doe" },
      "sourceHash": "sha256:abfbbb7c9afc1974",
      "branch": "feature/heuristic-alignment-wave2",
      "createdAt": 1751987000000,
      "updatedAt": 1751987000000
    }
  ]
}
```

### Reviewer identity in KV

On Import the owner-side UI translates the sidecar into POSTs against the existing `/api/comments` endpoint. To avoid touching the server:

- `id` is preserved so KV upserts (re-imports overwrite in place, no duplicates).
- `authorId` is set to `review:<reviewer-slug>` — the client keys off the `review:` prefix to render purple dots.
- `authorLabel` holds the reviewer’s display name.
- Sidecar-only fields (`sourceHash`, `branch`, `reviewer` object, `source`) are dropped by the server’s `ALLOWED_FIELDS_ON_CREATE` filter — which is fine, since they’re only needed during import validation, not for long-term storage.

### Debug API (both modes)

`window.__comments` exposes: `mode`, `branch`, `sourceHash`, `list()`, `reload()`, `enter()`, `exit()`, `export()`, `import()`, `reviewer()`, `setReviewer()`, `clearAll()` (local only), `clearToken()`.
