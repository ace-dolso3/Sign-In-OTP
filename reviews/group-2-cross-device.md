# Group 2 · Cross-Device Passkey Sign-In — Review

**Scope:** Sub-flows 2a–2e · 5 sub-flows · screens involved: `screen-chooser` (4-tile default), `screen-passkey` (states: `idle`, `cross-device`, `cross-device-failed`, `cross-device-no-credential`, `cross-device-transport-error`), `screen-passkey-enroll`.

**Figma frames reviewed (live):**

| Sub-flow | Doc node ID | **Live node ID** | Local cache |
|---|---|---|---|
| 2a Happy Path — Cross-Device via QR | `116:31` | `198:87` (`flow:cross-happy`) | `.review-tmp/group-2/2a-198-87.png` |
| 2b QR Code Expired | `120:31` | `198:98` | `.review-tmp/group-2/2b-198-98.png` |
| 2c No Passkey on Phone | `123:31` | `198:106` | `.review-tmp/group-2/2c-198-106.png` |
| 2d Bluetooth / Proximity Error | `126:31` | `198:114` | `.review-tmp/group-2/2d-198-114.png` |
| 2e Transport Error Fork | `183:31` | `198:122` | `.review-tmp/group-2/2e-198-122.png` |

**Cross-references walked:** `user-flow-documentation.md` Group 2 §, lines 119–217; `sign-in.html` FLOWS L5246–5293; `screen-passkey` HTML L2840–2970 (cross-device + 3 error sub-areas); state-machine `setPasskeyState` L4602–4640; QR-cancel/refresh handlers L4770–4790; `passkey-cd-btn` handler L4967; `passkey_instructions.md`; `Sign In - Claude Design/flow-passkey-paths.jsx` (ARCHIVE-headered today); `figma-flow-gaps.md`; Figma MCP live (this session).

---

## Summary (1-paragraph health check)

**Group 2's information design is the cleanest of any group reviewed so far.** All three failure states (`cross-device-failed`/expired, `cross-device-no-credential`/no-passkey-on-phone, `cross-device-transport-error`/Bluetooth) have *distinct, diagnostic copy* that tells the user exactly what went wrong and what they can do — a deliberate departure from the lazy "Something went wrong" pattern. The transport-error copy is gold-standard. **However:** the same architectural hole as G3 + G4 returns (QR happy path always ends in success — the timer never actually counts down, and no failure state is reachable in normal flow). And there's a **3-way drift** on QR validity: the doc says ~2 minutes, the Figma annotation says ~3 minutes, and the prototype hardcodes "2:00" — three numbers, three sources, one truth needed. New themes added to the ledger: **multiple entry points to a single destination not documented** (Theme 16) and **time-display value drift across sources** (Theme 17).

---

## Source-drift report

| Doc says | Reality | Severity |
|---|---|---|
| Figma `116:31` (2a) | Live frame is `198:87` (`flow:cross-happy`) | Tier B (doc update) |
| Figma `120:31` (2b) | `198:98` | Tier B |
| Figma `123:31` (2c) | `198:106` | Tier B |
| Figma `126:31` (2d) | `198:114` | Tier B |
| Figma `183:31` (2e) | `198:122` | Tier B |
| Doc 2a: "QR session has a short validity window (approximately 2 minutes)" | **Figma annotation says "~3 minutes"; prototype hardcodes "2:00"** — 3 different values across 3 sources | **Tier B (decide canonical) + Tier A (replace hardcoded text) + Tier C (re-capture Figma)** — see Issue 1 |
| Doc 2a Step 1: "User is on a device without a saved passkey" + Step 2: "Use a passkey from another device" option visible. User taps it. | Prototype actually has **two entry paths**: (a) `tile-cd-chooser` "Scan with Phone" tile from chooser — direct to QR (skips passkey-idle); (b) Face ID/Passkey tile → passkey-idle → tap "Use a passkey from another device" → QR (matches doc). | Tier B (doc update) — see Issue 6 |
| Doc 2a Step 6: "Authenticated → home — ❌ Missing" | Confirmed missing — same as Theme 8 across all happy paths | resolved (existing theme) |
| Doc 2c "phone connected but reported it has no passkey" | Prototype copy: "The phone you scanned with doesn't have a passkey saved for this account." Spot-on. | aligned |
| Figma 2a annotation: "Phone Biometric → Session Approved → Signed In" (3 invisible steps) | Prototype FLOWS: 4 visible screens (`screen-chooser` → `screen-passkey:idle` → `screen-passkey:cross-device` → `screen-passkey-enroll:prompt`) | aligned (Figma annotation correctly notes invisible OS-owned steps) |
| `Sign In - Claude Design/flow-passkey-paths.jsx` | Stale per archive policy (ARCHIVE header) | resolved |

