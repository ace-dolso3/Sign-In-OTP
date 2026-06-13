# QA Review Pass — Post-Audit Polish (2026-W2)

**Branch:** `feature/wave-1-scaffolding` @ `63a7e1c`
**Scope:** Polish/QA pass over the prototype after 20+ commits of W2/W3
work + 8 audit batches. Looking for issues *introduced by recent work*
— not coverage gaps. (Coverage was already audited in
[AUDIT-2025-W3-CLOSE.md](AUDIT-2025-W3-CLOSE.md).)
**Compare against:** wave-1 standalone (no 3-version diff; original / option-1
intentionally not consulted).

**Lens order:** 4 → 1 → 3 → 2 → 5 → 6
1. Visual / cross-screen consistency
2. Copy & microcopy regressions
3. Demo-hint typography & placement
4. Terminal-step honesty
5. Focus & a11y
6. State-machine integrity (smoke test)

**Severity legend:** 🔴 blocker · 🟠 major · 🟡 minor · ⚪ nit

---

## Lens 4 · Visual / Cross-Screen Consistency

Method: HTML/CSS static catalog across all 17 screens; spot-checks against
live prototype. Looking for divergent classes, mixed casing systems,
inconsistent component patterns, vestigial styles.

### F4-1 🟠 Heading hierarchy is split between `<h1>` and `<h2>` with no clear rule

The 17 screens use **at least 4 different heading conventions**:

| Convention | Screens |
|---|---|
| `<h1>` (no class) | chooser, password, otp, account-locked, forgot-password, reset-sent, new-password, reset-success |
| `<h2 class="settings-section-heading">` | settings-security, activity, active-devices, settings-passkeys, settings-recovery-email |
| `<h2 class="enroll-heading">` | passkey-enroll, reenroll |
| `<h2 class="recovery-heading">` | recovery, otp-no-access, **and** new-password sub-state ("Link expired") |

The pattern is roughly *core sign-in flow uses h1; everything post-auth
or branching uses h2-with-class*, but it's not codified anywhere and has
gaps:

- **`screen-new-password`** mixes both inside one screen — primary view
  uses unclassed `<h1>Create new password</h1>`, but the expired sub-state
  uses `<h2 class="recovery-heading">Link expired</h2>`. State change
  silently demotes the heading level.
- **`screen-settings-recovery-email`** has unclassed `<h2>` for two
  sub-states ("Add a recovery email", "Check your inbox") sitting under
  a classed `<h2 class="settings-section-heading">Recovery email</h2>`.
  Sibling `<h2>`s with different classes inside one screen.

**Why it matters:** heading hierarchy drives screen-reader landmarks and
visual rhythm. Mixed h1/h2 within a single screen breaks both. The
landing-page-vs-detail-screen split (h1 for landing, h2 for detail) is
defensible — but it needs to be a documented rule, applied uniformly,
with sub-states inheriting the parent screen's heading level + class.

**Recommendation:** Codify the heading rule in the prototype style guide
header comment. Either (a) every screen-level title is `<h1>` regardless
of context, with sub-state changes in lower levels, or (b) sign-in flow
= `<h1>`, settings/recovery/enroll = `<h2 class="*-heading">` with
sub-states at `<h3>`. Pick one. The current state has at least two
internal contradictions.

---

### F4-2 🟠 Five competing alert/banner systems for "tell the user something"

The prototype currently has five independent message-to-user surfaces,
each with its own class system, color tokens, and DOM shape:

| System | Class | Uses | Where |
|---|---|---|---|
| Chooser banner | `.chooser-banner` (+ `-icon`, `-text` substructure) | 1 | Chooser front-door, "we already tried that method" |
| Password error | `.pw-error-alert` | 1 | screen-password wrong-password substate |
| OTP verify alert | `.verify-alert` (+ `-cooldown/-expired/-locked/-resent/-wrong` modifiers) | 5 | screen-otp entered substates |
| Toast (W1 scaffolding) | `.toast-host` + `.toast` | 1 host | Global, post-success confirmations |
| Demo hint | `.demo-hint` | 2 | Test sentinels (G3-I4, G4-I1 follow-ups) |

These overlap functionally (status, error, confirmation, hint) but share
no common base. Adding a 6th surface (e.g., the lost-passkey placeholder
v2) will likely spawn yet another bespoke system unless this gets
unified.

The W3.2 banner-palette work was intended to address this — looking at
the artifacts now, palette tokens were added (✅) but the *consumers*
weren't migrated to a shared base class. Each surface still owns its
own background/border/typography rules.

