# Review · Group 3 · Password Sign-In

**Reviewer pass date:** 2026-06-12
**Sub-flows reviewed:** 3a Happy Path · 3b Wrong Password · 3c Account Locked · 3d Forgot Password → Reset
**Sources cross-referenced:**

| Source | Status | Notes |
|---|---|---|
| `sign-in.html` (`FLOWS`, `SCREEN_DESCRIPTIONS`, screen markup, JS handlers) | Authoritative | Walked all 4 sub-flows + read every relevant click handler |
| `user-flow-documentation.md` (Group 3) | Diverges (see Drift §1 + Issues 1, 6) | Cites legacy node IDs `86:31`, `90:31`, `169:32`, `92:31`; current full flow frames live at `198:137`, `198:145`, `198:156`, `198:170` |
| `figma-flow-gaps.md` | Agrees / informs Issue 4 | Notes Account Locked as a once-missing terminal state, now satisfied via `screen-account-locked` |
| `Sign In - Claude Design/screens-password.jsx` | Stale (see Drift §2) | Original ideation — uses chooser-on-top pattern, "Welcome Back" hero, segmented control, "2 of 5 attempts left" microcopy. All deliberately superseded |
| `passkey_instructions.md` | Not re-read this pass | No password-specific dependencies |
| `figma-export/screenshots/` | Agrees with prototype (visual reference only) | |
| Live Figma file `IDuYbd4aYwGsFgo6c3ThVX` (Figma MCP) | Diverges (see Issues 1, 2, 3) | Flow frames `198:137`, `198:156`, `198:170` mis-narrate the actual prototype behavior |

---

## Summary

Group 3 is **the most behaviorally fragile group of the review so far**. The screen designs themselves — password entry, account locked countdown, forgot/reset flow, post-login enrollment — are conceptually solid and copy is generally good. But underneath the surface, the **prototype's behavior diverges from what its UI promises and what Figma narrates**:

- The wrong-password handler **doesn't actually validate a password**. Any non-empty email + password proceeds to MFA. The error-state copy ("Incorrect password. 2 attempts remaining.") is hardcoded but never displayed in the natural flow — it's overwritten to "Please enter your email and password." when the inline error fires (i.e. only on empty-field submission). There is no real attempt counter and no path from the password screen to `screen-account-locked` at runtime.
- The forgot-password handler **shows the not-found error on the first tap, regardless of what the user typed**, then accepts the second tap. That's a demo affordance, but it's undocumented and contradicts the on-screen copy.
- Figma `198:156` (Account Locked) terminates at "Reset Email Sent" — but the prototype's locked screen routes the user to **`screen-forgot-password`** (where they must type their email again), not directly to a "we already emailed you a link" confirmation. The Figma narrative is a different flow than what the prototype delivers.
- Figma `198:137` (3a Happy Path) **omits the MFA screen and the post-login passkey enrollment screen** — both of which are real, mandatory steps in `password-happy`. A stakeholder reading 3a would think password sign-in is two screens.

These are higher-stakes than Group 1's Figma drift because they affect not just communication but **runtime correctness** of the prototype. Several Tier A fixes can be made surgically without touching cross-flow patterns.

The doc-to-Figma node ID drift theme from Group 1 **repeats here exactly as predicted** (legacy `86:XX` / `90:XX` etc. cited; full frames live at `198:XX`).

---

## Source-drift report

### §1 — Doc-to-Figma node ID drift (continues from Group 1)

[user-flow-documentation.md](../user-flow-documentation.md) cites these node IDs for Group 3:

| Sub-flow | Doc cites | Figma reality |
|---|---|---|
| 3a Happy Path | `86:31` | `86:31` exists but is a **simplified step-arrow strip only** (Sign In → Password → Signed In); the full flow with screen mockups is `198:137` (matches `FLOWS[password-happy].figmaUrl`) |
| 3b Wrong Password | `90:31` | Same pattern — strip; full flow is `198:145` |
| 3c Account Locked | `169:32` | Same pattern — `169:32` is named "Branch B: Account Locked" and is a strip; full flow is `198:156` |
| 3d Forgot Password → Reset | `92:31` | Same pattern; full flow is `198:170` |

**Same as Group 1.** Provisional decision (per ledger): cite the `198:XX` IDs in the doc.

