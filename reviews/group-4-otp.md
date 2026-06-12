# Group 4 · One-Time Code (OTP) Sign-In — Review

**Scope:** Sub-flows 4a–4g · 7 sub-flows · screens involved: `screen-chooser`, `screen-otp`, `screen-verify` (states: default, wrong, cooldown, expired, locked, resent), `screen-otp-no-access`, `screen-passkey-enroll`.

**Figma frames reviewed (live):**

| Sub-flow | Doc node ID | **Live node ID** | Local cache |
|---|---|---|---|
| 4a Happy Path | `93:31` | `198:185` (`flow:otp-happy`) | `.review-tmp/group-4/4a-198-185.png` |
| 4b Wrong Code | `94:31` | `198:196` | `.review-tmp/group-4/4b-198-196.png` |
| 4c Resend Cooldown | `96:31` | `198:210` | `.review-tmp/group-4/4c-198-210.png` |
| 4d Expired Code | `97:31` | `198:221` | `.review-tmp/group-4/4d-198-221.png` |
| 4e Account Locked | `98:31` | `198:232` | `.review-tmp/group-4/4e-198-232.png` |
| 4f Code Resent | `169:53` | `198:246` | `.review-tmp/group-4/4f-198-246.png` |
| 4g Can't Access Code | `169:74` | `198:254` | `.review-tmp/group-4/4g-198-254.png` |

**Cross-references walked:** `user-flow-documentation.md` (Group 4 §, lines 254–352), `sign-in.html` FLOWS (L5343–5413), `screen-otp` HTML (L3782), `screen-verify` HTML + state machine (L2602, L4449), `screen-otp-no-access` HTML (L3762) + handlers (L6090), `Sign In - Claude Design/screens-otp.jsx` (ARCHIVE-headered today), `figma-flow-gaps.md`, Figma MCP live (this session).

---

## Summary (1-paragraph health check)

**Group 4 is the strongest group reviewed so far on the engineering side.** The OTP code-entry interaction (`screen-verify`) has correct keyboard navigation, paste-handling, `autocomplete="one-time-code"` for SMS autofill, ARIA-live alerts, and `inputmode="numeric"` for mobile keyboards — meaningfully better than the password screen (G3). The escape-hatch on `screen-otp-no-access` (Use Password Instead → Contact Support → Back to sign in) is a **gold-standard 3-tier pattern** the rest of the flow should copy. **However:** the same validation-gap as Group 3 is present (`verify-btn` always succeeds in normal flow — wrong/expired/locked unreachable except via screens-nav), and two Figma frames (198:221 and 198:232) render the verify CTA as a **blank red button** because the prototype swaps its label via a CSS `::after { content }` trick that doesn't survive Figma's static export. New themes added to the ledger: CSS-pseudo-element labels invisible in Figma; time-scale presentation inconsistency.

---

## Source-drift report

| Doc says | Reality | Severity |
|---|---|---|
| Figma node `93:31` (4a) | Live frame is `198:185` (`flow:otp-happy`) | Tier B (doc update) |
| Figma node `94:31` (4b) | Live frame is `198:196` | Tier B |
| Figma node `96:31` (4c) | Live frame is `198:210` | Tier B |
| Figma node `97:31` (4d) | Live frame is `198:221` | Tier B |
| Figma node `98:31` (4e) | Live frame is `198:232` | Tier B |
| Figma node `169:53` (4f) | Live frame is `198:246` | Tier B |
| Figma node `169:74` (4g) | Live frame is `198:254` | Tier B |
| Doc 4b: "The code field clears" on wrong code | Prototype keeps boxes filled (red) on wrong | Tier A |
| Doc 4f: implies a "Resending Code" transition state | Prototype goes straight to green resent banner — no transition | Tier C / Tier A optional |
| Figma 4d (198:221) verify CTA | Prototype CTA renders as "RESEND CODE" via CSS pseudo-element. Figma export: blank red button. | Tier C (re-capture) + Tier A (consider DOM-text approach) |
| Figma 4e (198:232) verify CTA | Same root cause — Figma export shows blank red button labeled in CSS as "SIGN IN WITH PASSWORD" | Tier C + Tier A |
| `Sign In - Claude Design/screens-otp.jsx` | Stale per archive policy (ARCHIVE header added today) | resolved |
| `figma-export/screenshots/` | Likely stale; will be re-captured in Phase 3 | resolved (deferred) |