**Why it matters:** Cross-flow consistency theme from
[CROSS-FLOW-LEDGER.md](CROSS-FLOW-LEDGER.md) Theme 2 (banner palette)
is partially closed. Visual consistency is achieved by accident, not by
contract. A copy-paste of any banner into a new context risks drifting
on its own.

**Recommendation:** Extract a shared `.alert` (or `.banner`) base class
with palette modifiers (`.alert--neutral / --warn / --error / --success`)
and migrate the four named systems above onto it, keeping current
per-screen IDs for behavior. This is **Tier B refactor scope** — flag
as a Wave-2 follow-up theme, not a quick fix.

---

### F4-3 🟡 Container/panel naming convention is split between BEM-modifier and compound-name

Settings, OTP, and reenroll panels follow BEM-modifier convention:
- `.settings-panel.settings-panel-list`
- `.settings-panel.settings-panel-rename`
- `.otp-panel.otp-panel-request`
- `.reenroll-panel.reenroll-panel-prompt`

But enroll and recovery use compound-name only:
- `.enroll-panel-prompt`, `.enroll-panel-success`, `.enroll-panel-declined` (no `.enroll-panel` base)
- `.recovery-locked-panel`, `.recovery-support-panel`, `.recovery-passkey-help-panel`
- `.forgotpw-rate-limited-panel` (one-off)
- `.newpw-expired-panel` (one-off)

Behaviorally fine — display:none/flex driven by data attributes works
either way. But for a future refactor (e.g., shared transition timing,
print styles, theme overrides), the BEM pattern lets you target all
panels with a single selector; the compound-name pattern doesn't.

**Recommendation:** Tier-C nit. Worth noting for any future panel-system
unification work, not worth a dedicated commit.

---

### F4-4 🟡 HTML source case style on `.sign-in-btn` is inconsistent with no functional impact

Both `.sign-in-btn` (28 uses) and `.sign-in-another-way-btn` (11 uses)
have `text-transform: uppercase` in CSS, so visual output is consistent.
But the **HTML source** mixes Title Case and Sentence case:

- `.sign-in-btn` — mostly Title Case ("Sign in with Face ID", "Try Again",
  "Generate New Code") with some Sentence case ("Back to sign in"
  L4442) and one ALL CAPS authoring style would be safer
