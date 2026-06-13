# Tier-A Audit & Remediation Plan — Post-W3 Polish

**Date:** 2025-W3 close
**Scope:** Verify every Tier A item from per-group reviews against current
prototype HEAD (`9c69e4a`). Identify gaps and bundle remediations.

---

## ✅ STATUS: CLOSED — 2026-06-13

All 8 remediation batches shipped on `feature/wave-1-scaffolding`. Every
Tier-A item in this audit is now resolved (✅) or has been explicitly
decided in the open-questions section below. Two follow-up commits
landed after the named batches and finished the audit cycle:

- `4a315ae` — Flow audit: identifier-strip pre-fill in flow player + 3
  new FLOWS (passkey-failed-fallback-password, cross-device-direct,
  otp-no-access-use-password) + Group 9 (Recovery Email Setup) docs
- `b393e2e` — Audit follow-ups: terminal-step honesty (no signed-in
  destination by design), demo hints surfacing the password / OTP
  validation sentinels, OTP state-field doc clarification

This document is preserved as a historical artifact of the W3 close.
Do not reopen — file new findings under a fresh review or audit doc.

---

## 1. Audit results (Tier A only)

Legend: ✅ Done · ❌ Not done · ⚠️ Partial / needs decision

| ID | Issue | Status | Evidence |
|----|-------|--------|----------|
| **G2 Cross-device** | | | |
| G2-I1c | QR "02:00" hardcoded, not driven by `QR_TTL_MS` | ❌ | [sign-in.html#L3355](sign-in.html#L3355) static `<strong>02:00</strong>`; [#L4925](sign-in.html#L4925) `QR_TTL_MS=120000` defined but unused |
| G2-I2 | Live QR countdown + auto-transition to `cross-device-failed` on expiry | ❌ | No `startQrCountdown`-style controller exists |
| G2-I3 | Visible spinner on retry / regenerate / try-different device | ❌ | [#L5549](sign-in.html#L5549) handler swaps state attr only |
| G2-I4 | QR-default cancel button says "Cancel" (should be "Sign in another way") | ❌ | [#L3356](sign-in.html#L3356) `id="passkey-qr-cancel">Cancel` |
| **G3 Password** | | | |
| G3-I4 | Wrong-password validation has no sentinel; account-lock unreachable from real input | ❌ | [#L5657](sign-in.html#L5657) any non-empty email+pw proceeds |
| G3-I5 | Forgot-pw rate-limit reachable from real input (no "errors first" pattern) | ✅ | [#L7114](sign-in.html#L7114) validates email format and proceeds |
| G3-I9 | Forgot-password default state lacks visible back/cancel | ❌ | [#L4253](sign-in.html#L4253) — no back link in default panel; only in rate-limited substate |
| G3-I10 | Forgot-pw cooldown displays `MM:SS` | ✅ | W3.5 closed — uses `startLockoutCountdown` |
| **G4 OTP** | | | |
| G4-I1 | Verify button should validate input sentinel (e.g. `111111` → wrong) | ⚠️ | [#L5425](sign-in.html#L5425) default state always succeeds; wrong/locked only via demo-nav |
| G4-I2 | "Resend Code" / "Sign In with Password" labels via CSS `::after` (not screen-reader accessible) | ❌ | [#L636-L637](sign-in.html#L636) `content:` strings still present after W3.9 |
| G4-I4 | Doc says boxes clear on error; prototype keeps them filled | ⚠️ | [#L5368](sign-in.html#L5368) intentionally `f.value || '1'` — design decision needed |
| G4-I5 | `resent` → `cooldown` chain (no race) | ✅ | [#L5415-L5423](sign-in.html#L5415) chained via `setTimeout` |
| G4-I11 | Focus cell 1 after error state | ⚠️ | bound to I4 outcome |
| G4-I12 | `no-access-support-btn` uses `alert()` | ✅ | [#L7211](sign-in.html#L7211) now `showToast` |
| **G5 Enrollment** | | | |
| G5-I2 | `handleEnrollSkip` uses `alert()` | ✅ | no `alert()` anywhere in file |
| G5-I3 | `enroll-continue-btn` uses `alert()` | ✅ | no `alert()` anywhere in file |
| G5-I5 | `?enroll=success\|error` needs visible demo control | ✅ | demo drawer surfaces both success and error states |
| **G6 Password reset** | | | |
| G6-I3 | Reset-link TTL settled | ✅ | `RESET_LINK_TTL_MS=900_000`; copy says "15 minutes" |
| G6-I4 | Replace forced 2-tap reset-send-btn | ✅ | [#L7114](sign-in.html#L7114) validates and proceeds first attempt |
| G6-I5 | Restore rate-limit state on expiry | ✅ | [#L7068](sign-in.html#L7068) uses shared `startLockoutCountdown` with `hostEl`+`stateAttr` |
| G6-I6 | `reset-success-signin-btn` → "Back to sign in" | ⚠️ | [#L4354](sign-in.html#L4354) still "Sign In Now" — depends on G6-I2 decision |
| G6-I7 | "Try a different address" link on reset-sent screen | ⚠️ | Refactored away via identifier-strip-edit pattern; verify intent |
| **G8 Settings** | | | |
| G8-I1 | Rename/remove mutate the DOM | ✅ | [#L5856,#L5905](sign-in.html#L5856) handlers mutate + refresh |
| G8-I3 | Toast on rename/remove/remove-last | ✅ | all three handlers call `showToast` |
| G8-I6 | Sign-out button case standardized | ⚠️ | HTML reads "Sign Out" (title case) but CSS-uppercase parent makes confirm render "SIGN OUT" — inconsistent screen-reader vs visual |
| G8-I8 | Breadcrumb tappable on detail screens | ✅ | 4× `.settings-breadcrumb-link` buttons present |

---

## 2. Holistic remediation plan

Grouped by **interdependency**, not group number. Each batch ships as one
atomic commit so reverts are clean.

### Batch A — QR cross-device live countdown (closes G2-I1c + G2-I2 + G2-I4)

**Status:** ✅ Shipped in `7cfb39b`.

**Why bundled:** All three touch the QR-default screen and the
`cross-device-failed` transition. A live countdown is meaningless without the
auto-transition; the cancel-button relabel is a 1-line change in the same DOM
neighborhood.

**Changes:**
- [sign-in.html#L3355](sign-in.html#L3355) — replace static `<strong>02:00</strong>` with `<strong id="passkey-qr-expires-countdown">02:00</strong>`
- [sign-in.html#L3356](sign-in.html#L3356) — relabel `passkey-qr-cancel` text from "Cancel" to "Sign in another way"
- Add `startQrExpiryCountdown()` modeled on `startLockoutCountdown`; use existing `QR_TTL_MS = 120_000`
- Invoke on QR screen entry; on expiry → `setPasskeyState('cross-device-failed')`
- Clear on screen exit, retry-device, regenerate

**Effort:** ~40 lines of new JS + 2 HTML edits.

---

### Batch B — Spinner feedback on async-feeling actions (closes G2-I3)

**Status:** ✅ Shipped in `1abee37`.

**Why isolated:** Visual feedback pattern; easier to ship after Batch A so the
QR controller is in place to coordinate cancellation.

**Changes:**
- Add a single `.btn-spinner` CSS utility (or reuse OS-modal spinner styling)
- Apply on `passkey-qr-retry-device-btn`, `passkey-qr-regenerate-btn`, `passkey-qr-try-different-btn` for ~800 ms before state transition

**Effort:** ~20 lines.

---

### Batch C — OTP sentinel + accessible button labels (closes G4-I1 + G4-I2)

**Status:** ✅ Shipped in `c47af2d`. The validation sentinel itself was made
discoverable by the demo-hint on `screen-otp` shipped in `b393e2e` (`111111`
→ wrong-code error → 3-strike lockout).

**Why bundled:** Both touch the OTP `verify-btn` handler region. Sentinel
validation makes `wrong`/`locked` reachable from real input; CSS `::after`
removal makes those states screen-reader accessible.

**Changes:**
- [sign-in.html#L5425](sign-in.html#L5425) — read OTP value via `getOtpValue()`, branch:
  - `111111` → trigger wrong (`wrongAttempts++`, etc.)
  - empty/short → ignore (button should already be disabled)
  - else → happy path
- [sign-in.html#L627-L637](sign-in.html#L627) — remove `::after { content: 'Resend Code' }` and `::after { content: 'Sign In with Password' }` rules
- In `setVerifyState`, when entering `cooldown` / `locked`, set `verifyBtn.textContent = 'Resend Code'` / `'Sign In with Password'`
- Restore `'Verify'` on `default`/`resent`/`wrong`/`expired`

**Effort:** ~30 lines.

---

### Batch D — OTP wrong-state UX decision (G4-I4 + G4-I11)

**Status:** ✅ Shipped in `834e6f9`. Decision: keep boxes filled (current
behavior). Added `aria-invalid` + focus management; updated
`reviews/group-4-otp.md` and `user-flow-documentation.md` accordingly.

**Why isolated:** This is a **design decision**, not a bug. SYNTHESIS doc said
"clear on error"; prototype kept boxes filled (red) to make the state visible.

**Recommendation:** Keep filled boxes (current behavior) but:
- Add `aria-invalid="true"` on the inputs when in wrong state
- Focus cell 6 (last cell) so the user can `Backspace` through
- Update `reviews/group-4-otp.md` to reflect the resolved decision

**Effort:** ~10 lines + doc edit. **Ask David before changing.**

---

### Batch E — Password sentinel (closes G3-I4)

**Status:** ✅ Shipped in `c8193d4`. The validation sentinel itself was made
discoverable by the demo-hint on `screen-password` shipped in `b393e2e`
(`wrongpw` → wrong-password error → 3-strike lockout).

**Why isolated:** Touches `pw-submit-btn` handler only; no cross-screen impact.

**Changes:**
- [sign-in.html#L5657](sign-in.html#L5657) — sentinel: `wrongpw` (or specific value) → wrong state; 3 wrongs → `screen-account-locked`
- Reuse existing `wrong` substate styling on `screen-password`
- Real input → happy path → OTP screen

**Effort:** ~20 lines.

---

### Batch F — Forgot-password back affordance (closes G3-I9)

**Status:** ✅ Shipped in `2143b44`.

**Why isolated:** One-screen scope; one new button.

**Changes:**
- [sign-in.html#L4253](sign-in.html#L4253) — add `<button class="sign-in-another-way-btn" id="forgotpw-back-btn">Back to sign in</button>` to the default panel
- Wire handler: `goToSignInOptions(screenForgotPw)`

**Effort:** ~10 lines.

---

### Batch G — Reset-success copy + identifier-strip parity (G6-I6 + G6-I7)

**Status:** ✅ Shipped across `e0702cb` (G6-I7 — identifier-strip-edit on
reset-sent + per-instance Edit routing) and `834e6f9` (G6-I6 — reset CTA
copy).

**Why bundled:** Both are copy decisions on the reset success leg.

**Recommendation:**
- G6-I6: relabel `reset-success-signin-btn` from "Sign In Now" → "Back to sign in" (currently misleading — clicking does not auto-sign-in)
- G6-I7: confirm that identifier-strip-edit on `screen-password` covers "wrong email" recovery path; mark group-6 review accordingly. No code change needed if so.

**Effort:** ~5 lines.

---

### Batch H — Sign-out case consistency (G8-I6)

**Status:** ✅ Shipped in `834e6f9`. Decision: **Path B** (sentence case in
HTML, CSS uppercase only on primary buttons where it applies).

**Why isolated:** Affects `device-signout-btn` HTML text vs `.sign-in-btn` CSS uppercase render.

**Recommendation:** Pick one:
1. **Path A (visual consistency):** All "Sign Out" → "SIGN OUT" in HTML; remove from `.sign-in-btn` uppercase scope OR
2. **Path B (semantic consistency):** Use sentence case "Sign out" in HTML everywhere; rely on CSS for primary-button uppercase only where it applies

**Recommend Path B** — matches sentence-case heading convention. **Ask David.**

**Effort:** ~6 HTML edits.

---

## 3. Sequencing recommendation

Ship in this order — each batch is independently revertible:

1. **Batch C** (OTP sentinel + a11y labels) — highest accessibility value, isolated to one handler
2. **Batch E** (password sentinel) — symmetric with C, completes the "real input reaches error states" story
3. **Batch A** (QR live countdown) — biggest perceived prototype improvement
4. **Batch B** (spinners) — polish on top of A
5. **Batch F** (forgot-pw back) — quick win, 10 lines
6. **Batch D** (OTP wrong-state decision) — needs David's input
7. **Batch G** (reset copy) — needs David's input
8. **Batch H** (sign-out case) — needs David's input

**Batches 1–5 (~120 lines total) are mechanical and can be executed as a continuous run.**
**Batches 6–8 require a decision before code changes.**

---

## 4. Deferred (not in scope for this remediation pass)

- W3.6 — Documentation consolidation
- W3.7 — Figma re-capture
- W3.8 — Figma stubs
- Tier B and Tier C items across all groups

---

## 5. Open questions for David — RESOLVED

1. **Batch D (OTP wrong-state):** ✅ **Resolved** — keep boxes filled, add
   `aria-invalid` and manage focus. Shipped in `834e6f9`.
2. **Batch G (G6-I6 copy):** ✅ **Resolved** — relabeled "Sign In Now" →
   "Back to sign in" on the reset-success screen. Shipped in `834e6f9`.
3. **Batch G (G6-I7):** ✅ **Resolved** — identifier-strip-edit pattern
   accepted as the "try a different address" affordance. Shipped in
   `e0702cb`.
4. **Batch H (sign-out case):** ✅ **Resolved** — Path B chosen (sentence
   case in HTML, CSS uppercase only where applicable). Shipped in
   `834e6f9`.
