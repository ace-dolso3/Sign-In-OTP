# Heuristic Alignment Matrix

Scope: Critical + High findings, Sign-In only, branch `feature/heuristic-alignment-wave2`
Date: 2026-06-17
Sources: heuristic evaluation report + live acehardware.com behavior + current prototype behavior

## Status Key
- `pending`: not yet compared end-to-end
- `in-progress`: compared, fix design in progress
- `done`: implemented and verified

## Baseline Issue Matrix

| ID | Severity | Area | Finding Summary | Live Site Baseline | Prototype Baseline | Target Behavior | Status |
|---|---|---|---|---|---|---|---|
| H-001 | Blocker | Password Reset | Enumeration policy ambiguity for forgot-password outcomes | `/user/login` reset modal currently returns explicit inline error (`Email address entered is invalid. Create an Online Account.`), not non-confirming success | `screen-reset-sent` uses non-confirming copy (`If an account exists...`) and reset-not-found branch removed | Non-confirming response only (`If an account exists...`) | done |
| H-002 | Critical | Figma Drift | Prototype and Figma flow states/captions diverge on core sign-in flows | Live sign-in remains password-first legacy modal flow | Prototype is identifier-first and includes expanded passkey/OTP/settings states | New Figma column from updated prototype + aligned captions | in-progress |
| H-003 | Critical | Settings-Passkeys | Rename/remove/remove-last interactions do not fully mutate data or confirm outcomes | No equivalent passkey-list management on live `/user/login` modal | Verified locally: remove opens confirmation modal, list mutates (`2 -> 1 -> 0`), last-passkey warning appears, success status toast shown | Fully mutating actions + confirmation messaging | done |
| H-004 | Critical | Timing/TTL | Time values differ across docs, flow copy, and states | Live baseline does not expose equivalent multi-method timers in the same flow surface | Canonical constants present (`QR=2m`, `OTP=3m`, `LOCKOUT=15m`, `RESET=15m`, `RECOVERY=15m`) and now bound to reset/recovery/lockout duration labels in UI copy | Canonical constants + rendered values from constants | done |
| H-005 | High | Global Feedback | Success/failure confirmations inconsistent across key flows | Live reset modal currently shows inline error states only; no consistent toast model in observed surface | Shared `showToast()` exists with role-based semantics (`status`/`alert`) and broad usage across sign-in states | Consistent success/error feedback model | done |
| H-006 | High | Lockout Recovery | Lockout/rate-limit expiry recovery feedback can be unclear | Not fully observable on live due protected/failed backend paths in this environment | Shared `startLockoutCountdown()` in place with expiry callbacks and retry toasts | Clear expiry transition + explicit retry affordance | done |
| H-007 | High | Escape Hatches | Some mid-flow screens may trap users without clear return path | Live modal has close affordance; deeper recovery subflows not observable here | Added and validated deterministic back controls on reset-sent/new-password/expired-link panels to return users to sign-in chooser | Clear back/escape path on all non-terminal steps | done |
| H-008 | High | State Fidelity | Some branches only reachable via demo controls instead of realistic triggers | Live path is real-account driven and backend-gated | Reduced navigator dependence in reset flow (`Reset email sent -> I opened the reset link -> New password`) while preserving demo nav for edge-state QA | Reachable, coherent state transitions for in-scope scenarios | in-progress |

## Evidence Log

### Live Site Notes (acehardware.com)
- Primary sign-in entry discovered at `https://www.acehardware.com/user/login` (not `/my-account/sign-in`).
- Observed live sign-in surface is a password-first modal/page with `Email`, `Password`, `Forgot Password`, and `Create an Account`.
- Forgot-password modal observed with explicit inline message: `Email address entered is invalid. Create an Online Account.`
- Login baseline sweep completed: email input, password input, forgot-password modal open/close, and create-account modal launch verified.
- Create-account path from sign-in verified: `Create an Account` opens account-type chooser modal (`Online Account` / `Business Account`) with selectable options.
- Environment constraints: several auth-related requests returned 401/500 during automated probing, so account-existence behavior could not be conclusively validated beyond visible inline messaging.

