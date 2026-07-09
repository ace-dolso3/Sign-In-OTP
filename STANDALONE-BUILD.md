# Standalone HTML build

Portable, self-contained snapshots of the sign-in prototype — one per branch — that a colleague can open in any modern browser (including offline) without a server, Node, or internet connection.

## TL;DR — editing `sign-in.html` and propagating to standalones

When you edit `sign-in.html` on any branch, the standalone output for that branch (`sign-in-<branch>.html`) needs to stay in sync. This happens **automatically on commit** via a local post-commit hook.

**Workflow:**

1. Edit `sign-in.html` on your branch.
2. **(Optional)** Preview the standalone build against your uncommitted edit:
   ```bash
   npm run standalone
   ```
   The currently checked-out branch always reads from the working tree, so uncommitted edits show up in the rebuild. Other branches read from their tip commit.
3. Commit. The post-commit hook detects that `sign-in.html` changed and re-runs `npm run standalone` — every branch's artifact is regenerated for you.
4. Open `standalone/sign-in-<branch>.html` to verify.

**One-time setup per clone:** `npm run install-hooks` (installs the post-commit hook).

**Layered overlays (toasts, modals, OS sheets):** the canonical z-index scheme is documented as a block comment directly above `#flow-nav-bar` in `sign-in.html`. Any new modal, sheet, alert, or global overlay must sit at `≥ 500` so it renders above the flow-nav-bar pill (`z:400`) and its floating title. Product toasts stay at `1000`.

## Output

Running `npm run standalone` produces one file per tracked branch in `standalone/` (gitignored):

| File | Source branch | Typical size |
| --- | --- | --- |
| `sign-in-main.html` | `main` | ~330 KB |
| `sign-in-faceid-passkey.html` | `feature/faceid-passkey` | ~600 KB |
| `sign-in-wave-1-scaffolding.html` | `feature/wave-1-scaffolding` | ~690 KB |
| `sign-in-heuristic-alignment-wave2.html` | `feature/heuristic-alignment-wave2` | ~750 KB |

