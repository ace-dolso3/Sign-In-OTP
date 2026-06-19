# Wave-3 Phase 3 Content Polish Queue

Date: 2026-06-17 (closed 2026-06-18)
Status: **COMPLETE — parity-pass on all 5 frames.**
Source of truth: `sign-in.html` flow step sequences + labels.

## Objective
Replace cloned placeholder visuals/captions in the 5 remapped dedicated Wave-3 frames with branch-specific, step-accurate content.

## Target Frames
- `flow-w3:passkey-failed-fallback-password` (node expected: 677:195)
- `flow-w3:cross-device-direct` (node expected: 677:248)
- `flow-w3:reset-edit-different-email` (node expected: 677:309)
- `flow-w3:recovery-email-setup-pending` (node expected: 677:370)
- `flow-w3:recovery-email-setup-change` (node expected: 677:431)

## Canonical Step Sequences To Render

### 1) passkey-failed-fallback-password
1. Passkey prompt - biometric idle
2. Passkey failed - fallback tiles visible
3. Password - entry (chose Use a password)

### 2) cross-device-direct
1. Chooser - user taps Use another device tile
2. Cross-device - QR shown (skips passkey idle)

### 3) reset-edit-different-email
1. Forgot password - email entry
2. Reset email sent - identifier strip visible
3. Edit tapped - back to entry, field cleared
4. Reset email sent - new address

### 4) recovery-email-setup-pending
1. Security hub - Recovery email not set
2. Recovery email - enter backup address
3. Recovery email - verification link sent
4. Security hub - Recovery email pending verification

### 5) recovery-email-setup-change
1. Recovery email - enter backup address
2. Recovery email - verification link sent
3. Recovery email - tap Use a different email -> back to entry

## Acceptance Criteria
- Each frame has the exact step count listed above.
- Step image fills visually match the branch-specific terminal state.
- Step captions match the canonical labels (minor punctuation normalization allowed).
- User-flow node strip reflects branch semantics (no copied happy-path terminal labels).
- No cross-branch screenshot reuse in the final step of each frame.

## Verification Procedure
1. In prototype (`sign-in.html`), play each flow to terminal step and capture expected terminal label.
2. In Figma, inspect each target frame image sequence and caption sequence.
3. Mark each frame as `parity-pass` only if count, order, and terminal semantics all match.

## Resolved Blocker (2026-06-18)
- Page `198:31` is accessible via MCP using `await page.loadAsync()` + `await figma.setCurrentPageAsync(page)` (dynamic-page model).
- All target frames located and polished:
  - `flow-w3:passkey-failed-fallback-password` (677:195) → 1704x1079 → parity-pass
  - `flow-w3:cross-device-direct` (677:248) → 1704x1012 → parity-pass
  - `flow-w3:reset-edit-different-email` (677:309) → 1704x906 → parity-pass
  - `flow-w3:recovery-email-setup-pending` (677:370) → 1704x1165 → parity-pass
  - `flow-w3:recovery-email-setup-change` (677:431) → 1704x989 → parity-pass

## Closure Summary (2026-06-18)
- New `settings-security-recovery-pending` asset uploaded and hash registered.
- All step images use correct branch-specific screenshots (intentional loop-back reuse for `reset-edit-different-email` steps 1/3 and 2/4, and `recovery-email-setup-change` steps 1/3).
- All step captions and userflow node titles return `exact` semantic match against this document's canonical lists.
- Image rectangles resized to natural aspect at width=346; userflow strips trimmed to match step counts; group containers re-cascaded with zero overflows; net column compaction -403 px.
- Closes M-001 through M-004 in `reviews/WAVE3-PHASE1-MISMATCH-DRAFT.md` and verification gate #4 in `reviews/WAVE3-PHASE2-CORRECTION-DESIGN.md`.
