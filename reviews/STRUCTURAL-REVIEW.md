# Structural Review (Chunk 8)

**Status:** Cross-flow JTBD / IA-level review across all 7 groups (G1, G2, G3, G4, G5, G6, G8). No code changes. Companion to the seven `group-N-*.md` execution-level reviews and the 23-theme [CROSS-FLOW-LEDGER.md](CROSS-FLOW-LEDGER.md).

**Purpose:** The per-chunk reviews evaluated *how each flow is built*. This pass evaluates *whether each flow should exist in its current shape* — JTBD lens, IA rethinks, strategic alternatives, cross-flow redundancy. Findings here are intentionally bigger and slower than Tier A/B/C patches; they reshape the surface area Phase 3 then implements against.

**Ownership rules** (per Plan v6)
- Per-group `group-N-*.md` files are frozen execution snapshots.
- This file (`STRUCTURAL-REVIEW.md`) is a peer doc, not a retrofit.
- SYNTHESIS.md will merge both streams into Tier A/B/C waves.
- Recommendations here typically land as **Tier B (redesign)**, not Tier A (patch). A few that are smaller in implementation but bigger in implication are flagged as **Tier B → unblocks Tier A**.
- Anything genuinely out-of-scope parks in `figma-flow-gaps.md`.

**Pre-filed anchors** (from per-group reviews)
- **18a** Terminus after a security-elevating action succeeds — G5 + G6
- **18b** Email enumeration on Forgot Password — G6
- **18c** Modal-vs-panel for confirmations — G8
- **18d** Activity-log action-affordance scope — G8
- **18e** Recovery Email's place in Settings IA — G8

These five are addressed first (Part A). Five additional structural questions surfaced reading the seven reviews together (Part B). Part C maps the cascade — which Tier A/B items each structural decision unlocks. Part D parks items deliberately.

---

## Part A · Pre-filed structural items

### A1 · Terminus after a security-elevating action succeeds (18a)

**Question:** When a user completes an action that elevates account security (enrolling a passkey, resetting a password), what is the terminal state? Auto sign-in into the home destination, or explicit re-authentication?

**The disagreement**

| Source | G5 (Passkey enrollment success) | G6 (Password reset success) |
|---|---|---|
| Figma annotation | 3-CTA flat prompt: Set Up / Maybe Later / Don't Ask Again. Terminus = "User is authenticated, returns to where they were." | `339:653/654`: "User is automatically signed in. **All other sessions logged out.**" |
| Doc | (silent on terminus mechanism) | "User signs back in with the new password" — explicit re-auth |
| Prototype | 2-step decline (`Maybe Later` → suppressed screen). Success terminus: `enroll-continue-btn` → `alert('✓ Passkey saved...')` (Theme 18 stub). | `reset-success-signin-btn` "SIGN IN NOW" → `screen-chooser` (explicit re-auth, but mislabeled) |

**Why this is structural, not a copy fix**

The two flows make incompatible security claims:
- **Auto sign-in** says: *"because you completed this elevation, your session is trusted."* The actor proved they hold a credential.
- **Explicit re-auth** says: *"because the credential reaching this completion may have arrived on a shared device (email link), the session is not yet trusted."*

Both arguments are legitimate **for different threat models.** The right answer depends on:
- How the credential reached this point (in-band: WebAuthn ceremony — high trust; out-of-band: emailed link — variable trust)
- Whether the device is recognized
- Whether session sign-out elsewhere is part of the policy ("changed your password? other devices logged out")

**Options**

| Option | Description | Trade-off |
|---|---|---|
| **A** Auto sign-in everywhere | All security-elevating actions terminate signed-in. Maximum velocity. | Reset-via-email becomes a session bootstrap if the email is compromised. |
| **B** Explicit re-auth everywhere | All security-elevating actions terminate at chooser/sign-in. Maximum safety. | Friction; users completing passkey enrollment in-session shouldn't have to re-prove. |
| **C** Per-action policy | Enrollment auto sign-in (already authenticated); password reset explicit re-auth (out-of-band credential). | Two patterns — needs a clear rule for future actions. |
| **D** Trust-based policy | Decision driven by `(device-recognized × in-band-or-out)` matrix. Recognized device + in-band → auto. Anything else → re-auth. | More implementation, but most defensible model. |

**Recommendation: Option C as the lock-in for v1**, with Option D documented as the v2 evolution path.

**Rationale:**
- Option A is wrong: password reset originates from email, which can land on a shared/compromised device. The "all other sessions logged out" line in Figma `339:654` is a backend policy that doesn't *require* auto sign-in — log other sessions out AND explicit re-auth.
- Option B is wrong: passkey enrollment runs *in* an authenticated session. Forcing re-auth after enrollment is anti-velocity for no security gain.
- Option C captures the asymmetry: the bright-line rule is **"was the credential provided in-band (this same session) or out-of-band (email link, SMS code)?"**
  - In-band → auto sign-in (or stay-signed-in).
  - Out-of-band → explicit re-auth.
- Option D is the right v2 — but needs device-trust telemetry the prototype doesn't model yet.

**House rule (v1):**
> When a security-elevating action completes, the user is **signed in iff** the credential that completed the action was provided **in this same session**. Otherwise, the action terminates at sign-in (chooser) with an inline confirmation toast: *"Password updated. Sign in to continue."*

**Coupling**
- Unblocks G6 Issue 6 (Tier A): `reset-success-signin-btn` keeps its "SIGN IN NOW" label and chooser route — *and* the chooser receives a confirmation toast on landing (toast component already on the Wave 1 list).
- Aligns G5 enrollment-success terminus (Theme 18 alert → toast over the still-authenticated screen): *"Passkey saved."* Stay where you are.
- Establishes the rule for future actions (e.g., changing recovery email — out-of-band-verified, so terminus = sign-out-other-sessions but stay signed in; recovery email is *additive*, not credential-replacing).

