# Group 6 · Password Reset — Review

**Status:** Review-only. No code changes. Recommendations queued by tier into [CROSS-FLOW-LEDGER.md](CROSS-FLOW-LEDGER.md) and the SYNTHESIS pass (Plan v6 Phase 2).

**Sources cross-referenced**
- [user-flow-documentation.md § Group 6](../user-flow-documentation.md) (4 sub-flows)
- Live Figma frames `198:310` (6a), `198:324` (6b), `198:335` (6c), `198:343` (6d) — cached in `.review-tmp/group-6/`
- Prototype: [sign-in.html](../sign-in.html)
  - Markup: `screen-forgot-password` L3632, `screen-reset-sent` L3676, `screen-new-password` L3696, `screen-reset-success` L3744
  - State CSS: `data-forgotpw-state` L2451–2461; `data-newpw-state` L2403–2406
  - Handlers: `reset-send-btn` L6005, `startResetCooldown` L6033, `reset-resend-btn` L6051, `reset-simulate-link-btn` L6054, `reset-wrong-email-link` L6059, `save-pw-btn` L6079, `reset-success-signin-btn` L6085, `newpw-request-new-link-btn` L5026, `forgotpw-rate-back-btn` L5970
  - Rate-limit countdown: `startForgotpwRateCountdown` L5957
  - FLOWS array entries: L5471–5510
- [reviews/CROSS-FLOW-LEDGER.md](CROSS-FLOW-LEDGER.md) — 18 themes after Chunk 5

---

## 1 · Sub-flow alignment matrix

| Sub-flow | Doc anchor | Figma node | Prototype FLOWS id | Steps (Doc → Figma → Prototype) | Verdict |
|---|---|---|---|---|---|
| **6a Happy Path — Password Reset** | `104:31` | `198:310` | `reset-happy` | 4 → **6 (incl. "Open Reset Link" + "Signed In")** → 4 | ⚠️ **terminal step disagrees** |
| **6b Reset Link Expired** | `109:31` | `198:324` | `reset-link-expired` | 3 → 5 (incl. "Open Reset Link" + loop-back to "Recovery Email Sent") → 3 | ✅ aligned |
| **6c Email Not Found** | `107:31` | `198:335` | `reset-email-not-found` | 2 → 4 (incl. covert "No Email Sent" + Security badge) → 2 | ⚠️ **wireframe vs annotation contradict** |
| **6d Rate Limiting** | `113:31` | `198:343` | `reset-rate-limited` | 2 → 4 (incl. "Wait & Retry" recovery) → 2 | ✅ aligned (state-machine view); annotation cites different threshold |

---

## 2 · Findings (severity order)

### Issue 1 · 🚨 **Major / Structural — Email enumeration: Figma annotation contradicts Figma wireframe contradicts doc**

This is the single most consequential finding in Group 6 and must be settled before any production rollout.

| Source | What it shows |
|---|---|
| **Figma wireframe** (`198:335`, right panel) | Reset Password screen with **inline error**: *"We couldn't find an account with that email address."* — discloses registration status. |
| **Figma flow annotation** (frame 6c, `Submit Email → Check Your Inbox` w/ `🔒 Security: no enumeration` badge) | *"Identical response to the happy path. **Security requirement: never confirm whether an email is registered (prevents enumeration).**"* |
| **`user-flow-documentation.md` § 6c** | *"The error is inline and specific — 'We don't have an account with that email.' This is intentionally clear rather than vague, because users in this flow often have multiple email addresses…"* |
| **Prototype** (`screen-forgot-password[data-forgotpw-state="not-found"]`, sign-in.html L2451 + handler L6005) | Inline error matches the wireframe. |

**Why it matters**
- **OWASP ASVS V2.1.12 / V2.2.4** explicitly require that account-existence be non-disclosing on registration, recovery, and authentication endpoints. Email enumeration is a published, exploited weakness — automated tools harvest valid Ace customer emails for phishing and credential-stuffing.
- The doc's rationale ("users have multiple email addresses") is a real UX pain point but is conventionally addressed by a **generic post-submission screen** ("If an account exists with that email, we'll send a reset link") — which costs the user one inbox-check round trip if they guessed wrong, but reveals nothing to attackers. Figma's annotation describes exactly this pattern (covert "No Email Sent" terminus). The wireframe doesn't show it.
- The current implementation **leaks** registration status on every Forgot-Password submission. Combined with no observed rate-limiting until threshold hit (see Issue 5), this is harvestable.