Every artifact is fully offline-capable and comment-capable: recipients can double-click, leave notes, and export a JSON sidecar to send back. There is no separate read-only vs. review variant — one file does both. See [Review workflow](#review-workflow) below.

## What gets transformed

The build script ([scripts/build-standalone.mjs](scripts/build-standalone.mjs)) does exactly two surgical transforms to each branch's `sign-in.html`:

1. **Inlines Google Fonts.** The three `<link>` tags for `fonts.googleapis.com` / `fonts.gstatic.com` are replaced by one `<style data-inlined-fonts>` block containing every Roboto 400/500/700 `@font-face` rule. Font binaries are downloaded as WOFF2 and base64-embedded as `data:font/woff2;base64,...`. Only the `latin` and `latin-ext` subsets are kept (cyrillic/greek/vietnamese/math are dropped — ~600 KB smaller).
2. **Injects build metadata.** A tiny `<script>` right after `<head>` sets `window.__COMMENTS_SOURCE_HASH__` (sha256 of the font-inlined HTML) and `window.__COMMENTS_BRANCH__` (the git ref this was built from). The comment IIFE reads these into every exported sidecar JSON so an owner Importing feedback later can tell exactly which build a reviewer commented on.

Everything else — screens, transitions, demo controls, keyboard shortcuts, images, **and the click-to-comment overlay** — is preserved byte-for-byte.

After the transforms the script hard-asserts (a) the comment overlay IIFE is still present and (b) zero external font URLs remain. If either check fails, the build fails and no file is written for that branch.

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

Every standalone artifact ships with the click-to-comment overlay in **local mode** — comments live in the recipient's browser `localStorage`, exported as a JSON sidecar and sent back to the owner.

The build injects two globals right after `<head>` so exports can be traced back to the source build:

```html
<script>
  window.__COMMENTS_SOURCE_HASH__="sha256:<first-16-hex>";
  window.__COMMENTS_BRANCH__="feature/heuristic-alignment-wave2";
</script>
```

At runtime the IIFE reads these into every comment record and every exported sidecar so drift between the reviewed build and the current build can be detected on Import.

### For the reviewer (your colleague)

1. Double-click the `.html` file. A yellow "Review copy" banner appears at the top.
2. Click the toggle button (top-right) → enter comment mode.
3. Click anywhere on the prototype to place a dot and leave a note. On the first save they're asked once for their name.
4. Click **Export** in the toolbar. A file downloads named `comments-<branch>-<reviewer>-<yyyymmddhhmm>.json`.
5. Email/Slack/OneDrive that JSON back to you.

Optional: **Import** in the toolbar accepts a previously-exported JSON so a reviewer can resume across machines or sessions. It merges by comment `id` (upsert) — no work is lost.

### For the owner (you)

1. Save the reviewer's JSON somewhere convenient (Downloads is fine).
2. Open your working `sign-in.html` from the file system (double-click it, or drag it into a browser tab).
3. Click **Import** in the toolbar (top-right).
4. Pick the JSON. Every comment is upserted into your `localStorage` bucket. Reviewer dots render in **purple** so they're instantly distinguishable from your own amber dots.

A completion toast summarises: `Imported: +N new, M updated.` If the reviewer's `sourceHash` doesn't match your current build, a console warning is logged — the import still succeeds, but you'll want to eyeball anything that moved since the snapshot was sent.

### Review banner behavior

Every standalone artifact surfaces a yellow **"Review copy"** banner at the top of the viewport when opened by a recipient. The banner is generated at runtime by the comments IIFE (not baked into the HTML source) and follows these rules:

| Rule | Behavior |
| --- | --- |
| **Placement** | `position: fixed; top: 0; z-index: 240` — sits above the flow-nav pill (400 pill z-index is higher, but the pill is bottom-anchored so they never overlap) and below all modals/toasts (≥ 500). |
| **Content shift** | When mounted, JS adds `body.has-comments-review-banner` and sets a `--comments-review-banner-h` CSS var to the banner's measured height. Body gets `box-sizing: border-box; padding-top: var(--comments-review-banner-h)` so the page header slides down beneath the banner — no more content hidden behind the yellow bar. |
| **Responsive** | A `ResizeObserver` keeps `--comments-review-banner-h` in sync when the banner wraps at narrow widths (or if its text ever changes). Falls back to a `window resize` listener when `ResizeObserver` isn't available. |
| **Dismissable** | The banner includes an `×` dismiss button (right-aligned, 28×28 tap target, `pointer-events: auto` — the banner body itself stays `pointer-events: none` so it never intercepts prototype clicks). |
| **Dismissal persistence** | Stored in `localStorage['comments.reviewBannerDismissed:<SOURCE_HASH>'] = '1'`. Keying by `SOURCE_HASH` means a **new build resurfaces the banner** (fresh reviewers still see the notice) while returning reviewers to the same file aren't nagged on every reload. |
| **On dismiss** | Banner is removed from the DOM, the body class is stripped, and the CSS var is cleared — content springs back to the top. The Export/Import toolbar buttons and the toggle are unaffected; they're the durable path to save work. |
| **Accessibility** | Banner is `role="status"`. Dismiss button carries `aria-label="Dismiss review banner"`. Focus ring uses the amber accent (`#F4C430`). |
| **Reset for testing** | `localStorage.removeItem('comments.reviewBannerDismissed:' + window.__COMMENTS_SOURCE_HASH__)` and reload. |

The banner **does not** replace the toolbar buttons. Export / Import remain the durable path to save reviewer work; the banner is only a persistent reminder that comments live on-device until exported. Dismissing the banner is a one-way action per build — reviewers who need the reminder back can clear the localStorage entry above.

### Sidecar JSON schema (v1)

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

### Reviewer identity on Import

When the owner Imports a reviewer's sidecar, comments are merged into `localStorage` by comment `id` (upsert — re-imports overwrite in place, no duplicates). Each comment retains its embedded `source: "review"` field, and the render layer keys off that field to draw purple dots — instantly distinguishable from your own amber dots.

Sidecar fields (`sourceHash`, `branch`, `reviewer`, `source`) survive the merge and remain queryable via `window.__comments.list()`.

### Debug API

`window.__comments` exposes: `branch`, `sourceHash`, `list()`, `reload()`, `enter()`, `exit()`, `export()`, `import()`, `reviewer()`, `setReviewer()`, `clearAll()`.
