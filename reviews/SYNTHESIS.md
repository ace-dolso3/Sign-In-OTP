# Synthesis — Sign-In Flow UX Review

**Status:** Phase 2 of Plan v6. Rolled-up backlog merging seven group reviews + 23 ledger themes + 10 ratified structural positions. Read top-to-bottom; each Wave is a coherent shippable batch.

**Companion docs**
- Per-group reviews: [group-1-passkey.md](group-1-passkey.md), [group-2-cross-device.md](group-2-cross-device.md), [group-3-password.md](group-3-password.md), [group-4-otp.md](group-4-otp.md), [group-5-passkey-registration.md](group-5-passkey-registration.md), [group-6-password-reset.md](group-6-password-reset.md), [group-8-settings-security.md](group-8-settings-security.md)
- Theme index: [CROSS-FLOW-LEDGER.md](CROSS-FLOW-LEDGER.md) (23 themes)
- Structural decisions: [STRUCTURAL-REVIEW.md](STRUCTURAL-REVIEW.md) (A1–A5 + B1–B5, ratified 2026-06-12)

**Phase 3 directive (ratification):**
> 🔒 New flows ship to a **new column** in the Figma file. Originals (`198:36 / 87 / 137 / 185 / 266 / 310 / 389` + `421:2`) preserved as the "before" reference. Node-ID range for the new column is allocated at start of Wave 1; the doc's mapping table grows, doesn't replace.

---

## Reading guide

- **Wave 1** = scaffolding + functional fidelity. Shared components (toast, modal, lockout countdown, origin tracking) + the broken handlers that block usability testing. Lands first because everything else depends on it.
- **Wave 2** = surface restructure. The big structural items — identifier-first chooser (B1), OTP collapse (B2), recovery hub (B5), settings IA re-section (A5), demo-control drawer (B3). New screens, new flow shapes.
- **Wave 3** = polish + Figma capture. Microcopy normalization, case rules, banner-palette tokens, breadcrumb interactivity, character counters, then prototype-first re-capture and Figma upload to the new column.

Tier conventions (per Plan v6):
- **A** = local, isolated fix (single screen/state). Implementable mechanically.
- **B** = cross-flow pattern. Component or system-level.
- **C** = Figma frame drift. Tier C work is ALL deferred to Wave 3 (after the prototype is settled).

---

## Wave 1 — Scaffolding + functional fidelity

**Goal:** Remove every defect that *blocks usability testing* + introduce the shared components downstream waves depend on. Nothing in Wave 1 changes the IA — it's all "make what's there work correctly."

**Order matters within the wave** because items 1–3 are dependencies for items 4+.

### W1.1 · Toast component (shared, AAA-correct) — `B`

**Closes:** Theme 18 (alert stubs ×3) + half of Theme 8 (8 instances) + the success-feedback gap behind Theme 21 + supplies A1, A3, A4, B4 their landing surface.

**Spec**
- ARIA: `role="status"` for non-error confirmations, `role="alert"` for errors.
- 4-second default duration; 8-second for error toasts; configurable.
- Top-right or top-center placement (decide at build); deferred-mount so it survives screen transitions.
- `prefers-reduced-motion: reduce` aware entrance/exit (fade only, no slide).
- API: `showToast({ message, kind: 'success'|'info'|'error', duration?, action? })`.
- Action variant supports an inline button (e.g., *"Welcome back, David. — View account →"*).

**Replaces**
- `alert('✓ Passkey saved...')` (G5, L7037-ish via `enroll-continue-btn`)
- `alert('✓ You're signed in...')` (G5, `handleEnrollSkip` post-login)
- `alert('Account support coming soon...')` (G4, `screen-otp-no-access`)
- The missing rename / remove / remove-last confirmations (G8 Issue 3, three callsites)
- The post-reset, post-sign-in, post-passkey-enroll completion signal (B4)
- A1's "out-of-band → re-auth" landing message (*"Password updated. Sign in to continue."*)

### W1.2 · Modal component (shared, AAA-correct) — `B`

**Closes:** Theme 22 (modal pattern single-instance and partial) + ratifies A3 (modal for destructive, panel for in-place mutations).