### Prototype Notes (localhost:4173)
- Prototype remains identifier-first with passkey, cross-device, password, and OTP paths from chooser.
- Reset success copy is non-confirming: `If an account exists, we've sent a password reset link.`
- Figma reset-sequence asset sync executed on 2026-06-17 against file `IDuYbd4aYwGsFgo6c3ThVX` (Cover page):
	- `forgot-password.png` -> node `553:2`
	- `reset-sent.png` -> node `554:2`
	- `new-password.png` -> node `555:2`
	- `reset-link-expired.png` -> node `556:2`
	- `reset-success.png` -> node `557:2`
- Figma arranged-flow sync executed on 2026-06-17 against page `198:31` (`Prototype Flows`):
	- Legacy Password Reset section updated: `198:313`, `198:316`, `198:319`, `198:322`, `198:327`, `198:330`, `198:333`
	- Wave-2 Password Reset column updated: `608:188`, `608:191`, `608:194`, `608:197`, `608:221`, `608:224`, `608:227`
- Wave-3 parity expansion executed on 2026-06-17 against page `198:31` (`Prototype Flows`):
	- Added new `flow-w3:*` variants for previously legacy-only branches (13 total), including cross-device transport fork, OTP resend/no-access forks, enrollment failure/decline forks, reset rate-limit, and settings overview/rename/remove variants.
	- Wave-3 reset image nodes refreshed: `660:653`, `660:656`, `660:659`, `660:662`, `660:686`, `660:689`, `660:692`.
	- Prototype flow links now point to Wave-3/Wave-3-expanded nodes for all supported branches; only OS-native Figma-only references remain on legacy node IDs (`198:63`, `198:68`, `198:73`, `198:78`).
	- Wave-3 text polish completed for all 13 newly added `flow-w3:*` variants: titles/subtitles, step captions, user-flow node titles/descriptions, and edge labels were rewritten to match heuristic intent (no cloned placeholder copy remains).
- Runtime recovery: fixed intermediate JS parse regressions (`Unexpected token ':'`, `Unexpected end of input`) in `sign-in.html`; preview now renders `screen-chooser` with no page errors.
- Passkeys settings interactions validated end-to-end in prototype: confirmation modal on remove, last-passkey warning, list mutation to empty state, success status feedback.
- Canonical timer constants present and centralized in code; lockout and cooldown logic routed through shared helper.
- Demo navigator is still used to jump to many edge states, which remains expected for prototype testing but is a fidelity gap vs production realism.
- Full prototype sweep completed via navigator automation: `46/46` sign-in demo states reachable without missing-screen failures.
- Escape-hatch hardening added in reset journey: `Reset email sent` now includes in-flow progression (`I opened the reset link`) and deterministic back controls on reset-sent/new-password/expired-link states.

### Sweep Coverage (Closed Loop)
- Prototype: full Screens/Flows nav sweep complete (`46/46` states reached, no unreachable state failures in current build).
- Live: sign-in baseline controls validated (Sign In form presence, forgot-password modal behavior, create-account modal entry).
- Remaining live limitations: backend-protected/authenticated branches (account lockout, OTP internals, passkey account management) are not fully observable from anonymous session in this environment.

## Implementation Notes
- This matrix is the phase gate for implementation order.
- Only in-scope Sign-In changes should be marked done in this branch.
- Create-account observations can be logged in a backlog section but are out of implementation scope for this branch.

## Out-of-Scope Backlog (Capture Only)
- Create-account findings discovered during comparison.

## Priority Order For Implementation (Phase 2)
1. H-001 Password reset policy/copy hardening (ensure all related surfaces remain non-confirming and remove contradictory language).
2. H-002 Figma drift closure prep (lock changed prototype states and captions for new-column export mapping).
3. H-004 Timing/copy parity pass (ensure every displayed timer/TTL string derives from canonical constants).
4. H-007 Escape-hatch sweep (verify all non-terminal screens include explicit return affordance).
5. H-008 State-fidelity refinements (reduce unnecessary demo-only forcing in prioritized sign-in scenarios while keeping demo controls).