---

## Strengths (keep)

- **Diagnostic error copy distinguishes 3 failure types.** Three failure states, three completely different reasons explained:
  - Expired (timer-only, no credential issue): "The QR code timed out. Generate a fresh one to continue."
  - No-credential (channel established, but no passkey): "The phone you scanned with doesn't have a passkey saved for this account. Try a different device or sign in another way."
  - Transport error (BLE handshake): "The Bluetooth connection between this device and your phone failed. Make sure both devices are nearby, Bluetooth is enabled, and try again."
  → **Each tells the user exactly what failed, why, and what to do.** This is the standard the rest of the app should match.
- **Each failure state has its own primary CTA verb** — `GENERATE NEW CODE` (timer fix) / `TRY A DIFFERENT DEVICE` (credential fix) / `TRY AGAIN` (transport fix) — verbs match the user's mental model of the problem.
- **All three failure states have consistent secondary fallback** (`SIGN IN ANOTHER WAY` → chooser). 3-tier escape pattern from G4 carries over: primary fix CTA + secondary alt-method CTA. (Note: only secondary CTA, not the full 3-tier with text-link tertiary — see Issue 5.)
- **`role="img"` + `aria-label="QR code — scan with your phone camera"`** on the QR box — better than implicit alt text. Screen-reader users get a usable description.
- **`aria-hidden="true"` on the QR's decorative SVG paths** — correct ARIA hygiene. Screen reader doesn't try to read the QR pattern.
- **Expired overlay uses muted gray** with stopwatch-with-cross icon, not red. Communicates "stale/dead" rather than "error/your fault" — psychologically gentler. Keep.
- **Cross-device CTA text on chooser** (`tile-cd-chooser`) reads "Scan with Phone" — consumer-friendly, avoids "passkey from another device" jargon at the top of the funnel. Good.
- **Failure-state hero icons use the same neutral container** (`.enroll-hero-icon`, gray on rgba background) — consistent visual treatment across all three failure modes.
- **`SIGN IN ANOTHER WAY`** as a tertiary always-on escape on every cross-device sub-state. No dead ends.
- **Cross-device flow ends at `screen-passkey-enroll:prompt`** — invites the user to enroll a local passkey post-auth. **Strategically smart:** they just proved they want passkey UX; this is the highest-conversion enrollment moment. Don't change.
- **`screen-chooser` 4-tile default** explicitly surfaces "Scan with Phone" as a peer of Face ID / Password / One-Time Code. Direct entry path for users who already know they're on a borrowed device.
- **Fork diagram in Figma 2e is properly drawn** — shows both retry-loop and switch-method outcomes. No "where do I go now?" ambiguity for stakeholders.

---

## Issues

> **Tier reminder (per plan v5):** A = local prototype fix queued for Phase 3 Wave 1 · B = cross-flow pattern queued for Phase 3 Wave 2 · C = Figma frame drift queued for Phase 3 Wave 3.

### Issue 1 · Major · 3-way value drift on QR validity window · **Tier B + Tier A + Tier C**

**Three sources, three different numbers:**

| Source | Says | Location |
|---|---|---|
| `user-flow-documentation.md` (Group 2 prose) | "approximately 2 minutes" | `user-flow-documentation.md` L131 |
| Figma 2a annotation strip | "**~3 minutes**" | `198:87` (also same on `198:96` — frame 3 mockup annotation) |
| Prototype HTML | "**2:00**" (hardcoded) | `sign-in.html` L2870: `Code expires in <strong>2:00</strong>` |