**Spec**
- Built from G8's `#signout-modal` as the starting point (already has backdrop, `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus-on-confirm, backdrop-click-dismisses).
- Add: focus trap (Tab cycles within modal); Escape-key dismissal; focus return on close (caches the triggering element); `aria-describedby` linking the body text.
- API: `openConfirmModal({ title, body, confirmLabel, cancelLabel, kind: 'destructive'|'default', onConfirm })`.
- Per A3 house rule: used for **destructive/state-reversing** actions on a list item or named entity.

**Migrations**
- G8 sign-out: keep as modal, swap to new component.
- G8 passkey **remove** + **remove-last**: convert from `data-settings-state` panel to modal.
- G8 passkey **rename**: stays as panel (in-place mutation).
- Future-fit: any "Disable 2FA," "Remove recovery email," "Sign out everywhere" lands as modal automatically.

### W1.3 · `signInOrigin` + origin-route destination — `B`

**Closes:** All 8 instances of Theme 8 + locks B4 (origin-route destination).

**Spec**
- New module-scoped variable `signInOrigin = { from: 'cart'|'product'|'home'|'settings'|null, payload?: any }`.
- Set on entry to `screen-chooser` (or whichever surface initiates auth).
- Read on completion of any sign-in path; `switchScreen` to the origin surface (or `account-home` if `null`).
- Mirror G5's `enrollOrigin` mechanism — same shape, different post-action target.
- Toast on landing: *"Welcome back, {firstName}."* (4-second, `role="status"`).
- A1 coupling: when the credential was provided **out-of-band** (password reset, recovery-email verification), `signInOrigin` is *not* used — the flow lands at chooser with toast *"Password updated. Sign in to continue."*

**Replaces**
- `reset-success-signin-btn` "SIGN IN NOW" → chooser routing (label stays, the chooser receives the A1 out-of-band toast on landing — G6 Issue 6 closed).
- All G5 alert-based termini (replaced by W1.1 toast over the still-authenticated origin surface).
- G4 `screen-verify` happy-path terminus (currently silent / inconsistent).
- G3 `screen-password` happy-path terminus.

### W1.4 · `startLockoutCountdown(stateAttr, hostEl, durationSecs, onExpiry)` shared helper — `A → B (extracted)`

**Closes:** Theme 19 (lockout countdowns silently expire without state restoration).

**Spec**
- Single helper used by `startForgotpwRateCountdown` (G6) + `startLockedCountdown` (G3 `screen-account-locked`) + future OTP lockout if added.
- At `secs <= 0`: clear interval, remove the data-state attribute, call optional `onExpiry` callback (e.g., `showToast({ message: 'You can try again now', kind: 'info' })`), update blurb copy.
- Two-digit `MM:SS` padding throughout (resolves G3 Issue 10 boundary tick).

### W1.5 · Passkey rename / remove / remove-last actually mutate the list — `A`

**Closes:** Theme 21 (stub data-mutation handlers) — G8 Issue 1.

**Spec**
- **Rename** (panel, per A3): on `rename-save-btn` click, read `#rename-input` value, find the `.passkey-list-item[data-pk-id]` matching the cached id, update `.passkey-list-name` text, call `setSettingsState('list')`, fire `showToast({ message: '"{name}" renamed.', kind: 'success' })`.
- **Remove** (modal, per A3): convert to use W1.2 `openConfirmModal`. On confirm, `item.remove()` the matching `[data-pk-id]`, check empty-state, fire `showToast({ message: '"{name}" removed.', kind: 'success' })`.
- **Remove-last** (modal, per A3): same as remove but on confirm, additionally render the empty-state CTA per Figma 8f markup, then toast: *'"{name}" removed. You can sign in with password or a one-time code.'* (Escalated copy reflecting the consequence; uses W1.1 8-second duration.)
- **Empty-state markup**: add `<div class="passkey-list-empty">` with the "Add a passkey" CTA per Figma 8f spec; show when `#passkey-list` has zero `.passkey-list-item` children.

### W1.6 · Hub data centralization (passkey count, activity preview, trusted devices, recovery email) — `A`