### §2 — `screens-password.jsx` is historical

[Sign In - Claude Design/screens-password.jsx](../Sign%20In%20-%20Claude%20Design/screens-password.jsx) describes a flow with:

- A "Welcome Back" hero on every password-related screen (current prototype uses "Sign In" → "Reset Password" → "Check Your Email" → "Create New Password" → "Password Updated").
- A segmented control switching between `Password` and `One-Time Code` *on the password screen* (current prototype: chooser is a separate screen with method tiles).
- A Face ID tile pinned to the top of the password screen (deliberately removed; chooser is now method-first).
- "2 of 5 attempts left" microcopy in orange/amber adjacent to the Forgot Password link (current prototype hardcodes "2 attempts remaining" and uses red).
- A simpler `Account temporarily locked` screen with `Reset your password` + `Back to sign in` (current prototype: same intent, but with a **15:00 countdown timer** in red, all-caps "RESET YOUR PASSWORD" / "BACK TO SIGN IN" buttons).
- A simpler reset flow with a `NavBar title="Forgot Password"` chrome (current prototype: hero-style screen, no nav bar).

All deliberately superseded. **One-line `// ARCHIVE` header recommendation from Group 1 applies here too.**

---

## Strengths (keep)

1. **Account Locked screen is real and well-designed.** `screen-account-locked` ([sign-in.html L3609](../sign-in.html#L3609)) has a proper 15:00 countdown timer, reassuring "Account Temporarily Locked" hero, and dual CTAs ("RESET YOUR PASSWORD" primary + "BACK TO SIGN IN" secondary). Closes the gap [figma-flow-gaps.md L22](../figma-flow-gaps.md) flagged. Good user experience: shows progress and gives an immediate escape valve.
2. **Forgot password pre-populates the email field.** `forgot-link` handler ([L5947](../sign-in.html#L5947)) reads the email from the password screen and copies it to the reset form. Removes a re-typing step. Subtle but solid Nielsen N6 (recognition over recall).
3. **Resend cooldown is implemented end-to-end.** 60-second timer with disabled button + countdown text on `screen-reset-sent` ([L6034](../sign-in.html#L6034)). Better than the .jsx ideation which left it static.
4. **Forgot-password `not-found` error self-clears on input.** ([L6072](../sign-in.html#L6072)) — typing in the email field after the error shows clears the error state. Good error-recovery UX (Nielsen N3).
5. **`role="alert" aria-live="polite"`** on the `pw-error-alert` and `forgotpw-error-alert` divs. Screen readers will announce the error. ✓ WCAG 4.1.3.
6. **Password strength bar on `screen-new-password`** ([L3736](../sign-in.html#L3736)) provides real-time feedback (Weak / Fair / Strong) with a `role="progressbar"` and `aria-valuenow`. Good a11y. Strength rule itself is reasonable (length + class diversity).
7. **Forgot-password rate-limited panel exists.** Even though it's not currently triggered by anything in `password-forgot`, the markup, styling, and 15-min countdown ([L3654](../sign-in.html#L3654), [L5957](../sign-in.html#L5957)) are all wired. Easy to enable if/when the rate-limit branch is added to `FLOWS`.
8. **New Password "expired link" panel exists** ([L3729](../sign-in.html#L3729), `data-newpw-state="expired"`) with `setNewPwState('expired')` swap. Group 6 (Password Reset) will probably surface this; it's good groundwork.

---

## Issues

Severity legend: **Blocker** = ship-stopping · **Major** = noticeable user/stakeholder impact · **Minor** = polish · **Nit** = trivial.

### Issue 1 · Figma `198:137` (3a Happy Path) is missing the MFA + Enrollment screens — **Major** (Figma-side, behavioral mismatch)

**Lens:** Cross-flow consistency, source-of-truth alignment.
**Where:** Figma frame `198:137`. Top metadata strip lists 4 steps: `Sign In → Password → Signed In ✓ → Enroll Prompt`. The actual frame contains **only 3 screen mockups**: chooser, password, enroll-prompt. There is **no MFA / Verify mockup**.
**Reality:** The prototype's `password-happy` FLOWS at [L5296](../sign-in.html#L5296) defines four steps: `screen-chooser → screen-password → screen-verify (default) → screen-passkey-enroll (prompt)`. The MFA step is *required after every password sign-in* per the doc itself ([user-flow-documentation.md L203](../user-flow-documentation.md)). It's missing from Figma.
**Risk:** A stakeholder reading 3a would think password sign-in skips MFA. A dev rebuilding from Figma would ship without MFA. The `Signed In ✓` rectangle in Figma's strip implies the user is signed in directly after the password screen — which is wrong.

### Issue 2 · Figma `198:156` (3c Account Locked) ends at a "Reset Email Sent" screen the prototype never reaches — **Major** (Figma-side, route mismatch)

**Lens:** Behavioral accuracy, cross-flow consistency.
**Where:** Figma frame `198:156`, fifth screen — `reset-sent` mockup at x=1744. The metadata strip narrates: Password Entry → Wrong Password → Account Locked → Reset Email Sent ("reset triggered"). The frame description says "Account unlocks only via the password reset link. Reset link emailed automatically."
**Reality:** The prototype's `screen-account-locked` does **not** emit a reset email automatically. Tapping "RESET YOUR PASSWORD" routes the user to **`screen-forgot-password`** ([handler L5993](../sign-in.html#L5993)), where they must type their email and tap "SEND RESET EMAIL". The `password-account-locked` FLOWS at [L5317](../sign-in.html#L5317) terminates at `screen-account-locked` — there is no reset-sent step in the FLOWS array.
**Sub-finding A:** Figma's narrative implies a "reset link emailed automatically" pattern. That's a reasonable pattern, but it's **not what the prototype does**. Either the prototype should be updated (auto-fire the reset email when the account locks, then route to `screen-reset-sent` directly) or Figma should be updated to show the route through `screen-forgot-password`. **Recommend the latter unless the team explicitly wants to redesign** — auto-emailing without user confirmation can feel surprising and can be defeated by typo'd email accounts. The current "user re-confirms email then tap send" flow is more legible.
**Sub-finding B:** Figma also doesn't show the **15:00 countdown** that's prominently featured on the prototype's locked screen — a key UX element that sets user expectations.
**Risk:** Major because this affects what a stakeholder thinks the lockout flow does, and because it implies an automated email send the system isn't actually doing.

### Issue 3 · Figma `198:170` (3d Forgot Password) doesn't show the `not-found` error state — **Minor** (Figma-side, missing state)

**Lens:** Cross-flow consistency, error coverage.
**Where:** Figma frame `198:170`. Shows the happy reset path: Sign In → Password → Forgot Password → Reset Sent → New Password → Reset Success → Sign In.
**Reality:** The prototype has a `data-forgotpw-state="not-found"` state with an inline error alert "We couldn't find an account with that email address." ([L3645](../sign-in.html#L3645)). The reset-send button **always** shows this on first tap ([L6005](../sign-in.html#L6005); see Issue 5 below). Figma never depicts this state, even though it's one of the most common real-world reset-flow errors and the prototype fully implements it.
**Recommendation:** Add a `forgot-password-not-found` mockup to `198:170` (or as a sibling branch frame) showing the inline error with red border + alert text.

### Issue 4 · Wrong-password validation doesn't actually validate, and account-lock is unreachable from runtime — **Major** (Prototype, Tier A)

**Lens:** Behavioral correctness, design intent vs. reality.
**Where:** `pw-submit-btn` handler at [sign-in.html L4672](../sign-in.html#L4672).
**What the code does:** `if (email && pw) { proceed to MFA; return; }` — i.e., **any** non-empty email + password proceeds. The "wrong password" path is only hit when one of the fields is empty, and the error message gets overwritten to "Please enter your email and password." (L4684). The hardcoded copy "Incorrect password. 2 attempts remaining." in the alert template ([L3539](../sign-in.html#L3539)) is **never displayed in normal flow**.
**What the prototype claims:** `screen-password:error` is described as "Inline error showing remaining attempts" ([user-flow-documentation.md L218](../user-flow-documentation.md)). FLOWS step 3b labels the second password visit "Password — wrong password" ([L5313](../sign-in.html#L5313)). Walking the FLOW manually using the screens-nav strip is the **only** way to actually see the error state with its intended copy.
**The downstream consequence:** `password-account-locked` ([L5317](../sign-in.html#L5317)) cannot be reached through normal interaction. There is no attempt counter, no escalation logic from `screen-password:error → screen-account-locked`. The locked screen is reachable only via the screens-nav button.
**Risk:** Two-fold. (a) During usability testing, the prototype won't behave as the FLOW reads describe — testers will see the empty-field error, not the wrong-password error. (b) Implementation handoff: a dev walking the prototype to understand intended behavior won't find the wrong-password validation logic at all. **This is the highest-priority Tier A candidate.**

**Recommended fix sketch:**
- Add a `pwAttempts` counter that increments on each empty-fields-but-still-no-match submission, OR introduce a hardcoded "wrong password" check (e.g., specific demo-password sentinel triggers happy path; anything else cycles through the wrong → wrong → locked cascade).
- After 3 attempts → `setVerifyState('locked')` equivalent: navigate to `screen-account-locked`, start the lockout countdown.
- Restore the "Incorrect password. N attempts remaining." copy and update it dynamically with `pw-error-text`.
- Recommend the simpler "demo sentinel" approach: empty fields → "Please enter your email and password"; specific demo password (e.g., `correct`) → MFA; anything else → wrong-password error with a real counter, escalating to locked at 3.

### Issue 5 · Forgot Password "always errors first, then succeeds" is undocumented — **Minor** (Prototype, Tier A)

**Lens:** Behavioral correctness, prototype legibility.
**Where:** `reset-send-btn` handler at [sign-in.html L6005](../sign-in.html#L6005).
**What it does:** First tap *always* sets `data-forgotpw-state="not-found"`, regardless of what the user typed. Second tap (or after typing in the field, which clears the error and counts as a fresh start) routes forward to `screen-reset-sent`.
**Why it might be intentional:** The prototype is demoing the not-found state to anyone who walks the flow. Without this, the not-found state would be invisible (no real validation backend).
**Why it's a problem:**
  - Users in usability tests will read "We couldn't find an account with that email address" and think they typo'd, even when they entered something reasonable. Will trigger false-confusion that contaminates findings.
  - The behavior is undocumented anywhere — not in `user-flow-documentation.md`, not in `figma-flow-gaps.md`, not in code comments.
  - Inconsistent with how `pw-submit-btn` handles validation (which is *too* permissive, see Issue 4).
**Recommendation:** Either (a) move the not-found demo into a discoverable affordance — e.g., a sentinel email like `notfound@test.com` triggers it — or (b) add a comment at L6005 explaining the demo behavior + a note in `user-flow-documentation.md` Group 3d step 3. Recommend option (a) for usability-test fidelity. Tier A.

### Issue 6 · Doc says "Confirms password was changed... CTA returns to sign in" — actual CTA returns to chooser — **Nit** (Doc-side)

**Lens:** Source-of-truth alignment.
**Where:** [user-flow-documentation.md L259](../user-flow-documentation.md) and Figma frame `198:170` (`Reset Success` → `Sign In`).
**Reality:** The CTA on `screen-reset-success` ([sign-in.html L3753](../sign-in.html#L3753)) is "SIGN IN NOW" and routes to **`screen-chooser`** ([L6085](../sign-in.html#L6085)), not back to a `screen-password`. Functionally that's correct (the user picks a method again), but Figma's strip labels the destination "Sign In" / "begin a fresh sign-in", which is conceptually accurate but ambiguous. Doc is fine; Figma's destination block could clarify "Returns to chooser."
**Recommendation:** No prototype change. Optional Figma copy refinement.

### Issue 7 · Password screen heading reads as a section, not a goal — **Nit** (Prototype + Figma)

**Lens:** Microcopy & tone.
**Where:** `screen-password` heading: `Sign In` / "Enter your email and password" ([sign-in.html L3530](../sign-in.html#L3530)).
**Concern:** "Sign In" is the same heading as the chooser — confusing because the chooser already established that goal. Also the chooser's hero `<p>` is "Choose how you'd like to sign in" while the password screen's is "Enter your email and password" — they're both action-prompts, which is good, but the H1 doesn't reinforce that the user has already committed to a method.
**Compare:** Cross-device passkey screens use `Welcome Back` + state-specific subtitle. Verify screen uses `Verification Code` (something like that).
**Recommendation:** Change to `Welcome Back` (matches passkey-first chooser pattern + adds warmth) or `Sign In With Email` (specifies the method). Tier B (cross-flow consistency on H1 patterns).

### Issue 8 · Title-case button labels (CAPS) clash with sentence-case microcopy — **Minor** (Prototype + Figma, cross-flow theme)

**Lens:** Microcopy & tone, cross-flow consistency.
**Where:** Every primary button on Group 3 screens uses ALL CAPS: `SIGN IN`, `SEND RESET EMAIL`, `RESEND EMAIL`, `RESET YOUR PASSWORD`, `BACK TO SIGN IN`, `SAVE NEW PASSWORD`, `SIGN IN NOW`, `REQUEST A NEW LINK`. Heading copy is sentence case ("Reset Password") but button copy is uppercase.
**Concern:** Flat-out 1980s style. Modern auth UX (Apple HIG, Material 3, GitHub, Stripe, etc.) uses title or sentence case for primary buttons. Uppercase reduces readability for low-vision users (WCAG-adjacent), is less scannable, and clashes with the otherwise contemporary design.
**Recommendation:** Adopt **Title Case** for primary buttons globally ("Sign In", "Send Reset Email", "Reset Your Password"). Defer to Phase 2 synthesis decision; this affects every flow. **Tier B.**

### Issue 9 · Forgot Password screen is a back-only forward — no Cancel / Back UI — **Minor** (Prototype, possible Tier A)

**Lens:** Nielsen N3 (User control), mobile-first.
**Where:** `screen-forgot-password` ([L3632](../sign-in.html#L3632)). The screen has the heading "Reset Password" + "Enter your email address and we'll send you a link to reset your password" + email field + "SEND RESET EMAIL" button. **No back button, no cancel, no "I remembered my password — sign me in" escape.**
**Compare:** The .jsx ideation in [screens-password.jsx](../Sign%20In%20-%20Claude%20Design/screens-password.jsx) had `<Btn variant="ghost">Back to sign in</Btn>` on this screen.
**Reality on mobile:** With no chrome, the user must use the device's gesture-back. On iOS that works; on Android too. But standalone desktop / embedded webview contexts may not have gesture-back, leaving the user stuck.
**Recommendation:** Add a "Back to sign in" tertiary button (matches the locked screen's pattern). Same need on `screen-reset-sent` (but it has `Wrong email? Sign in with a different account` as a workaround) and `screen-new-password` (no back at all — though this is arrived-at via reset-link, so back-to-sign-in is less obvious). **Tier A** (single-screen fix on `screen-forgot-password`); Tier B for the cross-screen pattern.

### Issue 10 · Cooldown copy uses "1:00" but countdown shows "00:60" then "00:59" — **Nit** (Prototype, Tier A)

**Lens:** Microcopy & tone, consistency.
**Where:** Reset cooldown text — initial: "Resend available in 1:00" ([L6037](../sign-in.html#L6037)); ticking: "Resend available in 00:59" / "00:58" / etc. ([L6045](../sign-in.html#L6045)).
**Concern:** The format string `${MM}:${SS}` produces `00:59` after the literal `1:00` initial value. Inconsistent at the boundary tick — it goes `1:00 → 00:59 → 00:58`. Hairline issue.
**Recommendation:** Use the formatter for the initial value too: `Resend available in 01:00`. Or drop leading zeros for both. **Tier A.**

### Issue 11 · "I received the link →" simulate button is a real-life confusing affordance — **Minor** (Prototype)

**Lens:** Prototype legibility, usability test fidelity.
**Where:** `screen-reset-sent` has a button labeled `I received the link →` ([L3692](../sign-in.html#L3692), id `reset-simulate-link-btn`).
**Concern:** This is a prototype-only simulate button that lets the reviewer skip the email-link round-trip. In a real app, this UI wouldn't exist. In usability testing, participants will read it as a real CTA and tap it without understanding what's happening — they'll be teleported to "Create New Password" without realizing they're simulating clicking an email link.
**Recommendation:** Either (a) hide it behind a "demo controls" pattern (e.g., add a small "Demo: simulate clicking the link in your email" affordance, possibly distinguished by italics/dashed border/dimmer color), or (b) suppress it during usability tests and rely on the screens-nav for reviewer navigation. **Tier B** (consistency with how OTP/passkey flows handle simulate-only affordances — see Group 4 review).

### Issue 12 · Account-locked reset-success doesn't distinguish "old password" from "new password" sign-in — **Minor** (Cross-cutting, behavioral)

**Lens:** Auth-specific best practices, signed-in destination.
**Where:** After completing `password-forgot`, the user lands on `screen-reset-success` and is sent back to `screen-chooser`. They must now sign in again with their new password. There is no way to verify that the new password is correctly remembered, and no indication that the "Account Locked" cooldown is now bypassed (since the password was reset).
**Recommendation:** Either (a) auto-sign-in after password reset (acceptable on a private device — users on shared devices would need a way to opt out), or (b) on the chooser after reset, show a brief banner: "Password updated. Sign in with your new password." **Tier B** — relates to the signed-in-destination theme already in the ledger.

---

## Recommendations (1:1 with issues)

| # | Recommendation | Surface | Tier | Effort |
|---|---|---|---|---|
| 1 | Add MFA + Passkey Enrollment screen mockups to Figma `198:137`. Update header strip to 5 steps if helpful. | Figma | C | Low (re-capture from prototype) |
| 2 | Update Figma `198:156` to route Account Locked → Forgot Password → Reset Sent (matching prototype). Add the 15:00 countdown. **Or** if team wants the auto-email pattern, change the prototype to match. | Figma (or Prototype) | C (or A if redesigning) | Low–Medium |
| 3 | Add `forgot-password:not-found` mockup to Figma `198:170` showing the inline error. | Figma | C | Low |
| 4 | Implement a real wrong-password counter and lockout escalation in `pw-submit-btn`. Use a sentinel password ("correct") for the happy path; anything else → wrong-password error → 3 attempts → locked. | Prototype | A | Medium |
| 5 | Either move the not-found demo behind a sentinel email (e.g. `notfound@test.com`) or document the always-error-first behavior in the doc + a code comment. | Prototype + Doc | A | Low |
| 6 | (Optional) clarify Figma's reset-success destination as "Returns to chooser." | Figma | C | Low |
| 7 | Reconsider `screen-password` H1: `Welcome Back` or `Sign In With Email` instead of `Sign In`. | Prototype + Figma | B | Low |
| 8 | Adopt Title Case for primary buttons globally. Defer to synthesis. | Prototype + Figma | B | Medium (cross-flow) |
| 9 | Add "Back to sign in" tertiary button to `screen-forgot-password` (matches `screen-account-locked`). | Prototype + Figma | A (single screen) / B (cross-flow pattern) | Low |
| 10 | Format reset-cooldown initial value as `01:00` (or drop leading zeros consistently). | Prototype | A | Trivial |
| 11 | Distinguish `reset-simulate-link-btn` as demo-only (italic / dashed / dimmer) — same pattern across all simulate-flow buttons. | Prototype | B | Low |
| 12 | Add post-reset banner on chooser: "Password updated. Sign in with your new password." Or auto-sign-in (with caveats). | Prototype + Figma | B | Medium |

---

## Open questions

1. **Q1 (Issue 4) — Wrong-password fix approach.** Sentinel password (`correct` works, anything else fails)? Or trigger wrong-password on every Nth attempt? Recommendation: sentinel password, deterministic, easiest to demo. Decision needed before Tier A implementation.
2. **Q2 (Issue 2) — Account Locked routing intent.** Was the original intent for the lockout to auto-fire a reset email, or did the team always intend the user to confirm their email through `screen-forgot-password`? Either way is defensible — the answer determines whether Figma updates or the prototype updates.
3. **Q3 (Issue 5) — Forgot-password not-found demo.** Sentinel-email approach acceptable (e.g., `notfound@test.com` shows the error, anything else proceeds)? Cleaner for usability testing.
4. **Q4 (Issue 11) — Simulate-button visual treatment.** Should we adopt a global "demo control" style for buttons like `I received the link →` and the screens-nav? Affects multiple flows.
5. **Q5 (Issue 7) — Password screen H1.** `Welcome Back` matches passkey-first chooser tone. `Sign In With Email` is more literal. Pick a global pattern: should every method-screen H1 announce the method (`Sign In With Email`, `Sign In With Face ID`, `One-Time Code`) or should they all share a warm header (`Welcome Back`)?

---

## Cross-flow notes (for synthesis — appended to ledger)

- **Theme: Validation logic gap on prototype submit handlers** (NEW). Chunk 1 didn't surface this, but Issue 4 and Issue 5 here suggest there may be similar permissive/over-strict validation in OTP, cross-device, reset, and verify handlers. Worth auditing in Chunks 3, 4, 6 specifically.
- **Theme: Title Case vs UPPERCASE buttons** (NEW). Group 3 surfaces this prominently. Will recur in OTP, cross-device, settings.
- **Theme: Back / Cancel / escape-hatch availability** (NEW). `screen-forgot-password` lacks one. OTP, cross-device, settings sub-screens may have similar gaps. Audit pattern.
- **Theme: Demo simulate-buttons** (NEW). `reset-simulate-link-btn` is the first visible one. OTP probably has resend simulate, cross-device probably has a "scanned successfully" simulate, etc.
- **Existing themes confirmed:** Doc-to-Figma node ID drift (predicted to repeat — confirmed). Heading case (sentence vs. title) — applies to button copy too. `Sign In - Claude Design/` folder stale — confirmed for `screens-password.jsx`.
- **Signed-in destination theme:** Group 3 happy path terminates at `screen-passkey-enroll:prompt` — same 5-flow gap mentioned in Group 1. No change.

---

## What was inspected

- Figma frames pulled live via MCP: `198:137`, `198:145`, `198:156`, `198:170` (full flows); `86:31`, `169:32` (legacy strips, for drift check). Screenshots saved to `.review-tmp/group-3/`.
- `sign-in.html`:
  - `screen-password` markup ([L3526–3606](../sign-in.html#L3526)).
  - `screen-account-locked` markup ([L3609–3629](../sign-in.html#L3609)).
  - `screen-forgot-password` markup incl. rate-limited panel ([L3632–3673](../sign-in.html#L3632)).
  - `screen-reset-sent` ([L3676–3694](../sign-in.html#L3676)).
  - `screen-new-password` incl. expired panel ([L3697–3744](../sign-in.html#L3697)).
  - `screen-reset-success` ([L3747–3760](../sign-in.html#L3747)).
  - `pw-submit-btn` handler ([L4672–4688](../sign-in.html#L4672)).
  - `verify-btn` handler ([L4508–4530](../sign-in.html#L4508)) — confirmed enrollOrigin = 'post-login' for happy path.
  - `pw-other-btn` handler ([L5939](../sign-in.html#L5939)).
  - `forgot-link` handler ([L5947](../sign-in.html#L5947)).
  - `forgotpw-rate-back-btn`, `locked-reset-pw-btn`, `locked-another-way-btn` handlers ([L5970](../sign-in.html#L5970), [L5993](../sign-in.html#L5993), [L5998](../sign-in.html#L5998)).
  - `reset-send-btn`, `reset-resend-btn`, `reset-simulate-link-btn` ([L6005](../sign-in.html#L6005), [L6051](../sign-in.html#L6051), [L6054](../sign-in.html#L6054)).
  - `save-pw-btn`, `reset-success-signin-btn` ([L6079](../sign-in.html#L6079), [L6085](../sign-in.html#L6085)).
  - `tile-password-chooser` and `tile-pf-password` event listeners ([L4663](../sign-in.html#L4663), [L4977](../sign-in.html#L4977)).
  - `FLOWS` Group 3 entries ([L5296–5340](../sign-in.html#L5296)).
  - `SCREEN_DESCRIPTIONS` for password screens ([L4310](../sign-in.html#L4310)).
  - CSS state rules for `pw-state`, `forgotpw-state`, `newpw-state` ([L2447–2457, L2404–2406](../sign-in.html#L2447)).
- `user-flow-documentation.md`: Group 3 sections ([L191–268](../user-flow-documentation.md#L191)).
- `figma-flow-gaps.md`: full read (Account Locked confirmed satisfied).
- `Sign In - Claude Design/screens-password.jsx`: full read (confirmed stale; `// ARCHIVE` recommendation applies).
- `figma-export/screenshots/`: visual reference, no read needed.
