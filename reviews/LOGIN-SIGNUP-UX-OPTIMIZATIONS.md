# Login / Signup & 2FA UX Optimizations — Wave 2 vs. Authgear + LogRocket

**Date opened:** 2026-07-09
**Branch:** `feature/heuristic-alignment-wave2`
**Sources:**
- [Authgear · Login & Signup UX: The 2025 Guide to Best Practices](https://www.authgear.com/post/login-signup-ux-guide/)
- [LogRocket · 2FA UX patterns: Setup flows for SMS, TOTP, biometrics](https://blog.logrocket.com/ux-design/2fa-user-flow-best-practices/)

**Companion:** [BIOMETRIC-UX-OPTIMIZATIONS.md](reviews/BIOMETRIC-UX-OPTIMIZATIONS.md) — for the biometric/passkey-specific findings.
**Scope:** Compares wave 2's chooser, password, OTP, reset, and settings flows against the Authgear login/signup guide (~40 sub-rules) and the LogRocket 2FA guide (~15 sub-rules).

> Legend: ✅ compliant · ⚠️ partial / worth improving · 🔲 gap / new work · 📎 explicitly out of scope

---

## 1 · Authgear scoreboard (Login/Signup UX)

### 1.1 · Core principles

| Principle | Status | Notes |
|---|---|---|
| Security with usability | ✅ | Passkey-first for recognized devices; password + OTP as peer methods; no forced 2FA on happy paths. |
| Clarity — no ambiguity between login/signup | ⚠️ | Combined identifier-first pattern in the chooser is fine, but the Create Account link (`href="#"`) has no destination. If email is unrecognized, we don't offer a sign-up route. See §3.3. |
| Minimize cognitive load | ✅ | Identifier-first form is 1 field. WebAuthn `autocomplete="username webauthn"` on the email input ([sign-in.html:4058](sign-in.html#L4058)) supports zero-typing sign-in when a passkey is discoverable. |
| Inclusivity / plain language | ✅ | Copy sits at ~grade-6-8; no jargon; errors are actionable. |
| Mobile-first | ✅ | `inputmode="email"`, `inputmode="numeric"` on OTP fields, `autocomplete="one-time-code"` for SMS autofill, big tap targets. |
| Trust & security signals | ⚠️ | Ace branding, plain-language copy — good. No explicit "we'll never post to your…" reassurance near social buttons because there are no social buttons. No visible privacy/lock cue on the login form. Minor. |
| Data-informed iteration | 📎 | Out of prototype scope. |

### 1.2 · Authentication methods & UX trade-offs

| Method | Present? | Notes |
|---|---|---|
| Email + password | ✅ | With `autocomplete="username webauthn"` + `current-password`. |
| Social login (OAuth) | 🔲 | Not present. Not a violation — Ace may not offer it — but if in-scope for the real product, tiles would live on the chooser. |
| Magic link | 🔲 | Not present. Article treats it as a peer to OTP. Log as gap. |
| One-time passcode | ✅ | Email + SMS delivery picker, 6-digit inputs, paste + auto-submit + `autocomplete="one-time-code"`. |
| Phone + password | 🔲 | Not present. Probably out of scope. |
| Passkeys / WebAuthn | ✅ | First-class; `webauthn` token in autocomplete for conditional UI. |
| SSO | 📎 | Out of scope (consumer, not B2B). |
| MFA / OTP add-on | ⚠️ | OTP is available as a peer sign-in method but not as an add-on 2nd factor after password (removed intentionally in commit `b2ac4f0`). MFA never triggers after passkey happy path — matches modern guidance. |

### 1.3 · Signup flow (Authgear §"Designing a Smooth Sign-Up Flow")

Not applicable in wave 2 — `Create an Account` link is `href="#"` ([sign-in.html:4149](sign-in.html#L4149)). Article's rules translate into forward-looking guardrails for whoever builds signup later:

- Ask minimum info (email + password only, defer profile).
- No username field; use email.
- **Do NOT add a Confirm Password field** — the article explicitly calls this the "common offender." Provide a Show Password toggle instead. *(We currently have `#new-pw-2` on the reset flow — see §3.4.)*
- Inline validation, real-time password rules.
- No enrollment during signup (biometric doc §A).
- Log the user in immediately after signup.

### 1.4 · Login flow — line-by-line audit

| Sub-rule | Status | Evidence |
|---|---|---|
| Skip login when session is valid | 📎 | Prototype has no session model. |
| Present primary method first | ✅ | `passkey-first` chooser CTA takes over when device is recognized. |
| "Remember me" / trust device | ✅ | `Keep me signed in for 30 days` on both password and OTP screens ([sign-in.html:5047](sign-in.html#L5047), [sign-in.html:5394](sign-in.html#L5394)). |
| Password reveal (show/hide) | 🔲 | No eye toggle. Only a `.text-field-clear` X. Article: essential for accessibility + reduces retype errors. See §3.1. |
| Autocomplete tokens for password managers | ✅ | `username webauthn`, `current-password`, `new-password`. |
| Never disable paste | ✅ | Paste handler on OTP explicitly redistributes into digit fields. Password field has no paste block. |
| Keep inputs on error | ✅ | `pw-submit-btn` handler retains the email/password on error. |
| Forgot password prominent | ✅ | `#forgot-link` sits directly under the password field. |
| Loading feedback | ✅ | `.btn-loading` class + `biometricSpin` keyframes. |
| Success feedback | ✅ | Biometric success state, success toast, "You're signed in / Welcome back". |
| Avoid unnecessary captcha | 📎 | Simulated captcha exists on password screen; risk-based triggering would be a production concern. |

### 1.5 · Errors & recovery — Authgear's error→recovery table applied to wave 2

| Error | Article prescription | Wave 2 behavior | Verdict |
|---|---|---|---|
| Forgot Password | Prefill known email, one-click send, log in after success | `password-forgot` flow: entry → sent → new pw → success. Email is retained across the flow. | ✅ |
| Incorrect Password | Inline near field, keep inputs, surface Forgot after N | `pw-error-text` shows "Incorrect password. 2 attempts remaining." Forgot link stays visible. Escalates to lockout after 3. | ✅ |
| Unrecognized email | Suggest signup path, keep visible Sign up | We validate on submit against the sentinel. If email is unknown we still proceed (demo). **No "no account — sign up?" route.** | 🔲 See §3.3 |
| Account exists at signup | Switch UI to login, prefill email | No signup flow. | 📎 |
| Not verified | One-click Resend | No signup verification. | 📎 |
| **Account locked** | **State duration** ("Locked for 5 minutes") | Password locked screen says *"Please wait before trying again."* — **no duration.** OTP locked correctly says "Try again in 15 minutes." | ⚠️ See §3.2 |
| Invalid/expired OTP | Inline error, Resend, countdown, alternate factor | `otp-wrong`, `otp-expired`, `otp-resent-confirm`, `otp-resend-cooldown` all covered. Alternate factor via `otp-no-access-use-password`. | ✅ |
| Expired reset link | Fresh-link CTA, preserve email | `reset-link-expired` flow. Email preserved via `pw-user-email` var. | ✅ |
| CAPTCHA challenge | Low-friction, accessible | We show a simulated captcha; accessibility properties minimal. | ⚠️ Minor / prototype. |
| Network / server error | Non-blaming, retry, keep input | Not demoed. | 🔲 See §3.7 |
| MFA failed | Suggest alt factor, remember device | OTP-fail → password fallback covered. "Remember device" checkbox present. | ✅ |
| Passkey not available | Detect + explain + fallback | Partial — `passkey-not-found` returns to chooser with banner. **No hardware-unavailable flow.** | ⚠️ Tracked in biometric doc §3.2 |

### 1.6 · Accessibility (Authgear §"Ensuring Accessibility")

| A11y practice | Status | Evidence |
|---|---|---|
| Proper labels on inputs | ✅ | Every input has `aria-label` + a `.text-field-label` for the floating pattern. |
| Autocomplete tokens | ✅ | See §1.4. |
| Do not disable paste | ✅ | See §1.4. |
| Keyboard nav / logical tab order | ✅ | Modal focus trap present ([sign-in.html:5981](sign-in.html#L5981)). |
| **Visible focus states** | 🔲 **CRITICAL** | Global rule at [sign-in.html:117-118](sign-in.html#L117): `* { outline: none; } *:focus-visible { outline: none; }` — removes focus ring for **all** elements. Directly violates WCAG 2.4.7 (Focus Visible) and Authgear's explicit checklist item. See §3.5. |
| Accessible error indicators (`role="alert"`, `aria-describedby`) | ⚠️ | Some errors use `role="alert" aria-live="polite"` (verify-alert-cooldown, chooser-banner). Field-level password/OTP wrong-code errors don't wire `aria-describedby` from the input to the error text. See §3.6. |
| Alt text on icons | ✅ | Purely decorative SVGs have `aria-hidden="true"`; informative ones have `aria-label`. |
| Timeouts communicated | ✅ | OTP cooldown timer visible, reset-sent expiry countdown shown. |
| CAPTCHA alternatives | ⚠️ | Demo captcha only. |
| Biometric fallback for users who can't use biometrics | ⚠️ | Password + OTP always visible on chooser. No explicit hardware-unavailable branch (biometric doc §3.2). |
| Test with AT | 📎 | Not audited here. |

---

## 2 · LogRocket 2FA scoreboard

### 2.1 · SMS OTP flow

| Practice | Status | Evidence |
|---|---|---|
| Standard flow (credentials → 2FA prompt → OTP → success) | ✅ | Chooser → OTP delivery picker → code entry → enrollment offer. |
| Autofocus + auto-submit on 6 digits | ✅ | `otpFields` handler auto-advances and calls `verifyBtn.click()` when all 6 filled. |
| Copy-paste support | ✅ | Paste handler at [sign-in.html:6232](sign-in.html#L6232) redistributes across digit fields. |
| Standard PIN format (4 or 6 digits) | ✅ | 6-digit format. |
| SMS autofill via `autocomplete="one-time-code"` | ✅ | First field ([sign-in.html:5359](sign-in.html#L5359)). |
| Resend action available | ✅ | `#resend-btn` with cooldown. |
| **Display last 2 digits of phone number** before sending | 🔲 | We ask the user to type the phone number instead of presenting a masked pre-registered one. Reasonable for a first-time-user demo, but a returning-user flow should surface *"We'll text your phone ending in **42**"*. See §3.8. |
| Resend limit (FAQ: 2 resends) | ⚠️ | We enforce cooldown between resends but no ceiling on total resends. Article recommends max 2 before requiring a different factor. See §3.9. |
| Retry limit (FAQ: 3 retries) | ✅ | 3-strike lockout on wrong code (`otp-locked`). |

### 2.2 · TOTP authenticator app

| Practice | Status | Notes |
|---|---|---|
| TOTP setup with QR / secret | 🔲 | Not present. Cross-device QR is for **passkey** transport, not TOTP. If TOTP is on Ace's roadmap, this is a full new group. |
| TOTP verification | 🔲 | Not present. |

### 2.3 · Biometric 2FA

| Practice | Status | Notes |
|---|---|---|
| OS-native prompt UI | ⚠️ | Simulated `.os-modal` — see biometric doc §3.5. |
| Suggest alternate 2FA on repeated fail | ✅ | Fallback tiles auto-appear on `data-passkey-state="failed"`. |
| Educate re: privacy with "learn more" | ⚠️ | Enrollment prompt has one plain-language line; no "learn more" affordance. Article recommends a link for skeptical users. Optional. |

### 2.4 · Handling failures & edge cases

| Case | Status | Notes |
|---|---|---|
| OTP delivery failure — resend + alternate | ✅ | Resend button + `otp-no-access-use-password`. |
| **Lost/broken device → recovery codes** | 🔲 | No backup codes. Recovery email exists (`recovery-email-setup-*`) but isn't a *2FA recovery* code path. |
| Network latency handling | 🔲 | No spinner/timeout messaging on network errors specifically. |

### 2.5 · Dos and Don'ts checklist

| Do | Status |
|---|---|
| OTP autofocus + autosubmit + separate inputs + paste enabled | ✅ |
| Clear, direct recovery path | ✅ |
| Let users choose several 2FA methods | ⚠️ Chooser exposes password / OTP / passkey / cross-device — good. TOTP + backup codes absent. |
| Skip 2FA on trusted devices | ✅ | "Keep me signed in for 30 days". |
| Concise security education | ✅ On enrollment. ⚠️ Not surfaced on returning-user Face ID prompt (biometric doc §3.1). |

---

## 3 · Prioritized optimizations backlog

Ordered by impact / cost. Distinct from the biometric backlog — no overlap.

### 3.1 · Add Show/Hide password toggle **[HIGH · SMALL]** ✅ SHIPPED (`667cb2e`)

- **Article rule:** Authgear §"Signup Flow Details" — *"Provide a Show Password toggle so users can verify their input."* Also cited under accessibility (helps users with motor / cognitive challenges verify what they typed).
- **Current state:** Password fields (`#pw-password`, `#new-pw-1`, `#new-pw-2`) have only an X clear button. No reveal.
- **Proposal:** Add an eye-icon toggle inside each `.text-field` that swaps `type="password"` ↔ `type="text"`. Follow WCAG: button must be keyboard-accessible with an `aria-pressed` state and `aria-label="Show password"` / `"Hide password"`.
- **Files:** [sign-in.html:5009](sign-in.html#L5009), [sign-in.html:5187](sign-in.html#L5187), [sign-in.html:5195](sign-in.html#L5195).
- **Cost:** ~20 LOC CSS + ~10 LOC JS.
- **Secondary win:** Article also says Show-Password lets us drop the Confirm-Password field on reset (§3.4).

### 3.2 · Add lockout duration to password locked screen **[HIGH · TRIVIAL]** ✅ SHIPPED (`3473931`)

- **Article rule:** Authgear error→recovery table — *"State duration ('Locked for 5 minutes')."*
- **Current state:** `screen-account-locked` copy is *"Too many failed sign-in attempts. Please wait before trying again."* — vague. OTP lockout correctly reads *"Try again in 15 minutes."*
- **Proposal:** Update copy to *"Try again in **15 minutes**, or **reset your password** to sign in now."* Use the same `LOCKOUT_MS`-derived label pattern that OTP uses. Wire an existing reset-password CTA on this screen (already reachable via the current button, just improve the copy to signal it as the escape).
- **Files:** [sign-in.html:5082](sign-in.html#L5082).
- **Cost:** ~5 LOC + reuse `formatMinutesLabel(LOCKOUT_MS)`.

### 3.3 · Unrecognized-email → offer signup path **[HIGH · MEDIUM]** ✅ SHIPPED (`22798b2`)

- **Article rule:** Authgear error→recovery table — *"No account for this email — Sign up."*
- **Current state:** Identifier-first form accepts any email and continues. No branching on "does an account exist for this email?" No signup destination.
- **Proposal (two parts):**
  1. Since there's no actual signup flow, add a `chooser-unknown-email` banner state that surfaces after a simulated lookup and reads: *"No account found for that email. **Create an account** or try a different email."* Wire `Create an Account` to a stubbed screen (or reuse the existing footer link with better copy).
  2. When the signup flow is built, wire the branching properly.
- **Files:** Chooser markup around [sign-in.html:4039](sign-in.html#L4039), Continue handler.
- **Cost:** ~40 LOC for the demo state + banner + a new `FLOWS[]` entry (`chooser-unknown-email`).

### 3.4 · Remove Confirm Password field on reset (or gate behind toggle-not-tapped) **[MEDIUM · SMALL]** ✅ SHIPPED (`89fc3c5`)

- **Article rule:** Authgear §"Keep It Simple & Essential" — *"Don't make users type information twice. Common offender: Confirm Password field."*
- **Current state:** `screen-new-password` has both `#new-pw-1` and `#new-pw-2` (Confirm new password).
- **Proposal:** With the Show Password toggle from §3.1, remove `#new-pw-2` entirely. Or keep the field but hide it once the user reveals the password once. Simpler: just delete `#new-pw-2` and surface Show Password.
- **Files:** [sign-in.html:5195](sign-in.html#L5195) + reset flow handlers around `save-pw-btn`.
- **Cost:** ~15 LOC net removal.

### 3.5 · Restore visible focus outlines **[HIGH · SMALL]** *(Critical A11y)* ✅ SHIPPED (`bfa22b8`)

- **Article rule:** Authgear §"Ensuring Accessibility" — *"Implement visible focus states … so users who navigate by keyboard know where they are."* Also WCAG 2.4.7 (Focus Visible), Level AA.
- **Current state:** [sign-in.html:117-118](sign-in.html#L117):
  ```css
  * { -webkit-tap-highlight-color: transparent; outline: none; }
  *:focus-visible { outline: none; }
  ```
  This universal rule strips keyboard focus indicators from every element. A handful of components have their own `:focus-visible` styles ([sign-in.html:3412](sign-in.html#L3412), [sign-in.html:3442](sign-in.html#L3442), etc.), but most interactive elements — buttons, tiles, inputs, method tiles, comment popovers, passkey CTA — have none.
- **Proposal:** Replace the global override with a scoped tap-highlight suppression and a project-wide `:focus-visible` token:
  ```css
  * { -webkit-tap-highlight-color: transparent; }
  *:focus { outline: none; }               /* mouse-only focus stays clean */
  *:focus-visible {                        /* keyboard focus is always visible */
    outline: 2px solid var(--focus-ring, #e65100);
    outline-offset: 2px;
    border-radius: inherit;
  }
  ```
  Then audit component-specific overrides to keep their own token-based ring.
- **Files:** [sign-in.html:117](sign-in.html#L117).
- **Cost:** ~10 LOC change + ~30 min visual QA pass to confirm no ring collisions on the biometric ring / OTP digits / comments popover.
- **Priority note:** This is the single highest-impact accessibility fix in the file. Everything else on this backlog is layered on top of it.

### 3.6 · Wire `aria-describedby` for field-level errors **[MEDIUM · SMALL]** ✅ SHIPPED (`b3dc8ba`)

- **Article rule:** Authgear §"Accessible Error Indicators" — *"Link the error message to the field via `aria-describedby`."*
- **Current state:** Password wrong-attempt copy (`#pw-error-text`) and OTP wrong-attempt copy (`#wrong-attempt-text`) update dynamically but no `aria-describedby` on `#pw-password` / OTP inputs points at them. Screen readers may not associate the error with the input on refocus.
- **Proposal:** Give the error containers stable IDs and set `aria-describedby` on the input when the error is shown; remove when cleared. Also confirm each error region has `role="alert"` or `aria-live="polite"` — some already do.
- **Files:** password form ~[sign-in.html:4996](sign-in.html#L4996); OTP wrong-attempt ~[sign-in.html:5386](sign-in.html#L5386).
- **Cost:** ~15 LOC total across both flows.

### 3.7 · Add network / server error handling to submit paths **[LOW · MEDIUM]** ✅ SHIPPED (`317fabd`)

- **Article rule:** Authgear error→recovery table — *"Show non-blaming message ('We're having trouble connecting'). Provide Retry, graceful backoff … never clear user input."*
- **Current state:** No simulated network-error state in `FLOWS[]`. Handlers assume in-page success.
- **Proposal:** Add a `password-network-error` demo flow that shows an inline banner + Retry above the form, preserving `#pw-password` value.
- **Cost:** ~30 LOC, or 1 new flow entry if we just want to demo the UI shell.
- **Note:** Nice-to-have; only useful if the flow gallery needs error-state completeness.

### 3.8 · Mask registered phone in OTP delivery picker (returning-user variant) **[MEDIUM · SMALL]** ✅ SHIPPED (`b0b5cc6`)

- **Article rule:** LogRocket §"SMS OTP · Common UX Pain Points" — *"Display the last two digits of the phone number."*
- **Current state:** Delivery picker asks the user to type their phone. That's correct for a first-time OTP request, but a returning user's registered phone should be masked (e.g., *"Text a code to phone ending in **42**"*).
- **Proposal:** Add a `data-otp-mode="registered"` variant of the OTP delivery picker that hides the phone/email inputs and shows two radio-style tiles:
  - *"Email code to **s·····r@example.com**"*
  - *"Text code to phone ending in **·····5678**"*
  Plus a small "Use a different phone/email" link that falls back to the current input flow.
- **Files:** OTP delivery picker markup around [sign-in.html:5305](sign-in.html#L5305).
- **Cost:** ~50 LOC + one new flow variant.

### 3.9 · Cap OTP resends **[LOW · SMALL]** ✅ SHIPPED (`c1190e6`)

- **Article rule:** LogRocket FAQ — *"2 resends is safest."*
- **Current state:** Resend cooldown enforced between attempts, but no total cap.
- **Proposal:** After 2 resends, replace the Resend button with *"Still no code? **Sign in another way.**"* + route to `otp-no-access` for method-switch. Track count in a `otpResendCount` module-scoped var.
- **Cost:** ~15 LOC + one new state (`data-otp-substate="resend-exhausted"`).

### 3.10 · Add "learn more" affordance to enrollment privacy line **[LOW · TRIVIAL]** ✅ SHIPPED (`18894a4`)

- **Article rule:** LogRocket §"Biometric · Security concerns" — *"Educate users with learn more links."*
- **Current state:** Enrollment subtext has the plain-language assurance but no link for skeptical users who want details.
- **Proposal:** Append a subtle `Learn more` link after the sentence, opening a small info modal / bottom sheet with the 3-4 sentences from the biometric article's Quick Summary.
- **Cost:** ~30 LOC (link + modal).

### 3.11 · Recovery / backup codes as a 2FA alternate **[DEFER]**

- **Article rule:** LogRocket — *"A lost or broken 2FA-configured device should prevent access; offer recovery codes."*
- **Current state:** None. Recovery email exists as a separate feature.
- **Proposal:** Only meaningful if Ace decides to add a stronger 2FA layer (TOTP or step-up). Log as future consideration.

---

## 4 · Non-issues confirmed

For the record — practices we already satisfy that don't need rework:

- WebAuthn conditional UI via `autocomplete="username webauthn"`
- Autocomplete tokens on every credential field
- Paste supported on password + OTP
- `Keep me signed in for 30 days` matches "remember device"
- 6-digit OTP with autofocus, autosubmit, and paste redistribution
- 3-strike lockouts on password + OTP (matches LogRocket's 3-retry FAQ)
- Forgot-password link prominently placed under the password field
- OTP alternate factor via `otp-no-access-use-password`
- Reset flow prefills email, sends link, logs user in on success
- Expired reset link handled (`reset-link-expired`)
- Sign-in activity log + "Something doesn't look right?" anomaly footer (this is the Authgear "security notifications" pattern surfaced in-app rather than via email)
- Reduced-motion honored
- Modal focus trap on signout / OS sheet dialogs

---

## 5 · Suggested execution order

If you want to knock these out in batches:

**Sprint A · Accessibility & correctness** (~1 half-day)
1. §3.5 Restore focus outlines (highest impact, blocks everything else)
2. §3.2 Password lockout duration
3. §3.6 `aria-describedby` on field errors

**Sprint B · Copy & affordance polish** (~1 half-day)
4. §3.1 Show password toggle
5. §3.4 Drop Confirm Password on reset (consequence of §3.1)
6. §3.10 Learn more link on enrollment

**Sprint C · Flow completeness** (~1 day)
7. §3.3 Unrecognized-email → signup route (demo state)
8. §3.8 Masked phone in OTP delivery
9. §3.9 OTP resend cap
10. §3.7 Network error state (if needed for gallery completeness)

**Deferred:** §3.11 (TOTP/backup codes) — requires product decision.

---

## 6 · Change log

| Date | Note |
|---|---|
| 2026-07-09 | Doc created after reading Authgear (login/signup) + LogRocket (2FA) guides. 11 backlog items graded; sprint plan proposed. No code changes yet — this is a proposal doc, companion to `BIOMETRIC-UX-OPTIMIZATIONS.md`. |
| 2026-07-09 | Sprint D shipped on branch `sign-in-ux-best-practices`: §3.3 unknown-email banner (`22798b2`), §3.7 password network-error (`317fabd`), §3.8 masked OTP delivery (`b0b5cc6`). All non-deferred items closed; only §3.11 (backup codes) remains as a product-decision defer. Fixed post-commit standalone rebuild (`a345fa8`) so the branch produces its own artifact. |
| 2026-07-09 | Sprint C shipped on branch `sign-in-ux-best-practices`: §3.9 OTP resend cap (`c1190e6`), §3.10 learn-more link on enrollment (`18894a4`). Also fixed the post-commit standalone rebuild (`a345fa8`) which was silently mis-reporting failures and not producing an artifact for this branch. Remaining: §3.3, §3.7, §3.8; §3.11 deferred. |
| 2026-07-09 | Sprint A + B shipped on branch `sign-in-ux-best-practices`: §3.5 focus outlines (`bfa22b8`), §3.6 aria-describedby (`b3dc8ba`), §3.2 lockout duration (`3473931`), §3.1 show/hide password toggle (`667cb2e`), §3.4 drop confirm-password (`89fc3c5`). Remaining backlog: §3.3, §3.7–3.11 plus the settings/security/activity/devices audit gap. |
