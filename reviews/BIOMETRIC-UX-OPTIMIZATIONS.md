# Biometric UX Optimizations — Wave 2 vs. Orbix Guide

**Date opened:** 2026-07-09
**Branch:** `feature/heuristic-alignment-wave2`
**Source:** [Orbix Studio · Biometric Authentication App Design (2026 UX Guide)](https://www.orbix.studio/blogs/biometric-authentication-app-design#read-step-3)
**Scope:** Compares every practice the article prescribes against the current wave-2 prototype (`sign-in.html`) and its `FLOWS[]` registry. Adherence, gaps, and prioritized optimization backlog.

> Legend: ✅ compliant · ⚠️ partial / worth improving · 🔲 gap / new work · 📎 out of scope / noted

---

## 1 · Ten article rules → wave-2 status (scoreboard)

| # | Rule | Status | Evidence |
|---|---|---|---|
| A | Enable biometrics **after** first successful login, not during signup | ✅ | Enrollment offer is the terminal step of `password-happy`, `otp-happy`, `cross-device-happy`. No signup flow exists in the prototype (Create Account is `href="#"`), so violation is structurally impossible today. |
| B | Enrollment is **opt-in**, always reversible | ✅ | Prompt has `Set up Face ID sign-in` + `Skip for now`. `enroll-declined-fork` (Maybe Later) and `enroll-declined-never` (Don't ask again) are both first-class flows. Suppressed panel points to Settings for reversal. |
| C | **Visible fallback** (password / OTP / email) — one tap away | ✅ | Passkey screen always renders fallback tiles below the divider. Failed state auto-reveals them ([sign-in.html:1290](sign-in.html#L1290)). |
| D | **Don't auto-trigger** the OS prompt on page load | ✅ | Chooser lands with a button (`#chooser-passkey-cta`). Passkey screen lands `idle` and only calls `showOsModal()` from the `#passkey-try-btn` click handler ([sign-in.html:6968](sign-in.html#L6968)). No `DOMContentLoaded` invoke. |
| E | Fallback is a **peer**, not hidden under "having trouble?" | ✅ | Password / OTP / Use another device are peer method tiles on the chooser and peer fallback tiles on the failed passkey screen. |
| F | Limit retries — a couple, then move on | ⚠️ | Codified for password (3-strike → `password-account-locked`) and OTP (`otp-locked`). No explicit retry cap demoed for the biometric screen — one fail immediately surfaces the fallback tiles, which honors the intent but doesn't demonstrate the ceiling. |
| G | Privacy assurance **at the moment of decision**, plain-language | ⚠️ | Present on the **enrollment** prompt ([sign-in.html:4319](sign-in.html#L4319)): *"Your device uses Face ID to verify it's you — nothing ever leaves your device."* Absent from the **returning-user sign-in** surfaces (`chooser-subtitle-passkey-first` sells speed; `#biometric-status-sub` explains process). See §3.1. |
| H | Don't lock aggressively for biometric failures | ✅ | Biometric failures never lock — they surface fallback tiles. Lockouts are reserved for credential failures. |
| I | Use the **OS-owned** biometric sheet, don't fake it | 📎 | Prototype uses a simulated `.os-modal` (`showOsModal()`) for demo purposes — appropriate here, but the swap boundary to real `LocalAuthentication` / `BiometricPrompt` isn't documented in `FLOWS[]`. See §3.5. |
| J | Accessibility — biometrics cannot be the only path | ⚠️ | Non-biometric paths always available (password + OTP always visible). No `passkey-hardware-unavailable` flow. `#biometric-status-label` state changes lack `aria-live`. See §3.4. |

**Overall:** 6 clean ✅ · 3 ⚠️ · 1 📎. No violations. The two most-cited article mistakes ("auto-trigger on load" and "hide the fallback") are structurally impossible in wave 2.

---

## 2 · Copy audit — how our language stacks up

The article treats copy as a first-class UX surface. Grading our current strings against the article's recommended patterns:

| Surface | Current copy | Article-recommended pattern | Verdict |
|---|---|---|---|
| Enrollment prompt heading | *"Sign in faster with Face ID"* | *"Turn on biometric login for quicker access"* | ✅ Better than the article's example — leads with benefit, names the actual system. |
| Enrollment subtext | *"Skip the password next time. Your device uses Face ID to verify it's you — nothing ever leaves your device."* | *"Your fingerprint stays on your phone. We never see it."* | ✅ Excellent — one sentence, plain, at the moment of decision. |
| Enrollment decline confirmation | *"You can set up Face ID sign-in anytime from Account Settings › Sign-in & security."* | *"Make it just as easy to turn off as it was to turn on"* | ✅ Points to the specific reversal path. |
| Chooser · passkey-first subtitle | *"We recognize this device. Use Face ID for the fastest sign-in."* | Privacy line at moment of decision | ⚠️ Sells speed only. A returning user tapping this button is also deciding. Add a discreet privacy micro-line. |
| Passkey screen · idle sub | *"Your device will prompt you to authenticate"* | Privacy line at moment of decision | ⚠️ Explains process, not privacy. Consider adding a small "Your Face ID data never leaves this device." |
| Passkey screen · failed sub | *"Your account is still secure — try again or use a different method."* | Reassure that failure ≠ breach | ✅ Best copy in the file. Textbook "trust is built by giving control." |
| No-passkey banner | *"No passkey on this device. Sign in with your password or a one-time code below."* | Plain-language explanation + next step | ✅ Aligns with article's "explain in plain words." |
| OTP wrong-code | *"Incorrect code. 2 attempts remaining."* | Show remaining budget before lockout | ✅ Good — the article's testing section calls out that users need to see recovery paths clearly. |

---

## 3 · Prioritized optimizations backlog

Ordered by expected impact / cost. Each item lists the article citation, current state, proposed change, and a rough size.

### 3.1 · Add privacy assurance to the returning-user passkey surfaces **[HIGH · SMALL]** ✅ SHIPPED (`18894a4`)

- **Article rule:** G — "Privacy information should appear at the moment users are deciding, not hidden in settings or policies."
- **Current state:** Assurance only lives on the enrollment prompt. Returning users see speed/process copy on `chooser-subtitle-passkey-first` and `#biometric-status-sub`.
- **Proposal:** Add one 8-10 word privacy micro-line to:
  1. `chooser-subtitle-passkey-first` — e.g. keep the current line and append *"Face ID stays on your device."* as a `<small>` under the subtitle.
  2. `#biometric-status-sub` — swap process explanation for a privacy statement, or interleave them.
- **Files:** [sign-in.html:4048](sign-in.html#L4048), [sign-in.html:4167](sign-in.html#L4167), [sign-in.html:6626](sign-in.html#L6626) (default idle setter).
- **Cost:** ~15 lines of markup/copy. No JS behavior change.

### 3.2 · Add `passkey-hardware-unavailable` flow **[HIGH · MEDIUM]** ✅ SHIPPED (`0ef79af`)

- **Article rule:** J — "Biometrics also don't work for everyone. Some people can't use fingerprints or face recognition reliably because of physical reasons."
- **Current state:** No flow demonstrates "device reports no biometric hardware / biometrics disabled at OS level." A returning user in this state would tap `#chooser-passkey-cta`, hit `showOsModal()`, and… nothing article-correct happens (the sim always resolves). In production this is a real branch.
- **Proposal:** Add a new `FLOWS[]` entry:
  ```
  { id: 'passkey-hardware-unavailable', group: 'Passkey Sign-In',
    label: 'Device has no biometric hardware',
    steps: [
      { screen: 'screen-chooser', state: 'default', banner: 'no-biometric-hw',
        label: 'Chooser — device reports no biometric capability' },
      // OR
      { screen: 'screen-passkey', state: 'hardware-unavailable',
        label: 'Passkey — OS reports biometrics unavailable, fallback tiles only' },
    ] },
  ```
  Runtime: extend `setPasskeyState` with a `hardware-unavailable` case that hides `#passkey-try-btn` and surfaces fallback tiles + `Use another device` immediately.
- **Cost:** New state + banner + one flow entry + one figma frame. ~40 LOC.

### 3.3 · Cap `enroll-declined-fork` "Maybe Later" re-prompts **[MEDIUM · SMALL]** ✅ SHIPPED (`bee64bd`)

- **Article rule:** B — "make it just as easy to turn off as it was to turn on" implies not badgering the user forever.
- **Current state:** `Maybe Later` snoozes to next sign-in, `Don't ask again` permanently suppresses. No middle ground.
- **Proposal:** After N (2? 3?) "Maybe Later" declines, auto-treat as "Don't ask again" — with a one-time toast: *"We'll stop asking. Enable Face ID from Settings if you change your mind."* Requires a localStorage counter (`enrollDeclineCount`) and a decision threshold.
- **Cost:** ~20 LOC in the enrollment handlers.

### 3.4 · Add `aria-live` to the biometric status labels **[MEDIUM · TRIVIAL]** ✅ SHIPPED (`05fee87`)

- **Article rule:** J — "People using screen readers still need to understand what's happening and how to continue."
- **Current state:** `#biometric-status-label` and `#biometric-status-sub` update on `setBiometricState()` calls but have no `aria-live`, so state transitions (idle → prompting → success/failed) are silent for AT users.
- **Proposal:** Add `aria-live="polite" aria-atomic="true"` to the wrapping `.biometric-hero` (or to `#biometric-status-label` directly). Confirm the state-transition timing gives AT enough of a window.
- **Files:** [sign-in.html:4167](sign-in.html#L4167).
- **Cost:** 1 attribute.

### 3.5 · Document the OS-sheet swap boundary in `FLOWS[]` **[MEDIUM · SMALL]** ✅ SHIPPED (`1df8005`)

- **Article rule:** I — "Apps that attempt to replace the system prompt risk App Store rejection."
- **Current state:** `passkey-os-sheet-*` variants demonstrate the native sheet visually but there's no comment in the Passkey Sign-In group header explaining that `showOsModal()` is prototype-only stand-in and production must delegate to `navigator.credentials.get()` (WebAuthn) or the platform biometric API.
- **Proposal:** Add a group-level comment block above the Passkey Sign-In section in `FLOWS[]` (around [sign-in.html:7481](sign-in.html#L7481)) noting the boundary, so downstream implementers don't try to skin `.os-modal`.
- **Cost:** ~10 lines of comment.

### 3.6 · Add a `passkey-biometric-retry-then-fallback` flow **[LOW · SMALL]** ✅ SHIPPED (`b85e9aa`)

- **Article rule:** F — "Let users retry once or twice, but don't trap them in a loop."
- **Current state:** `passkey-biometric-failed` shows exactly one failure and then fallback tiles. Technically compliant but doesn't demonstrate the recommended cap-and-move-on rhythm to stakeholders reviewing the flow deck.
- **Proposal:** New `FLOWS[]` entry chaining `idle → prompting → failed → prompting → failed → fallback-tiles-visible`. Same DOM, just an extra flow step definition for the review deck.
- **Cost:** 1 flow entry, ~12 lines. No runtime changes needed.

### 3.7 · Sensitive-action re-auth in Settings **[LOW · MEDIUM]**

- **Article rule:** *"For actions like updating profile details or changing settings, a quick fingerprint or face check can make sense."*
- **Current state:** Settings-security destructive actions (remove passkey, revoke device, change recovery email) don't require re-auth. Sign-out modal exists but doesn't gate with biometric.
- **Proposal:** Gate `security-remove-device`, `security-remove-passkey`, and `security-recovery-email-change` behind a lightweight biometric confirmation — the same `showOsModal()` ceremony, but wired to the destructive action rather than sign-in. Add a `settings-reauth` flow to the registry.
- **Cost:** Reasonable if reusing `showOsModal()`. ~50 LOC + a new flow entry.
- **Note:** This is an *addition* the article recommends, not a remediation of a violation. May be out of scope for wave 2.

### 3.8 · Testing checklist artifact **[LOW · SMALL]** ✅ SHIPPED (`b85e9aa`)

- **Article rule:** Entire "How to test biometric authentication UX" section.
- **Current state:** Group review docs (`group-1-passkey.md` etc.) don't have a biometric-specific test matrix.
- **Proposal:** Append a "Biometric UX test checklist" to `group-1-passkey.md` and `group-5-passkey-registration.md`:
  - Deliberate biometric fail — fallback visible within 2 taps?
  - Bad lighting / poor sensor conditions — retry copy tolerable?
  - Screen-reader traversal of the passkey screen — status changes announced?
  - Fallback flow (Password / OTP tiles from failed state) — no hesitation?
  - Recovery after error — does the user pause?
- **Cost:** ~30 lines of markdown per group doc.

### 3.9 · Explicit `signup-safe` guardrail **[LOW · TRIVIAL]** ✅ SHIPPED (`1df8005`)

- **Article rule:** A — "Prompting during signup before trust is established consistently produces lower opt-in rates and higher abandonment."
- **Current state:** No signup flow exists. Create Account link is `href="#"` ([sign-in.html:4149](sign-in.html#L4149)).
- **Proposal:** Add a comment at the Create Account link and in `FLOWS[]` group header: *"When the signup flow is built, do NOT trigger enrollment inside it. Enrollment is post-first-login only — see the `password-happy` / `otp-happy` terminal step for the correct placement."*
- **Cost:** 2 comment blocks.

### 3.10 · Retry-counter demonstration on biometric [DEFER]

- Current implicit behavior (1 fail → fallback) is already spirit-compliant. Explicit counter is only worth building if stakeholders ask, or if 3.6 (retry-then-fallback flow) doesn't land the point.

---

## 4 · Non-issues confirmed (for the record)

Documenting things the article prescribes that we already do well, so future reviewers don't relitigate:

| Practice | Where satisfied |
|---|---|
| Enrollment post-login only | All three non-passkey happy paths terminate on enrollment. Password-happy specifically shed its interstitial OTP step in commit `b2ac4f0` (2026-06-25). |
| Fallback tiles auto-reveal on biometric fail | CSS at [sign-in.html:1290](sign-in.html#L1290). |
| Reduced-motion honored | `@media (prefers-reduced-motion: reduce)` blocks at [sign-in.html:733](sign-in.html#L733), 3306, 3328 + JS checks at 5917, 6147. |
| Cross-device error states all include "Sign in another way" | `passkey-qr-cancel`, `passkey-transport-cancel-btn`, `passkey-qr-no-cred-cancel`. |
| Failure reassurance framing | *"Your account is still secure — try again or use a different method."* — [sign-in.html:6632](sign-in.html#L6632). |
| No signup enrollment | Create Account is unimplemented; can't prompt. |
| Focus trap on modals | Signout modal has full trap ([sign-in.html:5981](sign-in.html#L5981)). |
| Behavioral biometrics (background fraud typing signals) | 📎 Explicitly out of prototype scope. Not a wave-2 concern. |

---

## 5 · Change log

| Date | Note |
|---|---|
| 2026-07-09 | Doc created after read of Orbix guide. Ten scoreboard rules, copy audit, 10 backlog items graded. No code changes yet — this is a proposal doc. |
| 2026-07-09 | Sprint D shipped on branch `sign-in-ux-best-practices`: §3.2 hardware-unavailable state (`0ef79af`) — includes Screens + Flows nav entries + SCREEN_DESCRIPTIONS. Only §3.7 (sensitive-action re-auth) and §3.10 (retry counter) remain, both deferred. |
| 2026-07-09 | Sprint C shipped on branch `sign-in-ux-best-practices`: §3.1 privacy assurance (`18894a4`), §3.3 Maybe Later cap (`bee64bd`), §3.5 OS-sheet swap comment (`1df8005`), §3.6 retry-then-fallback flow (`b85e9aa`), §3.8 test checklists (`b85e9aa`), §3.9 signup-safe guardrail (`1df8005`). Remaining: §3.2 (hardware-unavailable, still open), §3.7 (sensitive-action re-auth — deferred, touches settings), §3.10 (deferred). |
| 2026-07-09 | §3.4 (`aria-live` on biometric status region) shipped in `05fee87` on branch `sign-in-ux-best-practices`. |
