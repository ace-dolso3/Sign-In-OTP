# Review · Group 1 · Passkey / Face ID

**Reviewer pass date:** 2026-06-12
**Sub-flows reviewed:** 1a Happy Path · 1b Biometric Failed · 1c No Passkey Found · 1d–1g OS Native Sheets
**Sources cross-referenced:**

| Source | Status | Notes |
|---|---|---|
| `sign-in.html` (`FLOWS`, `SCREEN_DESCRIPTIONS`, screen markup) | Authoritative | Used as ground truth for resolving all drift |
| `user-flow-documentation.md` | Diverges (see Drift §1) | Cites `78:31` / `80:31` for 1a / 1b; those are simplified stripes, not the full flow frames |
| `figma-flow-gaps.md` | Agrees | Group 1 not flagged as gappy; "Home / signed-in destination" still open |
| `Sign In - Claude Design/flow-passkey-paths.jsx` | Stale (see Drift §2) | Original Claude Design intent — predates passkey-first chooser, dedicated recovery hub deprecation, and inline-banner pattern |
| `passkey_instructions.md` | Not re-read this pass | Re-check if a question depends on intent |
| `figma-export/screenshots/` | Agrees with prototype | Captured PNGs match prototype state |
| Live Figma file `IDuYbd4aYwGsFgo6c3ThVX` (Figma MCP) | Diverges (see Issues #1, #2, #3) | Mockups inside flow frames have drifted from current prototype copy/layout |

---

## Summary

Group 1 is **structurally healthy and conceptually sound** — the passkey-first chooser, the failed-state in-place recovery, the inline-banner approach for "no passkey on this device", and the deprecation of the standalone recovery hub all align with current FIDO/WebAuthn UX guidance and reduce friction over the older designs in `flow-passkey-paths.jsx`. The prototype's copy in the failed state is genuinely good ("Your account is still secure — try again or use a different method.").

The biggest issues are **not in the prototype's behavior** — they're in the **Figma flow frames having drifted from the prototype** (stale copy, missing UI elements, misleading routing-tree). The Figma file is the team's communication artifact; right now it would lead a stakeholder or developer to ship the wrong thing on the failed and no-passkey-found flows. Those are the highest-priority fixes.

A handful of in-prototype microcopy and a11y nits round out the list.

---

## Source-drift report

### §1 — Doc-to-Figma node ID drift (cross-flow concern)

[user-flow-documentation.md](../user-flow-documentation.md) cites these node IDs for Group 1:

| Sub-flow | Doc cites | Figma reality |
|---|---|---|
| 1a Happy Path | `78:31` | `78:31` exists but is a **simplified step-arrow strip only**; the full flow with screen mockups is `198:36` (matches `FLOWS[passkey-happy].figmaUrl`) |
| 1b Biometric Failed | `80:31` | Same pattern — `80:31` is the strip; full flow is `198:44` |
| 1c No Passkey Found | `463:886` | ✓ Correct — this is the full flow (named `flow:passkey-not-found-v2` in Figma) |
| 1d–1g OS Native Sheets | `100:31`–`103:31` | The full flow page has equivalents at `198:63 / 198:68 / 198:73 / 198:78` (see Issue #4 — they're empty stubs) |

The `78:XX` / `80:XX` / `100:XX` / `103:XX` nodes appear to be from an earlier version of the Figma file (likely the "Flows page" predecessor). The current "Prototype Flows" canvas (`198:31`, the URL you sent) anchors everything at `198:XX`. **Recommend updating `user-flow-documentation.md` to cite the `198:XX` IDs** that the `FLOWS` array already uses, so the doc and prototype agree. Same drift will likely repeat in Groups 2–8.

### §2 — `flow-passkey-paths.jsx` is historical

The .jsx file in [Sign In - Claude Design/flow-passkey-paths.jsx](../Sign%20In%20-%20Claude%20Design/flow-passkey-paths.jsx) describes a passkey flow with:

- An auto-prompt "Signing you in…" pattern (no chooser).
- A dedicated `Passkey Not Found` screen with "Sign in from another device" CTA.
- A recovery-hub flow ending in identity verification + re-enroll prompt.

All three patterns have been **deliberately superseded** in the current prototype (passkey-first chooser, inline banner, in-method recovery). The .jsx is original ideation, not current truth. Treat that whole folder as historical — useful for understanding what was tried and discarded, not as a source of "what should be." Worth a single-line note at the top of those .jsx files saying so.

### §3 — Group 7 deprecation sanity check ✓

Confirmed in `sign-in.html`:
- `screen-recovery` and `screen-reenroll` markup exists (L3436, L3473) and `setRecoveryState()` is wired (L5033) — but **only reachable via the screens-nav button**. No `FLOWS` entry uses them.
- The `Recovery Email Setup` FLOWS group at L5529 is **different** — it's settings-side recovery-email registration (post-login), not the deprecated recovery hub.
- Doc claim that the recovery hub is no longer wired into any user flow is **accurate**.

---

## Strengths (keep)

1. **Passkey-first chooser is gated by device state.** `screen-chooser:passkey-first` only appears when a credential is detected, so users who can't use Face ID never see a CTA they can't satisfy. (FIDO best practice; reduces failed-attempt anxiety.)
2. **Failed-state copy is reassuring.** "Your account is still secure — try again or use a different method." (`sign-in.html` L4591) is non-blaming, security-confidence-building, and gives clear next actions. Best microcopy in the group.
3. **In-place recovery from failure.** The `failed` state keeps the user on the passkey screen and surfaces Password + OTP fallback tiles inline. No back-tracking, no lost context. (Nielsen N3, N5.)
4. **Inline banner pattern for "no passkey on this device".** Returning to the chooser with a banner instead of routing to a dead-end screen is the right call. The chooser already has every realistic forward path. (Replaces the deprecated `screen-passkey:notfound` correctly.)
5. **Cross-device passkey entry is a first-class chooser tile** ("Scan with Phone"). Users on a new desktop can sign in with their phone's passkey in one tap from entry. (Big win over the .jsx pattern of hiding it behind a Passkey Not Found screen.)
6. **`aria-live="polite"`** on the chooser banner ([sign-in.html L2680](../sign-in.html#L2680)) means screen-reader users will hear the no-passkey explanation when they land back on the chooser. ✓ WCAG 4.1.3.

---

## Issues

Severity legend: **Blocker** = ship-stopping · **Major** = noticeable user/stakeholder impact · **Minor** = polish · **Nit** = trivial.

### Issue 1 · Figma `198:36` (1a Happy Path) idle screen is missing the cross-device button — **Major** (Figma-side)

**Lens:** Cross-flow consistency.
**Where:** Figma frame `198:36`, second screen ("Use Face ID to sign in").
**Drift:** Frame `463:886` (1c) shows the same `screen-passkey:idle` state with a "Use a passkey from another device" button between USE FACE ID and SIGN IN ANOTHER WAY. Frame `198:36` shows the same screen *without* that button.
**Why it matters:** The prototype CSS (`#screen-passkey[data-passkey-state="idle"] .passkey-cd-btn { display: flex; }`, [L1003](../sign-in.html#L1003)) shows the cross-device button in **all** idle states — not conditionally. So 1c is correct and 1a is stale.
**Risk:** A stakeholder reviewing 1a would think the cross-device button doesn't appear on the happy path. If a dev rebuilt to match Figma 1a, they'd remove a working entry point.

### Issue 2 · Figma `198:44` (1b Biometric Failed) failed-state subtitle is wrong copy — **Major** (Figma-side)

**Lens:** Microcopy & tone, source-of-truth alignment.
**Where:** Figma frame `198:44`, third screen ("Face ID could not sign you in").
**Drift:** The Figma mockup shows the subtitle "Your device will prompt you to authenticate" — that's the **idle** state's helper text. Prototype actually renders "Your account is still secure — try again or use a different method." (`sign-in.html` L4591).
**Why it matters:** "Your device will prompt you to authenticate" right after a failure is misleading and slightly contradictory; the prototype's actual copy is significantly better. The Figma is selling the team short.

### Issue 3 · Figma `463:886` (1c No Passkey Found) routing tree is misleading on the Face ID branch — **Major** (Figma-side)

**Lens:** Cross-flow consistency, behavioral accuracy.
**Where:** Figma frame `463:898` ("Branch B-v2: No Passkey Found — Decision Fork"), Face ID tile branch.
**Drift:** The decision-fork tree shows tapping the Face ID tile from the chooser-with-banner state routes to **Passkey Enrollment**. In the prototype, the user is **not yet authenticated** at this point (they failed the passkey lookup), so they cannot enter the Passkey Enrollment flow — that's a post-login event. Tapping Face ID would re-trigger WebAuthn and most likely return `no-credential` again.
**Why it matters:** This is a logic error visible to anyone reading the flow. It implies a path that isn't possible.
**Sub-finding:** Banner copy says "Sign in with your password or a one-time code below" — but the chooser still shows Face ID and Scan with Phone tiles. The banner narrows the user's mental model to two methods when four are visible. Either:
  - (a) the banner copy should acknowledge all available alternatives, or
  - (b) the Face ID tile should be visually de-emphasized (or hidden) when this banner is shown.

### Issue 4 · OS Native Sheet frames `198:63 / 68 / 73 / 78` are empty stubs — **Minor** (Figma-side)

**Lens:** Cross-flow consistency, stakeholder communication.
**Where:** Figma frames for 1d–1g OS sheet variants. Each is a 426×334 frame containing a single 346×200 empty rounded-rectangle and a label.
**Drift:** The doc ([user-flow-documentation.md](../user-flow-documentation.md), Group 1d–1g) describes these as "included in Figma as reference for the complete user journey" — but the frames don't actually contain any reference UI. They're "Platform UI handles auth (design in Figma)" placeholders.
**Recommendation:** Either populate with Apple's WebAuthn passkey sheet mockup + Android Credential Manager mockup (publicly available in their HIGs), or strip them from the flow page and update the doc to say "OS-owned, intentionally not included." Empty rectangles invite the question "is this a TODO?"

### Issue 5 · Failed-state heading uses red type — **Minor** (Prototype + Figma)

**Lens:** Auth-specific best practices, microcopy & tone.
**Where:** `screen-passkey:failed` — heading "Face ID Could Not Sign You In" in red.
**Concern:** Apple and Google passkey UX guidance both treat retryable biometric failures (wrong angle, wet finger, partial cover) as **neutral** events, not warnings — they're more common than not. Reserving red for this state risks anxiety on a benign event. Compare: the OS-native iOS Face ID dialog never goes red on a single failure.
**Suggestion:** Try heading in default text color, with the icon ring / accent doing the visual signaling (which the prototype already does via `data-state="error"` on `.biometric-ring`). Reserve red for terminal states (account-locked, etc.).
**Note:** The prototype's reassuring subtitle ("Your account is still secure...") does soften the red, so this is a polish issue, not blocking.

### Issue 6 · Title-case vs. sentence-case heading inconsistency — **Nit** (Prototype + Figma)

**Lens:** Microcopy & tone, cross-flow consistency.
**Where:**
- Prototype `failed` title: **"Face ID Could Not Sign You In"** (Title Case) — `sign-in.html` L4590.
- Prototype `idle` title: **"Use Face ID to sign in"** (sentence case) — L4585.
- Figma `198:44`: **"Face ID could not sign you in"** (sentence case).

**Concern:** The two prototype titles use different case conventions on the same screen across states. Pick one; sentence case is the modern convention (Material 3, HIG) and is what Figma already uses.
**Recommendation:** Sentence case across all biometric headings: "Face ID could not sign you in" / "Use Face ID to sign in" / "You're signed in".

### Issue 7 · Banner color may read as warning, not info — **Nit** (Prototype + Figma)

**Lens:** Mobile-first interaction, WCAG 1.4.1 (use of color), microcopy & tone.
**Where:** `chooser-banner` on `screen-chooser:default[data-chooser-banner="passkey-not-found"]`.
**Concern:** The banner uses an amber/tan background with an info-circle icon. Visually it sits between "informational" and "warning". Users may anxiously interpret a warning where the message is actually neutral context ("no passkey here, no big deal — pick another method").
**Recommendation:** Either re-skin to a clearer neutral/info palette (cool gray, light blue) or replace the icon with the info-circle outline and shift copy from "No passkey on this device" to "Tip: this device doesn't have Face ID set up yet — sign in another way and we'll offer setup after."

### Issue 8 · Reduced-motion handling on the biometric ring — **Question / Minor** (Prototype)

**Lens:** WCAG 2.2 (2.3.3 Animation from Interactions), mobile-first.
**Where:** `.biometric-ring` animation across idle/error/success states (`sign-in.html` ~L880–L900).
**Question:** I didn't confirm whether the ring's pulse/rotation respects `prefers-reduced-motion: reduce`. WCAG 2.3.3 (AAA) and best practice (AA-adjacent for vestibular safety) say motion-driven status indicators should pause or simplify under that media query.
**Action:** Verify there's a `@media (prefers-reduced-motion: reduce) { .biometric-ring { animation: none; } }` rule, or add one. If the icon is the only motion, a static icon swap is sufficient.

### Issue 9 · No "signed in" destination — **Major** (Cross-cutting, already tracked)

**Lens:** Auth best practices.
**Where:** Group 1a step 4 (and 1c, 2a, 3a, 4a). Already noted as a known gap in [user-flow-documentation.md](../user-flow-documentation.md) "Remaining Gaps" table.
**Why bring it up here:** Without a signed-in destination, the success state of `screen-passkey` ("You're signed in / Welcome back to Ace Hardware", L4612) is the de-facto terminal state. That's fine for a prototype, but it makes session timeout, post-login banners, and the "you're now signed in across all Ace properties" cross-device messaging unverifiable. Pull this forward into the synthesis backlog.

---

## Recommendations (1:1 with issues)

| # | Recommendation | Surface | Effort |
|---|---|---|---|
| 1 | In Figma `198:36`, update the `Passkey (idle)` screen mockup to include the "Use a passkey from another device" button (use the layout from `463:886`). | Figma | Low (re-capture from prototype) |
| 2 | In Figma `198:44`, update the failed-state subtitle to match the prototype's actual copy: "Your account is still secure — try again or use a different method." | Figma | Low |
| 3a | Remove or correct the "Passkey Enrollment" branch from the `463:898` decision fork. The Face ID tile from this state re-attempts WebAuthn — it does **not** route to enrollment. | Figma | Low |
| 3b | Decide: revise banner copy to acknowledge all 4 alternatives, **or** de-emphasize / hide the Face ID tile in this banner state. (Recommend revising copy — keep the tile available since cross-device sign-in via "Scan with Phone" is a real path even with no local passkey.) | Prototype + Figma | Low–Medium |
| 4 | Either populate the OS-sheet frames with reference UI from Apple/Google HIG, or strip them from the flow page and explicitly mark them OS-owned in the doc. | Figma + Doc | Low |
| 5 | Move failed-state heading off red — keep red for terminal states only. The ring icon + reassuring subtitle already carry the signal. | Prototype + Figma | Low |
| 6 | Standardize biometric headings to **sentence case** across all states. | Prototype + Figma | Low |
| 7 | Re-skin `chooser-banner` to neutral/info palette, soften copy to acknowledge it's a tip, not a problem. | Prototype + Figma | Low |
| 8 | Confirm or add `prefers-reduced-motion` handling on `.biometric-ring`. | Prototype | Low |
| 9 | Add a "Signed in" destination screen — track in synthesis backlog. | Prototype + Figma | Medium |

> No prototype changes during review per the agreed cadence. Recommendations 5, 6, 7, 8 will be implementation-side; 1, 2, 3a, 4 will require a re-capture-then-Figma-upload cycle once approved.

---

## Open questions

1. **Doc node-ID convention.** Should `user-flow-documentation.md` cite the `198:XX` flow-frame IDs (current canvas, what `FLOWS` already uses) or keep the legacy `78:XX` / `80:XX` references? Recommend the former — single source of truth.
2. **Cross-device entry duplication.** "Scan with Phone" is a chooser tile **and** a button inside the passkey idle screen. Is that intentional progressive discovery, or one-too-many entry points? (I'd keep both — the tile is for users who chose it deliberately; the inline button captures users who tried Face ID first and want to pivot without backing out.)
3. **OS-sheet mockups.** Populate with reference assets, or strip and mark OS-owned in the doc? Stripping is cleaner; populating helps non-engineering stakeholders visualize the full ceremony.
4. **Banner severity.** Is the amber/tan styling deliberate (existing Ace color system, want it to feel like a polite alert) or copy-pasted from a warning component? If the former, sentence-case the copy at minimum.
5. **The Sign In - Claude Design/ folder.** Is it actively referenced by anyone today, or is it quietly fossilized? If it's dead, a one-line "ARCHIVE — original ideation, see prototype for current truth" header would prevent future rabbit-holing.

---

## Cross-flow notes (for synthesis)

- **Doc-to-Figma node ID drift will likely repeat in Groups 2–8.** Whatever resolution we pick for Group 1 should be applied uniformly. (Tracked in Open question 1.)
- **Microcopy convention** (sentence case vs. title case) — pin down a global rule now; it'll come up again on the password, OTP, reset, and settings screens.
- **Banner palette / iconography** for "neutral context" vs. "warning" will recur on OTP "code resent", password "wrong password", and reset "rate limited" screens. Consider documenting the rule once.
- **Reduced-motion audit** is worth doing across all animated rings, spinners, and timer rings (passkey idle, OTP timer, QR expiry).
- **Sign-in destination gap** affects every happy path. Single shared destination (or sign-in toast pattern) would close 5 flows at once.
- **The Sign In - Claude Design/ folder is stale across the board.** Don't re-read it in Groups 2–8 unless we're explicitly mining for "what was considered and rejected."

---

## What was inspected

- Figma frames pulled live via MCP: `78:31`, `80:31`, `463:886`, `198:31` (parent), `198:36`, `198:44`. Screenshots saved temporarily under `.review-tmp/group-1/`.
- `sign-in.html`: `FLOWS` array (L5183+), `SCREEN_DESCRIPTIONS` (L4278+), `screen-chooser` markup (L2671–2826), `screen-passkey` markup (L2829–2978), passkey state machine (L4585–4614), CSS state rules (L880–1019), nav definitions (L3903–3996).
- `user-flow-documentation.md`: Groups 1, 7 sections.
- `figma-flow-gaps.md`: full read.
- `Sign In - Claude Design/flow-passkey-paths.jsx`: full read (confirmed stale).
- `figma-export/screenshots/`: visual reference (no read needed; manifest matched prototype).
