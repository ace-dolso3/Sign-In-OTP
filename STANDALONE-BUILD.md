# Standalone HTML build

Portable, self-contained snapshots of the sign-in prototype — one per branch — that a colleague can open in any modern browser (including offline) without a server, Node, or internet connection.

## Output

Running `npm run standalone` produces four files in `standalone/` (gitignored):

| File | Source branch | Typical size |
| --- | --- | --- |
| `sign-in-main.html` | `main` | ~330 KB |
| `sign-in-faceid-passkey.html` | `feature/faceid-passkey` | ~600 KB |
| `sign-in-wave-1-scaffolding.html` | `feature/wave-1-scaffolding` | ~690 KB |
| `sign-in-heuristic-alignment-wave2.html` | `feature/heuristic-alignment-wave2` | ~705 KB |

Send one to a colleague via email/Slack/OneDrive — they double-click to open it. No install, no login, no network required.

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
