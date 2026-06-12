# Cross-Flow Ledger

**Purpose:** Append-only index of recurring themes across chunk reviews. At Phase 2 synthesis, walk this ledger top-to-bottom; each theme becomes a single decision applied uniformly. Severity-agnostic — synthesis triages.

**Tier conventions (set in checkpoint v4):**
- **Tier A** — Local, isolated fix (single screen / state). Implementable per-chunk after sign-off, prototype-only.
- **Tier B** — Cross-flow pattern. Hold for Phase 2 synthesis to ensure consistency.
- **Tier C** — Figma frame drift. Hold for Phase 3 (prototype-first → re-capture → upload).

---

## Theme · Doc-to-Figma node ID drift

**Tier:** B (cross-flow consistency rule, applied to one doc).
**Pattern:** `user-flow-documentation.md` cites legacy node IDs (`78:31`, `80:31`, `100–103:31`) that are *simplified step-arrow strips*. The full flow frames the team is iterating on live at `198:XX` — which is what the `FLOWS` array in `sign-in.html` already uses.

| Group | Doc cites | Reality | File |
|---|---|---|---|
| 1 | `78:31` / `80:31` / `100–103:31` | full frames at `198:36` / `198:44` / `198:63 / 68 / 73 / 78` | [group-1-passkey.md](group-1-passkey.md) |
| 3 | `86:31` / `90:31` / `169:32` / `92:31` | full frames at `198:137` / `198:145` / `198:156` / `198:170` | [group-3-password.md](group-3-password.md) |
| 4 | `93/94/96/97/98:31` + `169:53` / `169:74` | full frames at `198:185` / `198:196` / `198:210` / `198:221` / `198:232` / `198:246` / `198:254` | [group-4-otp.md](group-4-otp.md) |
| 2 | `116/120/123/126/183:31` | full frames at `198:87` / `198:98` / `198:106` / `198:114` / `198:122` | [group-2-cross-device.md](group-2-cross-device.md) |
| 5 | `129/137/139/141/176:31` | full frames at `198:266` / `198:274` / `198:282` / `198:290` / `198:298` | [group-5-passkey-registration.md](group-5-passkey-registration.md) |
| 6 | `104/109/107/113:31` | full frames at `198:310` / `198:324` / `198:335` / `198:343` | [group-6-password-reset.md](group-6-password-reset.md) |
| 8 | `165:31/57/73/99/120` + `421:2` | full frames at `198:389` / `198:394` / `198:402` / `198:410` / `198:418` + `421:2` | [group-8-settings-security.md](group-8-settings-security.md) |

**Provisional decision (to ratify at synthesis):** Update `user-flow-documentation.md` to cite the `198:XX` IDs uniformly. Single source of truth.

---

## Theme · Heading case (title vs. sentence) + button case (UPPER vs Title)

**Tier:** B.
**Pattern:** Mixed capitalization across screens and even *between states of the same screen*. Group 3 also surfaced UPPERCASE primary buttons clashing with sentence-case heading copy throughout.

| Group | Evidence | File |
|---|---|---|
| 1 | Prototype `failed`: "Face ID Could Not Sign You In" (Title). `idle`: "Use Face ID to sign in" (sentence). Figma `198:44`: sentence. | [group-1 §Issue 6](group-1-passkey.md) |
| 3 | Every primary button uses ALL CAPS (`SIGN IN`, `SEND RESET EMAIL`, `RESET YOUR PASSWORD`, `SAVE NEW PASSWORD`, `REQUEST A NEW LINK`, etc.). Heading copy is sentence/title case. Clashes throughout. | [group-3 §Issue 8](group-3-password.md) |
| 3 | Password screen H1 is `Sign In` — same as chooser, doesn't reinforce method commitment. | [group-3 §Issue 7](group-3-password.md) |
| 4 | `screen-verify` H1 is `Welcome Back` (Title Case greeting) on a mid-task verify screen. OTP buttons all UPPERCASE (`VERIFY`, `SEND CODE`, `RESEND CODE`, `USE PASSWORD INSTEAD`). | [group-4 §Issue 8](group-4-otp.md) |
| 2 | QR default heading sentence-case ("Scan with your phone"), all 3 failure states Title Case ("QR Code Expired", "No Passkey on That Phone", "Couldn't Connect to Phone"); buttons all UPPERCASE (`CANCEL`, `GENERATE NEW CODE`, `TRY AGAIN`, `TRY A DIFFERENT DEVICE`, `SIGN IN ANOTHER WAY`). | [group-2 §Issue 7](group-2-cross-device.md) |
| 5 | All 6 enrollment states span sentence/Title within the same screen-group: "Sign in faster with Face ID" (sentence) / "Setup Didn't Complete" (Title) / "No problem" (sentence) / "Face ID Already Set Up" (Title) / "You're all set" (sentence) / "Got it, won't ask again" (sentence). Buttons all UPPERCASE primary + sentence-case skip. **Most-evidence single screen yet.** | [group-5 §Issue 6](group-5-passkey-registration.md) |
| 6 | **Heading case is consistent within G6 (all Title Case: "Reset Password" / "Check Your Email" / "Create New Password" / "Password Updated" / "Too Many Requests" / "Link Expired").** Same UPPERCASE-buttons-vs-Title-headings clash as G3/G4: `SEND RESET EMAIL`, `RESEND EMAIL`, `SAVE NEW PASSWORD`, `REQUEST A NEW LINK`, `SIGN IN NOW`, `BACK TO SIGN IN`. | [group-6 §Strengths](group-6-password-reset.md) || 8 | All H2s Title Case ("Sign-In & Security" / "Sign-In Activity" / "Active Devices" / "Passkeys"); primary buttons UPPERCASE (`ADD A PASSKEY`, `SAVE NAME`, `REMOVE PASSKEY`, `REMOVE ANYWAY`, `SEND VERIFICATION EMAIL`, `RESEND EMAIL`, `SIGN OUT`). **Worst-yet within-screen clash:** `screen-active-devices` mixes 4 cases on one surface — per-row `Sign out` (sentence), bulk `Sign out of all other devices` (sentence), modal confirm `SIGN OUT` (UPPER), modal `Cancel` (Title). | [group-8-settings-security.md](group-8-settings-security.md) |
**Provisional decision:** Sentence case for headings + Title Case for primary buttons globally (matches HIG / Material 3 / modern auth UX). Apply uniformly at synthesis.