**Tier:** **B (decides), unblocks Tier A** in G5 + G6 + future settings-change flows.

---

### A2 · Email enumeration on Forgot Password (18b)

**Question:** When a user submits an unrecognized email on the Forgot Password screen, do we tell them?

**The disagreement (G6 only — but it's a four-way contradiction)**

| Source | Position |
|---|---|
| Figma wireframe `198:335` | **Inline error:** "We couldn't find an account with that email address." (UI exists; designed; rendered.) |
| Figma annotation on same node | "Security requirement: never confirm whether an email is registered (prevents enumeration)." |
| `user-flow-documentation.md` | Treats the error as **intentional** UX for the multi-email-address case — user has multiple emails on file, may try the wrong one. |
| Prototype | Matches the wireframe: inline error visible. Forced 2-tap simulation (Theme 10 worst flavor). |

**OWASP context (V2.1.12 / V2.2.4 of ASVS):** Authentication entry points should not disclose whether an account exists. The classic enumeration vector is the password-reset form, exactly because it's typically less rate-limited than the sign-in form. The compensating UX cost is real: a user with multiple emails legitimately doesn't know which email is on file.

**Why it's structural**

This isn't *just* a copy fix. The decision shapes:
- The success/failure surface on Forgot Password (one screen for both, or two?)
- What email actually gets sent when the address isn't found (nothing? a "someone tried to reset your password but you don't have an account" notice? — that's even worse for enumeration)
- Whether the prototype's `screen-reset-sent` is "we sent an email" (definitive) or "if an account exists, you'll receive an email" (non-confirming)
- Whether the chooser screen also reveals account existence (it doesn't today — sign-in errors there are ambiguous-by-construction; consistency with reset is the question)

**Options**

| Option | Description | Trade-off |
|---|---|---|
| **A** Confirm-on-not-found | Current prototype/wireframe behavior. Tell the user the email isn't on file. | Enumeration disclosure. Multi-email users get clarity. |
| **B** Non-confirming success | Always show "If an account exists with that email, we sent a reset link." Never confirm. | Enumeration-safe. Ambiguous for typo'd emails. Industry standard. |
| **C** Hybrid: rate-limit + soft-confirm | First N attempts get Option B (non-confirming). After M unique emails per IP per window, throttle. | Safer than A, more useful than B at low traffic. Requires backend state. |
| **D** Identifier-prove first | User must prove identity (OTP to a known email) before reset can be requested. | Highest security; highest friction; rarely shipped. |

**Recommendation: Option B (non-confirming success)** as the v1 lock-in. **Reject the doc's "intentional" framing**; respect the Figma annotation; replace the wireframe.

**Rationale:**
- The doc's argument (multi-email UX) is real but small. The threat model (password-reset enumeration) is industry-known and ASVS-covered. The cost-benefit is one-sided.
- Multi-email users are still served well by Option B: if they typed the wrong email, the missing email never arrives → they try a different email. Slightly slower than Option A; not broken.
- Auth UX has converged on Option B (Apple, Google, GitHub, Stripe, AWS). Deviating requires a stronger reason than "multi-email convenience."
- Option C/D are bigger investments for marginal gain over B.

**House rule (v1):**
> Forgot Password always terminates at `screen-reset-sent` with copy: *"If an account exists for **{email}**, we've sent a password-reset link. It expires in 15 minutes."* No inline "not found" error. The submit handler accepts any well-formed email. If the email isn't on file, the backend silently does nothing (or sends a "no account" courtesy email — separate decision, doesn't change the UX).

**Coupling**
- Removes G6 Issue 1 from Tier A (the "not-found" panel goes away — it's no longer a UX state).
- Removes the `reset-wrong-email-link` mismatch (G6 Issue 7) by removing its reason to exist.
- Keeps Theme 10's forced-2-tap as a demo question — but the demo target shifts: instead of toggling to a "not-found" panel, the demo controls toggle simulated states like "rate-limited" and "valid + sent."
- Eliminates one of the two `screen-reset-sent` body-copy variants. Clean simplification.

**Tier:** **B (decides), unblocks Tier A** in G6 (removes 2 Tier A items by removing their UI).

---

### A3 · Modal-vs-panel for confirmations (18c)

**Question:** When the user takes a destructive or irreversible action and we want to confirm, do we open a modal (overlay over the current screen) or replace the screen with a confirmation panel?

**The disagreement (G8 only — but the precedent applies cross-flow)**

| Surface | Mechanism |
|---|---|
| `screen-active-devices` sign-out | **Modal** (`#signout-modal` with backdrop, `role="dialog"`, `aria-modal="true"`, focus management) |
| `screen-settings-passkeys` rename / remove / remove-last | **Panel-replacement** (`data-settings-state` attribute swaps the whole-screen content) |
| (Future likely actions) Disable 2FA, remove recovery email, delete account, log out everywhere | TBD — needs a rule |

**Why it's structural**

- Modal preserves *list context*: user sees the item they're acting on while confirming. ("Remove iPhone 15 Pro?" — and the iPhone 15 Pro row is still visible behind the dim.) For lists where multiple items look similar, this prevents misclick errors (Nielsen #5).
- Panel is simpler markup, simpler state machine, no overlay z-index dance, no focus trap requirement, no backdrop-click semantics, no Escape handler. Easier to ship correctly.
- A11y cost is asymmetric: a *correct* modal is harder than a panel. The G8 `signout-modal` is the prototype's only modal and it still has gaps (no focus trap, no Escape handler, no focus return on close).
- Cross-flow consistency is the user's mental model: if some destructive actions overlay and others screen-replace, the user is doing the work of figuring out what kind of system this is.

**Options**

| Option | Description | Trade-off |
|---|---|---|
| **A** Modals everywhere | Any destructive confirmation is a modal. Promote the G8 sign-out modal to a reusable component, close the AAA gaps. | One a11y investment buys consistency. Still needs done-right. |
| **B** Panels everywhere | Convert `signout-modal` to a panel-replacement. Same `data-settings-state` shape used in passkey rename/remove. | Simpler. Loses list-context. |
| **C** Modal for "kept item is removed" / panel for "kept item is mutated" | Removal/destruction = modal (preserves list context for "which one"). Mutation in place (rename, edit) = panel. | A defensible rule. Two patterns to maintain. |
| **D** Modal for global / panel for in-context | If the action affects something not visible on the current surface (e.g., "log out of all devices everywhere"), modal. Otherwise, panel. | Hard to apply consistently. |

**Recommendation: Option C** with the AAA modal investment.

**Rationale:**
- The user-research argument for modal-on-destruction is strong: list of similar items, easy to misclick, modal lets the user verify *which* one they're confirming. Sign-out and remove-passkey both fit. (Remove-Last is unique — there's only one passkey, so it's not a list-misclick risk; modal still works fine.)
- Rename is in-context mutation: the user just typed the new name, the affirmation is "save it"; there's no "did I pick the right item" question. Panel is the right shape.
- This rule scales cleanly: "Disable 2FA" → modal (reverses a state, list-context is "which method"). "Edit profile" → panel (in-place mutation).
- A11y investment is one-time. Build the modal component AAA-correctly (focus trap, Escape, focus return, `aria-describedby`, backdrop click), reuse for rename/remove and any future action that fits the rule.

**House rule (v1):**
> **Modal** for confirmations of *destructive or state-reversing* actions on a list item or named entity. **Panel** for confirmations of *in-place mutations* (rename, edit, update value). When in doubt, modal.

**Coupling**
- Wave 1 builds the canonical modal component (closes G8 Issue 10 gaps + replaces passkey remove/remove-last panels with modals).
- G8 Issue 1 (Theme 21 stub data-mutation) becomes simpler: the modal confirm button is the mutation entry point.
- Settings rename stays a panel — Issue 1's rename-save fix is unchanged.
- Active-devices sign-out modal stays a modal — needs the AAA gap-closing pass.
- A future "Delete Account" lands as modal (destructive) with type-to-confirm input — out of scope, but the pattern fits.

**Tier:** **B (component), couples to multiple Tier A items.**

---

### A4 · Activity-log action-affordance scope (18d)

**Question:** Is the activity log read-only with actions deferred to other screens (current intent), or does it surface anomaly-recovery actions inline?

**The disagreement (G8)**

- Doc 8b: *"The log is read-only — actions live on the active devices screen."*
- Reality: the activity log lists *historical* sign-ins, including from devices that may no longer be in the active-devices list. So "actions live on the active devices screen" only works for the subset of activity rows that are currently active sessions.
- For a suspicious *historical* sign-in (e.g., "May 18 · Chicago · Edge · Password"), the right actions are: **change password + review enrolled passkeys** — neither of which is on the active-devices screen.
- The user has to mentally transcribe the suspicious row, navigate elsewhere, and find the right action with no hand-off.

**Why it's structural**

The doc's "read-only" framing is a *clarity* argument (clean log surface). The defect is that the framing breaks down for the most important user-job the log serves: *"is anything here not me?"* If the user can't act on a suspicious row, the log's value collapses to passive auditing.

This connects to the broader question: **what is the JTBD of the activity log?**
- (a) **Audit transparency** — "show me everything for compliance/peace-of-mind" — read-only is fine.
- (b) **Anomaly response** — "something feels off; help me lock it down" — read-only isn't fine.
- (c) **Both** — most users come for (a) but a non-trivial minority arrive in (b) state, and the cost of being wrong about (b) is high (account compromise).

**Options**

| Option | Description | Trade-off |
|---|---|---|
| **A** Read-only (current) | No inline actions. User self-routes. | Clean. Fails (b) job. |
| **B** Inline action menu per row | "Don't recognize this?" link → mini action sheet (change password / sign out everywhere / review passkeys). | Crowded UI. Best for (b) job. |
| **C** Page-level action footer | Single "Something looks wrong?" button at the bottom of the log opens the same action sheet. | Less visual noise; still discoverable. |
| **D** Conditional inline action | Only suspicious-flagged rows get an inline action (e.g., new device or new location). Backend signal required. | Best UX; depends on backend. |

**Recommendation: Option C for v1, Option D for v2.**

**Rationale:**
- Option A loses the (b) job. Not acceptable for a security surface.
- Option B per-row is the "right" answer in isolation but adds visual weight to every row, distracting from the audit-scan use case.
- Option C buys the (b) job at near-zero cost to the (a) job. One button. One sheet. Doesn't change row layout.
- Option D requires server-side anomaly classification (new IP, new geo, new fingerprint, password-after-passkey, etc.) — a v2 investment. The Option C action sheet becomes the natural in-row action when the v2 signal arrives.

**House rule (v1):**
> Activity log is primarily read-only. Bottom-of-log button: **Something doesn't look right?** → action sheet:
> - Change my password (routes to forgot-password with email pre-filled)
> - Sign out everywhere except this device (routes to active-devices `#device-signout-all-btn`)
> - Review my passkeys (routes to passkey list)

**Coupling**
- Demotes G8 Issue 5 from "Tier B unresolved" to "Tier B with concrete spec."
- Cross-couples to G6 (forgot-password): the "from activity-log" entry needs `email` query param plumbing.
- Couples to G8 Issue 7 (silent self-disable on `activity-load-more-btn`): pair the cleanup — the action footer makes the load-more button less necessary.

**Tier:** **B (UX architecture), couples to G6 Tier A in pre-fill plumbing.**

---

### A5 · Recovery Email's place in Settings IA (18e)

**Question:** Where does "Recovery Email" live in the Settings IA?

**The disagreement (G8)**

- Prototype implements Recovery Email as a row on the Sign-In & Security hub, between Passkeys and Recent Sign-In Activity (L3099).
- `user-flow-documentation.md` Group 8 § doesn't mention it at all (Theme 23 — whole-flow doc gap).
- Figma `463:475` exists for the enrollment but isn't anchored under Group 8 in the doc's IA description.

**The bigger IA question:** the Sign-In & Security hub today flat-lists four categories without grouping:
1. Passkeys (sign-in method)
2. Recovery Email (recovery vector — *not* a sign-in method)
3. Recent Sign-In Activity (audit surface)
4. Trusted Devices (audit surface)

Three different jobs, one flat list. As features grow (2FA toggles, security questions, magic-link settings, login alerts), the flat list will compound.

**Why it's structural**

This is an IA decision, not a labeling choice. The hub is the front door for every account-security action; getting the grouping right now prevents a years-long drift.

**Options**

| Option | Description | Trade-off |
|---|---|---|
| **A** Keep flat list | Add Recovery Email to doc, no other change. | Doesn't scale. |
| **B** Two sections: "Sign-in methods" + "Account security" | Passkeys + Recovery Email under "Sign-in methods" (since recovery is the path back to a working sign-in); Activity + Devices under "Account security" (audit). | Recovery isn't a sign-in *method* — it's a way to *recover* one. Mis-grouping. |
| **C** Three sections: "How you sign in" + "Account recovery" + "Account activity" | Passkeys (+ future: Password, OTP toggle) under "How you sign in"; Recovery Email under "Account recovery"; Activity + Devices under "Account activity". | Future-scaling structure. Three sections feels heavy at v1. |
| **D** Two sections: "Sign-in & recovery" + "Account activity" | Passkeys + Recovery Email under "Sign-in & recovery" (related-but-distinct, hub-grouped); Activity + Devices under "Account activity". | Compromise: respects job-distinction without splintering. |

**Recommendation: Option D for v1, with the section name "Sign-in & recovery" — Option C is the v2 evolution if more recovery vectors are added (security questions, recovery codes).**

**Rationale:**
- Option A doesn't scale and abdicates the IA decision.
- Option B is conceptually wrong (recovery email is not a sign-in method) and is the IA the hub already has — flat with implicit groupings.
- Option C is right but heavy at v1 with only one item per "Sign-in" and "Recovery" section.
- Option D pairs the two security-credential features under one heading, distinguishing them from the audit surfaces. As more sign-in methods/recovery vectors are added, the section can split (becoming Option C).

**House rule (v1):**
> Sign-In & Security hub structure:
> - **Sign-in & recovery** § — Passkeys, Recovery Email
> - **Account activity** § — Recent Sign-In Activity (with "View all" → activity log), Trusted Devices (with "Manage" → active devices)

This also resolves a smaller IA question: the hub currently has both "Trusted Devices" (a read-only summary) and a separate "Active Devices" (the action surface). Two device concepts on one screen is confusing. The Option D structure makes the hub-row clearly an audit summary with a "Manage" action, not a separate concept.

**Coupling**
- Resolves G8 Issue 2 (whole-flow doc gap) via doc update for both Recovery Email and the section structure.
- Cleans up the "trusted devices vs active devices" labeling without making it a Tier A item — under Option D, both are read-only summaries on the hub, both link to the same active-devices screen.
- Couples to A4 (activity-log scope) — both decisions reshape the same hub.

**Tier:** **B (IA + doc), unblocks Tier B doc consolidation.**

---

## Part B · Additional structural questions surfaced during the pass

These five emerged reading the seven group reviews together. Each is a question whose right answer would simplify multiple flows, not just one.

### B1 · Method-first vs identifier-first front door

**Question:** Should the chooser collect the user's email *before* showing methods (identifier-first), or after (method-first)?

**Current shape:** Method-first. `screen-chooser` shows four method tiles (Face ID/Passkey, Password, OTP, Scan with Phone) with no email field; the user picks a method, then enters identifier on the method-specific screen.

**Industry context:**
- **Identifier-first** (Google, Apple, Microsoft, Auth0 default): collect email first, server returns method hints (passkey known? account locked? SSO?), route accordingly. Fewer wrong-method dead-ends.
- **Method-first** (Stripe legacy, some banks): show all methods upfront, user self-selects. More choice, more dead-ends ("I tried passkey, no passkey on this device, now I have to pick again").
- **Hybrid** (Amazon, eBay): collect identifier first, *then* show methods filtered to what the account supports.

**Evidence from the seven reviews that this matters:**
- **G1** has multiple "no passkey on this device" failure surfaces (chooser banner, idle screen, fallback tile list) because the user landed on passkey without knowing whether they have one.
- **G2** had two undocumented entry points to cross-device passkey because the method-first front door creates redundant routes.
- **G3** has `pwAttempts` lockout logic on a screen the user might not have meant to land on.
- **G4** has `screen-otp-no-access` (Theme 11 gold-standard) precisely because the user picked OTP and discovered they couldn't receive it.
- **G6** has the email-enumeration question (A2) entirely because reset is a *separate* method-first surface — identifier-first would unify reset with sign-in.

Each of these dead-ends costs 2–4 screens of recovery UX. Identifier-first prevents most of them by routing to the right method the first time.

**Options**

| Option | Description | Trade-off |
|---|---|---|
| **A** Stay method-first | No change. Keep chooser as today. | All current dead-end surfaces retained. |
| **B** Identifier-first (full) | Email field on chooser → server returns method hints → render method tiles filtered to supported. | Largest restructure. Highest UX win. Server work needed. |
| **C** Identifier-first (lite, client only) | Email field on chooser → progressive enhancement (WebAuthn `conditionalMediation`, browser autofill of saved passkey) → only show "Use a different way" expander if user opts out. | Smaller restructure; capture most of the value via browser-side discovery. No new server contract. |
| **D** "Continue" pattern (Stripe) | Chooser is a single email field with "Continue" button. Methods are decided on the next screen based on what the account has. | Identical to B in flow shape, different visual. |

**Recommendation: Option C for v1.** Capture identifier-first benefits without re-platforming the backend.

**Rationale:**
- Option A leaves five known dead-ends untreated.
- Option B is the right v2 destination but is large and depends on server work outside the prototype's scope.
- Option C is implementable in the prototype today: chooser collects email, browser does conditional-mediation passkey discovery (zero-tap autofill if a passkey exists), `tile-passkey` becomes opt-in for users without a passkey, `tile-cd-chooser` collapses into "Use a passkey on another device" under the passkey tile (resolves G2's undocumented entry-point ambiguity).
- Option D is the same as B in flow shape; B/D is a UI-detail debate.

**Sketch of v1 chooser shape:**
```
Sign In
[ email field with "Continue" ]
  ↓ (browser tries passkey via conditionalMediation in background)
[ Use Face ID or passkey on this device   ⇲ ]   ← if passkey detected, primary
[ Use a passkey on another device          ⇲ ]   ← cross-device collapsed in
[ Use password                              ⇲ ]
[ Send a one-time code                      ⇲ ]
```

After identifier entered: `screen-chooser` renders with email pre-filled at top, methods listed with the most-likely method floated to top.

**Coupling**
- Eliminates Theme 16 (multiple undocumented entry points) by unifying the cross-device entry under passkey.
- Reshapes Theme 8 destination work: the post-sign-in toast becomes "Welcome back, *{firstName}*" (we know identity).
- Reduces the surface area for Theme 18 (alert stubs) by removing two of the dead-end no-passkey/no-OTP screens that currently terminate at alerts.
- Eliminates G3's silent-input acceptance defect (one input field with browser-validated email = no need for sentinel-input games).
- Couples to A2: identifier-first reset = the reset CTA appears under the email field after a failed sign-in, not as a method-tile competing with sign-in.

**Tier:** **B (large redesign), unblocks ≥5 Tier A items across G1, G2, G3, G6.**

---

### B2 · `screen-otp` and `screen-verify` — collapse, sequence, or sequence-with-shared-component?

**Question:** OTP today is two screens: `screen-otp` (collect identifier, choose delivery, send code) and `screen-verify` (enter code). Is that the right shape?

**Current state**
- `screen-otp` (L3782): "Sign In" / "Send a verification code to sign in" / Email input / Delivery method tiles (email/SMS) / SEND CODE.
- `screen-verify` (L2602): "Welcome Back" / "Please enter the verification code we sent to ***-924" / 6 OTP inputs / VERIFY (with state-shifted labels: Resend Code, Sign In With Password, etc. — Theme 14 instance).

**Why this is structural**

Two screens for one conceptual flow ("get code → enter code") makes sense **only** if the gap between sending and entering is non-trivial:
- The user must leave the device to fetch the code (SMS to a different phone, email on another device).
- The user is allowed to come back later (deep link from email).

Both are real cases. But they don't justify *two screens* — they justify a single screen that **transitions in place** between the "request" and "enter" sub-states.

Compare to G6's password reset, which uses two distinct screens (`screen-forgot-password` for request → `screen-reset-sent` for confirmation) — and *that's* arguably also one screen with two states. The pattern repeats.

**Symptoms of the two-screen choice today:**
- G4 has Theme 17 issues across two screens (timer values on `screen-verify` ≠ TTL on `screen-otp`).
- "Welcome Back" heading on `screen-verify` (G4 Issue 8 — Title Case greeting on a mid-task verify screen) is awkward exactly because the user *just was on `screen-otp`*. They didn't go anywhere.
- Theme 8 (signed-in destination) has separate stubs on each.

**Options**

| Option | Description | Trade-off |
|---|---|---|
| **A** Two screens (current) | Keep separate `screen-otp` and `screen-verify`. | Inertia. All current bugs retained. |
| **B** Single screen, two `data-otp-state` panels | One `screen-otp` with `data-otp-state="request"` and `data-otp-state="entered"`. State swap, no nav. | Cleanly models "still on the same screen." Smaller code. |
| **C** Inline expansion within an identifier-first chooser (B1 dependency) | Email already on chooser; OTP becomes a "Send code" action inline; code entry expands inline below. No screen at all. | Most compact. Requires B1. |

**Recommendation: Option B for v1, Option C if B1 ships.**

**Rationale:**
- Option A's hidden cost is real: two screens means two sets of microcopy, two sets of timer states, two breadcrumbs, two error-shapes. Theme 17 ⊕ Theme 14 ⊕ Theme 8 each has one more instance because of this split.
- Option B is purely a refactor: same ARIA, same handlers, fewer screens. Eliminates the "Welcome Back" greeting awkwardness — the user is on the same screen, the heading reads "Sign In with one-time code" throughout.
- Option C is the most JTBD-aligned shape but requires B1.

**Coupling**
- Removes Theme 17 instances on the `screen-verify` ↔ `screen-otp` boundary (one source of truth for the TTL).
- Removes the "Welcome Back" heading question (G4 Issue 8).
- Pairs cleanly with the Theme 14 DOM-textContent pattern — state swap drives label changes, no pseudo-element CSS hacks.
- If B1 ships first, this collapses further into Option C.

**Tier:** **B (refactor), removes 3+ Tier A items in G4.**

---

### B3 · Demo control surface — one drawer or per-screen sentinels?

**Question:** Theme 12 (demo simulate-buttons leak into UI) has six divergent flavors across the seven flows. Is the right answer per-screen toggles, or a single global "demo mode" surface?

**Catalog of current demo mechanisms**
| Group | Mechanism | Visibility |
|---|---|---|
| G1 | (No demo toggle — passkey states reachable only via screens-nav side panel) | Hidden |
| G2 | (No demo toggle — QR failures reachable only via screens-nav) | Hidden |
| G3 | `pwAttempts` button-tap counter; `reset-simulate-link-btn` ("I received the link →") | Inline button leaks to UI |
| G4 | `screen-otp-no-access` reachable via screens-nav; verify-state controlled by sentinel input ("expired" / "locked") | Hidden + sentinel |
| G5 | `?enroll=success|error` URL param | Invisible to testers |
| G6 | Forced 2-tap (every user) on `reset-send-btn` for the not-found state | Invisible, mis-leading |
| G8 | `activity-load-more-btn` silent self-disable | Visible but ambiguous |
| All | "screens-nav" side panel for direct screen access | Visible, comprehensive, off to the side |

**The pattern:** every group has a different demo mechanism. A usability-test participant who Googles their way around the prototype gets seven different signals, none of which look like demo controls.

**Why this is structural**

The demo-control problem is real even after Tier A polish: this is a *prototype*, not a production app, and stakeholders/testers need a way to navigate failure paths. The per-screen-sentinel pattern (G3, G4, G6) creates the worst defect — testers mistake demo behavior for canonical UX (G6 Issue 1 is the textbook case).

**Options**

| Option | Description | Trade-off |
|---|---|---|
| **A** Per-screen sentinels (current — divergent) | Keep what's there. | Six patterns. No consolidation. |
| **B** Per-screen sentinels (consolidated) | One sentinel pattern across all screens (e.g., type "fail" in any input → simulated failure). | Consistent; still per-screen. Still hides the demo nature. |
| **C** Global "demo controls" drawer | A floating panel (top-right) with a dropdown for each screen's possible states. Toggle it; the screen reflects. | Visible, comprehensive. One implementation. |
| **D** screens-nav becomes the canonical demo surface | Promote the existing side-panel "screens-nav" into the formal demo control. Add per-screen state pickers. | Builds on existing infrastructure. |

**Recommendation: Option D**, evolving the existing `screens-nav` panel.

**Rationale:**
- Option A is the status quo defect.
- Option B reduces variance but doesn't solve discoverability — testers still don't know the mechanism exists.
- Option C is good but introduces a new UI element competing with the existing side panel.
- Option D extends what's already there: the screens-nav side panel today shows screen IDs and lets you jump between them. Add a per-screen state picker (e.g., on `screen-otp`, the panel shows: state = `default | sent | expired | wrong | locked`). One existing surface, expanded.

**House rule (v1):**
> Remove every per-screen demo-control hack: forced 2-tap, sentinel inputs, URL params, simulate-buttons in the main UI. The screens-nav side panel becomes the only demo control surface, with a per-screen state dropdown.

**Coupling**
- Resolves Theme 10 (validation/state-transition gaps) by removing the per-screen hacks (the validation can become real or be absent — the demo control covers both).
- Resolves Theme 12 (demo controls in UI) by collapsing all flavors into one canonical surface.
- Resolves G3 Issue 11 (`reset-simulate-link-btn`) by moving simulate-link into screens-nav.
- Cleans up G8 Issue 7 (`activity-load-more-btn` silent self-disable) by removing the demo button entirely.

**Tier:** **B (consolidation), removes ≥6 Tier A items.**

---

### B4 · Single canonical signed-in destination (Theme 8 root cause)

**Question:** What is the canonical "you're signed in now" destination, and what does it look like?

**Current state:** Theme 8 has 8 confirmed instances of missing signed-in destinations across G1, G3, G4, G5, G6, G8. The mechanism varies (alert, navigation to chooser, silent navigation, missing toast); the *defect is identical*: the prototype doesn't model "post-sign-in" as a place.

**Why it's structural**

The lack of a canonical destination is symptomatic of a deeper question: **what does "signed in" mean for Ace?**
- Is it a return to a `home`/`account-overview` screen? (Most retail apps.)
- Is it a return to wherever the user came from (origin-route)? (Cart-abandonment patterns.)
- Is it a cross-property handoff ("you're now signed in across all Ace properties")? (Brand alignment.)
- Is it a non-destination — a banner overlay on whatever screen they were already on? (Authentication as a side-effect, not a journey.)

The seven flow reviews each invented their own answer (alert / chooser / navigation-to-chooser-with-mislabeled-button / nothing). Without a structural answer, every Tier A "fix" is local guesswork.

**Options**

| Option | Description | Trade-off |
|---|---|---|
| **A** Origin-route: return to whatever surface initiated the sign-in (home, cart, product, settings) + a non-blocking toast | Most retail. Respects user intent. | Requires origin tracking. Toast is "Welcome back, *{firstName}*". |
| **B** Single home destination: always land on `screen-account-home` | Simplest. Doesn't respect origin intent. | Anti-velocity for users mid-task elsewhere. |
| **C** Hybrid: origin-route for in-app, home for marketing-link entries | Best of both. Adds branching logic. | Two paths. |
| **D** Modal overlay: sign-in completes as a modal close + toast over the underlying surface | Sign-in *never* navigates. Pure overlay. | Most user-friendly; biggest refactor. Requires sign-in to be invoked from any surface, not its own surface. |

**Recommendation: Option A for v1, with Option D as v2 evolution.**

**Rationale:**
- Sign-in is rarely a destination in itself. The user came to Ace to do something; sign-in is a tax. Returning to whatever they were doing respects that.
- Option B is wrong for retail — a user who clicked "buy" from a product page and got bounced into sign-in needs to land back at "buy," not on the account dashboard.
- Option C is fine but the branching is over-engineering at v1.
- Option D is the right v2 — modal sign-in over the originating surface — but requires the sign-in to be invokable from any surface, which is a bigger change than v1 wants.

**House rule (v1):**
> Sign-in completes by **routing back to the origin surface** (the page/state that triggered the sign-in flow), with a 4-second non-blocking toast: *"Welcome back, *{firstName}*."* If origin is unknown (direct sign-in from Ace homepage), default to `account-home`.

The prototype implements this as a `signInOrigin` variable analogous to G5's `enrollOrigin` — same mechanism, just a different post-action target.

**Coupling**
- Closes 8 Theme 8 instances in one mechanism.
- Couples directly to A1 (terminus): `signInOrigin` is set when entering sign-in; A1's "in-band vs out-of-band" rule decides whether the post-elevation action returns there or routes to chooser.
- Pairs with the Wave 1 toast component (Theme 18 + A3 modal pattern + Theme 8 destination — three problems, one component).

**Tier:** **B (architecture), unblocks 8 Tier A items.**

---

### B5 · "Sign in another way" — a back-to-chooser, or a recovery hub?

**Question:** When a user fails or escapes a chosen method (Face ID didn't work, OTP didn't arrive, password forgotten), the current pattern routes them back to the chooser to pick again. Is that the right shape, or should it route to a *recovery hub*?

**Current state:**
- G4 `screen-verify` and `screen-otp` have a `SIGN IN ANOTHER WAY` button → goes to `screen-chooser`.
- G2 failure states have the same button → `screen-chooser`.
- G1 `screen-passkey:failed` has inline tile fallbacks → goes to method directly (different pattern).
- G6 `screen-forgot-password:rate-limited` has `BACK TO SIGN IN` → `screen-chooser`.

The user-experience cost: after a method failure, "back to chooser" is a *choice*, not *help*. A user whose Face ID failed is frustrated and looking for resolution; presenting them with the same four method tiles asks them to diagnose what went wrong themselves.

**Industry comparison:**
- **Apple ID** uses a "Trouble signing in?" pattern that routes to a structured recovery flow (recover password / recover account / contact support) rather than the chooser.
- **Google** does conditional routing — failed passkey routes to OTP automatically, failed OTP routes to "try a backup method."

**Why it's structural**

The current shape implicitly says "the user is the diagnostician." A recovery hub says "we'll help you find a working path." For a security flow, the second is materially better UX and reduces the support-contact rate.

**Options**

| Option | Description | Trade-off |
|---|---|---|
| **A** Keep chooser as the universal fallback | No change. | All current dead-end recovery UX retained. |
| **B** Add `screen-recovery-hub` as a new surface | After 2 method failures, route to a hub: "Trouble signing in?" + diagnostic options (try different method, reset password, recover passkey, contact support). | New screen. Strong (b)-job (recovery). |
| **C** Per-method conditional routing | Failed Face ID → suggests OTP (next-best). Failed OTP → suggests password. Failed password → suggests reset. Method-by-method. | More personalization; complex rules. |
| **D** Promote G7-deprecated `screen-recovery` from legacy to v1 | The original prototype had a recovery hub. It was deprecated. Re-promote with refreshed UX. | Reuses existing markup. Recovers a deprecated surface. |

**Recommendation: Option B for v1, with Option D as the implementation route — refresh the legacy `screen-recovery` rather than build new.**

**Rationale:**
- Option A is the status quo defect.
- Option B fixes the (b)-job hole. Routing rule: after the user explicitly hits "Sign In Another Way" twice, OR after a method-specific terminal state (locked, no-access, expired-after-retry), present the recovery hub.
- Option C is *better* UX but requires per-method routing tables that won't be consistent across test scenarios.
- Option D recovers a real prior investment (the original `screen-recovery` markup) that the team already designed.

**House rule (v1):**
> "Sign In Another Way" routes to chooser the first time, recovery hub on subsequent failures. Recovery hub presents:
> - Try a different sign-in method (back to chooser, with a banner explaining what was tried)
> - I forgot my password (routes to forgot-password)
> - I lost my passkey / phone (routes to passkey-recovery — TBD)
> - Contact account support (today: stub; v2: real handoff)

**Coupling**
- Couples to G7 (deprecated) — promote `screen-recovery` from legacy to v1, which sanity-resolves the Group 7 question.
- Couples to A1 (terminus) — the "lost passkey" path is itself a security-elevating action with terminus rules.
- Closes G4 Issue 12 (Contact Account Support `alert()` stub) by giving it a real surface (the recovery hub).

**Tier:** **B (new surface), unblocks Theme 11 + closes G7 question.**

---

## Part C · Implication map — how structural decisions cascade to Tier A/B

Each row reads: *"Once this structural item is decided, the following Tier A/B work either becomes mechanical, becomes simpler, becomes unnecessary, or gets unblocked."*

| Structural item | Mechanical (just do it) | Simpler | Unnecessary | Unblocks |
|---|---|---|---|---|
| **A1** Terminus rule | G6 Issue 6 button label | G5 enrollment terminus | — | Future settings-change actions |
| **A2** Email enumeration → non-confirming | — | G6 reset flow (collapses 2 panels) | G6 Issue 1 + Issue 7 (no UI) | Identifier-first sign-in (B1) |
| **A3** Modal-vs-panel rule | G8 modal AAA gaps | G8 rename/remove handlers | — | Future destructive actions |
| **A4** Activity-log scope | "Something doesn't look right?" footer | — | — | Cross-flow pre-fill plumbing |
| **A5** Recovery Email IA | Hub re-section | Doc consolidation | — | Future recovery vector additions |
| **B1** Identifier-first | — | G3 + G4 + G6 entry surfaces | Theme 16 entry-point ambiguity | A2 simplification |
| **B2** OTP collapse | G4 Issue 8 heading | Theme 17 OTP timer drift | One screen | B3 demo-control surface |
| **B3** Demo control drawer | — | All Theme 10 + 12 flavors | G3 Issue 11 + G8 Issue 7 + G6 Issue 1 (forced 2-tap is gone) | Honest UX testing |
| **B4** Origin-route destination | — | All 8 Theme 8 instances | "Welcome Back" heading questions | Cross-property handoff (v2) |
| **B5** Recovery hub | G4 Issue 12 stub | "Sign In Another Way" routing | Some Theme 11 ambiguity | G7 (deprecated → restored) |

### Wave-1 batches that cleanly fall out

If A1 + A2 + A3 + A4 + A5 + B4 land at **synthesis** (Phase 2) before Wave 1 implementation, the Wave 1 implementation list becomes unusually clean:

1. **Toast component** (used by A1 termini, A3 modal-confirm result, B4 destination, Theme 18 alert replacement) — **one component closes 4 themes**.
2. **Modal component** (per A3) with AAA-correct dialog — **opens the destructive-action confirmation pattern**.
3. **Origin tracking** (`signInOrigin` analogous to G5's `enrollOrigin`) — **closes Theme 8 entirely**.
4. **Hub re-section** in G8 (per A5) + doc consolidation for Recovery Email — **closes Theme 23**.
5. **Stub-mutation handler fixes** (Theme 21 — passkey rename/remove) — **uses the modal + toast components from items 1–2**.

The other Wave 1 items (case consolidation, breadcrumb-tappable, lockout-countdown helper, banner-palette tokens) are smaller and parallel.

---

## Part D · Items deliberately not resolved here

These came up during the pass but are out-of-scope for v1 structural decisions. They're noted for future cycles or for `figma-flow-gaps.md`.

1. **Modal sign-in over the originating surface (Option D in B4)** — v2 architecture pattern.
2. **Backend-driven anomaly classification (Option D in A4)** — requires server-side signals.
3. **"Lost device / lost both factors" recovery path** — referenced in B5 but out of scope; requires KYC/identity-proof flow design.
4. **Cross-property session model** — "you're signed in across all Ace properties" is a brand promise; the auth surface implies it but the prototype doesn't model multi-property session sync. A real product question, not a UX-flow question. Park.
5. **Conditional WebAuthn mediation (the technical lever for B1 Option C)** — implementation detail; goes into Phase 3 Wave 1 spec, not a structural decision in itself.
6. **Method-tile inventory** — should "Face ID/Passkey" and "Scan with Phone" be separate tiles or one with a sub-option? B1 dissolves this question; only relevant if B1 is rejected.
7. **Account creation flow** — referenced from chooser ("Don't have an account? Create an Account") but not part of the seven groups reviewed. Out of scope.
8. **Active sessions on the Sign-In & Security hub** — current "Trusted Devices" + "Active Devices" duplication is partially resolved by A5 but the broader "what is the canonical session-management surface" question exceeds it. Park unless it recurs.

---

## Part E · Decisions to ratify at synthesis

Phase 2 SYNTHESIS.md will roll Part A + Part B into the Wave 1/2/3 backlog. The synthesis is gated on **explicit ratification of the recommendations in this file**, in the following order (each unblocks the next):

1. **A1 Terminus rule** (Option C: in-band auto / out-of-band re-auth)
2. **A2 Email enumeration** (Option B: non-confirming)
3. **B4 Origin-route destination** (Option A: origin + toast, with `signInOrigin`)
4. **A3 Modal-vs-panel rule** (Option C: modal for destructive, panel for in-place)
5. **A5 Recovery Email IA** (Option D: "Sign-in & recovery" + "Account activity")
6. **A4 Activity-log scope** (Option C: "Something doesn't look right?" footer)
7. **B2 OTP collapse** (Option B: single screen, two states)
8. **B3 Demo-control drawer** (Option D: extend screens-nav)
9. **B5 Recovery hub** (Option B/D: promote legacy `screen-recovery`)
10. **B1 Identifier-first** (Option C: client-side conditionalMediation) — **biggest single decision**

Items 1–4 are tight, well-scoped decisions with clear Wave 1 implications.

Item 5–6 are IA decisions that affect the Settings group only.

Items 7–9 are refactors/component additions.

Item 10 (B1) is the largest and reshapes the most flows; it's listed last so the smaller ones don't gate on it. If B1 is deferred to v2, items 1–9 still stand and Wave 1 still ships.

---

*Chunk 8 of 8 in the per-group review pass. Phase 1 complete. Next: Phase 2 SYNTHESIS — merges 23 ledger themes + 5 Part-A items + 5 Part-B items + Implication map → Tier A/B/C waves with ratified positions.*

---

## Ratification (2026-06-12)

All 10 recommendations (A1–A5 + B1–B5) ratified as drafted. Phase 2 SYNTHESIS proceeds against these positions.

**Phase 3 directive (added at ratification):** When implementing in Figma, **build the fresh flow groups in a new column** of the Figma file, parallel to the existing flow groups. **Do not overwrite or replace the original flow groups.** Preserve `198:36/87/137/185/266/310/389` and the `421:2` set in their current state as the historical "before" reference; the new structurally-revised flows occupy a new column anchored at a fresh node-ID range.

This affects:
- The Phase 3 capture/upload sequence in `figma-export/CAPTURE-AND-UPLOAD.md` (target node IDs become net-new, not replacements).
- The Figma file's structural shape — gains a "v2 / structural revision" column alongside the existing flow columns.
- Theme 7 / Tier C re-capture: the *originals* are not re-captured. Only the new column is populated. The doc's node-ID table grows with new entries, doesn't replace existing ones.