**Why this is structural, not Tier A**
- It's not a copy fix — it changes the flow's terminal screen, kills the inline-error state entirely, and requires the doc's "multiple addresses" UX problem be solved a different way (e.g., the sent-screen lists masked email or offers "this isn't my email" link).
- All three sources are internally consistent within themselves and externally consistent in pairs — there is no obvious authoritative source. The wireframe is **the latest visual artifact** but the annotation is **on the same Figma node**, so they were drawn by someone aware of both positions.

**Tier:** **Structural (Chunk 8)** — surface the trade-off, recommend OWASP-aligned non-disclosing pattern, document the multiple-email UX countermeasure.

---

### Issue 2 · 🚨 **Major / Structural — Terminus disagreement: auto sign-in vs explicit re-auth**

| Source | Terminal step |
|---|---|
| **Figma flow annotation** (`339:653/339:654`) | *"Signed In — User is automatically signed in with the new credentials. Redirected to home screen. All other sessions are logged out."* — **transition: "auto sign-in"** |
| **Figma wireframe** (`198:322` / Password Updated panel) | CTA reads **"SIGN IN NOW"** — explicit user action required |
| **`user-flow-documentation.md` § 6a** | *"directs them back to sign in explicitly, since the session from the reset link shouldn't auto-authenticate on a potentially shared device."* |
| **Prototype** (`reset-success-signin-btn` L6085) | `switchScreen(screenResetSuccess, screenChooser, 'backward')` — routes to chooser, requires user to sign in fresh |

So the **flow diagram says auto sign-in**, but the **wireframe (same Figma node), doc, and prototype** say explicit re-auth. Doc gives a real security argument: reset links arrive in email, which can be opened on a shared/borrowed device — auto-authenticating from that link extends that device's trust unwittingly.