**Why this matters:** Cross-device auth has real timing constraints (BLE proximity windows, server-side caBLE token TTL, user attention spans). Picking a number is a real product decision; not picking one means three different stakeholders walk away with three different mental models. Also — see Issue 2 — the prototype's "2:00" is a *static label*, not a live timer, so the user sees the same "2:00" the whole time.

**Recommendation, three parts:**
- **Tier B (decide canonical):** Pick a value at synthesis. Recommend **2 minutes** — matches industry caBLE token TTLs, matches doc, matches prototype's existing copy. Avoids over-promising patience (3 min asks the user to sit and stare at a QR for too long).
- **Tier A (Phase 3 Wave 1):** Make the displayed value a single source of truth (e.g., `const QR_TTL_MS = 120_000` consumed by both copy and timer). See Issue 2 for the timer.
- **Tier C (Phase 3 Wave 3):** Re-capture 198:87 / 198:96 / 198:98 with corrected annotation.

---

### Issue 2 · Major · QR "expires in 2:00" is a static label, not a live countdown — and the QR never auto-expires · **Tier A**

**Location:** `sign-in.html` L2870 + state machine L4602.

```html
<p class="passkey-qr-expires">Code expires in <strong>2:00</strong></p>
```

```js
case 'cross-device':
  // Biometric hero + try-btn hidden via CSS; QR area shown
  break;
```

The text "2:00" is a fixed string. Nothing decrements it. Nothing transitions `cross-device` → `cross-device-failed` after a timeout. The expired state is only reachable via the bottom screens-nav. Same architectural issue as `pw-submit-btn` (G3) and `verify-btn` (G4) — just for **time** rather than **input value**.

**Recommendation:** Add a real countdown. Provisional sketch:
```js
let qrExpiryInterval = null;
function startQrCountdown() {
  let secs = QR_TTL_MS / 1000;
  const el = document.querySelector('.passkey-qr-expires strong');
  const tick = () => {
    if (secs <= 0) {
      clearInterval(qrExpiryInterval); qrExpiryInterval = null;
      setPasskeyState('cross-device-failed');
      return;
    }
    el.textContent = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
    secs--;
  };
  tick();
  qrExpiryInterval = setInterval(tick, 1000);
}
// Start on entering 'cross-device', clear on leaving any cross-device state.
```

This is the **second instance of Theme 10** (validation/state-transition gap), but specific to a *time* trigger rather than an *input* trigger. Worth grouping under the same Wave 1 batch — share helpers. **Pairs with Issue 1's "single source of truth" decision.**

---

### Issue 3 · Major · Retry CTAs (`GENERATE NEW CODE`, `TRY AGAIN`, `TRY A DIFFERENT DEVICE`) all just toggle state with no visible feedback · **Tier A**

**Location:** `sign-in.html` L4622, L4632, L4783.

```js
document.getElementById('passkey-transport-retry-btn').addEventListener('click', () => {
  setPasskeyState('cross-device');
});
document.getElementById('passkey-qr-retry-device-btn').addEventListener('click', () => {
  setPasskeyState('cross-device');
});
document.getElementById('passkey-qr-refresh-btn').addEventListener('click', () => {
  setPasskeyState('cross-device');
});
```

All three CTAs run the exact same operation: set state back to `cross-device`. The QR SVG is a hardcoded static SVG that never changes between renders. Same "2:00" label (Issue 2). User taps "GENERATE NEW CODE" and… sees the same QR. Mental model: *"Did anything happen?"*

This is OK for a wireframe-quality prototype, but as the live demo for a redesign that will be usability-tested, it will produce false negatives (testers will report "the regenerate button is broken").

**Recommendation:** Provide minimal visible feedback that retry actually happened. Cheapest options:
- **(a)** Pulse/scale the QR box briefly on re-enter (200ms). Cheap, accessible (skip if `prefers-reduced-motion`).
- **(b)** Subtitute one of two pre-baked QR SVG variants on re-render so the visual hash changes.
- **(c)** Show a 600ms "Generating new code…" spinner overlay before the QR appears.