---

## Theme · Banner palette & iconography (neutral context vs. warning)

**Tier:** B.
**Pattern:** Amber/tan banner with info-circle icon used for neutral-context messages reads as "warning" — anxiety on benign events.

| Group | Surface | File |
|---|---|---|
| 1 | `chooser-banner` for `passkey-not-found` | [group-1 §Issue 7](group-1-passkey.md) |
| 4 | **Working precedent:** `verify-alert-cooldown` (amber clock `#e6930a`) for caution/cooldown; `verify-alert-expired/locked/wrong` (red `#c62828`) for error; `verify-alert-resent` (green `#2e7d32`) for success. | [group-4 §Strengths](group-4-otp.md) |
| 2 | **Diverging pattern:** failure-state surfaces use neutral icon-in-container (`.enroll-hero-icon`, gray on rgba) instead of a banner. Three patterns now in evidence for "passive informational state": G1 banner / G2 icon-container / G4 alert strip. | [group-2 §Strengths, §Issue 7](group-2-cross-device.md) |
| 5 | **Canonical neutral palette identified:** `enroll-hero-icon--declined` = `#F3F4F6` bg / `#6B7280` icon. Combined with G4's `--success` (`#E8F5E9/#2E7D32`), `--error` (`#FFF3E0/#E65100`), and `--setup` brand-red, **the 4-tier token set now exists**: neutral / caution / error / success. | [group-5 §Strengths, §Cross-flow](group-5-passkey-registration.md) |
| 8 | **Reinforces 4-tier token discipline.** Hub badges use `--success` (Active / Verified) + `--muted` (Pending / Not set). Recovery-email pending uses muted-gray badge — neutral, not alarming. Remove-Last warning uses muted-red container (8% red bg, `#B71C1C` icon) — pairs with Theme 4 "red = terminal only" rule. No deviations from canonical palette. | [group-8 §Strengths](group-8-settings-security.md) |

**Provisional decision (recurrence likely):** Document a 3-tier banner palette — neutral/info (cool gray or light blue), caution (amber, reserved), error (red, terminal only). Map current banner uses to the right tier. **Adopt G4 token set as canonical** (`#e6930a` caution, `#c62828` error, `#2e7d32` success); flag G1's chooser-banner as needing a *neutral* palette distinct from these three. Synthesis must also pick **one informational-state pattern** (banner vs. icon-container vs. alert strip). **G5 supplies the canonical neutral pair (`#F3F4F6/#6B7280`).**

---

## Theme · Error / failed-state heading color

**Tier:** B.
**Pattern:** Red headings on retryable, recoverable failures may over-signal severity.