---

## Strengths (keep)

- **`screen-verify` interaction quality** — `inputmode="numeric"`, `maxlength="1"` per cell, paste-across-6, ArrowLeft/Right navigation, Backspace-to-previous, `autocomplete="one-time-code"` on the first cell. Best OTP entry UX in the app.
- **`autocomplete="one-time-code"`** — enables iOS/macOS SMS autofill suggestion bar. Aligns with NIST 800-63B and Apple HIG. Don't change.
- **ARIA-live alerts** — every state-specific alert (`verify-alert-cooldown/expired/locked/resent/wrong`) has `role="alert"` + `aria-live="polite"`. Screen-reader users hear state changes.
- **Auto-disabled VERIFY until 6 digits entered** (`updateVerifyBtn`, L4399) — correct affordance.
- **Cooldown auto-recovery** — at 0:00 the cooldown clears and state returns to `default`. No stuck state.
- **Resent banner auto-dismisses after 4s** — good ephemeral feedback pattern.
- **`wrongAttempts` counter resets on `default` re-entry** — clean (L4471).
- **`screen-otp-no-access` 3-path escape** — primary CTA (Use Password Instead) + secondary CTA (Contact Account Support) + tertiary text-link (Back to sign in). **This is the canonical pattern for any dead-end screen.** G3's `screen-forgot-password` should adopt it.
- **`SIGN IN ANOTHER WAY` button on `screen-otp` and `screen-verify`** — explicit escape hatch back to chooser without using the global header back. Better than G3.
- **Code-expiry phrasing static, not a countdown** — "The code expires in **3 minutes**" — avoids anxiety. Right call.
- **Figma 4a chronology strip** — depicts all 4 happy-path screens (chooser → otp → verify → enroll) plus inter-step labels. **No Figma drift on 4a** — unlike G3's 198:137 which omitted MFA + Enroll.
- **Wrong-attempts copy** — "Incorrect code. 2 attempts remaining." is direct, non-blaming, and pluralizes correctly (`attempt${remaining !== 1 ? 's' : ''}`, L4519).
- **Cross-channel toggle on `screen-otp`** — Email vs Text segmented control with check-badge selected state. Clean.
- **Channel-specific helper text** swaps with the toggle ("We'll send a 6-digit code to your email" / "We'll text a 6-digit code to your phone"). Good microcopy.
- **`verify-destination-text` updates dynamically** based on the channel + value entered on `screen-otp` (L4731). Confirmation that transferred state works.

---

## Issues

> **Tier reminder (per plan v5):** A = local prototype fix queued for Phase 3 Wave 1 · B = cross-flow pattern queued for Phase 3 Wave 2 · C = Figma frame drift queued for Phase 3 Wave 3.

### Issue 1 · Major · `verify-btn` doesn't validate — wrong/locked unreachable in normal flow · **Tier A**

**Location:** `sign-in.html` L4475–4521.

**Behavior observed:**
```js
if (verifyState === 'default') {
  enrollOrigin = 'post-login';
  setEnrollState('prompt');
  switchScreen(screenVerify, screenEnroll, 'forward');
  return;
}
// state was 'wrong' or other — bump attempts, show wrong/locked
```

In a normal user run (chooser → otp → verify default → tap VERIFY), `verifyState` is always `'default'`, so VERIFY *always* succeeds and the user lands on enrollment. The `wrong`, `expired`, and `locked` states only show via the bottom-screen-nav (which forces `data-state` directly). This is the **same architectural pattern as G3's `pw-submit-btn`** — Theme 10 confirmed.

**Recommendation:** Validate the entered code. Sentinel approach (e.g. `'111111'` → happy path, anything else → `setVerifyState('wrong')` and increment counter). Bump counter inside that branch, not on the button-tap-after-already-wrong branch. Defer to Phase 3 Wave 1.

---