- `.sign-in-another-way-btn` — uniformly Sentence case ("Sign in another
  way", "Back to sign in")

**Why it matters:** Screen readers read the HTML source, not the
rendered case. Title Case "Sign In With Face ID" reads aloud the same
as "Sign in with Face ID" in most TTS engines — but inconsistent
authoring style causes diffs to be noisier than necessary and makes
"why is this one different?" reviews harder. W3.1 standardized the
*visual* output via CSS but didn't standardize the source.

**Recommendation:** Tier-C nit. Add a comment to the W3.1 case-rule CSS
block clarifying that source casing should be Sentence case
("First-word-capitalized") for screen-reader naturalness, since visual
casing is handled by CSS. Then sweep the 28 `.sign-in-btn` instances on
the next polish pass.

---

### F4-5 🟡 `.security-section-heading` (h4) sits below `.security-group-title` (h3) — visually OK, semantically tight

In `screen-settings-security` (W2.3 IA re-section work), the structure is:

```
<h2 class="settings-section-heading">Sign-in & security</h2>      ← screen
  <section aria-labelledby="...">
    <h3 class="security-group-title">Sign-in & recovery</h3>      ← group
    [Passkeys card, Recovery Email card]
  </section>
  <section aria-labelledby="...">
    <h3 class="security-group-title">Account activity</h3>        ← group
    <h4 class="security-section-title">Recent sign-in activity</h4>  ← list
    [activity rows]
    <h4 class="security-section-title">Devices signed in</h4>     ← list
    [device rows]
  </section>
```

Heading hierarchy is correct (h2 → h3 → h4) and the W2.3 commit message
explicitly noted demoting h3 → h4 for hierarchy. **But** the Group 1
section has no `<h4>`s while Group 2 has two — asymmetric visually.
Group 1's cards self-label, so structurally it works, but a screen-reader
user navigating by heading levels will hear "Sign-in & security >
Sign-in & recovery" then jump straight back up to "Account activity >
Recent sign-in activity" with no sub-level under Group 1. Minor
discoverability difference between the two groups.

**Why it matters:** This was a deliberate W2.3 decision (cards
self-label). Calling it out here is a nit, not a regression — but
worth verifying that the asymmetry was intentional, not an oversight.

**Recommendation:** Verify against the W2.3 spec/notes. If intentional,
add a comment in HTML noting "Group 1 cards self-label; no <h4>s by
design." If accidental, decide whether to add visually-hidden `<h4>`s
in Group 1 for parity.

---

### F4-6 ⚪ Vestigial-looking one-off button classes — verified legitimate

The button-class catalog flagged 8 one-offs (`.tile`, `.forgot-link`,
`.passkey-cd-btn`, `.os-cancel-btn`, `.resend-btn`,
`.activity-anomaly-toggle`, `.flow-nav-arrow`, etc.). Investigated each:

- `.tile` / `.tile.tile-selected` — OTP delivery method picker (email/phone). Legit.
- `.forgot-link` — inline forgot-password link in `screen-password`. Legit.
- `.passkey-cd-btn` — cross-device tile in chooser. Legit.
- `.os-cancel-btn` — OS-style sheet cancel. Legit.
- `.resend-btn` — OTP resend code button. Legit.
- `.activity-anomaly-toggle` — W2.6 disclosure toggle. Legit.
- `.flow-nav-arrow` — demo-only flow navigation. Legit.
- `.text-field-clear` — appears 8x as a single class (X icon in inputs). Legit.

**No findings; this row is for the record.**

---

## Lens 4 · Summary

| ID | Severity | Theme |
|----|----------|-------|
| F4-1 | 🟠 major | Heading hierarchy mixed h1/h2 (2 internal contradictions) |
| F4-2 | 🟠 major | 5 competing alert/banner systems — Theme 2 partial closure |
| F4-3 | 🟡 minor | Panel naming split between BEM and compound-name |
| F4-4 | 🟡 minor | HTML source button casing inconsistent (visual OK via CSS) |
| F4-5 | 🟡 minor | Settings group heading asymmetry — verify intent |
| F4-6 | ⚪ nit | One-off button classes verified legitimate |

**Two real issues**, both tier-B refactor scope (heading rule
codification, banner system unification). The remaining four are
notes-for-later, not blockers.

---

## Lens 1 · Copy & Microcopy Regressions

Method: extracted every visible `<p>`, button label, heading, placeholder,
and aria-label across 17 screens. Cross-tabulated for terminology drift,
punctuation drift, and case-style drift.

### F1-1 🟠 "Verification code" vs "one-time code" — same concept, two terms, both used on the same screen

Single OTP screen, three references to the code:

| Surface | Term used |
|---|---|
| Chooser tile | "Get a **one-time code**" |
| OTP request screen subtext | "Send a **one-time code** to your email or phone" |
| OTP request screen tile-label | "Send **verification code** to" |
| OTP request screen helper | "We'll send a **6-digit code** to your email" |
| OTP code-entry screen subtext | "Please enter the **verification code** we sent to your email" |
| OTP code-entry screen alert (resent variant) | "We sent a new **6-digit code** to your email" |

So the user is told: *we'll send a one-time code* → *send verification
code to* → *we'll send a 6-digit code* → *please enter the verification
code*. Four variants in two screens for the same artifact.

Definition note: "OTP" itself is **not** in any visible copy (good — that's
internal jargon). But the visible-copy choice between "one-time code" and
"verification code" wasn't standardized.

**Why it matters:** Trust regression. When the screen tells you it sent a
*one-time code* and the next screen asks for a *verification code*, a
distrustful user pauses to wonder if they're on the right screen. This is
exactly the kind of micro-friction that compounds in OTP flows where the
user is already context-switching to email/SMS.

**Recommendation:** Pick one. Recommend **"one-time code"** as canonical
(matches the chooser tile entry-point and is the more common 2024+
terminology in security UX) and sweep the OTP screens. Tier-A polish.

---

### F1-2 🟠 Decline / dismiss CTA copy uses 5 different labels for "skip this"

Same conceptual action ("user wants to bail out without completing"),
five different labels:

| Label | Where |
|---|---|
| `Not now` | post-success enrollment opt-in |
| `Maybe Later` | passkey enrollment prompt |
| `Do this later` | recovery email setup (×2) |
| `Skip for now` | passkey enrollment (alternate variant) |
| `Continue Shopping` | enrollment success "I'm done" exit (×2) |

Each one is reasonable in its local context, but as a system this
fragments the user's mental model of "the small button that gets me out
of this." Five variants also means five translations to maintain.

**Why it matters:** Decline-CTA copy is one of the most-tested
microcopy surfaces in onboarding flows. Inconsistent labels are
correlated with users second-guessing whether the secondary button is
the same kind of action they declined a moment ago.

**Recommendation:** Standardize on **two** variants:
- `Not now` for soft-dismissal of optional enrollments (passkey opt-in,
  recovery email)
- `Continue shopping` for terminal exits where the user is "done with
  account stuff and back to the store" (post-success states)

Sweep the 7 occurrences. Tier-A polish.

---

### F1-3 🟡 Primary CTA case style inconsistent — Title Case is dominant but two outliers exist

`.sign-in-btn` rendered output is uppercase via CSS, but among 25
distinct labels:

- 24 are Title Case in source ("Sign In", "Send Code", "Use Password Instead", "Save New Password", "Try a Different Device")
- 1 is Sentence case ("Back to sign in" — `screen-reset-success`)

Additionally, `Use password instead` exists in **two casings** in source —
Title (`Use Password Instead`) on the password screen wrong-password
state, and Sentence (`Use password instead`) appears once elsewhere.

Visually CSS uppercases everything. Source-level inconsistency is a
diff-noise / future-grep concern, not a user-facing one.

**Recommendation:** Sweep button source-text to Sentence case across the
board (matches W3.1 intent for accessible source readability). Comment
in the case-rule CSS block specifying source convention. **Combines with
F4-4** — same finding viewed from different angles.

---

### F1-4 🟡 Period-punctuation drift on instructional sentences

Of 80 visible `<p>` elements, **27 end with a period and 53 don't**. Most
period-less ones are legitimate (timestamps, list rows, label-style
strings). But the following are full sentences and would normally take a
period:

- `Enter your email to get started` (chooser)
- `Enter your password to continue` (password)
- `Send a one-time code to your email or phone` (OTP request)
- `Your device will prompt you to authenticate` (passkey)
- `Devices currently signed in to your account` (active devices)
- `Sign-in events for your account · last 30 days` (activity — middot
  delimiter, intentional)
- `We'll send a 6-digit code to your email` (OTP request helper)

Compare to: `The link expires in 15 minutes.`, `Code expires in 03:00.`,
`Your password has been changed successfully. You can now sign in with
your new password.` — full periods.

Recurring pattern: **subtitle/helper** text drops the period; **inline
status / confirmation** text keeps it. This is actually a defensible
convention (subtitle ≈ short prompt, status ≈ statement) but it isn't
documented and the line is fuzzy ("Send a one-time code to your email or
phone" reads as a complete sentence to most users).

**Why it matters:** Punctuation consistency is a brand-voice signal.
Mixed punctuation reads as either careless or as a missing rule. The
inconsistency on close-paired screens (chooser subtitle no period,
password timer with period) is the most visible.

**Recommendation:** Codify the rule. Recommend: **subtitle copy under
heading = no period; body sentences and status copy = period.** Sweep
once. Tier-B polish (lower priority than terminology fixes).

---

### F1-5 🟡 "Code expires in" vs "link expires in" — different artifacts, different timer voice

Two timer-style affordances:

| Source | Artifact | Voice |
|---|---|---|
| `passkey-qr-expires` | QR code | "Code expires in **MM:SS**" (no period; updates live) |
| `verify-cooldown-timer` | OTP code | "Code expires in **03:00**." (with period) |
| `reset-sent-meta` | reset email | "The link expires in **15 minutes**." (with period) |
| `forgotpw-rate-limited` | rate limit | "Try again in **15 minutes** or sign in another way." |

Two "Code expires in" instances differ in punctuation (one has period,
one doesn't). The QR variant is a live-counting timer; the OTP variant
is an at-load static value. Both surface to the user identically.

**Recommendation:** Align — recommend **with period** for the QR variant
(matches OTP). Tier-C nit; one character.

---

## Lens 1 · Summary

| ID | Severity | Theme |
|----|----------|-------|
| F1-1 | 🟠 major | "Verification code" vs "one-time code" terminology drift on OTP flow |
| F1-2 | 🟠 major | 5 different decline-CTA labels for same conceptual action |
| F1-3 | 🟡 minor | Primary CTA source casing — 24 Title + 1 Sentence + 1 dup-cased button |
| F1-4 | 🟡 minor | Period drift on instructional `<p>` (27 with / 53 without, no codified rule) |
| F1-5 | 🟡 minor | "Code expires in" period inconsistency between QR and OTP timers |

**Two real Tier-A polish items** (terminology + decline CTA). The other
three are sweeps to bundle on a single copy-polish pass.

---

## Lens 3 · Demo-Hint Typography & Placement

Method: inspected `.demo-hint` CSS, both HTML instances, and confirmed
visually on the live prototype.

### F3-1 ⚪ Demo-hint pattern is well-formed and consistent

Two instances (`screen-password` L4263, `screen-otp` L4612), identical
structure: `<p class="demo-hint" aria-hidden="true">Type/Enter <code>X</code> to see ...</p>`.

CSS (L735-763):
- 11px italic body, `text-align: center`, color `#6b6b6b`
- `.demo-hint::before` content `'Demo · '` — 9px uppercase, `font-weight: 600`,
  `letter-spacing: 0.4px`, color `#888`
- `.demo-hint code` — SF Mono 11px, light gray chip background

Live screenshot confirmed: the "DEMO ·" label is unmistakable, the chip
formatting clearly differentiates the trigger from prose, and the size
de-emphasizes vs. real instructional copy.

`aria-hidden="true"` is correct — these are sighted-only prototype
affordances.

**No regression. Pattern works.**

---

### F3-2 🟡 Demo-hint placement breaks primary↔secondary CTA proximity

On `screen-password`:

```
[primary CTA]    SIGN IN
[demo-hint]      DEMO · Type wrongpw to see...
[secondary CTA]  SIGN IN ANOTHER WAY
```

The hint sits **between** the primary and secondary CTAs. The intent is
clear (the hint refers to the primary CTA above it), but it visually
splits the two-button group. On `screen-otp`, similar placement: hint
sits between the action group and the recovery help link.

Mobile/desktop both show this — the hint adds ~50px of vertical space
between the two CTAs, which would normally be a much tighter group.

**Why it matters:** When the demo affordance is removed before going to
production, those two CTAs will snap closer together — and any
non-demo-aware reviewer looking at the prototype now sees a gap that
won't exist later. Less of a UX concern, more of a "what does the
production version actually look like?" review concern.

**Recommendation:** Tier-C — either place the demo hint *outside* the
core action group (e.g., directly above the legal copy, separated by
the existing `<hr>` divider) so the primary↔secondary CTA pair stays
visually adjacent, or accept the displacement as a known prototype-only
artifact and add a comment.

---

### F3-3 ⚪ Only 2 demo-hints exist, but ≥7 demo-triggerable states are reachable via the drawer

The `screen-passkey-enroll` screen has **5** demo-triggerable
sub-states (success, error, declined, suppressed, already-enrolled),
all reachable via the demo drawer's preset list. None has an inline
demo-hint, because the trigger is the drawer button, not a typed input.

This is **correct by design** — demo-hints exist to teach typed-input
triggers (`wrongpw`, `111111`); drawer-triggered states need no inline
hint. Calling it out only because someone reading the doc later might
expect every demo-triggerable state to have a hint.

**No finding; for the record.**

---

## Lens 3 · Summary

| ID | Severity | Theme |
|----|----------|-------|
| F3-1 | ⚪ nit | Pattern well-formed; for the record |
| F3-2 | 🟡 minor | Hint placement splits primary/secondary CTA pair |
| F3-3 | ⚪ nit | 2 hints / 7+ triggerable states by design |

Lens 3 is the cleanest of the six — the demo-hint surface is one of the
better-controlled surfaces in the prototype. Only one real recommendation.

---

## Lens 2 · Terminal-Step Honesty

Method: walked the success/terminal endpoints of each major flow,
checked whether the screen reads as a real ending (vs. a placeholder
that dumps the user back into the flow).

### F2-1 ✅ Terminal screens cover the right outcomes

Endpoints inventoried:

| Flow | Terminal screen / state | Heading | CTA |
|---|---|---|---|
| Password sign-in success | (no screen — toast `'You're signed in / Welcome back to Ace Hardware'`) | — | (auto-navigates) |
| Passkey sign-in success | same toast | — | — |
| OTP sign-in success | same toast | — | — |
| Password reset complete | `screen-reset-success` | "Password updated" | "Back to sign in" |
| Passkey enrollment success | `screen-passkey-enroll` data-substate=success | "All set" / "You're all set" | "Continue Shopping" |
| Passkey enrollment declined | `screen-passkey-enroll` data-substate=declined | (declined panel copy) | "Continue Shopping" |
| Recovery email setup complete | `screen-settings-recovery-email` substate=sent | (confirmation copy) | (no exit CTA) |

Each flow has a recognizable terminal beat. By design, **sign-in success
is a toast** (per the W3 doc rationale: "no separate signed-in / home
destination by design — the screen reads 'You're signed in / Welcome back
to Ace Hardware'"). That's a defensible prototype simplification.

### F2-2 🟡 `screen-reset-success` CTA "Back to sign in" lands user on the chooser, not pre-filled

After resetting the password, the success screen says "Back to sign in"
which routes to `screen-chooser`. The user must re-enter their email even
though they just used it 30 seconds ago. Realistic apps would either
auto-sign-in or pre-fill the email field.

**Why it matters:** Reads as a small step backward. The user finishes a
reset, gets told "you can now sign in with your new password," and then
has to type their email again. Out-of-scope for this prototype's wave-1
contract (no real auth state), but worth flagging as a UX gap to address
before any production handoff.

**Recommendation:** Tier-B — when the prototype gains a session/state
layer (post-Wave-2), pre-fill `pw-email-display` from the reset flow's
known email. Until then, this is a known shortcut.

### F2-3 🟡 Recovery email setup has no exit CTA on the "sent" confirmation

In `screen-settings-recovery-email` substate=sent, the user sees
confirmation copy but no explicit "Done" / "Back to security" CTA — the
back-arrow header is the only egress. Compare with `screen-reset-success`
which has an explicit primary CTA.

**Why it matters:** Settings flows benefit from explicit returns to the
parent (security hub). Relying on header back-nav is fine on iOS but
less discoverable on web/Android.

**Recommendation:** Add a `Back to security` or `Done` primary button at
the bottom of the sent-substate panel. Tier-B polish.

### F2-4 🟡 Enrollment "declined" terminal CTA is "Continue Shopping" — feels jarring vs. "Maybe later" entry

User flow: user clicks **Maybe Later** on the enrollment prompt → lands on
declined panel → CTA says **Continue Shopping**. The voice shifts from
"I'm not ready right now" to "I'm done with you, take me to the store."

**Why it matters:** Mismatched voice. "Maybe Later" is a soft-decline
that implies *I might come back*; "Continue Shopping" treats the
interaction as fully terminal. A user who clicked "Maybe Later" looking
for a soft-out is now told their session is over.

**Recommendation:** Either change the entry button to "Not interested" /
"No thanks" (terminal-voice) **or** change the exit CTA to "Got it" /
"Continue" (soft-voice). Pairs with **F1-2** decline-CTA cleanup.

---

## Lens 2 · Summary

| ID | Severity | Theme |
|----|----------|-------|
| F2-1 | ✅ pass | Terminal screens exist and cover the right outcomes |
| F2-2 | 🟡 minor | Reset-success "Back to sign in" loses pre-fill (state limitation) |
| F2-3 | 🟡 minor | Recovery-email-sent has no explicit exit CTA |
| F2-4 | 🟡 minor | Enroll-declined voice mismatch ("Maybe Later" → "Continue Shopping") |

No blockers. The terminal-state architecture is honest — toasts for
sign-in success, dedicated screens for password reset and enrollment.
The three minor findings are voice/CTA polish, not structural.

---

## Lens 5 · Focus & A11y

Method: searched for global outline overrides, focus-visible rules,
aria-live regions, aria-expanded toggles. Confirmed JS toggles aria
state where attributes exist.

### F5-1 🔴 Global `outline: none` on `*:focus-visible` kills keyboard focus indicators across the entire prototype

Lines 52-53 of `sign-in.html`:

```css
* {
  -webkit-tap-highlight-color: transparent;
  outline: none;          /* ← global */
}
*:focus-visible {
  outline: none;          /* ← also global, on *:focus-visible explicitly */
}
```

The codebase then re-introduces outlines in only **two specific places**:
- `.identifier-strip-edit:focus-visible` (L3161) — Edit button on the
  identifier strip
- `.settings-breadcrumb-link:focus-visible` (L3191) — settings
  breadcrumb back-links

Every other interactive element — every button, every input, every
checkbox, every nav tile, the demo drawer launcher, the Forgot password
link, the QR retry button, the activity-anomaly disclosure — has **no
visible focus indicator** when reached by keyboard.

This violates **WCAG 2.4.7 Focus Visible (AA)**. It also makes the
prototype unnavigable by keyboard users — pressing Tab moves focus
silently with nothing on screen indicating where it is.

**Why it matters:** This is a Tier-A blocker for any accessibility
review and a hard fail for any production handoff. It's also a regression
risk in the prototype itself — anyone testing keyboard navigation will
report bugs that aren't bugs (they're focus loss perceived as broken
behavior).

**Recommendation:** Replace lines 52-53 with a focused-only rule:

```css
* {
  -webkit-tap-highlight-color: transparent;
}
/* No global outline kill. Browser defaults apply, plus explicit
   per-component focus-visible rules below. */
```

Then either keep the existing two component-level overrides (and accept
browser-default focus rings everywhere else) **or** add a single
prototype-wide focus-ring rule:

```css
*:focus-visible {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
  border-radius: 4px;
}
```

This is **Tier-A**. Should be addressed before any further QA pass or
external sharing.

### F5-2 🟡 Two more `outline: none` overrides on input wrappers (lines 331, 1874)

`.text-field input { outline: none; ... }` (L331) and the settings text
input variant (L1874) explicitly suppress the input's native focus
outline. Both rely on the wrapper showing a focus ring instead — but
since the wrappers don't have `:focus-within` outlines either, focus on
text inputs is also invisible.

**Recommendation:** Pair with F5-1. Add `:focus-within` outlines to the
wrappers when the global kill is removed, or accept browser defaults.
Tier-A bundled with F5-1.

### F5-3 ✅ aria-live and aria-expanded are well-managed

- 12 `aria-live="polite"` regions across error/status/timer surfaces.
  Polite is correct for non-urgent updates (cooldown timers, "code
  resent" confirmations, password-strength hints).
- 3 `aria-expanded` initial values, all `"false"` on disclosure-style
  buttons. JS toggles correctly: `setAttribute('aria-expanded', 'true' / 'false')`
  in 3 places (L7119, L7127, L7739) for the activity-anomaly toggle and
  proto-nav drawer.

No findings.

### F5-4 ⚪ aria-hidden coverage on decorative SVGs is consistent

Every inline SVG icon has `aria-hidden="true"` (verified via grep —
visible icons are decorative; semantic information lives in the
surrounding `aria-label` or visible text). Good baseline.

---

## Lens 5 · Summary

| ID | Severity | Theme |
|----|----------|-------|
| F5-1 | 🔴 **blocker** | Global `outline: none` kills focus indicators (WCAG 2.4.7 fail) |
| F5-2 | 🟡 minor | Bundled fix — `.text-field input` outline: none |
| F5-3 | ✅ pass | aria-live and aria-expanded properly managed |
| F5-4 | ⚪ nit | aria-hidden coverage on decorative SVGs is consistent |

**One real blocker (F5-1).** Single CSS change fixes the entire surface.
Should be addressed before next sharing.

---

## Lens 6 · State-Machine Integrity (Smoke Test)

Method: enumerated all 19 `screen-*` IDs, the FLOWS array (45 flow
objects), and the demo drawer nav (39 quick-nav items). Cross-checked
that every flow step references a live screen and every screen is
reachable.

### F6-1 ✅ All 19 screen IDs exist and resolve

```
screen-account-locked, screen-active-devices, screen-activity,
screen-blurb (aria-live region, not navigable), screen-chooser,
screen-forgot-password, screen-new-password, screen-otp,
screen-otp-no-access, screen-passkey, screen-passkey-enroll,
screen-password, screen-recovery, screen-reenroll, screen-reset-sent,
screen-reset-success, screen-settings-passkeys,
screen-settings-recovery-email, screen-settings-security
```

19 IDs, no duplicates, no orphans. `screen-blurb` is the navigator's
description aria-live region (not a navigable screen) — confirmed.

### F6-2 ✅ FLOWS array structure intact

45 flow objects in the FLOWS array. Spot-checked first 5 and last 5:
- `passkey-happy`, `passkey-biometric-failed`,
  `passkey-failed-fallback-password`, `passkey-not-found`,
  `passkey-os-sheet-happy` — all routes resolve to live screens
- `settings-activity-log`, `settings-active-devices`,
  `settings-rename-passkey`, `settings-remove-passkey`,
  `settings-remove-last-passkey` — all routes resolve to live screens

### F6-3 ✅ Demo drawer nav covers 39 of 45 flows

The "Demo" drawer's right-side preset list has 39 quick-nav buttons,
covering the most-likely-tested states. The remaining 6 flow objects in
FLOWS are derivative variants (e.g., `password-wrong-password-rate-limited`
follows from `password-wrong-password` + 2 more typed attempts) that
are reachable via the parent state's continued interaction.

No dead-ends discovered during 8-screen sample walk (chooser →
passkey-fail → password → wrong-pw → forgot → reset-sent → new-pw →
reset-success).

### F6-4 ⚪ State pollution potential when forcing data attributes externally

While testing, forcing `data-otp-state="entered"` plus
`data-otp-substate="default"` from outside the natural state machine
caused the OTP screen to render **two competing buttons** ("Resend Code"
+ "Resend code") because the verify button is mutated to read "Resend
Code" only when state === 'expired', but the resend button is always
visible. Forcing a non-canonical combination revealed a coupling.

This isn't a real-user issue (users can't force these combinations) but
it's worth a comment on the state machine to document which
state×substate pairs are valid.

**Recommendation:** Add a comment listing valid state×substate
combinations near the OTP screen's data-attribute declarations. Tier-C
documentation nit, not a fix.

---

## Lens 6 · Summary

| ID | Severity | Theme |
|----|----------|-------|
| F6-1 | ✅ pass | All 19 screen IDs exist; no orphans |
| F6-2 | ✅ pass | FLOWS array structure intact (45 entries) |
| F6-3 | ✅ pass | Demo nav covers all primary flows |
| F6-4 | ⚪ nit | Document valid state×substate combinations (OTP) |

**Clean lens.** State machine holds together as designed; no broken
routes, no orphan screens. Single doc-comment nit.

---

## Consolidated Findings (All Lenses)

| ID | Severity | Theme | Tier (suggested) |
|----|----------|-------|------------------|
| **F5-1** | 🔴 **blocker** | Global `outline: none` kills focus indicators (WCAG 2.4.7) | **Tier A** — fix before next share |
| F1-1 | 🟠 major | "Verification code" vs "one-time code" terminology drift | Tier A polish |
| F1-2 | 🟠 major | 5 different decline-CTA labels | Tier A polish |
| F4-1 | 🟠 major | Heading hierarchy mixed h1/h2 (2 internal contradictions) | Tier B refactor |
| F4-2 | 🟠 major | 5 competing alert/banner systems | Tier B refactor |
| F1-3 | 🟡 minor | Primary CTA source casing (combines with F4-4) | Tier B sweep |
| F1-4 | 🟡 minor | Period drift on instructional `<p>` | Tier B sweep |
| F1-5 | 🟡 minor | "Code expires in" period inconsistency | Tier C nit |
| F2-2 | 🟡 minor | Reset-success "Back to sign in" loses pre-fill | Tier B (post-state-layer) |
| F2-3 | 🟡 minor | Recovery-email-sent missing exit CTA | Tier B polish |
| F2-4 | 🟡 minor | Enroll-declined voice mismatch | Tier B (pairs with F1-2) |
| F3-2 | 🟡 minor | Demo-hint splits primary/secondary CTA pair | Tier C |
| F4-3 | 🟡 minor | Panel naming split BEM vs compound-name | Tier C |
| F4-4 | 🟡 minor | HTML source button casing (combines with F1-3) | Tier B sweep |
| F4-5 | 🟡 minor | Settings group heading asymmetry — verify intent | Tier C verify |
| F5-2 | 🟡 minor | `.text-field input` outline:none (bundled w/ F5-1) | Tier A bundled |
| F3-1 | ⚪ nit | Demo-hint pattern well-formed | — for the record |
| F3-3 | ⚪ nit | 2 hints / 7+ triggerable states by design | — for the record |
| F4-6 | ⚪ nit | One-off button classes verified legitimate | — for the record |
| F5-3 | ✅ pass | aria-live and aria-expanded properly managed | — |
| F5-4 | ⚪ nit | aria-hidden on decorative SVGs consistent | — |
| F6-1 | ✅ pass | All 19 screen IDs exist | — |
| F6-2 | ✅ pass | FLOWS array structure intact | — |
| F6-3 | ✅ pass | Demo nav coverage | — |
| F6-4 | ⚪ nit | Document valid OTP state×substate combos | Tier C |
| F2-1 | ✅ pass | Terminal screens cover right outcomes | — |

### Recommended action grouping

**Tier A (before next share — single PR):**
- F5-1 + F5-2 — restore focus indicators (one CSS change, ~10 lines)
- F1-1 — sweep "verification code" → "one-time code" across OTP flow (~6 strings)
- F1-2 — standardize decline-CTA on `Not now` + `Continue shopping` (~7 strings)

**Tier B (Wave-2 polish themes):**
- F4-1 — codify heading rule, sweep h1/h2 contradictions
- F4-2 — extract `.alert` base class, migrate 4 banner systems
- F1-3 + F4-4 — sentence-case sweep on button source text
- F1-4 — codify period rule for subtitle vs body, sweep
- F2-3 — add exit CTA to recovery-email-sent
- F2-4 — align enroll-declined voice with entry CTA
- F2-2 — pre-fill email on reset-success (post-state-layer)

**Tier C (notes-for-later):**
- F1-5, F3-2, F4-3, F4-5, F6-4 — small comments + verifications

---

**Pass complete.** 24 findings · 1 blocker · 4 majors · 12 minors · 4 nits · 5 passes.

Pause point: review the consolidated table above and assign each item to
Wave-2 / Wave-3 / out-of-scope. F5-1 should land on its own pre-Wave-2
hotfix branch given it's a single CSS change with WCAG impact.