**Closes:** G8 Issue 4 + couples to W1.5 (so removing a passkey updates the hub count).

**Spec**
- Centralize Settings state in a single object: `{ passkeys: [...], recoveryEmail: {...}, devices: [...], recentActivity: [...] }`.
- Render hub from this object on screen entry + on any mutation.
- Lift `pwAttempts`, `enrollOrigin`, `recoveryEmailStore` into the same object for consistency.
- Hub-row reflectors (`refreshRecoveryEmailHubRow` is the existing canonical pattern) drive all 4 hub-card states.

### W1.7 · Forgot Password collapses to non-confirming success — `A → B (decided)`

**Closes:** G6 Issue 1 (email enumeration) + G6 Issue 7 (`reset-wrong-email-link` mismatch) + locks A2 (Option B — non-confirming).

**Spec**
- Remove the `screen-reset-not-found` panel entirely (all markup + handler).
- `reset-send-btn` accepts any well-formed email (real `type="email"` validation, no sentinel).
- All submissions terminate at `screen-reset-sent` with copy:
  > *If an account exists for **{email}**, we've sent a password-reset link. It expires in 15 minutes.*
- The existing `reset-wrong-email-link` ("not me") link is removed — there's no wrong-email path to recover from anymore (the user just submits a different email if they typo'd).
- G6 Issue 4's invisible forced-2-tap is removed (no more "not found" target). Demo control for *rate-limited* state moves to W2.5 (B3 demo drawer).

### W1.8 · Reset-link TTL constant + recovery-email TTL constant + global time constants — `A`

**Closes:** Theme 17 (time-display value drift) + provisional canonicals.

**Spec**
- Add to `sign-in.html`'s constants section:
  ```js
  const QR_TTL_MS = 120_000;          // 2 min — G2 (already)
  const OTP_TTL_MS = 180_000;         // 3 min — G4
  const LOCKOUT_MS = 900_000;         // 15 min — G3, G4
  const RESEND_COOLDOWN_MS = 60_000;  // 1 min — G3, G4, G6
  const RESET_LINK_TTL_MS = 900_000;  // 15 min — G6 (Figma value, ratified)
  const RECOVERY_EMAIL_LINK_TTL_MS = 900_000;  // 15 min — same as reset, decided at synthesis (consistency over the 30-min outlier)
  ```
- Replace every hardcoded time string in HTML with templated values rendered from the constants on screen entry.
- Update doc to match (correct the "1 hour" reset-link claim; correct the 30-minute recovery-email outlier).

### W1.9 · Settings detail-screen breadcrumb is interactive — `A`

**Closes:** G8 Issue 8 + Theme 11 new flavor.

**Spec**
- Convert `<span class="settings-breadcrumb">` to `<button class="settings-breadcrumb-link">` on all 4 detail screens (`screen-active-devices`, `screen-activity`, `screen-settings-passkeys`, `screen-settings-recovery-email`).
- On click: navigate to `screen-settings-security`.
- Add a chevron-back affordance (`‹`) to the topbar matching existing back-button visual weight.

### W1.10 · Sign-out button case consolidation (G8) — `A`

**Closes:** G8 Issue 6 + a slice of Theme 2.

**Spec** (provisional, to be globalized in Wave 3 W3.1):
- Per-row `Sign out` → `SIGN OUT` (UPPER, matches modal).
- Bulk → `SIGN OUT OF ALL OTHER DEVICES`.
- Modal `Cancel` stays sentence case (matches Theme 2 secondary-action rule).

### W1.11 · ARCHIVE headers — `A` ✅

Already shipped at Chunk 2 checkpoint. All 14 `.jsx` files in `Sign In - Claude Design/` carry `// ARCHIVE — original ideation; see sign-in.html for current truth.` headers.

### W1.12 · Group 7 sanity check — `A`

**Action:** grep `sign-in.html` to confirm `screen-recovery` / `screen-reenroll` are not wired into any active FLOW. **If `screen-recovery` is wired, do not delete it** — Wave 2's W2.4 (B5 recovery hub) repurposes it. Just confirm the audit.

---

## Wave 2 — Surface restructure