### Issue 2 · Major · Verify CTA renders as blank red button in Figma 198:221 + 198:232 · **Tier A + Tier C**

**Location:** `sign-in.html` L581–584.

```css
#screen-verify[data-state="expired"] #verify-btn::after  { content: 'RESEND CODE'; }
#screen-verify[data-state="expired"] #verify-btn          { font-size: 0; }
#screen-verify[data-state="locked"]  #verify-btn::after   { content: 'SIGN IN WITH PASSWORD'; }
#screen-verify[data-state="locked"]  #verify-btn          { font-size: 0; }
```

In the live prototype this works — the button shows the correct contextual label. In **static Figma exports** (`198:221` expired, `198:232` locked) the rendering engine doesn't include the CSS pseudo-element content, so both Figma frames show a fully red button with **no visible label**. Anyone looking at Figma — a developer estimating, a PM reviewing, a stakeholder doing a walkthrough — sees an unlabeled CTA and either has to guess or run the prototype.

**Recommendation, two parts:**
- **Tier A (prototype):** Replace the CSS-pseudo-element label swap with explicit DOM text content set in `setVerifyState`. Single source of truth, accessible to assistive tech (currently the visible-text label is in CSS, which screen readers may miss depending on engine), and renders in Figma exports.
- **Tier C (Figma):** After the prototype change, re-capture frames 198:221 and 198:232.

---

### Issue 3 · Major · Wrong-attempts counter ties to button taps, not code values · **Tier A**

**Location:** `sign-in.html` L4505–4521.

Each call to the verify-btn handler bumps `wrongAttempts++`. Combined with Issue 1, the only way to reach this branch in normal flow is via screens-nav (which sets state to `wrong`). Once you're in `wrong`, every subsequent tap of VERIFY (regardless of what's in the boxes) bumps the counter. After 3 taps, lockout.

The user's mental model is "I tried 3 wrong **codes**" — not "I tapped the button 3 times." The counter should track distinct submitted-but-wrong code values, not button taps.

**Recommendation:** Tie `wrongAttempts++` to a wrong-code submission inside Issue 1's sentinel logic. Defer to Phase 3 Wave 1.

---

### Issue 4 · Minor · Doc says "field clears on error"; prototype keeps boxes filled (red) · **Tier A**

**Location:** `sign-in.html` L4467 (`setVerifyState('wrong')`):
```js
otpFields.forEach(f => { f.value = f.value || '1'; });
```

Doc (line 281): *"The code field clears so they don't accidentally submit the same wrong entry again."*

NIST 800-63B and conventional OTP UX favor field-clear-on-error. Figma 4b (198:196) is also ambiguous — its annotation strip shows a "Wrong-code → Try Again → Verify" sequence with the retry destination depicted as empty boxes, while frame 4 of the static layout shows boxes filled red.

**Recommendation:** Clear the boxes on `wrong` and refocus the first cell. Aligns with doc, NIST, and reduces friction.

```js
} else if (state === 'wrong') {
  otpFields.forEach(f => { f.value = ''; });
  otpFields[0].focus();
  verifyBtn.disabled = true;
}
```

---

### Issue 5 · Minor · Resend → 100ms flicker between resent and cooldown · **Tier A**

**Location:** `sign-in.html` L4500–4503.

```js
resendBtn.addEventListener('click', () => {
  ...
  setVerifyState('resent');                              // 4-second auto-dismiss to 'default'
  setTimeout(() => setVerifyState('cooldown'), 4100);    // fires 100ms later
});
```

So the timeline is: `resent` (4000ms) → auto-dismiss to `default` → ~100ms of `default` (no banner) → `cooldown`. The flash is brief but the structure is fragile (two timers racing).

**Recommendation:** Have `setVerifyState('resent')` chain into `cooldown` directly via its own timeout, instead of two parallel timeouts in the click handler. State-machine cleanup.

---

### Issue 6 · Minor · "Resending Code" transition state in Figma annotation; missing in prototype · **Tier C / Tier A optional**

**Location:** Figma 4f (198:246) chronology strip shows "Resending Code (Brief transition state: spinner or progress indicator while new code is generated and dispatched)" between OTP Entry and Code Sent.