| Group | Surface | File |
|---|---|---|
| 1 | `screen-passkey:failed` heading is red despite reassuring subtitle | [group-1 §Issue 5](group-1-passkey.md) |
| 2 | **Working precedent:** all 3 cross-device failure-state headings ("QR Code Expired", "No Passkey on That Phone", "Couldn't Connect to Phone") use neutral dark gray. Strong evidence for "red = terminal only" rule. | [group-2 §Strengths](group-2-cross-device.md) |
| 5 | **Reinforces precedent:** "Setup Didn't Complete" (error state) uses neutral dark gray, not red. Pairs with amber error icon (`#E65100`). | [group-5 §Strengths](group-5-passkey-registration.md) |
| 8 | **Strongest reinforcement yet.** "Remove [device]?" modal heading neutral-dark with destructive-red `SIGN OUT` button. "Remove [passkey]?" panel heading neutral-dark with destructive-red `REMOVE PASSKEY`. "This is your only passkey" (8f) heading neutral-dark with `REMOVE ANYWAY` red — the *escalated* CTA carries the alarm, not the heading. Three reinforcing instances in one group. | [group-8 §Strengths #5](group-8-settings-security.md) |

**Provisional decision:** Reserve red type for *terminal* states (account locked, lockout). Use neutral text for retryable failures; let the icon ring / state accent carry the signal. **Adopt G2 + G5 + G8 as canonical references**; revise G1.

---

## Theme · Reduced-motion handling on animated indicators

**Tier:** B (audit pass once).
**Pattern:** Animated state indicators (rings, spinners, timer rings) need verified `prefers-reduced-motion: reduce` fallbacks.

| Group | Element | File |
|---|---|---|
| 1 | `.biometric-ring` (idle/error/success animation) | [group-1 §Issue 8](group-1-passkey.md) |
| 2 | QR is static SVG (no animation today). **But Issue 3's recommended retry-spinner must respect `prefers-reduced-motion: reduce`.** | [group-2 §Issue 3, §Cross-flow](group-2-cross-device.md) |
| 5 | "Setting up…" feedback is text-only (no spinner today). Issue 4's recommended inline spinner must respect `prefers-reduced-motion`. | [group-5 §Issue 4](group-5-passkey-registration.md) |

**Likely recurrence:** OTP timer ring, QR-expiry timer (cross-device), spinners on submit. Audit all together.

---

## Theme · Empty / placeholder Figma stub frames

**Tier:** C.
**Pattern:** Frames in the Figma flow exist as empty rectangles labeled "Platform UI handles auth". Invites "is this a TODO?".

| Group | Frames | File |
|---|---|---|
| 1 | `198:63 / 68 / 73 / 78` (OS native sheets 1d–1g) | [group-1 §Issue 4](group-1-passkey.md) |

**Provisional decision:** Either populate with reference UI from Apple/Google HIG, or strip and explicitly mark OS-owned in the doc.

---

## Theme · Stale Figma frames vs. current prototype

**Tier:** C.
**Pattern:** Flow-frame mockups have drifted from the prototype's actual UI/copy. Figma is the team's communication artifact — drift here misleads stakeholders and downstream devs.

| Group | Specific drift | File |
|---|---|---|
| 1 | `198:36` missing cross-device button on idle; `198:44` failed subtitle is wrong copy; `463:886` decision tree shows impossible Face ID → Enrollment path | [group-1 §Issues 1–3](group-1-passkey.md) |
| 3 | `198:137` (3a) missing MFA + Enrollment screens; `198:156` (3c) ends on "Reset Email Sent" but prototype routes through `screen-forgot-password`; `198:170` (3d) missing not-found error state | [group-3 §Issues 1–3](group-3-password.md) |
| 4 | `198:221` (4d expired) + `198:232` (4e locked) verify CTAs render as **blank red buttons** — prototype uses CSS `::after { content }` for state-specific labels, doesn't survive Figma export. | [group-4 §Issue 2](group-4-otp.md) |
| 2 | `198:87` / `198:96` / `198:98` annotation says QR validity is "~3 minutes" but doc says "approximately 2 minutes" and prototype hardcodes "2:00". Re-capture after canonical value chosen (Theme 17). | [group-2 §Issue 1](group-2-cross-device.md) |
| 8 | `198:389` (8a hub) does **not** show the Recovery Email row that exists in the prototype (L3099). Whole row missing from Figma. Also Figma 8d/8e specify a "Passkey renamed" / "Passkey removed" toast that's absent from the prototype — bidirectional drift (Figma has feature prototype lacks; prototype has row Figma lacks). Re-capture after Wave 1 fixes. | [group-8 §Issues 2, 3](group-8-settings-security.md) |

**Phase 3 ordering:** Prototype-first → re-run `figma-export/capture_screens.py` → upload via Figma MCP. Never the reverse.

---

## Theme · Signed-in destination missing

**Tier:** B (already tracked in `figma-flow-gaps.md` "Remaining Gaps").
**Pattern:** Every happy-path terminates on a per-method success state ("You're signed in") with no shared destination, post-login toast, or cross-property handoff.

| 2 | 2a happy path Step 6 "Authenticated → home" — confirmed missing | [group-2 §Source-drift](group-2-cross-device.md) |
| 5 | **Two more instances:** `enroll-continue-btn` ("CONTINUE SHOPPING") fires `alert('✓ Passkey saved...')` on the success terminus; `handleEnrollSkip` post-login fires `alert('✓ You're signed in...')`. **Theme is now critical** — 4+ confirmed instances. Theme 18 (`alert()` consolidation) is the unblocker. | [group-5 §Issues 2-3](group-5-passkey-registration.md) |
| 6 | **5th instance** — `reset-success-signin-btn` labeled **"SIGN IN NOW"** routes to `screen-chooser` instead of completing sign-in. Mechanism: navigation-based (no `alert()`), so **cleaner than G4/G5 stubs** — but the *button label* is the defect. Pairs with structural Issue 6.S2 (auto sign-in vs explicit re-auth terminus). | [group-6 §Issue 6](group-6-password-reset.md) |
| 8 | **Three more instances (6th, 7th, 8th)** — passkey rename / remove / remove-last all silent on success. Different defect shape: not a stub destination, but a **missing toast** after a real action. (Compounded by Theme 21: the action itself doesn't actually mutate the data.) Wave 1 toast component fixes Theme 8 + Theme 18 + Theme 21 in the same batch. | [group-8 §Issue 3](group-8-settings-security.md) |

**Provisional decision:** Define one canonical signed-in destination + the cross-property "you're now signed in across all Ace properties" pattern. Single fix closes ≥5 flows. **G6 sets the precedent for the *mechanism* — real `switchScreen` navigation, not `alert()`.**

---

## Theme · `Sign In - Claude Design/` folder is historical

**Tier:** A (one-line header per file — trivial).
**Pattern:** The folder is original ideation, deliberately superseded by the current prototype. Future readers re-read it as truth.

| Group | Evidence | File |
|---|---|---|
| 1 | `flow-passkey-paths.jsx` describes auto-prompt, dedicated not-found screen, recovery hub — all superseded | [group-1 §Drift §2](group-1-passkey.md) |
| 3 | `screens-password.jsx` describes "Welcome Back" hero, segmented Password/OTP control on the password screen, Face ID tile pinned on top, simpler locked screen without countdown — all superseded | [group-3 §Drift §2](group-3-password.md) |

**Decision:** Add a one-line `// ARCHIVE — original ideation; see sign-in.html for current truth.` header to each .jsx in that folder. Done once, applies forever.

---

## Theme · Validation logic gaps in prototype submit handlers

**Tier:** A (per-handler) and/or B (review pattern across all handlers).
**Pattern:** Submit handlers either don't validate (any non-empty input proceeds) or always-fire-error-then-succeed regardless of input. Affects usability-test fidelity and implementation-handoff legibility.

| Group | Evidence | File |
|---|---|---|
| 3 | `pw-submit-btn` accepts any non-empty email + password → wrong-password error path is unreachable in normal flow; `screen-account-locked` is unreachable from runtime. `reset-send-btn` always shows not-found error on first tap regardless of input. | [group-3 §Issues 4–5](group-3-password.md) |

**Provisional decision:** Audit OTP, cross-device, verify, and reset handlers in subsequent chunks. Adopt sentinel-input pattern (e.g., demo-only specific inputs trigger specific states; everything else proceeds happy). Document conventions in a single place.

**Update (Chunk 3):** Confirmed in Group 4 — `verify-btn` happy path always succeeds in normal flow (state must be `default` to enroll, which is the runtime default). Wrong/expired/locked unreachable except via screens-nav. Same architecture as G3's `pw-submit-btn`. Wave 1 should fix both with **one shared sentinel pattern**, not two divergent ones.

**Update (Chunk 4):** Third instance in Group 2 — but this one is *time-triggered* not input-triggered. QR has no countdown timer (`Code expires in 2:00` is a static label); no `setInterval`; never auto-transitions to `cross-device-failed`. Three failure flavors of the same architectural hole now confirmed: **input-trigger (G3)** / **button-tap-counter (G4)** / **time-trigger (G2)**. Wave 1 should batch all three under a single "state-transition fidelity" pass with a shared helper API.

**Update (Chunk 5):** Group 5 has the **mildest** instance — `?enroll=success|error` URL param is at least an explicit stub (G3/G4/G2 had no toggle at all). Same family. Consider unifying all four under "Theme 12 visible demo controls" alongside the sentinel pattern.

**Update (Chunk 6):** Group 6 has the **worst** instance — `reset-send-btn` forces every user through the email-not-found error on first tap (always; regardless of input value), then proceeds on second tap. **Invisible 2-tap pattern** — no toggle, no input sentinel, no counter, no URL param. A tester clicking through manually will assume the inline error IS the canonical flow. Five flavors of the same architectural hole now confirmed: **input-trigger (G3) / button-tap-counter (G4) / time-trigger (G2) / URL-param (G5) / forced-2-tap (G6)**. G6's flavor is invisible enough that it also ladders into Issue 1 (email-enumeration confusion) — a tester may mistake the demo behavior for a security decision.

---

## Theme · Missing back / cancel / escape-hatch buttons

**Tier:** A (per-screen) or B (cross-flow pattern audit).
**Pattern:** Some screens lack a tertiary back-out button despite being mid-flow. Users on contexts without gesture-back may get stuck.

| Group | Evidence | File |
|---|---|---|
| 3 | `screen-forgot-password` has no "Back to sign in" button (the .jsx ideation had one). `screen-new-password` has no back. | [group-3 §Issue 9](group-3-password.md) |

**Provisional decision:** Audit every non-terminal screen. Add tertiary `BACK TO SIGN IN` (or method-appropriate equivalent) where missing. Match the pattern already used on `screen-account-locked` and `screen-passkey:failed`.

**Update (Chunk 3):** Group 4's `screen-otp-no-access` is the **gold-standard 3-path pattern** — primary CTA (Use Password Instead) + secondary CTA (Contact Account Support) + tertiary text-link (Back to sign in). Adopt this as the canonical layout for any dead-end / can't-proceed screen. `screen-verify` and `screen-otp` also have a `SIGN IN ANOTHER WAY` button — use as the canonical mid-flow escape pattern. G3's `screen-forgot-password` should adopt this.

**Update (Chunk 4):** Group 2's three failure states use **2-tier escape** (primary CTA + secondary `SIGN IN ANOTHER WAY` button — no tertiary text-link). G1's `screen-passkey:failed` uses **inline-tile-list** (`passkey-fallback-options`: Password tile + OTP tile + secondary button) — yet another pattern. **Three escape patterns now in evidence:** G1 inline-tile-list / G2 2-tier / G4 3-tier. Synthesis must pick one canonical pattern (or document when each is appropriate).

**Update (Chunk 5):** Group 5 enrollment uses **2-tier patterns throughout** (Set Up + Not now / Try Again + Do this later / Maybe Later + Don't ask again). 1-tier on `suppressed` (just CONTINUE). **2-tier is appropriate here because user is already authenticated** — no need for global navigation mid-enrollment. Confirms 2-tier is fine when context is bounded.

**Update (Chunk 7):** Group 8 has a **new defect shape** — settings detail screens (`screen-activity`, `screen-active-devices`, `screen-settings-passkeys`, `screen-settings-recovery-email`) all use a non-tappable `<span>` breadcrumb ("Account Settings › Sign-In & Security") with no in-flow back button. **Mobile users without OS-level gesture-back are stuck on detail screens.** First group reviewed where the back affordance is *visible but not interactive* — different from prior groups (which had explicit buttons or omitted them entirely). Wave 1 fix: convert breadcrumb to a button or add chevron-back to topbar. Pairs with this theme's canonical 3-tier pattern.

---

## Theme · Demo simulate-buttons leak into the user-facing UI

**Tier:** B.
**Pattern:** Prototype-only buttons that simulate external events (clicking an email link, receiving a code, etc.) appear visually identical to real CTAs. Will confuse usability-test participants.

| Group | Evidence | File |
|---|---|---|
| 3 | `reset-simulate-link-btn` ("I received the link →") on `screen-reset-sent` looks like a real CTA | [group-3 §Issue 11](group-3-password.md) |
| 5 | `?enroll=success|error` URL param controls the simulated WebAuthn outcome but is invisible to testers — different leak vector, same family. | [group-5 §Issue 5](group-5-passkey-registration.md) |
| 6 | **Two new candidates:** (a) `reset-send-btn`'s invisible forced-2-tap (Theme 10's worst flavor) — promote to a visible state-toggle ("Show: Happy / Email not found / Rate limited"); (b) `forgotpwAttempts` counter is *missing* (vs G3's `pwAttempts`) — either add for demo realism or document that rate-limit is server-driven. | [group-6 §Issues 4, 9](group-6-password-reset.md) |
| 8 | `activity-load-more-btn` ("Load older events") on tap silently flips to `"No older events"` and disables — **silent self-disable** as a stub mechanism. Not an alert (Theme 18) and not invisible (Theme 10), but in the same family: an unimplemented action with ambiguous feedback. Either remove the button or replace with paginated-fetch stub. | [group-8 §Issue 7](group-8-settings-security.md) |

**Provisional decision:** Adopt a global "demo control" treatment (italic / dashed border / dimmer color / leading marker like "Demo:") to clearly distinguish simulate-buttons from real CTAs. Audit all flows. **Pair with Theme 10 sentinel pattern** — same Wave 1 batch should produce one consolidated demo-control mechanism per screen, not five divergent ones.

---

## Theme · Doc ↔ prototype micro-drift in success destinations

**Tier:** B / C (depending on whether doc or Figma is the wrong one).
**Pattern:** Documentation describes a destination/CTA with phrasing that doesn't match the prototype's actual route.

| Group | Evidence | File |
|---|---|---|
| 3 | Doc + Figma describe `screen-reset-success` returning to "sign in" — the prototype actually returns to `screen-chooser`. Functionally fine; phrasing ambiguous. | [group-3 §Issue 6](group-3-password.md) |

**Provisional decision:** When updating doc node IDs (per Doc-to-Figma drift theme), tighten destination phrasing in the same pass.

---

## Theme · CSS-pseudo-element button labels invisible in Figma exports

**Tier:** A (Tier A prototype fix unlocks Tier C re-capture).
**Pattern:** Prototype uses `::after { content: 'X' }` + `font-size: 0` on the host button to swap labels by state. Functional in the live prototype, but Figma's static export does not include CSS pseudo-element content. Result: those Figma frames render unlabeled buttons — ambiguous to anyone reviewing Figma alone. Also potentially an accessibility risk depending on screen-reader handling of pseudo-element content.

| Group | Evidence | File |
|---|---|---|
| 4 | `#verify-btn` swaps to "RESEND CODE" (expired state) and "SIGN IN WITH PASSWORD" (locked state) via `::after`. Figma 198:221 + 198:232 export as blank red buttons. | [group-4 §Issue 2](group-4-otp.md) |
| 6 | **Clean precedent — zero pseudo-element label swaps in G6.** All buttons use static labels (`SEND RESET EMAIL`, `RESEND EMAIL`, `REQUEST A NEW LINK`, `SAVE NEW PASSWORD`, `SIGN IN NOW`, `BACK TO SIGN IN`). Confirms G4's `verify-btn` is the outlier. | [group-6 §Strengths](group-6-password-reset.md) |
| 8 | **Strongest precedent yet — `device-signout-all-btn` uses real DOM `textContent` mutation** to swap label to `"No other active devices"` after bulk sign-out (L6303). `activity-load-more-btn` uses the same DOM-text pattern. Zero pseudo-element label swaps in G8. Confirms canonical pattern across G5 + G6 + G8. | [group-8 §Issue 7, §Strengths](group-8-settings-security.md) |

**Provisional decision:** Replace pseudo-element label swaps with explicit DOM text content (set in the state-machine handler). Single source of truth, screen-reader-safe, Figma-export-safe. Wave 1 (Tier A) prerequisite to Wave 3 re-capture (Tier C). **G5/G6/G8 all use DOM text — canonical pattern confirmed.**

---

## Theme · Time-scale presentation inconsistency

**Tier:** B.
**Pattern:** The same screen displays time references in three different formats: plain English ("3 minutes"), `M:SS` numeric live countdown ("0:42"), and abbreviated ("15 min"). No global rule.

| Group | Evidence | File |
|---|---|---|
| 3 | Reset cooldown shows "1:00" then "00:59" — boundary-tick formatting glitch. | [group-3 §Issue 10](group-3-password.md) |
| 4 | `screen-verify` shows three formats: "3 minutes" (static, code TTL), "0:42" (live cooldown), "15 min" (static lockout). | [group-4 §Issues 7, 9, 10](group-4-otp.md) |

**Provisional decision:** Lock a global rule at synthesis. Provisional:
- **Static phrase, English** for non-actionable time labels (code TTL, lockout windows): "3 minutes", "about 15 minutes".
- **Numeric live countdown (`MM:SS`)** *only* when the user is actively waiting on it to enable an action (cooldown timer). Always two-digit padded (`00:42`, not `0:42`).
- Avoid live timers on lockout / TTL displays — they leak timing information and create anxiety.

---

## Theme · Multiple undocumented entry points to a single state

**Tier:** B (doc / Tier C Figma annotation).
**Pattern:** A flow's documented "happy path" lists one entry sequence, but the prototype actually has two or more legitimate entry points to the same state. Doc readers (and downstream devs) end up with an incomplete model.

| Group | Evidence | File |
|---|---|---|
| 2 | Two entry paths to `screen-passkey:cross-device`: (a) `tile-cd-chooser` "Scan with Phone" tile direct from chooser; (b) `tile-passkey` → idle → `passkey-cd-btn` ("Use a passkey from another device"). Doc only describes path (b). | [group-2 §Issue 6](group-2-cross-device.md) |
| 5 | **Working precedent:** Two entry paths to `screen-passkey-enroll:prompt` — (a) post-login (Password / OTP happy paths); (b) Settings → Add a Passkey (`settings-add-passkey-btn`). **Both documented; `enrollOrigin` mechanism handles origin-aware nav correctly.** Adopt as canonical pattern. | [group-5 §Strengths, §Issue 8, §Cross-flow](group-5-passkey-registration.md) |

**Likely recurrence:** Settings (Group 8) — multiple ways to reach the passkey-management screen (top-nav, post-sign-in prompt, deep-link). Audit at synthesis.

**Provisional decision:** Document every legitimate entry path explicitly. Prefer one canonical "primary" path in marketing/onboarding; preserve secondary paths for power-user shortcuts.

---

## Theme · Time-display value drift across sources (doc / Figma / prototype)

**Tier:** B (decide canonical) + Tier A (single source of truth in code) + Tier C (re-capture Figma after).
**Pattern:** A single time value (TTL, lockout window, cooldown duration) is rendered with three different numbers across the three artifacts. Distinct from Theme 15 (which is about *format*); this theme is about *value*.

| Group | Doc says | Figma says | Prototype says | File |
|---|---|---|---|---|
| 2 | "approximately 2 minutes" (QR validity) | "~3 minutes" (annotation strip on `198:87`) | "2:00" (hardcoded text, doesn't count down) | [group-2 §Issue 1](group-2-cross-device.md) |
| 6 | **Worst yet — reset-link expiry.** Doc "typically 1 hour"; Figma `339:645`/6b annotation **"15 minutes"**; Prototype `screen-reset-sent` body copy **silent on duration**; Prototype expired panel vague ("valid for a short time"). Compounded by `screen-recovery`'s neighboring "30 minutes" outlier (line 3424) — *fourth* value in a related surface. | [group-6 §Issue 3](group-6-password-reset.md) |
| 8 | **Confirms** the `screen-recovery` 30-minute outlier flagged in Chunk 6 — its source is the **recovery-email verification link** copy at L3424 (`screen-settings-recovery-email`). Same surface-family as G6's reset-link. Now two adjacent recovery-link timers with different values: **password-reset link 15 min (Figma 6b) vs recovery-email verification link 30 min (prototype L3424)**. Centralize both in the constants pass. | [group-8 §Theme 17 row](group-8-settings-security.md) |

**Likely recurrence:** OTP TTL ("3 minutes" already on `screen-verify`), lockout windows ("15 min"), reset-link cooldown, Account-Locked countdown. Three sources × multiple timers = high drift surface area. **Confirmed recurring** — G6 hit it on day one, G8 confirmed source of the recovery-email outlier.

**Provisional decision:** Lock canonical values at synthesis. Centralize as constants (`QR_TTL_MS`, `OTP_TTL_MS`, `LOCKOUT_MS`, `RESEND_COOLDOWN_MS`, **`RESET_LINK_TTL_MS`**, **`RECOVERY_EMAIL_LINK_TTL_MS`**) consumed by both copy-rendering and timer logic. Replace hardcoded strings in HTML. Re-capture Figma frames last (Tier C). **Reset-link TTL provisional: 15 minutes (Figma value, industry-standard); doc to be corrected.** Recovery-email link TTL: decide at synthesis — could legitimately be longer than reset link (lower-trust action) or should match for simplicity.

---

## Theme · Stub confirmations as native `alert()` dialogs

**Tier:** A (Phase 3 Wave 1 — single consolidation pass replaces all instances).
**Pattern:** The prototype uses native browser `alert()` for post-action confirmations (signed-in toast, passkey saved, account-support stub). These look like browser security warnings, not Ace UX; they block the page; they're unstyled; they won't survive into production. **Distinct from Theme 8** (which is about *missing destinations*) — this theme is specifically about the placeholder *mechanism* used in their absence.

| Group | Evidence | File |
|---|---|---|
| 4 | `screen-otp-no-access` Contact Account Support button fires `alert('Account support coming soon...')` | [group-4 §Issue 12](group-4-otp.md) |
| 5 | `enroll-continue-btn` ("CONTINUE SHOPPING") on success fires `alert('✓ Passkey saved. Continuing to shop… (prototype)')` | [group-5 §Issue 3](group-5-passkey-registration.md) |
| 5 | `handleEnrollSkip` for post-login origin fires `alert('✓ You're signed in. (Passkey setup skipped for now)')` | [group-5 §Issue 2](group-5-passkey-registration.md) |
| 6 | **Boundary established — Group 6 has zero `alert()` stubs.** Every CTA, including terminal ones, uses real `switchScreen` navigation. Sets the canonical replacement pattern for Wave 1 — the alert-based stubs in G4/G5 are isolated regressions, not a pervasive pattern. | [group-6 §Issue 10](group-6-password-reset.md) |
| 8 | **Boundary holds — Group 8 has zero `alert()` stubs.** Sign-out modal uses real ARIA dialog; activity-load-more uses DOM textContent; recovery-email uses inline error spans; rename/remove use silent navigation (a *different* defect — Theme 21 — but not alert-shaped). G6 + G8 together set the boundary: alert-based stubs are confined to G4/G5. | [group-8 §Issue 3, §Theme 18 row](group-8-settings-security.md) |

**Provisional decision (Wave 1):** Build one shared toast/banner component. Replace all 3 `alert()` calls in the same Wave 1 batch as Theme 8's signed-in destination work + Theme 21's data-mutation handlers — same problem space, same code paths. Toast must support: short/long display durations, accessible role="status" for non-error confirmations, deferred-mount so it survives screen transitions, and `prefers-reduced-motion` aware entrance/exit. **Use G6's navigation pattern + G8's `signout-modal` ARIA dialog as the canonical replacement targets.**

**Likely recurrence:** ~~Audit Group 6~~ ✅ G6 audited (zero alerts). ~~Audit Group 8~~ ✅ G8 audited (zero alerts). **Theme 18 boundary closed.**

---

## Theme · Lockout countdowns silently expire without state restoration

**Tier:** A (Wave 1 — single shared helper).
**Pattern:** Multiple lockout countdowns clear their `setInterval` at `secs <= 0` but don't restore the host screen's data-state attribute. The user sees `00:00` frozen on the lockout panel with no visual transition or affordance to retry. Compare to `startRecoveryCountdown` (`screen-recovery` legacy hub) which correctly resets attempts and calls `setRecoveryState('default')` at expiry.

| Group | Surface | File |
|---|---|---|
| 6 | `startForgotpwRateCountdown` (L5957) — clears interval but leaves `data-forgotpw-state="rate-limited"` set; user is stuck on the panel showing `00:00` until they tap `BACK TO SIGN IN`. | [group-6 §Issue 5](group-6-password-reset.md) |
| 6 | `startLockedCountdown` (`screen-account-locked`, neighboring block) — same bug shape, same fix shape. Out of G6 scope but confirmed. | [group-6 §Issue 5](group-6-password-reset.md) |

**Provisional decision (Wave 1):** Extract a shared `startLockoutCountdown(stateAttr, hostEl, durationSecs, onExpiry)` helper. At `secs <= 0`: clear interval, remove the data-state attribute, call optional `onExpiry` callback (e.g., toast "You can try again now"), and update blurb. Wire `forgotpwRateBack`, `lockedCountdown`, and (eventually) any OTP lockout through it.

---

## Theme · Structural disagreements: security-elevating-action terminus + email-enumeration disclosure

**Tier:** Structural (Chunk 8) — scope cuts across multiple flows; resolution must be a coherent house rule, not a per-screen patch.

**Pattern:** Two independent decision-points have surfaced where Figma annotations, Figma wireframes, the doc, and the prototype disagree on a *security-shaped product question*. These aren't copy fixes — they change flow shape and require trade-off analysis.

### 18a · Terminus after a security-elevating action succeeds

| Group | Disagreement | File |
|---|---|---|
| 5 | Figma annotation: flat 3-CTA prompt (Set Up / Maybe Later / Don't Ask Again). Prototype: 2-step decline (Maybe Later → suppressed screen with explicit Don't-Ask-Again). | [group-5 §Issue 1](group-5-passkey-registration.md) |
| 6 | Figma annotation `339:653/654`: "User is automatically signed in… all other sessions logged out". Doc + Prototype: explicit re-auth via `BACK TO SIGN IN` (security argument: reset link arrived in email, possibly opened on shared device). | [group-6 §Issue 2](group-6-password-reset.md) |

### 18b · Email enumeration on Forgot Password

| Group | Disagreement | File |
|---|---|---|
| 6 | **Figma wireframe** (`198:335`): inline error "We couldn't find an account with that email address." **Figma annotation** on same node: "Security requirement: never confirm whether an email is registered (prevents enumeration)." **Doc**: error is intentional (multi-email-address UX). **Prototype**: matches wireframe. Internal Figma contradiction. | [group-6 §Issue 1](group-6-password-reset.md) |

**Why structural, not Tier A/B:** Both 18a and 18b have legitimate arguments on each side; they're security-shaped product decisions that affect IA and copy across multiple screens. They also pair with each other — "what does post-success of a security-elevating action look like" needs to be coherent across passkey enrollment (G5), password reset (G6), and likely settings flows (G8).

**Chunk 8 ownership:** Structural pass produces `reviews/STRUCTURAL-REVIEW.md` with recommended position + trade-off documentation per item. **Must land before Phase 3 Wave 1** so Tier A copy fixes (e.g., `reset-success-signin-btn` label) align with the chosen terminus position.

**Update (Chunk 7):** Group 8 surfaces **three more structural items** to fold in:

### 18c · Modal-vs-panel for confirmation dialogs

| Group | Disagreement | File |
|---|---|---|
| 8 | `screen-active-devices` sign-out: **true modal** (`#signout-modal` with backdrop, `role="dialog"`, `aria-modal="true"`, focus management). `screen-settings-passkeys` rename/remove/remove-last: **panel-replacement** via `data-settings-state` attribute (full-screen state swap, no overlay). Same conceptual pattern (confirm a destructive action), two different mechanisms. **Modal preserves list-context** (user sees what they're acting on while confirming); **panel** is simpler markup but loses context. | [group-8 §Issue 10, §8.S1](group-8-settings-security.md) |

### 18d · Activity log action-affordance scope

| Group | Disagreement | File |
|---|---|---|
| 8 | Doc 8b: *"The log is read-only — actions live on the active devices screen."* Intent: keep log clean. **Defect:** activity log lists devices that may not be in the active-devices list (historical sign-ins from devices since signed out), so "actions live on devices screen" only works for the subset that *are* still active. Suspicious historical sign-in → the right action is change-password + review-passkeys, neither of which is one tap from the log. | [group-8 §Issue 5, §8.S2](group-8-settings-security.md) |

### 18e · Recovery Email's place in the IA

| Group | Disagreement | File |
|---|---|---|
| 8 | Recovery Email is implemented as a row on the Sign-In & Security hub. Doc Group 8 § doesn't mention it at all. Should it be: (a) a peer of passkeys under "Sign-in methods"; (b) an "Account hygiene" section alongside activity + devices; or (c) its own group? `screen-settings-security` currently mixes both axes (sign-in methods + account hygiene) without explicit grouping. | [group-8 §Issue 2, §8.S3](group-8-settings-security.md) |

---

## Theme · Stub data-mutation handlers (action completes, data unchanged)

**Tier:** A (Wave 1 — fix per-handler in single batch).
**Pattern:** Submit/confirm handlers update screen state (return to list, dismiss modal, etc.) but never mutate the underlying data the user thinks they're acting on. Distinct from Theme 8 (terminal-step *destination* stub) and Theme 18 (alert-based mechanism). This theme is mid-flow data fidelity: the action *appears* to happen, the screen flips, the data didn't change.

| Group | Evidence | File |
|---|---|---|
| 8 | `rename-save-btn` handler returns to list but doesn't write the input value to `.passkey-list-name`. `remove-confirm-btn` and `remove-last-confirm-btn` return to list but don't `item.remove()` the passkey from `#passkey-list`. Compare to `signout-modal-confirm` (same flow, L6289) which *does* call `item.remove()` correctly. | [group-8 §Issue 1](group-8-settings-security.md) |

**Comparison to canonical:** `signout-modal-confirm` (G8) and `setRecoveryEmailState` (G8) are the in-flow precedents that work — they actually mutate state. The defect is local to passkey rename/remove handlers.

**Provisional decision (Wave 1):** Implement actual mutations:
- Rename: read `#rename-input` value, update matching `.passkey-list-name`, then `setSettingsState('list')` + toast.
- Remove (single + last): use cached `pkId` to call `item.remove()`, check empty-state, render Figma-8f empty CTA if list is empty, else `setSettingsState('list')` + toast.

**Couples to:** Theme 18 (toast component) + Theme 8 (post-action confirmation). One Wave 1 batch fixes all three families.

---

## Theme · Modal/dialog pattern is single-instance and partial

**Tier:** B (cross-flow component definition) + Structural 18c (when to use modal vs panel).
**Pattern:** The prototype has exactly one true modal-as-overlay (`#signout-modal`) with backdrop, ARIA dialog role, `aria-modal="true"`, and initial-focus management. **Every other "confirmation" surface is a full-screen panel-replacement.** The modal is incomplete (no focus trap, no Escape-key handler, no focus return on close, no `aria-describedby`).

| Group | Evidence | File |
|---|---|---|
| 8 | `#signout-modal` (L3290–3302, handlers L6262–6306) — strongest dialog implementation in the codebase: separate backdrop, full ARIA, focus-on-confirm, backdrop-click-dismisses. Missing: focus trap, Escape handler, focus return, `aria-describedby`. | [group-8 §Issue 10, §Strengths #2](group-8-settings-security.md) |

**Provisional decision (Wave 2):** Either (a) promote sign-out modal to a canonical reusable modal component used wherever confirmation overlays are appropriate, with the AAA gaps closed; or (b) decide "no modals — always panels" as a house rule and convert the sign-out modal to a panel for consistency. Decision lives in Chunk 8 structural pass (18c).

---

## Theme · Whole-flow doc gaps (feature exists in prototype, not in `user-flow-documentation.md`)

**Tier:** B (doc consolidation pass — pair with synthesis).
**Pattern:** The prototype implements substantial flow surfaces that the documentation does not enumerate. Different from doc-vs-prototype micro-drift (Theme 13) — this is full sub-flow absence.

| Group | Evidence | File |
|---|---|---|
| 8 | **Recovery Email Setup** is implemented in the prototype as a screen (`screen-settings-recovery-email`, 2 panels), 3 FLOWS-array entries (`recovery-email-setup-happy/pending/change`), in-memory `recoveryEmailStore`, hub-row reflector (`refreshRecoveryEmailHubRow`), email validation, cooldown timer, change-email loop-back. Figma `463:475` exists for it. **`user-flow-documentation.md` Group 8 § doesn't mention it.** | [group-8 §Issue 2](group-8-settings-security.md) |

**Likely recurrence:** Audit each group's doc § against its FLOWS-array entries and against Figma frame inventory. Recovery Email may not be the only gap.

**Provisional decision:** Doc consolidation pass at synthesis adds missing sub-flows. Consider whether Recovery Email warrants a Group of its own rather than a sub-flow under 8.

---

## Theme · _(reserved — add as new chunks find them)_