**Goal:** The structural reshaping. New screens, new flow shapes, new IA. This is where the prototype starts to look meaningfully different from the current state.

**Order within the wave matters less than within Wave 1**, but B1 (identifier-first) is sequenced first because it reshapes the entry point all other waves rely on.

### W2.1 · Identifier-first chooser (B1) — `B`

**Closes:** Theme 16 (multiple undocumented entry points to a single state) + the entry-point ambiguity behind G2's two paths to cross-device + reduces the surface area for several downstream items.

**Spec**
- `screen-chooser` shape:
  ```
  Sign In
  [ email field with "Continue" button ]
    ↓ (browser tries passkey via WebAuthn conditionalMediation in background)
  ─── or ───
  [ Use Face ID or passkey on this device   ⇲ ]   ← top-pinned if passkey detected
  [ Use a passkey on another device          ⇲ ]   ← cross-device collapsed under passkey
  [ Use password                              ⇲ ]
  [ Send a one-time code                      ⇲ ]
  ```
- Email is captured first; subsequent screens (`screen-password`, `screen-otp`, etc.) receive the email via `signInOrigin`-style passing or a new `signInIdentifier` global. Email field is read-only on downstream screens (with an "Edit" affordance to come back to chooser).
- WebAuthn `navigator.credentials.get({ mediation: 'conditional' })` runs on chooser load. If a passkey resolves, the user is signed in zero-tap. If not, the method tiles render normally.
- `tile-cd-chooser` ("Scan with Phone") is **collapsed under** the passkey tile — a sub-option after the user picks the passkey method. Eliminates G2's two-entry-points defect.

**Eliminates** (no longer reachable in the same shape — replaced or removed):
- G1 Issue 7 chooser banner ambiguity (the banner was for "no passkey on this device" — under conditionalMediation, a missing passkey is already known before the user picks the tile).
- G2 Issue 6 undocumented entry point.

**Doc impact:** Group 1, 2, 3, 4 all need new sub-flow numbering / anchors when this lands. Held until Wave 3.

### W2.2 · OTP screen collapse (B2) — `B`

**Closes:** G4 Issue 8 (Welcome Back heading) + Theme 17 instances on the OTP/verify boundary + Theme 14 cleanup.

**Spec**
- Merge `screen-otp` and `screen-verify` into a single screen `screen-otp` with two `data-otp-state` panels:
  - `data-otp-state="request"` — collect identifier (or pre-filled from W2.1 chooser), choose delivery (email/SMS), SEND CODE button.
  - `data-otp-state="entered"` — show 6 OTP inputs, "Code sent to {destination}", VERIFY button, RESEND link.
- Heading reads "Sign In with one-time code" throughout (no more "Welcome Back" greeting).
- Single TTL source from `OTP_TTL_MS` (W1.8); the cooldown/expiry timers are owned by one screen.
- All Theme 14 `::after` pseudo-element label swaps replaced with explicit DOM `textContent` mutation — confirmed as canonical pattern across G5/G6/G8 (Theme 14 row in ledger).

**Replaces**
- `screen-verify` is removed; route any FLOWS-array references to the merged `screen-otp` with appropriate `data-otp-state`.

### W2.3 · Settings hub IA re-section (A5) — `B`

**Closes:** G8 Issue 2 (Recovery Email doc gap = Theme 23) + the trusted-vs-active devices labeling confusion + locks A5 (Option D — two sections).

**Spec**
- `screen-settings-security` two-section structure:
  - **Sign-in & recovery** § — Passkeys, Recovery Email
  - **Account activity** § — Recent Sign-In Activity (with "View all" → activity log), Trusted Devices (with "Manage" → active devices)
- Rename the second device hub-card to align: under Option D, both are read-only audit summaries on the hub, both link to the same active-devices screen. Pick one canonical label — *"Devices signed in"* or *"Active sessions"*.
- `user-flow-documentation.md` Group 8 § grows to enumerate: 8a Hub, 8b Activity, 8c Active Devices, 8d Rename, 8e Remove, 8f Remove Last, **8g Recovery Email Setup** (with sub-flows happy / pending / change), referencing Figma `463:475`.

