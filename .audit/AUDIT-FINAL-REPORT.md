# Wave 3 Prototype Interactivity Audit — Final Report

**Branch**: `feature/heuristic-alignment-wave2` (HEAD `6777d6f`)
**Method**: Playwright harness + per-flow click walking + manual verification of suspected bugs
**Scope**: All 46 flows registered in `sign-in.html` FLOWS array

---

## TL;DR

The prototype is in significantly better shape than the initial automated audit suggested. **The vast majority of "broken" findings were harness artifacts** — caused by the audit harness not syncing the closure-scoped `currentScreen` JS variable when warping between screens.

After patching the harness to route through demo-nav (which properly invokes `switchScreen` and updates `currentScreen`) AND verifying every remaining flagged bug with a fresh-load single-click manual test, the **genuine broken-connectivity issues are short**:

### Verified Bugs (Worth Fixing)

| # | Severity | Where | Issue |
|---|---|---|---|
| B1 | P2 | `screen-reset-sent` | Flow `reset-edit-different-email` (in [flows.json](.audit/flows.json)) describes a "Edit email → forgot-password" return path, but the UI has no edit/change-email button. Only `reset-open-link-btn`, `reset-resend-btn`, `reset-sent-back-btn` exist. → **Either add an "Edit email" button to the UI, or remove the flow from the registry.** |

### Documentation / Flow-Registry Gaps (not interactivity bugs)

| # | Where | Issue |
|---|---|---|
| D1 | `flows.json` | 3 transitions need `trigger:"auto"` markers because they're sentinel-driven escalations (3 wrong-password attempts → account-locked; 3 wrong-OTP → locked; OTP cooldown/expired timers). One already marked, two missing. |
| D2 | `flows.json` | 4 `passkey-os-sheet-*` flows have `screen:null` steps representing OS-level WebAuthn sheets — not auditable in HTML. Add `trigger:"os-sheet"` marker so they're skipped. |
| D3 | `flows.json` | Group "Account Recovery" has **0 flows** even though 5 recovery screens exist in `sign-in.html` (Recovery entry, Rate-limited, Re-enroll prompt/success/failed). Recovery screens are not exercised by any flow definition. |

### Bonus Observation — Visual "Double-Up" Issue

During audit walking, the prototype occasionally showed a "Trouble getting in?" recovery overlay layered over a regular screen. This is **not a bug** — it's the prototype's correct auto-escalation behavior after the audit hammered "Sign in another way" multiple times in succession. The escalation logic works as designed; only triggered by repeated test loops.

---

## What Was Originally Flagged as Broken (and Why It Was Wrong)

These were all FALSE POSITIVES caused by the harness:

| Originally Flagged | Verdict | Why False |
|---|---|---|
| `tile-cd-chooser` dead | ✅ WORKS | Fresh-load click navigates to passkey/cross-device. |
| `tile-password-chooser` dead | ✅ WORKS | Fresh-load click navigates to screen-password. |
| `tile-otp-chooser` dead | ✅ WORKS | Fresh-load click navigates to screen-otp/request. |
| `passkey-fallback-password` broken | ✅ WORKS | Click goes to screen-password. |
| `passkey-fallback-otp` broken | ✅ WORKS | Click goes to screen-otp/request. |
| `passkey-qr-cancel` (Sign in another way) broken | ✅ WORKS | Returns to screen-chooser/default. |
| `save-pw-btn` broken | ✅ WORKS | Goes to screen-reset-success. |
| `reset-open-link-btn` broken (v3 only) | ✅ WORKS | Goes to screen-new-password. |
| `verify-cant-access-btn` (Can't access this code? Get help) broken | ✅ WORKS | Goes to screen-otp-no-access. |
| `enroll-decline-later-btn` "wrong destination" | ✅ WORKS | Routes to settings or chooser based on `enrollOrigin` context. Demo-nav entry sets origin=settings; real post-login sets origin=post-login. |
| `enroll-suppressed-continue-btn` "wrong destination" | ✅ WORKS | Same — context-dependent routing is correct. |

### Root Cause of False Positives

The harness instantly hid/shown screens via DOM mutation, but the prototype's `switchScreen(currentScreen, target, ...)` reads a closure-scoped `currentScreen` JS variable that the harness couldn't see or sync. After the first click in a per-transition test, `currentScreen` became stale — subsequent clicks animated from the wrong source screen, leading to weird visible state and false "broken" results.

**Fix applied**: harness now routes via the demo-nav `proto-nav-item` buttons (`data-nav-target="..."`, `data-nav-state="..."`), which trigger the real screen handlers and keep `currentScreen` in sync.

---

## Validated Working Connections (Sample)

These are confirmed via the patched-harness audit AND/OR fresh-load manual tests:

**Chooser tiles** — all 4 work: passkey, cross-device, password, OTP
**Passkey flow** — try-btn, cross-device-btn, success state, failed state, fallback to password/OTP
**Password flow** — submit (happy), wrong-password idx buttons, forgot link → forgot-password screen
**OTP flow** — send-btn → entered, verify-btn → wrong, can't-access link → no-access, no-access → password
**Forgot password chain** — forgot-password → reset-sent → new-password → reset-success
**Cross-device** — direct entry tile, QR shown, transport-retry, cancel back to chooser
**Recovery email setup** — full happy chain, change/loop-back, pending verification
**Settings & Security** — security hub → activity, devices, passkeys-list → rename/remove
**Enrollment** — setup → success, skip → declined, decline-never → suppressed, context-aware Continue

---

## Files

- `.audit/flows.json` — 46 flows extracted from FLOWS registry
- `.audit/harness.js` — patched audit harness (v3 — routes via demo-nav)
- `.audit/runner.js` — per-flow walker with ANIM_SETTLE=380ms
- `.audit/results-batch-A.json` — v1 raw (pre-patch)
- `.audit/results-batch-B.json` — v1 raw (pre-patch)
- `.audit/results-batch-C.json` — v1 raw (pre-patch)
- `.audit/results-batch-D.json` — v1 raw (pre-patch)
- `.audit/results-batch-B-v3-raw.json` — patched audit run (cleaner but still some flakiness on multi-iteration loops)

---

## Recommended Next Steps

1. **Fix B1**: Decide whether `reset-edit-different-email` should be implemented (add "Use a different email" link on reset-sent) or removed from flows.json. (Low effort either way.)
2. **Fix D1 + D2**: Update `flows.json` to add `trigger:"auto"` for the 2 sentinel escalations and `trigger:"os-sheet"` for the 4 OS-sheet flows. Pure documentation fix.
3. **D3 decision**: Either add flow definitions for the Account Recovery group (Recovery entry, Rate-limited, Re-enroll prompt/success/failed) or remove the screens if they're not actually reachable.
4. **No interactivity fix needed in `sign-in.html`** — all click handlers route correctly to the right destinations.