**Reality:** Prototype goes straight to green confirmation banner — no spinner.

**Recommendation:** Either implement a ~600ms spinner state for realism (better matches real-world perceived latency of OTP delivery) OR strip the transition state from Figma + doc. **Recommend strip — adding a fake spinner introduces complexity without UX benefit on a prototype.** Tier C if Figma-only edit, no Tier A change required.

---

### Issue 7 · Minor · Three different time-scale presentations on the same screen · **Tier B**

`screen-verify` shows three time references in different formats:

| Element | Format | Behavior |
|---|---|---|
| Code-expiry hero text | "**3 minutes**" | Static phrase, never updates |
| Cooldown alert | "**0:42**" → "0:00" | Live countdown |
| Locked alert | "**15 min**" | Static phrase, never updates |

The same screen has plain English ("3 minutes"), `M:SS` numeric ("0:42"), and abbreviated ("15 min"). No global pattern.

**Recommendation:** Set a global rule in synthesis. Provisional:
- **Static phrase, English** for non-actionable time labels (code TTL, lockout windows): "3 minutes", "about 15 minutes"
- **Numeric live countdown** only when the user is *waiting on it to enable an action* (cooldown timer)

Defer to Phase 2 synthesis. Cross-flow theme.

---

### Issue 8 · Minor · `screen-verify` H1 "Welcome Back" is emotionally off-key for an active-task screen · **Tier B**

The verify screen is shown to a user who has just requested a code and is now mid-task entering it. The hero says "Welcome Back" — appropriate for a returning-user landing greeting, not for the moment of typing 6 digits while their fingers are mid-air. Compare:

| Screen | H1 | Tone |
|---|---|---|
| `screen-chooser` | "Sign In" | Neutral, command |
| `screen-otp` | "Sign In" | Neutral, command |
| `screen-verify` | "Welcome Back" | Greeting (mismatched) |
| `screen-otp-no-access` | "Can't access your code?" | Active question |

**Recommendation:** Verify H1 → "Enter Your Code" or "Verify Your Identity" or "Verifying You" — active-voice, task-focused. "Welcome Back" lands better post-authentication. Adds to ledger Theme 2 (heading + button case). Defer to Phase 2.

---

### Issue 9 · Minor · "15 min" lockout label has false precision · **Tier B**

The locked alert reads: *"Code requests are temporarily locked. Try again in **15 min** or sign in another way."* This is a **static phrase that never decrements.** A user who left the page open for 14 minutes still sees "15 min". A user who navigates to settings and returns sees "15 min".

Two valid resolutions:
- **(a)** Implement a real `MM:SS` countdown when in `locked` state. Pro: trustworthy. Con: live timer adds anxiety + reveals exact unlock to attackers (minor).
- **(b)** Soften the precision: "Try again in about 15 minutes" or "Try again later". Pro: zero implementation. Con: less informative.

**Recommendation:** (b). Live lockout timers leak timing information and create a "watching the clock" UX. Tier B.

---

### Issue 10 · Nit · Sub-minute timer formatting `0:42` reads as "zero forty-two" · **Tier B**

Same theme as G3's reset cooldown. The `M:SS` pattern is awkward when M is always 0. Consider `00:42` (two-digit pad) or just `42s` for sub-minute timers.

**Recommendation:** Lock a global timer-formatting rule in Phase 2. Tier B.

---

### Issue 11 · Minor · `screen-verify` keeps box-fill focus stranded after wrong-state · **Tier A** (covered by Issue 4 fix)

Currently when `wrong` is entered, focus is wherever the user last was. If Issue 4 is applied (clear boxes + focus cell 1), this resolves automatically. Calling it out so it's not lost during the Phase 3 batch.

---

### Issue 12 · Nit · `no-access-support-btn` opens a `window.alert()` · **Tier A**

**Location:** `sign-in.html` L6105.

```js
document.getElementById('no-access-support-btn').addEventListener('click', () => {
  alert('This would open account support. (prototype)');
});
```

Native `alert()` looks broken in a polished prototype. Other "this is a stub" simulations use prettier patterns elsewhere.