### W2.4 · Recovery hub (B5 / G7 promotion) — `B`

**Closes:** G7 sanity-check question (deprecated → restored) + G4 Issue 12 (Contact Support stub) + Theme 11's "is back-to-chooser the right escape?" question.

**Spec**
- Promote the deprecated `screen-recovery` markup to v1 status. Refresh visual + copy.
- Triggers:
  - User taps "Sign In Another Way" twice in one session, OR
  - A method-specific terminal state fires (account locked, OTP no-access after retry, passkey "not found" after fallback chain).
- Hub presents:
  - **Try a different sign-in method** → back to chooser, with a banner explaining what was already tried this session
  - **I forgot my password** → routes to forgot-password (B1's identifier-first means email is pre-filled)
  - **I lost my passkey or phone** → routes to *passkey-recovery* (TBD; v2 design — for v1, lands on a placeholder explaining the journey)
  - **Contact account support** → today: lands on a real inline contact card (replaces G4's `alert()`); v2: real handoff to support tooling.

### W2.5 · Demo-control drawer (B3) — `B`

**Closes:** Theme 10 (validation/state-transition gaps × 5 flavors) + Theme 12 (demo simulate-buttons leak) + G3 Issue 11 (`reset-simulate-link-btn`) + G6's invisible forced-2-tap (W1.7 already removes the target panel; this removes the *mechanism*) + G8 Issue 7 (`activity-load-more-btn` self-disable).

**Spec**
- Extend the existing screens-nav side panel (already shows screen IDs, lets you jump). Add per-screen state pickers:
  - On `screen-passkey`: state = `idle | active | success | failed | not-found`
  - On `screen-password`: state = `default | wrong-password | locked`
  - On `screen-otp`: state = `request | entered | wrong | expired | locked | resent`
  - On `screen-forgot-password`: state = `default | rate-limited`
  - On `screen-reset-sent`: state = `default | expired-link`
  - On `screen-passkey-cd`: state = `default | expired | no-passkey | no-connect`
  - On `screen-passkey-enroll`: state = `prompt | active | success | error | already-set | suppressed`
  - On `screen-active-devices`: state = `default | only-this-device-left`
- Removes from the user-facing UI:
  - `reset-simulate-link-btn` ("I received the link →")
  - `activity-load-more-btn` (replaced by clear "Showing last 30 days" copy)
  - The forced 2-tap mechanism in `reset-send-btn` (already gone in W1.7)
  - The URL-param `?enroll=success|error` (state moves to drawer)
  - The `pwAttempts` counter mechanism stays as a real lockout simulation but the *trigger* moves to the drawer
- Drawer surfaces a single "Demo controls" header so testers can see the prototype-vs-product distinction at a glance.

### W2.6 · Activity-log "Something doesn't look right?" footer (A4) — `B`

**Closes:** G8 Issue 5 + locks A4 (Option C — page-level action footer).

**Spec**
- Bottom of `screen-activity` list:
  ```
  ─────────────────────────────────
  Something doesn't look right?
  → Change my password
  → Sign out everywhere except this device
  → Review my passkeys
  ```
- Implemented as a collapsed section (chevron-expand) so it doesn't dominate the audit-scan use case but is discoverable.
- Cross-flow plumbing: each routing target receives `signInOrigin = 'activity-anomaly'` so the post-completion toast can read *"Password changed. We've signed you out on other devices."* etc.

### W2.7 · Cross-property session model (parking lot) — `–`

Listed for completeness — not in Wave 2 scope. The "you're signed in across all Ace properties" brand promise sits behind real backend session sync. Park in `figma-flow-gaps.md` per Part D of STRUCTURAL-REVIEW.

---

## Wave 3 — Polish + Figma capture

**Goal:** Microcopy normalization, design-system tokens, accessibility audit, then the prototype-first → screenshot → Figma upload pass to the **new column** (per ratification directive).

### W3.1 · Heading + button case rules (Theme 2) — `B`

**Lock at synthesis:**
- **Headings**: Sentence case globally. Matches HIG / Material 3 / modern auth UX.
- **Primary buttons**: Title Case (e.g., "Send Reset Email", not "SEND RESET EMAIL").
- **Secondary buttons**: Sentence case ("Back to sign in", "Cancel").
- **Destructive primary buttons**: Title Case still ("Remove Passkey", "Sign Out") — destructive cue carried by color, not by case.

**Migrations** (every screen audited):
- G1, G2, G3, G4, G5, G6, G8 all have entries — see Theme 2 ledger row for explicit list.
- Single-batch sweep; no per-screen variance.

### W3.2 · Banner / informational-state palette tokens (Theme 3) — `B`

**Lock at synthesis** (the 4-tier set already identified in G4 + G5):
```css
--state-neutral-bg:  #F3F4F6;  --state-neutral-fg:  #6B7280;  /* G5 declined */
--state-caution-bg:  #FFF3E0;  --state-caution-fg:  #e6930a;  /* G4 cooldown */
--state-error-bg:    #FFEBEE;  --state-error-fg:    #c62828;  /* G4 wrong */
--state-success-bg:  #E8F5E9;  --state-success-fg:  #2e7d32;  /* G4 resent */
```

**Migrations**:
- G1 chooser banner moves from caution-tier to neutral-tier (it's "no passkey on this device" informational, not a warning).
- All amber banners audited; only those carrying genuine caution intent stay amber.
- `status-color-success` / `status-color-error` / `status-color-warn` / `status-color-info` aliased to the four state-* tokens above.

### W3.3 · Failed-state heading color rule (Theme 4) — `B`

**Lock**: Reserve red type for *terminal* states (account locked, lockout). Use neutral dark gray for retryable failures. Per G2 + G5 + G8 precedent.

**Migrations**: G1 `screen-passkey:failed` heading → neutral.

### W3.4 · Reduced-motion audit (Theme 5) — `B`

Audit pass on every animated indicator: `.biometric-ring`, OTP timer ring, QR-expiry timer, submit spinners, toast slide-in (W1.1), modal fade-in (W1.2). Verify each respects `prefers-reduced-motion: reduce`.

### W3.5 · Time-display format rule (Theme 15) — `B`

**Lock** (resolved in STRUCTURAL-REVIEW; spelling out for synthesis):
- **Static phrase, English** for non-actionable time labels (TTL, lockout windows): "15 minutes", "3 minutes". Never abbreviated ("min").
- **Numeric live countdown (`MM:SS`)** *only* when the user is actively waiting on it to enable an action (cooldown). Always two-digit padded (`00:42`, not `0:42`).
- Avoid live timers on lockout / TTL displays — they leak timing information and create anxiety.

### W3.6 · Doc consolidation pass (Themes 1 + 13 + 23) — `B`

Single sweep over `user-flow-documentation.md`:
- Update all node-ID references from doc-cited legacy IDs to the canonical `198:XX` IDs (Theme 1) **AND ADD** new-column IDs as they're allocated in W3.7. Doc-table shows both: original column IDs + new-column IDs side by side.
- Tighten destination phrasing where doc/prototype micro-drift exists (Theme 13).
- Add 8g Recovery Email Setup sub-flow entry (Theme 23 / W2.3).
- Audit each group's doc § against FLOWS-array entries — fix any other whole-flow gaps surfaced (Theme 23 generalizes beyond just G8).

### W3.7 · Figma re-capture + upload to new column (Theme 7 + Phase 3 directive) — `C`

**Sequence (strict order):**
1. Allocate node-ID range in Figma for the new column. Frame name pattern: `flow-v2:set-{group}` (e.g., `flow-v2:set-1-passkey`). Position parallel-to-right of existing column.
2. **DO NOT** modify the original frames (`198:36 / 87 / 137 / 185 / 266 / 310 / 389` + `421:2`). They are preserved historical reference.
3. Run `python3 figma-export/capture_screens.py` for the **new** prototype state.
4. Upload PNGs via Figma MCP, targeting the **new node-ID range only**. Per the directive in `figma-export/CAPTURE-AND-UPLOAD.md`.
5. Spot-check the Figma file: original column intact; new column populated.
6. `user-flow-documentation.md` table grows to show both column IDs side-by-side per sub-flow.

**Rationale (recapped from ratification):** The team has design history invested in the original column. Replacing those frames erases the "what we tried first" context. Adding a parallel column preserves the before/after diff and makes the v2 changes legible to anyone reviewing.

### W3.8 · Empty Figma stub frames (Theme 6) — `C`

Either populate with reference UI from Apple/Google HIG, or strip and explicitly mark OS-owned in the doc. Decision: **populate with HIG references** in the new column. The originals stay as empty rectangles (preservation directive).

### W3.9 · CSS pseudo-element cleanup verification (Theme 14) — `C`

Confirm zero `::after { content: '...' }` button-label patterns remain after W2.2 (OTP collapse, which removed the largest set). Audit + re-capture verifies Figma export now shows all button labels.

### W3.10 · Rename character counter (G8 Issue 9) — `C`

Bind the `#rename-char-hint` text to `input` event: `${value.length} / 40 characters`. Tiny enhancement.

---

## Cross-cutting items handled across waves

| Theme | Wave 1 | Wave 2 | Wave 3 |
|---|---|---|---|
| **1** Doc-to-Figma node ID drift | — | — | W3.6 |
| **2** Heading + button case | W1.10 (G8 only) | — | W3.1 (global) |
| **3** Banner palette | — | — | W3.2 |
| **4** Failed-state heading color | — | — | W3.3 |
| **5** Reduced-motion | (toast + modal built reduced-motion-aware) | — | W3.4 |
| **6** Empty Figma stubs | — | — | W3.8 |
| **7** Stale Figma frames | — | — | W3.7 |
| **8** Signed-in destination | W1.3 | — | — |
| **9** ARCHIVE headers | ✅ done | — | — |
| **10** Validation/state gaps | — | W2.5 | — |
| **11** Escape-hatch back buttons | W1.9 (settings) | W2.4 (recovery hub) | — |
| **12** Demo controls leak | — | W2.5 | — |
| **13** Doc/prototype micro-drift | — | — | W3.6 |
| **14** Pseudo-element labels | — | W2.2 | W3.9 |
| **15** Time-scale format | — | — | W3.5 |
| **16** Multi-entry-points | — | W2.1 | — |
| **17** Time-value drift | W1.8 | — | — |
| **18** Alert stubs | W1.1 | — | — |
| **19** Lockout countdowns | W1.4 | — | — |
| **20** Structural disagreements | — | (resolved by A1–A5 in Waves 1–2) | — |
| **21** Stub data-mutation | W1.5 | — | — |
| **22** Modal pattern partial | W1.2 | — | — |
| **23** Whole-flow doc gaps | — | W2.3 | W3.6 |

| Structural item | Wave 1 | Wave 2 | Wave 3 |
|---|---|---|---|
| **A1** Terminus rule | W1.3 | — | — |
| **A2** Email enumeration | W1.7 | — | — |
| **A3** Modal-vs-panel | W1.2 + W1.5 | — | — |
| **A4** Activity-log scope | — | W2.6 | — |
| **A5** Recovery Email IA | — | W2.3 | — |
| **B1** Identifier-first | — | W2.1 | — |
| **B2** OTP collapse | — | W2.2 | — |
| **B3** Demo-control drawer | — | W2.5 | — |
| **B4** Origin-route destination | W1.3 | — | — |
| **B5** Recovery hub | — | W2.4 | — |

---

## Wave-1 readiness checklist

Before Wave 1 starts, the following must be true. If any is `❌`, hold and resolve.

- ✅ All 7 group reviews written + cross-flow ledger at 23 themes
- ✅ Structural review written + 10 positions ratified
- ✅ Phase 3 directive captured ("new column, preserve originals")
- ⏳ User greenlight to start Wave 1 implementation
- ⏳ Confirmation: Wave 1 is implemented in `sign-in.html` only (no Figma changes during Wave 1)
- ⏳ Confirmation: Wave 1 lands as a single coherent commit/PR group, not screen-by-screen
- ⏳ Confirmation: testing rhythm — pause-per-W-item or pause-per-Wave?

---

*Phase 2 complete. Next: greenlight + cadence question, then Phase 3 Wave 1 implementation.*