Recommend (c) — also serves as an honest UX acknowledgment of network latency. Tier A.

---

### Issue 4 · Minor · QR-default-state fallback button labeled `CANCEL`; all other cross-device sub-states use `SIGN IN ANOTHER WAY` · **Tier A**

**Location:** `sign-in.html` L2871 vs L2882, L2895, L2935.

| State | Tertiary CTA label |
|---|---|
| `cross-device` (QR shown) | `CANCEL` |
| `cross-device-no-credential` | `SIGN IN ANOTHER WAY` |
| `cross-device-transport-error` | `SIGN IN ANOTHER WAY` |
| `cross-device-failed` (expired) | `SIGN IN ANOTHER WAY` |

Functionally all four buttons do the same thing: `setPasskeyState('idle') + switchScreen → screenChooser`. Different label for one outlier. The user mid-QR-scan reading "CANCEL" may interpret it as "cancel my sign-in attempt" (terminate); the others read as "use a different sign-in method" (continue). Words have weight.

**Recommendation:** Standardize to `SIGN IN ANOTHER WAY` for all four states. The user who genuinely wants to bail can use the global header back button (which already works). Tier A — single text replacement.

---

### Issue 5 · Minor · No "Back to sign in" tertiary text-link on cross-device sub-states (G4 has it, G2 doesn't) · **Tier B**

G4's `screen-otp-no-access` has a 3-path layout: primary CTA + secondary CTA + tertiary text-link "Back to sign in". G2's three failure states (`cross-device-failed`, `cross-device-no-credential`, `cross-device-transport-error`) have only **2 paths**: primary CTA + secondary `SIGN IN ANOTHER WAY` button. Both functionally cover the user's options, but the canonical 3-path pattern from Theme 11 has emerged as the gold standard.

**Note:** This may be a deliberate design choice — `cross-device` failure states already let users escape via secondary button + global back. Not a blocker. Flagging for synthesis: do we **want** uniform 3-tier-escape on every dead-end, or is 2-tier sufficient when the secondary button already returns to chooser?

**Recommendation:** Decide the rule at synthesis. Tier B. (Also flag: `passkey-fallback-options` on `screen-passkey:failed` from G1 has yet another pattern — secondary tile-list of methods inline. Three patterns total across the app for "after a failure, where do you go?" — pick one.)

---

### Issue 6 · Minor · Two undocumented entry paths to QR · **Tier B / Tier C**

Doc Group 2 §2a only documents:
> Step 1 `screen-chooser:default` · Step 2 `screen-passkey:idle` · Step 3 `screen-passkey:cross-device`

But the prototype actually has **two** entry paths to step 3:

| Path | Entry | Steps |
|---|---|---|
| **A · Direct** | Chooser tile `tile-cd-chooser` ("Scan with Phone") | chooser → cross-device QR (skips idle) |
| **B · Indirect** | Chooser tile `tile-passkey` (Face ID / Passkey) → idle screen → tap "Use a passkey from another device" link (`passkey-cd-btn`) | chooser → idle → cross-device QR |

Both terminate at the same state. Both are legitimate. **The doc only describes path B.** Figma 2a frame 1 renders the chooser with the "Scan with Phone" tile prominent (path A entry), then frame 2 shows passkey-idle (path B entry) — the diagram implies path B but path A is right there in frame 1. Mixed message.

**Recommendation:** Add a brief note to doc Group 2 §2a:
> *Two entry points exist: (a) directly via the "Scan with Phone" tile on the chooser, or (b) via the Face ID / Passkey tile then "Use a passkey from another device" on the idle screen. Both terminate at the QR step.*

Tier B (doc) + optional Tier C (Figma annotation update on 198:87 to disambiguate which path the diagram shows). No prototype change needed.

---

### Issue 7 · Minor · Heading + button case (theme-2 confirmation) · **Tier B**

| Surface | Heading | Buttons |
|---|---|---|
| QR default | "Scan with your phone" (sentence) | `CANCEL` (UPPER) |
| QR expired | "QR Code Expired" (Title) | `GENERATE NEW CODE` / `SIGN IN ANOTHER WAY` |
| No credential | "No Passkey on That Phone" (Title) | `TRY A DIFFERENT DEVICE` / `SIGN IN ANOTHER WAY` |
| Transport error | "Couldn't Connect to Phone" (Title) | `TRY AGAIN` / `SIGN IN ANOTHER WAY` |

