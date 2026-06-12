# Group 5 · Passkey Registration & Enrollment — Review

**Scope:** Sub-flows 5a–5f · 5 named sub-flows + 1 implicit (5e/5f are forks of 5d) · 1 screen with 6 panel-states: `screen-passkey-enroll` (`prompt`, `success`, `error`, `already-enrolled`, `declined`, `suppressed`).

**Figma frames reviewed (live):**

| Sub-flow | Doc node ID | **Live node ID** | Local cache |
|---|---|---|---|
| 5a Happy Path — Passkey Registration | `129:31` | `198:266` (`flow:enroll-happy`) | `.review-tmp/group-5/5a-198-266.png` |
| 5b Biometric Fails / User Cancels | `137:31` | `198:274` | `.review-tmp/group-5/5b-198-274.png` |
| 5c Passkey Already Exists | `139:31` | `198:282` | `.review-tmp/group-5/5c-198-282.png` |
| 5d User Declines Setup | `141:31` | `198:290` | `.review-tmp/group-5/5d-198-290.png` |
| 5e/5f Declined Fork (Maybe Later / Don't Ask Again) | `176:31` | `198:298` (`flow:enroll-fork`) | `.review-tmp/group-5/5ef-198-298.png` |

**Cross-references walked:** `user-flow-documentation.md` Group 5 §, lines 353–434; `sign-in.html` FLOWS L5414–5468; `screen-passkey-enroll` HTML L2983–3070 (6 panels); `setEnrollState` L4563; enrollment handlers L4890–4955; settings → enroll wiring L4886; `passkey_instructions.md`; `Sign In - Claude Design/flow-passkey-paths.jsx` (ARCHIVE-headered); Figma MCP live (this session).

---

## Summary (1-paragraph health check)

**Group 5 has the strongest design intent of any group reviewed yet** — benefit-framed copy, privacy reassurance ("nothing ever leaves your device"), three concrete bullets, dedicated screens for "Maybe Later" vs. "Don't Ask Again" (respecting that they're meaningfully different decisions), and origin-aware navigation that returns settings-originated users back to settings rather than dumping them on the chooser. The `enroll-setup-btn` correctly uses `textContent` updates rather than CSS pseudo-elements (lesson learned from G4 Theme 14). **However:** the flow leans on `alert()` for the post-login signed-in confirmation (twice) — same anti-pattern as G4 Issue 12 — and the `enrollOutcome` URL param (`?enroll=success|error`) is undocumented and visually identical to a real CTA path. The biggest finding is **architectural**: Figma's 5d annotation strip describes a flatter 3-CTA prompt (`Set Up / Maybe Later / Don't Ask Again` all on one screen), while the prototype implements a 2-step decline (`Set Up / Not now` → `Maybe Later / Don't Ask Again`). Both shapes have valid arguments — synthesis (or the structural pass) needs to pick one. Theme 18 added: **post-prompt confirmation via native `alert()` is now a 4-flow recurring pattern** worth a single Tier A consolidation.

---

## Source-drift report

| Doc says | Reality | Severity |
|---|---|---|
| Figma `129:31` (5a) | `198:266` (`flow:enroll-happy`) | Tier B |
| Figma `137:31` (5b) | `198:274` | Tier B |
| Figma `139:31` (5c) | `198:282` | Tier B |
| Figma `141:31` (5d) | `198:290` | Tier B |
| Figma `176:31` (5e/5f) | `198:298` (single frame for both forks) | Tier B |
| Figma 5a annotation strip text: *"You're in! Sign in even faster next time with Face ID or Touch ID. Tone is celebratory and promotional."* | Prototype prompt copy is *"Sign in faster with Face ID"* + benefit-framed body. **Annotation describes a tone/copy that isn't in the actual mockup or prototype.** | Tier C — annotation drift inside Figma itself |
| Figma 5d annotation: *"Three CTAs: Set Up Passkey, Maybe Later, Don't Ask Again"* on the prompt screen | Prototype prompt has 2 CTAs (Set Up + Not now); the 3-CTA fork happens on the *declined* screen | **Tier B — architectural disagreement** (see Issue 1) |
| Figma 5b annotation: *"App catches the error and offers 'Try Again' and 'Skip for Now'"* | Prototype error panel labels: `TRY AGAIN` + "Do this later" | Tier C — minor copy drift |
| Figma 5b annotation: terminal "Skipped" state | Prototype's skip path goes to chooser + native alert (no dedicated screen) | Tier B — see Issue 2 |
| Figma 5a annotation strip lists *"Signed In (Password)"* as the start state | Enrollment is reachable from password OR OTP happy-path; 198:266 doesn't note OTP origin | Tier C — completeness |
| Figma 5e/5f frame's chooser mockup shows 4 method tiles incl. "Scan with Phone" | Matches prototype 4-tile chooser | aligned |
| `Sign In - Claude Design/flow-passkey-paths.jsx` references auto-prompt + dedicated not-found enrollment hub | ARCHIVE-headered | resolved |

---

## Strengths (keep)

- **Benefit-framed copy, not security-framed.** "Sign in faster with Face ID" + three benefit bullets ("No password to remember", "Works with Face ID or Touch ID", "Syncs across your Apple devices"). Avoids the "you must set up extra security" framing that drives passkey decline rates up. Industry best practice.
- **Privacy reassurance front-and-center.** Subtext explicitly says *"nothing ever leaves your device."* Directly addresses the most common passkey objection. Keep verbatim.
- **Dedicated "Don't ask again" suppressed-state screen** rather than a toast or `alert()`. Respects that suppression is a real user decision deserving acknowledgment. Matches G4 banner-pattern philosophy (a state change deserves a state-change confirmation).
- **"Maybe Later" vs. "Don't Ask Again" are split into two distinct paths** — snooze (will re-prompt) vs. permanent suppress (won't). User autonomy respected. The doc's design-intent paragraph explicitly defends this split — and it's right to.
- **Origin-aware navigation in `handleEnrollSkip`.** From settings → returns to settings; from post-login → returns to chooser + signed-in confirmation. Single function, two correct exit destinations. Solid pattern.
- **`enroll-hero-icon` uses semantic color groups** (`--setup` brand red, `--success` green `#E8F5E9/#2E7D32`, `--error` amber `#FFF3E0/#E65100`, `--declined` neutral gray `#F3F4F6/#6B7280`). Consistent with G4's banner palette token set; `--declined` introduces the neutral pair the cross-flow ledger has been asking for (Theme 3).
- **`enroll-setup-btn` uses `this.textContent = 'Setting up…'`** — correct DOM-text approach, not CSS pseudo-element. Avoids the G4 Theme 14 problem.
- **1800ms artificial delay on setup** simulates real WebAuthn round-trip; not instant. Better fidelity than most prototype handlers.
- **`SCREEN_DESCRIPTIONS` annotations are accurate** (see L4295: `'screen-passkey-enroll:already-enrolled'` correctly mentions `InvalidStateError`). High signal for downstream developers.
- **"Saved to: iPhone (this device)"** on success — gives device context. Tells the user *where* their passkey lives. Strength.
- **Settings path surfaced on both decline AND suppressed states** ("Account Settings › Sign-In & Security"). Recovery breadcrumb if the user changes their mind. Same path string used both places — consistent.
- **Already-enrolled state treated as silent success, not error.** Heading "Face ID Already Set Up" + green check icon + reassuring subtext + single GOT IT CTA. Doesn't punish the user for the runtime returning `InvalidStateError`. Good.
- **`<ul aria-label="Benefits">`** on the benefits list — proper list semantics with accessible name. Benefit SVG icons are `aria-hidden="true"`. ✓
- **`enroll-already-continue-btn` returns the user to `screen-passkey:idle`** — correct destination since they discovered they already have a passkey on this device; they should be signed in via Face ID, not the enrollment screen.
- **`?enroll=success|error` URL param** is a clean stub for WebAuthn outcomes. (Issue 5 below — flag it visually for testers, but the mechanism is fine.)

---

## Issues

> **Tier reminder:** A = local prototype fix (Phase 3 Wave 1) · B = cross-flow pattern (Wave 2) · C = Figma frame drift (Wave 3).

### Issue 1 · Major · 2-step decline (prototype) vs. 3-CTA prompt (Figma annotation) — architectural disagreement · **Tier B**

**Location:** `sign-in.html` L3008–3009 (prompt has 2 CTAs); L3041–3044 (declined panel has 2 CTAs); Figma 198:298 annotation row says *"Setup Prompt … User sees Set Up Passkey, Maybe Later, and Don't Ask Again options."*

The prototype implements:
```
prompt:    [SET UP FACE ID SIGN-IN] + [Not now] → declined panel
declined:  [MAYBE LATER] + [Don't ask again]
```

The Figma 5d/5e/5f annotation describes:
```
prompt:    [Set Up Passkey] + [Maybe Later] + [Don't Ask Again]
declined:  (no separate screen — taps go straight to the chosen outcome)
```

Both shapes have legitimate arguments:
- **2-step (current):** Lower decline-funnel friction; doesn't surface "Don't Ask Again" upfront, which prevents impulsive permanent suppression. Makes "Don't Ask Again" feel like a deliberate second action — appropriate for an irreversible decision.
- **3-CTA flat (Figma intent):** Faster; doesn't require an extra screen for users who know they want to permanently suppress. Less perceived friction.

**Recommendation:** Synthesis (or the structural pass) decides. My provisional preference: **keep the 2-step**, because:
1. "Don't Ask Again" is irreversible (or recoverable only via Settings); irreversible actions deserve a discoverable second step rather than immediate availability.
2. The 2-step has its own UX value — `enroll-panel-declined` shows the Settings recovery breadcrumb explicitly. A flat 3-CTA prompt loses that screen.
3. Reduces the cognitive load of the prompt itself (3 CTAs = analysis paralysis).

But if structural-pass research/data shows declines drop on flat-3-CTA, that's the right call. Either way, **decide and reconcile Figma annotation accordingly** (Tier C).

---

### Issue 2 · Major · `handleEnrollSkip` shows native `alert('✓ You're signed in...')` for post-login origin · **Tier A**

**Location:** `sign-in.html` L4915.

```js
function handleEnrollSkip() {
  setEnrollState('prompt');
  if (enrollOrigin === 'settings') {
    switchScreen(screenEnroll, screenSettings, 'backward');
    currentScreen = screenSettings;
  } else {
    // Post-login: user is signed in — show confirmation
    switchScreen(screenEnroll, screenChooser, 'backward');
    currentScreen = screenChooser;
    alert('\u2713 You\u2019re signed in. (Passkey setup skipped for now)');
  }
}
```

This is the **third** native `alert()` in the prototype's user-facing flows (G4 has `alert('Account support coming soon...')`; `enroll-continue-btn` has `alert('✓ Passkey saved. Continuing to shop…')`). Native alerts:
- Look like browser security warnings, not Ace UX
- Block the entire page
- Are unstyled — break the visual fidelity of the prototype
- Won't survive into production

**Recommendation:** Replace with the actual signed-in confirmation pattern. Per Theme 8, this is the "missing signed-in destination" — same fix closes ≥5 flows. Tier A.

**Note for synthesis (Theme 18 candidate):** Three `alert()` calls in user-facing paths is now a recurring pattern. New ledger theme: **stub-confirmations as native `alert()`** — should be a single Tier A pass to replace all three with a shared toast/banner component.

---

### Issue 3 · Minor · `enroll-continue-btn` ("CONTINUE SHOPPING") shows native `alert()` instead of navigating · **Tier A**

**Location:** `sign-in.html` L4948.

```js
document.getElementById('enroll-continue-btn').addEventListener('click', () => {
  alert('✓ Passkey saved. Continuing to shop… (prototype)');
});
```

Same problem as Issue 2 — and arguably worse, because this is the **success terminus** of the happy path. The user has just completed the full enrollment ceremony and the only acknowledgment they get is a browser dialog. Doesn't represent the production destination.

**Recommendation:** Pair with Theme 8's "signed-in destination" decision. Either route to a stub success screen or a "You're signed in across all Ace properties" confirmation. Same Tier A batch as Issue 2. **One fix closes both.**

---

### Issue 4 · Minor · "Setting up…" feedback is text-only; no spinner · **Tier B (nit)**

**Location:** `sign-in.html` L4898–4905.

```js
this.disabled = true;
this.textContent = 'Setting up…';
const enrollOutcome = ...;
setTimeout(() => {
  this.disabled = false;
  this.textContent = 'SET UP FACE ID SIGN-IN';
  setEnrollState(...);
}, 1800);
```

1800ms is a long perceptual gap with only text feedback (button goes gray, label changes). User may tap repeatedly thinking it didn't register. Cross-flow opportunity: G2 Issue 3 (visible feedback for retry CTAs) has the same need; one shared spinner pattern serves both.

**Recommendation:** Inline 14px spinner before "Setting up…" text. Respect `prefers-reduced-motion: reduce` (Theme 5). Tier B — bundle with G2's spinner.

---

### Issue 5 · Minor · `?enroll=success|error` URL param is undocumented and not visually distinguishable · **Tier B**

**Location:** L4900.

The query param controls whether the simulated WebAuthn outcome is success or error:
```js
const enrollOutcome = new URLSearchParams(location.search).get('enroll') || 'success';
```

Default is `success`, so usability testers will only ever see the happy path unless someone happens to know to add `?enroll=error`. The error state (5b) is then effectively unreachable in normal testing — same problem family as G3/G4/G2's validation gaps (Theme 10).

**Recommendation:** Either (a) add a small unobtrusive demo toggle (consistent with the global "demo simulate" treatment from Theme 12 — italic / dashed / "Demo:" prefix) or (b) use an in-flow sentinel input pattern (e.g., specific account email triggers the error path). (a) is simpler for stakeholders; (b) fits the broader sentinel pattern Theme 10 will adopt. **Synthesis decision.**

---

### Issue 6 · Minor · Heading + button case (Theme 2 confirmation) · **Tier B**

| State | Heading | Buttons |
|---|---|---|
| `prompt` | "Sign in faster with Face ID" (sentence) | `SET UP FACE ID SIGN-IN` (UPPER) + "Not now" (sentence) |
| `success` | "You're all set" (sentence) | `CONTINUE SHOPPING` (UPPER) |
| `error` | "Setup Didn't Complete" (Title) | `TRY AGAIN` (UPPER) + "Do this later" (sentence) |
| `already-enrolled` | "Face ID Already Set Up" (Title) | `GOT IT` (UPPER) |
| `declined` | "No problem" (sentence) | `MAYBE LATER` (UPPER) + "Don't ask again" (sentence) |
| `suppressed` | "Got it, won't ask again" (sentence) | `CONTINUE` (UPPER) |

Mixed sentence/Title within the same screen-group. UPPERCASE primary buttons + sentence-case skip buttons. Consistent **with the rest of the prototype's mixed pattern** but no rule emerges. Tier B at synthesis.

**Note:** "Setup Didn't Complete" + "Face ID Already Set Up" using Title Case while the others use sentence is inconsistent *within the same component* — these two should at minimum align with each other and ideally with the rest. Worth a sentence-case pass on errors specifically: "Setup didn't complete" / "Face ID already set up" reads more conversational.

---

### Issue 7 · Nit · "Saved to: iPhone (this device)" is hardcoded · **Tier B**

**Location:** L3018.

The success state hardcodes `Saved to: iPhone (this device)`. On Android, Windows, etc., this string would lie to the user. It's a strength of the design (provides device context) but a fragility of the prototype (literal string).

**Recommendation:** In production, populate from `navigator.userAgentData` or the platform-detection that the rest of the prototype already does for "Use Face ID" vs. "Use Touch ID" vs. "Use Windows Hello" copy. Flag for synthesis. Tier B.

---

### Issue 8 · Nit · Origin-aware "Not now" creates ambiguity in user mental model · **Tier B (info-only)**

**Location:** L4886 (`enrollOrigin = 'settings'`) + L4912–4923.

The same "Not now" button does different things depending on whether the user arrived from settings or post-login:
- From settings → goes back to settings (no signed-in alert)
- From post-login → goes to chooser + native alert "You're signed in"

Functionally correct, but the user can't see from looking at the button what will happen. This is a tradeoff — the alternative is splitting "Not now" into two contextual labels — which would be worse.

**Recommendation:** No change to behavior. **Worth flagging at the structural pass** as an example of context-aware navigation done well — and as evidence that the Tier A "fix" for Issue 2 (replace alert with toast) needs to know about origin so the toast doesn't fire when origin is `settings`. Tier B awareness, not a fix.

---

### Issue 9 · Nit · `enroll-decline-later-btn` ("MAYBE LATER") and `enroll-skip-btn` ("Not now") share one handler — but the labels imply different intents · **Tier A (info-only)**

**Location:** L4922 + L4926.

```js
document.getElementById('enroll-skip-btn').addEventListener('click', () => setEnrollState('declined'));  // Not now → declined panel
document.getElementById('enroll-decline-later-btn').addEventListener('click', handleEnrollSkip);          // Maybe Later → exit
document.getElementById('enroll-later-btn').addEventListener('click', handleEnrollSkip);                  // "Do this later" on error → exit
```

Three buttons that all variants of "skip enrollment for now":
- `enroll-skip-btn` ("Not now", on prompt) → opens the *declined* fork screen (does NOT exit).
- `enroll-decline-later-btn` ("MAYBE LATER", on declined) → exits via `handleEnrollSkip`.
- `enroll-later-btn` ("Do this later", on error) → exits via `handleEnrollSkip`.

Functionally distinct, semantically overlapping. Three "later" / "skip" labels with two different exits. Refactor opportunity if the team adopts Issue 1's flat-3-CTA model (would consolidate).

**Recommendation:** No fix needed if 2-step decline stays. If 3-CTA flat is adopted, consolidate. Tier A only if Issue 1 lands as "flat".

---

### Issue 10 · Nit · `?enroll=error` doesn't simulate the OS cancel path distinctly from biometric-fail · **Tier B (info-only)**

The URL param triggers the same `error` state regardless of whether the underlying cause was "OS dialog cancelled" vs. "Face ID didn't recognize the user." Real WebAuthn distinguishes these (`NotAllowedError` vs. timeout vs. user cancel) and the copy might want to too — though arguably "Setup Didn't Complete" is generic enough to cover both gracefully.

**Recommendation:** Likely no action — generic copy is the right move. Flagging only because it's adjacent to the structural-pass question of "should the prototype simulate richer error states?" Tier B.

---

## Open questions

1. **Q1 (Issue 1)** — 2-step decline (current) or flat 3-CTA prompt (Figma intent)? (Recommend keep 2-step.)
2. **Q2 (Issues 2 + 3)** — Replace 3 `alert()` calls with shared toast/banner pattern? (Recommend yes — Theme 18.)
3. **Q3 (Issue 4)** — Add inline spinner to "Setting up…"? (Recommend yes — bundle with G2's spinner.)
4. **Q4 (Issue 5)** — Visible demo control vs. hidden URL param for `enroll=success|error`? (Recommend visible demo control — Theme 12.)
5. **Q5 (Issue 6)** — Settle heading case rule (force sentence case across all 6 enrollment states)?
6. **Q6 (Issue 7)** — Defer device-string detection to production, or stub a basic detection in prototype?

---

## Cross-flow notes

| Theme | Group 5 contribution | Action |
|---|---|---|
| **Theme 1** · Doc-to-Figma node ID drift | 5 entries (`129/137/139/141/176:31` → `198:266/274/282/290/298`) | Doc-update batch in Wave 3 |
| **Theme 2** · Heading + button case | All 6 states span sentence/Title; UPPERCASE buttons throughout. Most evidence yet from a single screen. | Wave 2 |
| **Theme 3** · Banner palette / informational state | **G5 supplies the canonical `--declined` neutral palette** (`#F3F4F6/#6B7280`). Combined with G4's amber/red/green, the full 4-tier token set now exists: neutral / caution / error / success. | Phase 2 — adopt as canonical |
| **Theme 4** · Failed-state heading color | G5 error heading "Setup Didn't Complete" uses neutral dark gray (not red). **Reinforces "red = terminal only" rule** alongside G2 precedent. | Phase 2 |
| **Theme 5** · Reduced-motion audit | "Setting up…" pseudo-pending state is text-only (no animation today); future spinner must respect `prefers-reduced-motion`. | Wave 1 |
| **Theme 8** · Signed-in destination missing | Two more entries: `enroll-continue-btn` `alert()` + `handleEnrollSkip` post-login `alert()`. Theme is now critical — 4+ confirmed instances. | Phase 2 |
| **Theme 10** · Validation/state-transition gaps | G5 has the **mildest** instance — `?enroll=error` URL param at least *exists* as a stub (G3/G4/G2 had no toggle at all). Still falls under same family. | Wave 1 |
| **Theme 11** · Escape-hatch patterns | G5 prompt has 2-tier (Set Up + Not now); error has 2-tier (Try Again + Do this later); declined has 2-tier (Maybe Later + Don't ask again); suppressed has 1-tier (Continue). 1+2-tier patterns across enrollment. **2-tier is appropriate here** (no global navigation needed mid-enrollment because user is already authenticated). | Phase 2 — confirms 2-tier is fine when context is bounded |
| **Theme 12** · Demo simulate-buttons leak | `?enroll=success|error` URL param invisible to testers — same family as G3's `reset-simulate-link-btn`, just a different leak vector. | Phase 2 |
| **Theme 14** · CSS-pseudo-element labels | G5 **does NOT have this issue** — `enroll-setup-btn` correctly uses `textContent`. Confirms G4's `verify-btn` is the outlier. | Resolved precedent |
| **Theme 16** · Multiple entry points | G5 has 2: post-login (from password/OTP happy paths) + Settings → Add a Passkey (`settings-add-passkey-btn`). Doc covers both via the `enrollOrigin` mechanism. **Origin-aware nav handled correctly here** — strong precedent for Theme 16. | Phase 2 — cite G5 as canonical |
| **Theme 17** · Time-display value drift | No timer in this group. | — |
| **NEW · Theme 18** · Stub confirmations as native `alert()` | G4 (account support) + G5 (`enroll-continue-btn` + `handleEnrollSkip` post-login) = 3 confirmed instances. All three are post-action confirmations that should be in-DOM toasts/banners, not browser dialogs. | Phase 2 — single Tier A pass replaces all 3 |

---

## Tier A queue (Phase 3 Wave 1)

| # | Description | Effort | Cross-flow? |
|---|---|---|---|
| 5.2 | Replace `handleEnrollSkip` post-login `alert()` with in-DOM signed-in confirmation | S | **Pairs with Theme 8 + Theme 18** — single fix closes G4 + G5 alerts |
| 5.3 | Replace `enroll-continue-btn` `alert()` with in-DOM success destination | S | **Pairs with Theme 8 + Theme 18** |
| 5.5 | Visible demo control for `?enroll=success|error` (italic / dashed / "Demo:" prefix) | XS | Theme 12 — apply pattern uniformly |

## Tier B queue (Phase 3 Wave 2)

- Issue 1 — Decide 2-step decline vs. flat 3-CTA prompt (depends on synthesis or structural pass)
- Issue 4 — Inline spinner on "Setting up…" (pairs with G2 retry-spinner)
- Issue 6 — Settle heading case rule
- Issue 7 — Device-string detection
- Issue 8 — Awareness of origin-aware nav for Issue 2's toast implementation
- Theme 18 — Toast/banner component spec (replaces all 3 `alert()` calls)

## Tier C queue (Phase 3 Wave 3)

- Doc node-ID updates (5 entries)
- Figma 5a annotation strip drift (Figma describes copy that isn't in the mockup)
- Figma 5b annotation strip vocabulary drift ("Skip for Now" vs. "Do this later"; terminal "Skipped" state vs. exit-to-chooser)
- Figma 5d annotation drift (3-CTA prompt described, 2-CTA implemented) — depends on Issue 1 resolution
- Figma 5a annotation extension to mention OTP origin (currently only references Password)