**Counter-argument** (Figma's position): friction after a successful reset is a known abandonment point; if the device is the user's, asking them to sign in again immediately is gratuitous. Auto sign-in *is* the dominant industry pattern (Google, Microsoft, Apple all auto-authenticate after password reset on the same device).

**Why this is structural**
- It's the same shape as G5's Issue 1 (2-step decline vs flat 3-CTA prompt) — a genuine trade-off where both Figma and the alternate source have legitimate arguments.
- Resolution affects: button label ("SIGN IN NOW" vs "CONTINUE"), navigation target (chooser vs home), and session-revocation timing (Figma's "All other sessions are logged out" is desirable regardless).

**Tier:** **Structural (Chunk 8)** — pair with G5 Issue 1 in the structural pass; pick a coherent house rule for "what happens after a security-elevating action succeeds."

---

### Issue 3 · 🚨 **Major — Three-way time-value drift on reset-link expiry (Theme 17 instance, worst yet)**

| Source | Quoted value |
|---|---|
| **Figma 6a annotation** (`339:645`) | *"Link is single-use and **expires in 15 minutes**."* |
| **Figma 6b annotation** | *"Email sent with a **15-minute** reset link."* |
| **Doc § 6b** | *"validity window had passed (**typically 1 hour**)"* |
| **Prototype `screen-reset-sent` body copy** (L3683) | No expiry duration mentioned at all — *"Check your inbox and follow the link to create a new password."* |
| **Prototype expired-state copy** (L3740) | Vague — *"Reset links are only valid for a short time."* |

Worse than G2's QR drift (which had a value in all three sources, just different): here the prototype hasn't committed to a number. The user gets no urgency cue from the sent-email screen and only a vague "short time" once they've already failed.

**Recommendation (paired with Theme 17 consolidation)**
- Settle on a single number. **15 minutes is the industry norm and Figma's stated value;** the doc should be corrected, not the design.
- Surface the duration on `screen-reset-sent`: *"The link expires in **15 minutes**."* — paired with sent timestamp. (G2's `screen-recovery` already does this on L3424 with "**30 minutes**" — note that's *also* a different value; one more drift to consolidate.)
- Surface the duration on the expired panel for closure: *"This link expired (links are valid for 15 minutes)…"*

**Tier:** **A (Wave 1)** — copy fix once the canonical value is chosen.

---

### Issue 4 · ⚠️ **Major — Forced 2-tap pattern on `reset-send-btn` (Theme 10 instance, input-trigger flavor)**

```js
// L6005-6018
document.getElementById('reset-send-btn').addEventListener('click', () => {
  const alreadyErrored = screenForgotPw.getAttribute('data-forgotpw-state') === 'not-found';
  if (!alreadyErrored) {
    // First tap: show not-found error (prototype always shows it to demo the state)
    screenForgotPw.setAttribute('data-forgotpw-state', 'not-found');
    return;
  }
  // Second tap: clear error and proceed
  …
});
```

The prototype forces every user through the email-not-found error on first tap. Consequences:
- **6a Happy Path is functionally unreachable** as labeled in the FLOWS index — selecting it auto-advances through the steps via `runFlow()`, but a tester clicking through manually from `screen-forgot-password` will always see the error first.
- A tester unaware of the demo trick may file a bug ("the happy path is broken") or assume the inline error is the canonical flow.
- Reinforces Issue 1 by making the inline-error UX feel like the only path.

This is the **input-trigger flavor of Theme 10** (G3 had input-string sentinels, G4 had button-tap counters, G2 has time-trigger, G5 has URL-param). G6 has *implicit* 2-tap — the worst flavor because it's invisible.

**Tier:** **A (Wave 1)** — replace with a visible demo-control toggle on `screen-forgot-password` ("Show: ✓ Happy / Email not found / Rate limited") matching the consolidated Theme 12 pattern.

---

### Issue 5 · ⚠️ **Major — Rate-limit countdown silently expires without restoring state**

```js
// L5957-5969
forgotpwRateInterval = setInterval(() => {
  secs--;
  timerEl.textContent = fmt(secs);
  if (secs <= 0) { clearInterval(forgotpwRateInterval); forgotpwRateInterval = null; }
}, 1000);
```

When the 15:00 countdown reaches 00:00, the interval clears — **but the screen state stays `rate-limited`**. The user is still looking at the lockout panel with `00:00` frozen on screen. No state restoration, no visual transition, no "you can try again now" affordance.

Compare to:
- `screen-recovery` `startRecoveryCountdown` L5040–5049 — correctly resets `recoveryAttempts = 0` and calls `setRecoveryState('default')` at expiry.
- `screen-account-locked` `startLockedCountdown` (next block down) — **same bug**, also doesn't restore. (Out of scope for G6 but worth flagging.)

**Why it matters**
- Users wait the 15 minutes, see `00:00`, tap nothing-happens, and get confused or frustrated.
- The only escape is `BACK TO SIGN IN`, which on tap restores the state via `screenForgotPw.removeAttribute('data-forgotpw-state')`. So the bug is hidden by the workaround — but the workaround is the wrong shape (asks the user to navigate away).

**Tier:** **A (Wave 1)** — at expiry, mirror `startRecoveryCountdown`'s pattern: clear `data-forgotpw-state`, optionally show a brief toast ("You can try again."). Consider extracting a shared `startLockoutCountdown(stateAttr, onExpiry)` helper since the bug repeats on `screen-account-locked`.

---

### Issue 6 · ⚠️ **Major — `SIGN IN NOW` does not sign the user in (Theme 8 instance)**

`reset-success-signin-btn` (L6085–6088):
```js
switchScreen(screenResetSuccess, screenChooser, 'backward');
currentScreen = screenChooser;
```

The button says **"SIGN IN NOW"** but routes the user back to the **chooser**, where they have to start the entire credential-collection process again. The label promises an action it doesn't perform.

This is the 5th confirmed **Theme 8 (signed-in destination)** instance and the 4th **Theme 18 (stub-confirmation behavior)** instance — but here the implementation is *navigation-based* rather than `alert()`-based, which is actually cleaner. The defect is the **button label**, not the mechanism.

**Tier:** **A (Wave 1)** — pair with Theme 8/18 consolidation:
- If structural Issue 2 picks **explicit re-auth**: relabel button to **"BACK TO SIGN IN"** (matches the rate-limit panel's existing button on L3670 — already a precedent).
- If structural Issue 2 picks **auto sign-in**: change handler to navigate to the post-login destination (whatever that becomes after the Theme 8 fix lands).

---

### Issue 7 · 🟡 **Minor — `reset-wrong-email-link` label doesn't match its behavior**

L3692 markup:
```html
<a href="#" class="recovery-help-link" id="reset-wrong-email-link">
  Wrong email? <span>Sign in with a different account</span>
</a>
```

L6059 handler:
```js
switchScreen(screenResetSent, screenForgotPw, 'backward');
currentScreen = screenForgotPw;
```

The link text says "Sign in with a different account" but the destination is `screen-forgot-password`, which is a **reset-password** form, not a sign-in form. The user can re-enter a different email and request a new reset, but they're not "signing in." The label oversells the action.

**Recommendation** — three options, pick one:
1. Relabel: *"Wrong email? **Try a different address**"* (matches the destination).
2. Repurpose to actually go to chooser: send the user to `screen-chooser` so they can pick another sign-in method or enter a different email there.
3. Drop the link entirely — the user can already tap back-arrow to re-edit.

**Tier:** **A (Wave 1)** — tiny copy fix; pick option 1.

---

### Issue 8 · 🟡 **Minor — `screen-forgot-password` is the only reset-flow screen without a hero icon**

| Screen | Hero icon | Tone |
|---|---|---|
| `screen-forgot-password` (default) | ❌ none | neutral |
| `screen-forgot-password` (rate-limited panel) | 🔒 lock | error |
| `screen-reset-sent` | ✉️ green | success |
| `screen-new-password` (default) | ❌ none | neutral |
| `screen-new-password` (expired panel) | 🚫 dark | error |
| `screen-reset-success` | ✓ green | success |

Two of six screen-states are iconless. That's defensible — the form *is* the focal element. But it creates a minor inconsistency where the user lands on Forgot Password feeling "this screen is unfinished" relative to neighbors. The Figma wireframe (6c, 6d) confirms iconless on `screen-forgot-password` default — so this is consistent with design intent and probably intentional restraint.

**Tier:** **C (Wave 3 / nit)** — leave as-is unless a global "every screen has a hero" rule is adopted in structural pass.

---

### Issue 9 · ℹ️ **Info — Figma 6d cites "5 attempts / 30-min window" rate-limit threshold; prototype implements no threshold**

Figma flow annotation (frame 6d, "Rate Limited" node): *"Too many requests in window (e.g. 5 attempts / 30 min)."*

Prototype: rate-limit panel only appears via the demo mechanism (presumably `runFlow` selecting `reset-rate-limited`). There's no actual counter — no `forgotpwAttempts` variable analog to `pwAttempts` (G3) or `recoveryAttempts` (deprecated hub).

This is a **prototype-scope info-only** finding — production-side rate limiting will live on the server, and the Figma "e.g." softens the specific numbers. But if the prototype is meant to *demonstrate* the rate-limit trigger condition, it should count attempts and switch to the locked panel after the threshold (parallel to G3's `pwAttempts >= 5` pattern at L4920ish).

**Tier:** **B (Wave 2)** — add `forgotpwAttempts` counter for demo realism, OR keep the demo-control toggle approach and document that rate-limit is server-driven. Pair with Theme 12 consolidation.

---

### Issue 10 · ℹ️ **Info — Group 6 has zero `alert()` stubs (positive note + Theme 18 boundary)**

Worth recording: G6 uses **real `switchScreen` navigation throughout**. Every CTA — including terminal ones — has a defined destination. No native `alert()` confirmations.

This is the **cleanest group reviewed** on Theme 18 (stub-alert mechanism) and confirms that real navigation *is* available; the alert-based stubs in G4 (`verify-cant-access-btn`'s deprecated handler) and G5 (`handleEnrollSkip` post-login + `enroll-continue-btn`) are isolated regressions, not a pervasive pattern.

**Implication for Wave 1 (Theme 18 consolidation)** — the canonical replacement target is exactly the kind of `switchScreen(_, screenChooser, …)` call G6 already uses. G6 is the precedent.

---

## 3 · Strengths to preserve

1. **Live cooldown text** on resend button (`startResetCooldown` L6033) — readable, polite, decremented every second. Matches G2's QR resend pattern. Industry-standard pattern executed cleanly.
2. **Password strength meter** with three discrete tiers (Weak/Fair/Strong) and ARIA `aria-valuenow` updates — accessible and clear without being prescriptive.
3. **Two complementary auto-clear behaviors:**
   - On email input change in not-found state (L6024) → error clears as the user starts correcting.
   - On `reset-send-btn` second tap → error clears and flow proceeds.
   - Both sensible; the first is a real-world necessity, the second is the demo hack (Issue 4).
4. **Real navigation everywhere** — see Issue 10. Sets the bar for Wave 1.
5. **Coherent expired-state shape** — the "Link Expired" panel (`newpw-expired-panel` L3735) replaces the form entirely with a single primary CTA. Same shape as G3's `screen-account-locked` and G2's `screen-passkey-cd:expired`. Theme 4 confirmed precedent.
6. **`reset-sent-email` interpolation** (L3683) — the sent-confirmation screen displays the actual address the user submitted (`<strong id="reset-sent-email">`). Tiny but high-trust touch.
7. **Hero color tokens** — green ✓ on success, dark gray on expired, red lock on rate-limited. Matches the canonical 4-tier palette identified in G5 (Theme 4).

---

## 4 · Tier queue (Group 6 contributions)

### Tier A — Phase 3 Wave 1 (copy/state/wiring fixes)

- **6.3** Settle reset-link expiry value (Theme 17 consolidation) and surface it on `screen-reset-sent` body copy. Also fix `screen-recovery`'s "30 minutes" → consolidated value.
- **6.4** Replace forced 2-tap `reset-send-btn` with visible demo-control toggle (Theme 12 consolidation).
- **6.5** Fix `startForgotpwRateCountdown` to restore `data-forgotpw-state` on natural expiry; consider shared `startLockoutCountdown` helper covering `screen-account-locked` too.
- **6.6** Relabel `reset-success-signin-btn` to **"BACK TO SIGN IN"** (assuming Issue 2 lands explicit re-auth) — pair with Theme 8 consolidation.
- **6.7** Relabel `reset-wrong-email-link` to **"Try a different address"** to match its destination behavior.

### Tier B — Phase 3 Wave 2 (UX enhancements)

- **6.9** Add `forgotpwAttempts` demo counter (or document that rate-limit is server-driven) — pair with Theme 12 framework decision.

### Tier C — Phase 3 Wave 3 (nits)

- **6.8** (Optional) Add a hero icon to `screen-forgot-password` default state if the structural pass adopts a "every screen has a hero" rule. Otherwise leave as-is.

### Structural — Chunk 8 (Plan v6)

- **6.S1** Email enumeration: pick a single position (OWASP-aligned non-disclosing **vs.** doc's "explicit error for multiple-email users"); resolve internal Figma annotation ↔ wireframe contradiction; document the trade-off chosen.
- **6.S2** Reset-flow terminus: pick **auto sign-in** (Figma) or **explicit re-auth** (doc + prototype); pair with G5 Issue 1 to settle a coherent house rule for "post-success of a security-elevating action."

---

## 5 · Theme contributions to ledger

| Theme | What G6 adds |
|---|---|
| **Theme 1** (Figma node-ID drift) | Doc anchors `104/109/107/113:31` map to live `198:310/324/335/343`. |
| **Theme 4** (color/hero palette) | Confirms 4-tier palette (neutral/caution/error/success). All G6 hero treatments match precedent. |
| **Theme 8** (signed-in destination) | **5th instance** — `reset-success-signin-btn` routes to chooser. Mechanism: navigation-based (cleaner than `alert()`). |
| **Theme 10** (demo trigger flavors) | **5th flavor** — input-trigger via implicit first-tap error injection. Worst flavor because invisible. |
| **Theme 12** (visible demo controls) | Two new candidates: `reset-send-btn` 2-tap pattern + `forgotpwAttempts` realism. |
| **Theme 14** (button label-swap) | No new instances; G6 uses static labels throughout (clean precedent). |
| **Theme 17** (time-value drift) | **3rd instance, worst yet** — Figma 15 min / doc 1 hour / prototype silent. Compounded by `screen-recovery`'s 30-min outlier. |
| **Theme 18** (stub `alert()` confirmations) | **Boundary established** — G6 has zero alerts; sets the canonical replacement pattern (real `switchScreen`). |

**No new themes needed.** Group 6 hits 8 existing themes and contributes the cleanest precedent so far on Theme 18. It also surfaces **two structural issues (Issue 1 + Issue 2)** that should be paired with G5's Issue 1 in Chunk 8.

---

*Chunk 6 of 7 in the per-group review pass. Next: Chunk 7 · Group 8 · Settings & Security. Then Chunk 8 (structural pass) → Phase 2 SYNTHESIS → Phase 3 Waves.*