QR default uses sentence case ("Scan with your phone"); all three failure states use Title Case. UPPERCASE buttons throughout. Same pattern as G3 + G4. **No new evidence — adding to Theme 2 row.** Tier B.

---

### Issue 8 · Minor · `cross-device-failed` is *the only* state in Group 2 that overlays an "Expired" badge directly on the QR, but the QR is also dimmed at 18% opacity — visually busy · **Tier B / Nit**

**Location:** `sign-in.html` L2899–2937.

The expired state shows the QR pattern at 18% opacity *plus* a centered overlay with stopwatch icon + "Expired" label. Functionally clear, but visually it's two redundant stale signals competing on top of each other. The other failure states (no-credential, transport-error) replace the QR with a clean error icon + heading — much calmer.

**Recommendation:** Consider replacing the dimmed QR + overlay with the same clean treatment as the other two failure states (gray icon + heading), or keep the dimmed QR but drop the overlay. Tier B at synthesis. (Counter-argument: the dimmed QR preserves spatial continuity — user knows they're "still on the QR screen, but it expired" rather than "moved to a different error" — defensible. Just flag it.)

---

### Issue 9 · Nit · `passkey-other-btn` is a duplicate of `passkey-fallback-options` on the failed state · **Tier B**

`screen-passkey:failed` (G1) shows:
- `passkey-fallback-options` (Password tile + One-Time Code tile, both with chevrons)
- `passkey-other-btn` ("SIGN IN ANOTHER WAY") underneath

These do almost the same thing: route to alternate method. The fallback tiles route directly (Password / OTP), the SIGN IN ANOTHER WAY button routes to the chooser (where the user picks). Three-deep redundancy if you count the global back button.

This is a **G1 observation surfaced again while reviewing G2's code path** — not a G2-specific issue. Adding to existing Theme 11 (escape-hatch patterns). Tier B at synthesis.

---

### Issue 10 · Nit · Comment about the deprecated `notfound` state at L4596 references G7-style behavior · **Tier B (info-only)**

Inside `setPasskeyState`:
> `// NOTE: the 'notfound' state has been removed. When no credential is discovered, the runtime now returns the user to the chooser with a "No passkey on this device" banner instead of morphing this screen into a fallback hub.`

This comment correctly documents an intentional decision and points future readers to the right handler. Strength, not an issue. Flagging only because it confirms G7 (deprecated recovery hub) is genuinely retired in code. Cross-references the Group 7 sanity-check from the original plan. ✅

---

## Open questions

1. **Q1 (Issue 1)** — Canonical QR validity: 2 min (recommend) vs 3 min (Figma annotation)?
2. **Q2 (Issue 2)** — Implement live countdown or keep static label? (Recommend live — needed for Issue 2 + Issue 3 to work.)
3. **Q3 (Issue 3)** — Visual feedback choice: pulse / SVG-swap / spinner? (Recommend spinner — also models real network delay.)
4. **Q4 (Issue 4)** — Replace `CANCEL` with `SIGN IN ANOTHER WAY` on QR default? (Recommend yes.)
5. **Q5 (Issue 5)** — Adopt 3-tier escape pattern uniformly? (Synthesis decision.)
6. **Q6 (Issue 8)** — Dimmed-QR-with-overlay vs clean-error-icon for expired? (Synthesis decision.)

---

## Cross-flow notes

| Theme | Group 2 contribution | Action |
|---|---|---|
| **Theme 1** · Doc-to-Figma node ID drift | 5 more entries (`116/120/123/126/183:31` → `198:87/98/106/114/122`) | Doc-update batch in Phase 3 Wave 3 |
| **Theme 2** · Heading + button case | All UPPERCASE buttons, mixed sentence/title headings — same as G3/G4 | Phase 2 synthesis |
| **Theme 3** · Banner palette | No new banners introduced; G2 uses icon-in-container pattern instead. **Worth flagging at synthesis:** "icon container" (G2) vs "amber banner" (G1) vs "alert strip" (G4) — three patterns for "passive informational state" | Phase 2 synthesis |
| **Theme 4** · Failed-state heading color | G2 uses **neutral dark gray** for all failure-state headings ("Couldn't Connect to Phone", "No Passkey on That Phone", "QR Code Expired"). **Working precedent** that contradicts G1's red treatment. Stronger evidence for "red = terminal only" rule. | Phase 2 — cite G2 as canonical |
| **Theme 5** · Reduced-motion audit | Confirmed: QR is static SVG, no animation. No new entries — but Issue 3's recommended spinner/pulse must respect `prefers-reduced-motion`. | Phase 3 Wave 1 |
| **Theme 8** · Signed-in destination missing | Confirmed in 2a Step 6 — same hole as G1 Issue 9 | Phase 2 synthesis |
| **Theme 10** · Validation logic gaps | Confirmed: QR has no countdown timer (time-based variant of the same gap). G3 = input-trigger; G4 = button-tap-counter; G2 = time-trigger. Wave 1 should batch all three under a shared "state-transition fidelity" pass. | Phase 3 Wave 1 |
| **Theme 11** · Missing back/cancel/escape-hatch | G2 has secondary CTAs but no tertiary text-link tier. Multiple patterns now in evidence (G1 fallback tiles, G4 3-tier, G2 2-tier). Synthesis must pick one. | Phase 2 synthesis |
| **Theme 14** · CSS-pseudo-element labels invisible in Figma | No new instances in G2. | — |
| **Theme 15** · Time-scale presentation inconsistency | G2 contributes "2:00" (numeric, doesn't actually count down) — fits the same "make M:SS pad to two digits" rule (`02:00`, not `2:00`). Confirms the rule. | Phase 2 synthesis |
| **NEW · Theme 16** · Multiple undocumented entry points to a state | G2 has two entry paths to QR (`tile-cd-chooser` direct + `passkey-cd-btn` via idle); doc only describes one. Likely recurs in Settings (Group 8) — multiple ways to reach the passkey-management screen. | Phase 2 synthesis |
| **NEW · Theme 17** · Time-display value drift across sources | G2 supplies the first hard instance: doc "2 min" / Figma "3 min" / prototype "2:00". Pattern likely recurs (lockout windows, code-resend cooldowns, code TTLs). | Phase 2 synthesis — single source of truth per timer |

---

## Tier A queue (deferred to Phase 3 Wave 1)

| # | Description | Effort | Cross-flow? |
|---|---|---|---|
| 1c | Replace hardcoded "2:00" string with constant-driven copy | XS | Pairs with Theme 17 source-of-truth refactor |
| 2 | Implement live QR countdown + auto-transition to `cross-device-failed` | M | Pairs with G3 + G4 Wave 1 batch (Theme 10) |
| 3 | Visible feedback for retry/regenerate/try-different-device CTAs (recommend 600ms spinner) | S | Localized; respect `prefers-reduced-motion` (Theme 5) |
| 4 | Standardize `CANCEL` → `SIGN IN ANOTHER WAY` on QR default | XS | Localized text |

## Tier B queue (Phase 3 Wave 2 — cross-flow patterns)

- Theme 2 · Heading + button case (more evidence)
- Theme 3 · "Passive informational state" pattern unification (G1 banner / G2 icon-container / G4 alert strip)
- Theme 4 · Strengthens "red = terminal only" rule with G2 precedent
- Theme 11 · Pick one escape-hatch pattern (G1 fallback tiles vs G2 2-tier vs G4 3-tier)
- Theme 16 · Doc multiple entry points where they exist
- Theme 17 · Single source of truth for every visible time value

## Tier C queue (Phase 3 Wave 3 — Figma reconciliation)

- Re-capture 198:87 / 198:96 / 198:98 with corrected QR-validity annotation (after Issue 1 canonical value chosen)
- Doc node-ID updates for all 5 sub-flow anchors (`116/120/123/126/183:31` → `198:87/98/106/114/122`)
- Optional: 198:87 annotation strip clarification of which entry path the diagram represents