**Recommendation:** Replace with a small inline modal styled to match the OS sheet pattern, or a console placeholder + a non-blocking toast: *"Account support not wired in this prototype."* Tier A. Low effort.

---

## Open questions

1. **Q1 (Issue 1)** — Confirm sentinel: code `111111` → happy; anything else → wrong-code path. OK?
2. **Q2 (Issue 2)** — Adopt DOM-text approach for the verify CTA (single-source-of-truth) before re-capturing Figma 198:221 + 198:232?
3. **Q3 (Issue 4)** — Adopt field-clear on wrong-code? (Recommend yes — NIST + standard pattern.)
4. **Q4 (Issue 6)** — Strip the "Resending Code" transition state from Figma + doc? (Recommend yes — fake spinner = noise.)
5. **Q5 (Issue 8)** — Verify H1: keep "Welcome Back" or switch to active-task copy? (Tied to global heading-pattern decision in Phase 2.)
6. **Q6 (Issue 9)** — Lockout copy: precision-soften ("about 15 minutes") or live countdown? (Recommend soften.)

---

## Cross-flow notes

| Theme | Group 4 contribution | Action |
|---|---|---|
| **Theme 1** · Doc-to-Figma node ID drift | Confirmed again — 7 more entries (`93/94/96/97/98:31`, `169:53`, `169:74` → `198:185/196/210/221/232/246/254`) | Doc-update batch in Phase 3 Wave 3 |
| **Theme 2** · Heading + button case | Verify H1 "Welcome Back" clashes with task; OTP buttons UPPERCASE — same as G3 | Phase 2 synthesis |
| **Theme 3** · Banner palette | **Working precedent** — amber clock for cooldown (`#e6930a`), red for error (`#c62828`), green for success (`#2e7d32`). Lock these tokens. | Phase 2 — cite as canonical |
| **Theme 7** · Stale Figma frames | Add 198:221 + 198:232 (CSS-pseudo-element label invisible in export) | Phase 3 Wave 3 |
| **Theme 10** · Validation logic gaps | Confirmed in `verify-btn`; same architecture as G3 | Phase 3 Wave 1 fixes both with one shared sentinel pattern |
| **Theme 11** · Missing back/cancel | **Group 4 is the gold standard** — adopt `screen-otp-no-access`'s 3-path pattern as canonical for all dead-ends | Phase 2 synthesis |
| **NEW · Theme 14** · CSS-pseudo-element labels invisible in Figma | First instances: 198:221, 198:232 | Tier A fix in Phase 3 Wave 1 + Tier C re-capture in Wave 3 |
| **NEW · Theme 15** · Time-scale presentation inconsistency | First instance: `screen-verify` shows 3 different time formats | Phase 2 synthesis lock |

---

## Tier A queue (deferred to Phase 3 Wave 1)

| # | Description | Effort | Cross-flow? |
|---|---|---|---|
| 1 | Validate verify-btn input (sentinel `111111`) + tie wrongAttempts to wrong submissions | M | Pairs with G3 Issue 4 — one shared sentinel pattern |
| 2 | Replace CSS `::after` button labels with DOM text in `setVerifyState` | S | Localized — but enables Theme 14 fix |
| 4 | Clear OTP boxes + focus cell 1 on wrong-state | XS | Pairs with Issue 11 |
| 5 | Chain `resent` → `cooldown` via single state machine path | S | Localized |
| 12 | Replace `alert()` for support-button stub | XS | Localized |

## Tier B queue (Phase 3 Wave 2 — cross-flow patterns)

- Theme 2 · Heading + button case lock (Issue 8)
- Theme 3 · Banner palette canonicalization (this group provides the precedent)
- Theme 11 · Adopt `screen-otp-no-access` 3-path as canonical for dead-end screens
- Theme 15 · Time-scale presentation rule (Issues 7, 9, 10)
- Issue 9 lockout copy

## Tier C queue (Phase 3 Wave 3 — Figma reconciliation)

- Re-capture 198:221 (expired) + 198:232 (locked) after Issue 2 Tier A applied
- Doc node-ID updates for all 7 sub-flow anchors
- Either remove the "Resending Code" transition state from 198:246 + doc OR (less recommended) implement it
