# Ace Hardware Sign-In Flow — User Flow Documentation

> **Source of truth:** The `FLOWS` array and `SCREEN_DESCRIPTIONS` object in `sign-in.html`. This document is derived directly from those definitions and reflects the prototype's current wired state as of the last update.
>
> **Figma file key:** `IDuYbd4aYwGsFgo6c3ThVX` · Flows page: "Prototype Flows"
> **Prototype:** `sign-in.html` (local file — `feature/faceid-passkey` branch)

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Screen exists in prototype and step is correctly wired |
| ⚠️ | Screen exists but has a known limitation or gap |
| ❌ | Screen or state is missing from the prototype |
| — | OS-native or external; no app screen exists |

---

## Prototype Screen Inventory

All screens currently in `sign-in.html`, including their `data-state` values:

| Screen ID | States | Notes |
|-----------|--------|-------|
| `screen-chooser` | `default`, `passkey-first` | Entry point; state driven by passkey detection on device. Both variants present four sign-in methods (Face ID/Passkey, Password, One-Time Code, Scan with Phone). |
| `screen-passkey` | `idle`, `failed`, `success`, `cross-device`, `cross-device-failed`, `cross-device-no-credential`, `cross-device-transport-error` | Passkey sign-in; multiple error/fallback states plus a `success` terminal state ("You're signed in / Welcome back to Ace Hardware") used by the passkey happy path. The legacy `notfound` state has been removed — no-passkey is now handled by returning the user to the chooser with an inline banner. **W3.7 note:** the four `cross-device-*` states remain in the code but are currently unreachable — the chooser tile (`#tile-cd-chooser`), the passkey-screen cross-device button (`#passkey-cd-btn`), the Screens-panel Cross-Device group, and the Flows-panel Cross-Device group are all temporarily hidden. Removing the `CROSS-DEVICE TEMPORARILY HIDDEN` CSS block and the `hidden: true` fields on the `cross-device-*` FLOWS entries restores the feature. |
| `screen-passkey-enroll` | `prompt`, `success`, `error`, `declined`, `already-enrolled` | Post-login enrollment upsell |
| `screen-verify` | `default`, `cooldown`, `expired`, `locked`, `wrong`, `resent` | OTP / MFA code entry |
| `screen-password` | `default`, `error` | Password sign-in |
| `screen-account-locked` | — | Too many failed password attempts |
| `screen-forgot-password` | `default`, `not-found`, `rate-limited` | Password reset entry; inline error and rate-limit states |
| `screen-reset-sent` | — | Reset email confirmation |
| `screen-new-password` | `default`, `expired` | Reset link destination; expired-link state |
| `screen-reset-success` | — | Password updated confirmation |
| `screen-otp` | — | OTP channel selection |
| `screen-otp-no-access` | — | Can't receive a code fallback |
| `screen-settings-security` | — | Security hub in account settings |
| `screen-activity` | — | Sign-in activity log |
| `screen-active-devices` | — | Active session list + remote sign-out |
| `screen-settings-passkeys` | `list`, `rename`, `remove`, `remove-last` | Passkey management; `remove-last` has stricter confirm |
| `screen-recovery` | `default`, `locked` | **Legacy / reference only.** The dedicated recovery hub is no longer wired into any user flow. Recovery now happens in-method (Forgot Password, "Can't access code"). Screen remains reachable via the Screens tab. |
| `screen-reenroll` | `prompt`, `success`, `error` | **Legacy / reference only.** Post-recovery re-enrollment is covered by the standard Passkey Registration & Enrollment group. |

> **Note on terminal steps — no signed-in destination by design:** This prototype intentionally does not include a signed-in / home destination screen (account home, store landing, or whatever the post-auth surface would be). Every authenticated happy path terminates at the last auth surface (passkey `success` ring, post-login passkey enrollment offer, or password-reset success). When the real product ships, the route after sign-in is whatever the host application defines — designing it here would be out of scope for the auth experience.

---

## How to read this document

Each flow has:
- **A scenario summary** — who this user is and what triggered this path
- **Design intent** — why this flow or screen exists; what UX problem it solves
- **A step table** — the screen sequence with a purpose note for each step

Screen states are referenced as `screen-id:state` (e.g. `screen-password:error`). When state is omitted, the screen has only one visual state.

---

## Device views & state simulation (W3.6)

The prototype wraps the sign-in card in a **device frame** selectable via a tab bar below the card: **Desktop**, **Mobile Web**, or **App**. Chrome differs per tab (no chrome on Desktop — the page's outer header stays at top; phone silhouette + browser toolbar for Mobile Web; phone silhouette + iOS-style status bar for App). Mobile Web + App frames render at **396px wide × 728px tall** — a standardized display size across every screen — with the sign-in card scrolling internally when content exceeds the visible area. On those two tabs the outer page header is `visibility: hidden` (space preserved so nothing shifts) and a scaled-down clone of it renders inside the frame. Every screen — chooser and downstream — renders inside the active frame. Frame selection persists in `localStorage` under `proto:device-tab`.

Left of the card, a **state pill rail** hosts scenario pills scoped per device tab. Each pill re-shapes the chooser to simulate a specific device/session state. Pills are only relevant to the chooser landing, so the rail is invisible on downstream screens (via `visibility: hidden` — grid column preserves layout so the card never shifts). Selection persists per tab in `localStorage` under `proto:device-state:<tab>`.

**Design principle:** the landing screen should show *the fastest correct path for what this device can actually do right now*, and hide options that can't complete. Detection assumptions differ by surface:

| Surface | Credential detection | Consequence |
|---------|---------------------|-------------|
| **Desktop browser** | Weakest — browsers gate credential enumeration; identity is at best cookie-based. | Coarse states only. |
| **Mobile Web** | Better than desktop, worse than native — WebAuthn conditional UI can hint autofill, but no synchronous "does a passkey exist?" answer. | Middle ground — can hint identity via cookie/session. |
| **Native App** | Strongest — iOS `ASAuthorization` / Android Credential Manager can report platform-passkey availability, autofill capability, and last-signed-in identity. | Full state matrix — the state that couldn't exist on desktop lives here. |

### Desktop tab (2 states)

| Pill | Chooser behavior |
|------|------------------|
| **Default** | Current mock — email empty, all 4 method tiles offered. |
| **Returning identity** | Email pre-filled from cookie. `Not you?` link to reset. All tiles remain visible. |

### Mobile Web tab (2 states)

| Pill | Chooser behavior |
|------|------------------|
| **Default** | Current mock in mobile browser frame. |
| **Returning identity** | Email pre-filled from prior session. `Not you?` link. All tiles remain visible. |

> The former **Cross-device emphasis** Mobile Web pill was removed alongside the cross-device sign-in hide (W3.7). Its rationale was to promote the `Use another device` (QR) tile for users with a passkey on a different device; with the cross-device tile hidden, the pill had no purpose.

### App tab (5 states)

| Pill | Chooser behavior |
|------|------------------|
| **Fresh install** | Email + Continue only. No `OR SIGN IN ANOTHER WAY` divider, no method tiles — nothing else can complete for a first-time user. `Create Account` footer preserved. |
| **Returning · passkey** | Layers on `passkey-first` base. Identity chip (`shopper@ace.com`) above the CTA. CTA copy swaps to `Sign in as shopper@ace.com`. Divider + tiles hidden — this variant is the "one clear path" case. **App default state.** |
| **Returning · saved password** | Email pre-filled with `shopper@example.com`. `Not you?` link. All tiles remain as fallback if autofill fails. |
| **Returning · no credentials** | Email pre-filled. `Not you?` link. Face ID tile **hidden** (no passkey on this device — showing it would be a dead-end). **Password tile promoted to position 1** with an emphasis ring — fastest remaining path for a returning user with no local credentials. (Pre-W3.7 this state promoted the cross-device tile; when cross-device was temporarily hidden, password took over.) |
| **Multi-identity** | Replaces form + tiles with 2 identity chips (`shopper@ace.com` w/ Face ID glyph, `d.olson@example.com` w/ lock glyph) + `Use a different account` link. Simulates a family/shared device. |

### Panel context indicator

The Demo panel (Screens/Flows) shows a live `Simulating` chip at the top identifying the current tab + state pill, so reviewers know what variant of the chooser the listed nav entries are landing in.

### Small-viewport fallback

On viewports below 640px, the entire device-frame system collapses back to the plain card presentation via `display: contents` — you're already on a phone-sized viewport, so the phone frame concept adds no value.

### Where the state lives

| Attribute | Set by | Read by |
|-----------|--------|---------|
| `body[data-device-tab]` | `initDeviceTabs()` | Frame chrome CSS, tab-scoped pill visibility, chrome content spans |
| `body[data-device-state]` | `initStatePills()` | Tab-agnostic hooks (currently only the context chip) |
| `body[data-current-screen]` | `screenchange` event listener | Pill rail visibility (only on chooser) |
| `#screen-chooser[data-chooser-variant]` | `initStatePills()` | Per-variant chooser CSS rules |
| `#screen-chooser[data-chooser-state]` | Existing chooser wiring + `initStatePills()` for `passkey-first` base | Existing passkey-first CSS rules |

`localStorage` keys:
- `proto:device-tab` — last selected tab
- `proto:device-state:desktop` — last Desktop pill
- `proto:device-state:mobile-web` — last Mobile Web pill
- `proto:device-state:app` — last App pill (default: `returning-passkey`)

---

## Group 1 · Passkey Sign-In

### 1a · Happy Path — Passkey / Face ID `78:31`

**Scenario:** A returning user on a device where they've previously set up Face ID for their Ace account. This is the target end-state for most returning users on mobile — the fastest, most secure path.

**Design intent:** The passkey-first chooser is only shown when the device OS reports a stored WebAuthn credential for this account. By surfacing it conditionally, users who haven't set up passkeys never see a Face ID button that won't work for them. The sign-in requires no password entry and no code — just the OS biometric confirmation. Authentication is fully phishing-resistant because the credential is device-bound.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-chooser:passkey-first` | Entry point when a passkey is detected. Prominently surfaces "SIGN IN WITH FACE ID" as the primary action. Other methods (password, OTP) are listed below as alternatives but visually subordinate. | ✅ |
| 2 | `screen-passkey:idle` | Holds the UI while the OS biometric dialog runs. The ring animation signals that authentication is in progress. No user interaction needed — the OS takes over. | ✅ |
| 3 | OS biometric sheet | The native iOS/Android prompt. Not part of the app's UI. | — |
| 4 | `screen-passkey:success` | **Terminal step.** Biometric ring turns green; label reads "You're signed in / Welcome back to Ace Hardware." The action buttons hide so the user isn't tempted to re-trigger an already-successful ceremony. By design there is no separate signed-in destination — the host app takes it from here. | ✅ |

---

### 1b · Biometric Failed `80:31`

**Scenario:** The user is on a device with a saved passkey, but Face ID failed — wrong angle, obscured camera, wet finger, or the user cancelled the OS dialog.

**Design intent:** Failure needs a graceful, non-punishing recovery. The user is already in context (they got this far), so the `failed` state keeps them on the passkey screen rather than kicking them back to the chooser. They see a clear reason for the failure and can either retry Face ID or immediately pivot to password or OTP without losing their place.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-chooser:passkey-first` | Starting point. | ✅ |
| 2 | `screen-passkey:idle` | Biometric ceremony begins. | ✅ |
| 3 | `screen-passkey:failed` | OS returned an error or the user cancelled. Shows an inline explanation and fallback options — retry Face ID, use password, or use a one-time code. No email re-entry required. | ✅ |

---

### 1c · No Passkey Found `463:886`

**Scenario:** The user tapped "Face ID / Passkey" from the default chooser (no passkey detected on this device), but after initiating the WebAuthn lookup, the browser confirms there is no credential registered for this account on this device. Common when signing in on a new device, after resetting a device, or for an account that has never had passkeys set up.

**Design intent:** Rather than landing on a dedicated dead-end screen, the user is returned to the chooser with an inline banner explaining that no passkey was found on this device. The chooser already presents every realistic forward path — Password, One-Time Code, and Scan with Phone (cross-device) — so the banner just gives context and lets the user pick a method without losing their place. Account recovery remains accessible via the per-method "Can't access..." links and Forgot Password flows; there is no longer a dedicated recovery hub.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-chooser:default` | Entry point when no passkey is detected. Face ID / Passkey tile is present but signals it will trigger a lookup first. | ✅ |
| 2 | `screen-passkey:idle` | OS credential lookup runs. For the `notfound` case this is brief — the OS returns immediately with no credential. | ✅ |
| 3 | `screen-chooser:default` + banner | User is returned to the chooser with an inline `passkey-not-found` banner. They pick Password, One-Time Code, or Scan with Phone to continue. | ✅ |

---

### 1h · Biometric Failed → Password Fallback `198:44`

**Scenario:** The user got Face ID failure on the passkey screen and instead of retrying, chose to fall back to password sign-in via the inline "Or continue with" tiles that surface in the `failed` state.

**Design intent:** This documents the in-context fallback that already exists in the failed state. Critically, the fallback tiles live *on the passkey screen itself* — the user does not have to back out to the chooser to switch methods. That preserves momentum ("I'm trying to get in") and avoids a punishing detour. The same path exists for OTP via the second fallback tile.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-passkey:idle` | Biometric ceremony begins. | ✅ |
| 2 | `screen-passkey:failed` | Failure state surfaces inline fallback tiles. | ✅ |
| 3 | `screen-password` | User taps the password fallback tile and lands on password entry. | ✅ |

---

### 1d–1g · OS Native Sheet Variants `100–103:31`

**Scenario / Design intent:** These Figma frames document the native WebAuthn browser/OS dialog behavior that the app cannot control or customize. On iOS, the native passkey sheet appears as a system bottom sheet — it handles biometric confirmation, no-credential states, and enrollment nudges on its own. These are included in Figma as reference for the complete user journey and to ensure dev teams understand which parts of the flow are app-owned vs. OS-owned.

| Flow | Figma Frame | Notes |
|------|-------------|-------|
| OS Sheet — Happy Path | `100:31` | Figma reference only — no prototype screens |
| Biometric Fails (OS Sheet) | `101:31` | Figma reference only |
| No Passkey Enrolled (OS Sheet) | `102:31` | Figma reference only |
| Enrollment Nudge (OS Sheet) | `103:31` | Figma reference only |

---

## Group 2 · Cross-Device Passkey Sign-In

### 2a · Happy Path — Cross-Device via QR `116:31`

**Scenario:** A user who has a passkey on their phone but is signing in on a different device — a desktop browser, a tablet, or any device where their phone's passkey isn't available. They choose to authenticate by scanning a QR code with their phone.

**Design intent:** Cross-device passkey authentication (via the WebAuthn caBLE/Hybrid protocol) lets users leverage a passkey on one device to authenticate a session on another. The QR code creates a temporary encrypted channel between the two devices using Bluetooth proximity as a trust signal. This is more secure than emailing a link or entering a code because it requires physical proximity. From the UX side, the flow is self-guiding — the QR screen gives instructions and the phone handles the rest.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-chooser:default` | User is on a device without a saved passkey. | ✅ |
| 2 | `screen-passkey:idle` | The "Use a passkey from another device" option is visible. User taps it. | ✅ |
| 3 | `screen-passkey:cross-device` | Displays the QR code and instructions. The user scans with their phone. The phone handles biometric confirmation and returns the assertion to this session over the encrypted caBLE channel. | ✅ |
| 4 | Phone-side biometric | OS-native on the phone. Not part of the app's UI. | — |
| 5 | `screen-passkey-enroll:prompt` | **Terminal step.** Post-sign-in enrollment offer. The user just proved they want passkeys but doesn't have one on *this* device yet — ideal moment to offer setup. By design no separate signed-in destination follows; the host app takes it from here. | ✅ |
| 6 | _Host app post-auth_ | Where the user lands after the auth experience completes — not designed in this prototype. | — |

---

### 2b · QR Code Expired `120:31`

**Scenario:** The QR session has a short validity window (approximately 2 minutes). If the user didn't scan in time — or the phone scanned but authentication didn't complete before the window closed — the session expires.

**Design intent:** The expired state is distinct from an authentication failure. It's a timing problem, not a credential problem. The screen makes that clear and offers an immediate retry (generate a new QR) or a switch to a different sign-in method.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-passkey:cross-device` | QR shown; session timer running. | ✅ |
| 2 | `screen-passkey:cross-device-failed` | Session expired before authentication completed. Offers retry or switch to another method. | ✅ |

---

### 2c · No Passkey on Phone `123:31`

**Scenario:** The phone successfully scanned the QR code and established the encrypted channel, but reported that it has no passkey registered for this account.

**Design intent:** This is a credential problem rather than a connectivity problem. The copy is specific — it doesn't say the QR expired or the connection failed; it tells the user their phone doesn't have a passkey for this account. They can try a different phone or fall back to password/OTP.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-passkey:cross-device` | QR shown; phone scanned successfully. | ✅ |
| 2 | `screen-passkey:cross-device-no-credential` | Phone connected but has no matching passkey. Offers: try a different device, or use another sign-in method. | ✅ |

---

### 2d · Bluetooth / Proximity Error `126:31`

**Scenario:** The caBLE protocol uses Bluetooth Low Energy for proximity verification — both devices must be physically nearby. If Bluetooth is off on either device, or they're too far apart, the transport layer fails even if the QR was scanned.

**Design intent:** This error is specific to the transport, not the credential. The screen prompts the user to check that Bluetooth is enabled and the devices are close, then retry. It's framed as a fixable technical issue, not a failure of their passkey.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-passkey:cross-device` | QR shown; phone scanned. | ✅ |
| 2 | `screen-passkey:cross-device-transport-error` | BLE/proximity connection failed. Explains the likely cause (Bluetooth or distance) and offers retry or fallback. | ✅ |

---

### 2e · Transport Error Fork `183:31`

**Scenario:** After a transport error, the user decides whether to retry the cross-device flow or abandon it and sign in a different way.

**Design intent:** This fork represents the two most likely user responses to a Bluetooth error — those who want to fix it and try again, and those who just want to get signed in and will use password or OTP instead. Both exits are first-class options.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-passkey:cross-device-transport-error` | Fork point. | ✅ |
| 2a | `screen-passkey:cross-device` | User retries — a fresh QR is generated. | ✅ |
| 2b | `screen-chooser:default` | User abandons cross-device and chooses another method. | ✅ |

---

### 2f · Direct Entry — “Use Another Device” Tile `198:87`

**Scenario:** A user on a device without a saved passkey explicitly chooses to sign in with another device by tapping the “Use another device” tile on the chooser, skipping the passkey idle prompt entirely.

**Design intent:** The chooser exposes two paths to cross-device passkey: (a) tapping the Face ID / Passkey tile and then selecting “Use a passkey from another device” on the passkey screen, or (b) tapping the dedicated “Use another device” tile on the chooser. Path (b) is for users who already know they want the cross-device flow and don’t need the passkey ceremony to fail first. Documenting both keeps the entry-point graph honest.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-chooser:default` | User taps the “Use another device” tile (`tile-cd-chooser`). | ✅ |
| 2 | `screen-passkey:cross-device` | QR shown directly — no passkey idle step. | ✅ |

---

## Group 3 · Password Sign-In

### 3a · Happy Path — Password Sign-In `86:31`

**Scenario:** A user without passkeys (or who chose password from the chooser) signs in with their email and password and is offered the chance to set up Face ID.

**Design intent:** Password is the fallback for users not yet on passkeys. The flow is intentionally standard and unsurprising — email + password → done. The final step (passkey enrollment offer) is the key nudge: this is the primary vector for migrating existing password users onto passkeys. It appears post-authentication (not as a gate) so it never blocks sign-in — users who skip it still get in. MFA is not chained after password; the OTP tile on the chooser is the entry point for one-time-code sign-in.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-chooser:default` | No passkey on device. User selects Password. | ✅ |
| 2 | `screen-password` | Email and password entry. Standard credentials form. | ✅ |
| 3 | `screen-passkey-enroll:prompt` | **Terminal step.** Post-sign-in enrollment offer. "Sign in faster with Face ID" — invites the user to set up a passkey now that they've successfully authenticated. Skippable without penalty. By design no separate signed-in destination follows. | ✅ |

---

### 3b · Wrong Password `90:31`

**Scenario:** The user entered an incorrect password.

**Design intent:** Inline error with remaining attempt count. Gives clear, specific feedback without locking the account prematurely. The attempt counter sets expectations so the user doesn't accidentally lock themselves out.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-chooser:default` | Starting point. | ✅ |
| 2 | `screen-password` | Credentials entered. | ✅ |
| 3 | `screen-password:error` | Inline error showing remaining attempts. The email field is pre-filled; only password needs re-entry. | ✅ |

---

### 3c · Account Locked `169:32`

**Scenario:** The user has exceeded the allowed number of wrong password attempts and the account is temporarily locked.

**Design intent:** Lockout protects against brute-force attacks but shouldn't permanently trap legitimate users. The screen shows a countdown until the lock expires and surfaces "Reset your password" as an immediate escape — users who genuinely forgot their password can resolve it without waiting.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-chooser:default` | Starting point. | ✅ |
| 2 | `screen-password` | Credentials entered. | ✅ |
| 3 | `screen-password:error` | Final warning before lockout. | ✅ |
| 4 | `screen-account-locked` | Account locked. Shows countdown and password reset CTA. | ✅ |

---

### 3d · Forgot Password → Reset `92:31`

**Scenario:** The user can't remember their password and taps "Forgot password?" from the password screen.

**Design intent:** Standard email-based reset. The reset link is time-limited (see Group 6 for the expired-link branch). The success screen confirms the password was changed and directs the user back to sign in — it doesn't auto-sign-in, because on a shared/public device the user may want to return to the chooser on their own terms.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-chooser:default` | Starting point. | ✅ |
| 2 | `screen-password` | User taps "Forgot password?" | ✅ |
| 3 | `screen-forgot-password` | Email entry for reset. | ✅ |
| 4 | `screen-reset-sent` | Confirms the email was sent. Provides a resend option. | ✅ |
| 5 | `screen-new-password` | User arrives from the reset link in their email. Creates a new password. | ✅ |
| 6 | `screen-reset-success` | Confirms the password was changed. CTA returns to sign in. | ✅ |

---

## Group 4 · One-Time Code (OTP) Sign-In

### 4a · Happy Path — OTP Sign-In `93:31`

**Scenario:** A user without passkeys who prefers not to use a password — or a user who uses OTP as their primary second factor. They select a delivery channel, receive a 6-digit code, and enter it to sign in.

**Design intent:** OTP is the passwordless fallback for users who haven't set up passkeys. The channel selection step (email vs. phone) lets users pick whichever channel they have access to at the moment. Like the password happy path, this ends with a passkey enrollment offer to encourage migration.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-chooser:default` | User selects One-Time Code. | ✅ |
| 2 | `screen-otp` | Channel selection — email or registered phone number. User requests the code. | ✅ |
| 3 | `screen-verify:default` | 6-digit code entry. Timer visible. | ✅ |
| 4 | `screen-passkey-enroll:prompt` | **Terminal step.** Post-sign-in enrollment offer. Same as password happy path. By design no separate signed-in destination follows. | ✅ |

---

### 4b · Wrong Code `94:31`

**Scenario:** The user entered an incorrect code.

**Design intent:** Same pattern as wrong password — inline error with remaining attempts. The code field clears so they don't accidentally submit the same wrong entry again.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1–3 | (same as 4a steps 1–3) | Setup. | ✅ |
| 4 | `screen-verify:wrong` | Inline error with remaining attempt count. | ✅ |

---

### 4c · Resend Cooldown `96:31`

**Scenario:** The user requested a new code too quickly after the last one.

**Design intent:** Cooldown prevents code-flooding — users accidentally (or maliciously) spamming resend. The timer is visible so the user knows exactly when they can request again. During the cooldown the previously-sent code is still valid.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-otp` | Code requested. | ✅ |
| 2 | `screen-verify:default` | Code entry. User taps resend too soon. | ✅ |
| 3 | `screen-verify:cooldown` | Resend button disabled with countdown. | ✅ |

---

### 4d · Expired Code `97:31`

**Scenario:** The user's code exceeded its validity window before they submitted it.

**Design intent:** Codes expire for security. The expired state is clearly distinct from the wrong-code state — it tells the user exactly what happened and what to do (request a new code). No failed-attempt penalty since the code genuinely expired, not because the user entered it wrong.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-otp` | Code requested. | ✅ |
| 2 | `screen-verify:default` | User didn't submit before expiry. | ✅ |
| 3 | `screen-verify:expired` | Clear expiry message; CTA to request a new code. | ✅ |

---

### 4e · Account Locked `98:31`

**Scenario:** The user entered too many incorrect codes and the verify session is locked.

**Design intent:** Lockout after wrong code attempts prevents brute-force OTP guessing. Unlike account-level password lockout, this is session-level — the user can try signing in a different way without waiting. The screen routes them to their available alternatives.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-otp` | Code requested. | ✅ |
| 2 | `screen-verify:default` | Codes entered incorrectly multiple times. | ✅ |
| 3 | `screen-verify:wrong` | Intermediate wrong-code warning. | ✅ |
| 4 | `screen-verify:locked` | Session locked. Routes to alternate sign-in methods. | ✅ |

---

### 4f · Code Resent Confirmation `169:53`

**Scenario:** The user successfully requested a new code.

**Design intent:** A brief confirmation state reassures the user the resend worked without them having to guess. Auto-dismisses after a few seconds and returns to normal code entry. This prevents the confusion of "did my tap do anything?" after hitting resend.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-verify:default` | User taps resend. | ✅ |
| 2 | `screen-verify:resent` | Confirmation banner shown briefly, then returns to `default`. | ✅ |

---

### 4g · Can't Access Code `169:74`

**Scenario:** The user can't receive a code on any of their registered channels — they've lost access to their phone number, their email is inaccessible, or both.

**Design intent:** This is the OTP dead-end. Rather than leaving the user stranded, the screen offers two forward paths: try signing in with a password, or contact account support. It's a clear off-ramp rather than an error with no resolution.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-verify:default` | User taps "Can't access code?" | ✅ |
| 2 | `screen-otp-no-access` | No channels reachable. Routes to password sign-in or account support contact. | ✅ |

---

### 4h · Can't Access Code → Switch to Password `198:254`

**Scenario:** The user is on the OTP can’t-access screen and chooses to sign in with a password instead, taking the primary forward path off the dead-end.

**Design intent:** The “Use Password Instead” CTA is the canonical escape valve from OTP. Documenting it as a discrete journey (rather than just an entry point) reinforces that the can’t-access screen is a *fork*, not a terminus. The password screen the user lands on inherits the chooser identifier so they don’t re-type their email.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-verify:default` | User on code entry, can’t receive a code. | ✅ |
| 2 | `screen-otp-no-access` | Escape options shown. | ✅ |
| 3 | `screen-password` | User taps “Use Password Instead” and lands on password entry with their email pre-filled. | ✅ |

---

## Group 5 · Passkey Registration & Enrollment

### 5a · Happy Path — Passkey Registration `129:31`

**Scenario:** A user just signed in successfully (via password or OTP) on a device where they haven't set up Face ID. They're presented with the enrollment offer and accept it.

**Design intent:** The enrollment prompt is the key conversion moment — turning a password/OTP user into a passkey user. It appears post-authentication so it never gates sign-in. The copy ("Sign in faster with Face ID") frames passkeys as a benefit, not a security requirement. Accepting triggers a WebAuthn `create()` call, which fires the OS biometric prompt to create and store the credential.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-passkey-enroll:prompt` | The enrollment offer — benefit-framed, skippable. Shows what the user gains and reassures them nothing leaves their device. | ✅ |
| 2 | OS biometric sheet | Device creates and stores the passkey. App-owned transition to success on completion. | — |
| 3 | `screen-passkey-enroll:success` | Confirms Face ID is set up. Next time they visit, they'll see the passkey-first chooser. | ✅ |

---

### 5b · Biometric Fails / User Cancels `137:31`

**Scenario:** The user accepted the enrollment offer, but Face ID failed during the credential creation step — or they cancelled the OS dialog.

**Design intent:** A failed enrollment attempt shouldn't feel like a punishment. The error screen offers a clean retry and makes clear that cancelling is fine — they can set it up from Account Settings any time.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-passkey-enroll:prompt` | User accepts. | ✅ |
| 2 | `screen-passkey-enroll:error` | Biometric failed or cancelled. Offers retry and a "Set up later" exit. | ✅ |

---

### 5c · Passkey Already Exists `139:31`

**Scenario:** The WebAuthn `create()` call returned `InvalidStateError` — a passkey for this account already exists on this authenticator. This can happen if the user set up Face ID previously (e.g., from settings) and the app then tried to create a duplicate.

**Design intent:** This is a silent success masquerading as an error. The user doesn't need to do anything — they already have Face ID set up. The screen is a reassurance screen, not an error screen. It confirms they're all set and lets them continue.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-passkey-enroll:prompt` | Enrollment triggered. | ✅ |
| 2 | `screen-passkey-enroll:already-enrolled` | Passkey already exists — no action needed. "You're all set." | ✅ |

---

### 5d · User Declines Setup `141:31`

**Scenario:** The user taps "Not now" on the enrollment prompt.

**Design intent:** Declining should be easy and consequence-free. The `declined` state shows two distinct exit options because they represent meaningfully different intents: "Maybe Later" means snooze (the prompt will reappear on the next sign-in), while "Don't Ask Again" means suppress (the prompt will never appear again). The distinction respects user autonomy — some people just aren't ready; others have made a deliberate decision not to use Face ID.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-passkey-enroll:prompt` | User taps "Not now." | ✅ |
| 2 | `screen-passkey-enroll:declined` | Two options: "Maybe Later" (snooze) or "Don't Ask Again" (permanent suppress). | ✅ |

---

### 5f · Declined Fork — Don't Ask Again

**Scenario:** The user chose "Don't Ask Again" on the declined screen, permanently suppressing the enrollment prompt.

**Design intent:** "Don't Ask Again" is an irreversible preference that deserves an explicit acknowledgment screen — not a browser `alert()`. The `suppressed` state is a quiet confirmation: neutral icon, plain copy ("Got it, won't ask again"), a reminder that Face ID is still available via Settings, and a single "CONTINUE" button to proceed. There are no secondary options — the decision has been made and the screen's only job is to confirm it and get out of the way. The neutral gray icon color intentionally avoids making this feel like an error or a success.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-passkey-enroll:declined` | User taps "Don't Ask Again." | ✅ |
| 2 | `screen-passkey-enroll:suppressed` | Acknowledgment screen. Confirms preference saved, surfaces Settings path, single CONTINUE CTA. | ✅ |
| 3 | `screen-chooser:default` | Returns to chooser; enrollment prompt suppressed. | ✅ |

---

### 5e · Declined Fork — Maybe Later `176:31`

**Scenario:** The user chose "Maybe Later" on the declined screen — they're not ready to set up Face ID but haven't ruled it out.

**Design intent:** "Maybe Later" is a snooze, not a permanent decision. The prompt will reappear on the next sign-in. The user is returned to the chooser immediately — no friction, no guilt, no extra screen. The simplicity of this exit reinforces that declining is consequence-free.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-passkey-enroll:declined` | User taps "Maybe Later." | ✅ |
| 2 | `screen-chooser:default` | Returns to chooser; preference snoozed until next sign-in. | ✅ |

---

## Group 6 · Password Reset

### 6a · Happy Path — Password Reset `104:31`

**Scenario:** The user initiated a password reset (from "Forgot password?" or from account recovery) and successfully creates a new password via the emailed link.

**Design intent:** Standard email-based reset. The flow is deliberately linear and instructional — the user is stressed and needs clear steps. The success screen confirms the change and sends them back to sign in explicitly, since the session from the reset link shouldn't auto-authenticate on a potentially shared device.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-forgot-password` | Email entry for reset request. | ✅ |
| 2 | `screen-reset-sent` | Confirms the email was dispatched. Resend option in case it doesn't arrive. | ✅ |
| 3 | `screen-new-password` | Arrived via the reset link. New password creation with strength requirements. | ✅ |
| 4 | `screen-reset-success` | Password changed. Directs user back to sign in. | ✅ |

---

### 6b · Reset Link Expired `109:31`

**Scenario:** The user clicked the reset link from their email, but the link's validity window had passed (typically 1 hour).

**Design intent:** Expiry is a security feature — reset links shouldn't be valid indefinitely. The expired state is treated as a new starting point: the user is offered a CTA to request a fresh link without having to navigate back to the sign-in page manually.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-forgot-password` | Reset requested. | ✅ |
| 2 | `screen-reset-sent` | Link emailed. | ✅ |
| 3 | `screen-new-password:expired` | Link expired before use. Explains why and offers to resend a fresh link. | ✅ |

---

### 6c · Email Not Found `107:31`

**Scenario:** The user submitted an email address that has no matching Ace account.

**Design intent:** The error is inline and specific — "We don't have an account with that email." This is intentionally clear rather than vague, because users in this flow often have multiple email addresses and may have signed up with a different one. The field stays editable so they can try another address.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-forgot-password` | Email submitted. | ✅ |
| 2 | `screen-forgot-password:not-found` | Inline error. Field stays active for correction. | ✅ |

---

### 6d · Rate Limiting `113:31`

**Scenario:** The user (or an automated actor) has submitted too many reset requests for the same account or from the same IP in a short window.

**Design intent:** Rate limiting protects accounts from password-reset abuse and email flooding. The form is replaced with a lockout panel showing a countdown — the user can't retry until the window clears. The copy is non-accusatory since this can happen legitimately (e.g., user clicked multiple times thinking it wasn't working).

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-forgot-password` | Too many requests submitted. | ✅ |
| 2 | `screen-forgot-password:rate-limited` | Lockout panel with countdown timer. | ✅ |

---

## Group 7 · Account Recovery — *(deprecated as a dedicated flow)*

**About this group:** The previous design routed every recovery scenario through a dedicated recovery hub (`screen-recovery` → `screen-verify` → `screen-reenroll`). That hub has been **deprecated**. The screens still exist in the prototype for reference and remain reachable from the Screens tab, but they are no longer wired into any user flow.

**Why it changed:** The recovery hub only exposed Password and One-Time Code as verification channels — both of which are already first-class tiles on the chooser. Routing a user through the hub added an extra layer between them and the method they actually wanted to use, with no incremental security benefit.

**Where recovery happens now:** Each sign-in method owns its own in-context escape valve, so users never have to leave the path they started on:

| Original recovery scenario | New in-method path |
|----------------------------|--------------------|
| Forgot password | `screen-password` → **"Forgot password?"** → Password Reset flow (Group 6) |
| Can't receive OTP code | `screen-verify` → **"Can't access this code?"** → `screen-otp-no-access` |
| OTP rate-limited | `screen-verify:locked` → user can fall back to Password tile on chooser |
| No passkey on device | `screen-chooser:default` + `passkey-not-found` banner → user picks Password, OTP, or Scan with Phone (Group 1c) |
| Post-recovery passkey re-enrollment | Covered by Group 4 (Passkey Registration & Enrollment) after any successful sign-in |

**Legacy screens still present (Screens-tab reference only):** `screen-recovery`, `screen-recovery:locked`, `screen-reenroll:prompt`, `screen-reenroll:success`, `screen-reenroll:error`.

---

## Group 8 · Account Settings & Security

**About this group:** The security settings area is the post-login management surface for passkeys, sign-in activity, and active sessions. It's not part of the sign-in flow itself, but it's where users come to manage the credentials they use to sign in — registering new passkeys, reviewing which devices have access, or investigating suspicious activity.

---

### 8a · Security Settings Overview `165:31`

**Design intent:** The security hub (`screen-settings-security`) is a single consolidated view of everything security-related: registered passkeys, recent sign-in activity, and active sessions. By aggregating these in one place, users don't need to hunt through settings menus. It's the starting point for all settings-area flows.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-settings-security` | Overview: passkey list summary, recent activity preview, active devices count. | ✅ |

---

### 8b · Sign-In Activity Log `165:57`

**Design intent:** Gives users visibility into recent sign-in events — device, location, method, and timestamp. This is primarily for anomaly detection: "Was that me?" If the user sees an unfamiliar sign-in, they have context to act (change password, remove a session). The log is read-only — actions live on the active devices screen.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-settings-security` | User taps "View activity." | ✅ |
| 2 | `screen-activity` | Full sign-in log with device, location, method for each event. | ✅ |

---

### 8c · Active Devices & Remote Sign-Out `165:73`

**Design intent:** Shows all devices that currently have an active session — useful after a device loss or after spotting an unfamiliar sign-in in the activity log. Remote sign-out terminates the session on the selected device immediately.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-settings-security` | User taps "Active devices." | ✅ |
| 2 | `screen-active-devices` | List of active sessions with device name, last seen, and sign-out action. | ✅ |

---

### 8d · Rename a Passkey `165:99`

**Scenario:** Users can register multiple passkeys — one per device. The default name is typically the device name (e.g., "iPhone 15 Pro"). Renaming lets users distinguish between devices when they have several registered.

**Design intent:** Passkey management should feel as intuitive as managing saved passwords. Rename is a low-stakes operation and the UI reflects that — it's an inline edit field, not a modal confirmation.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-settings-security` | User navigates to passkey management. | ✅ |
| 2 | `screen-settings-passkeys:list` | All registered passkeys shown with device name, date added, and actions. | ✅ |
| 3 | `screen-settings-passkeys:rename` | Inline edit field for the passkey name. | ✅ |

---

### 8e · Remove a Passkey `165:120`

**Scenario:** The user wants to revoke a passkey — typically because a device was lost, sold, or they simply no longer want that device to have Face ID access.

**Design intent:** Removal is a security action and gets a confirmation step. The standard `remove` confirmation screen is clear but not alarming. The `remove-last` state is treated differently — it requires a stricter confirmation that explicitly warns the user they will lose Face ID sign-in entirely on all devices after removal.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-settings-security` | User navigates to passkey management. | ✅ |
| 2 | `screen-settings-passkeys:list` | User selects a passkey to remove. | ✅ |
| 3 | `screen-settings-passkeys:remove` | Confirm removal. Warns that another sign-in method will be required from that device. | ✅ |

---

### 8f · Remove Last Passkey (Only Passkey Warning) `421:2`

**Scenario:** The user tries to remove their only remaining passkey. This is treated as a higher-stakes action than a standard removal because it results in losing Face ID sign-in entirely — not just on one device, but across all entry points.

**Design intent:** The `remove-last` state diverges from `remove` specifically to surface that loss of access consequence before it's too late. The stricter confirmation (`screen-settings-passkeys:remove-last`) uses a triangle warning icon and reframes the action: "This is your only passkey" sets context, and the CTA escalates to REMOVE ANYWAY rather than just REMOVE. The cancel action is labeled "Keep passkey" — grounding the user in what they'd be preserving rather than what they're canceling. After confirmation, the list refreshes to an empty state with an "Add a passkey" CTA, keeping the recovery path discoverable.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-settings-security` | User navigates to passkey management. | ✅ |
| 2 | `screen-settings-passkeys:list` | Only one passkey in list. User taps it and selects remove. | ✅ |
| 3 | `screen-settings-passkeys:remove-last` | Stricter warning: triangle icon, "This is your only passkey," REMOVE ANYWAY CTA. | ✅ |

---

## Group 9 · Recovery Email Setup

A backup-email enrollment journey reachable from the Security hub. Mirrors the Figma frame `463:475` *flow:recovery-email-enrollment*. The hub row reflects three states (`not-set`, `pending`, `verified`) so the same screen is reusable across the lifecycle.

### 9a · Happy Path — Add Recovery Email `463:475`

**Scenario:** A signed-in user adds a backup email address from the Security hub and verifies it on the same session, ending with a verified status.

**Design intent:** A recovery email is a soft, low-friction account-recovery anchor — lower-stakes than a passkey but useful when every other channel is unreachable. Setup is intentionally short: the user enters the address, sees a confirmation that the verification link was sent, and on completion the hub row updates to a verified badge so the status is visible without drilling in.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-settings-security:recovery-not-set` | Hub shows “Add a recovery email” row. | ✅ |
| 2 | `screen-settings-recovery-email:request` | User enters a backup address and submits. | ✅ |
| 3 | `screen-settings-recovery-email:sent` | Verification link sent confirmation. | ✅ |
| 4 | `screen-settings-security:recovery-verified` | Hub row updates with verified badge. | ✅ |

---

### 9b · Pending Verification — Hub Reflects Status `463:475`

**Scenario:** The user submits a recovery email but leaves the verification link unclicked. The Security hub reflects the pending status so they can resume later.

**Design intent:** Pending state is a first-class status, not an error. Surfacing it on the hub avoids the “did that even save?” ambiguity and gives the user a clear resume affordance whenever they next visit Security.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-settings-security:recovery-not-set` | Starting point. | ✅ |
| 2 | `screen-settings-recovery-email:request` | Enter address. | ✅ |
| 3 | `screen-settings-recovery-email:sent` | Verification link sent. User leaves before verifying. | ✅ |
| 4 | `screen-settings-security:recovery-pending` | Hub shows pending badge so the user can complete verification later. | ✅ |

---

### 9c · Use a Different Email — Loop Back `463:475`

**Scenario:** On the verification-sent screen the user realizes they entered the wrong address (or wants to use a different one). They tap “Use a different email” to loop back to the entry step without leaving the flow.

**Design intent:** Mirrors the new `reset-edit-different-email` pattern in the password-reset flow — a one-tap retry that keeps the user in context rather than forcing them to navigate back through the hub.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-settings-recovery-email:request` | Enter address. | ✅ |
| 2 | `screen-settings-recovery-email:sent` | Verification link sent. | ✅ |
| 3 | `screen-settings-recovery-email:request` | User taps “Use a different email” — returns to entry, field cleared. | ✅ |

---

## Remaining Gaps

### Screens / States Still Missing from the Prototype

| # | Gap | Affects | Priority |
|---|-----|---------|----------|
| ~~1~~ | ~~**Home / signed-in destination** — every happy path terminates at the last auth screen rather than a post-login state~~ | ~~All groups~~ | ✅ By design — prototype scope ends at auth completion; host app owns post-auth |
| ~~2~~ | ~~`screen-passkey-enroll:declined` — "Don't Ask Again" exit has no distinct confirmation screen~~ | ~~Group 5e~~ | ✅ Fixed |
| ~~3~~ | ~~`screen-settings-passkeys:remove-last` — exists in prototype but has no named flow or Figma frame~~ | ~~Group 8e~~ | ✅ Fixed |

### Wiring Gaps (Screen Exists, but Organic Routing Is Missing)

| # | Gap | Fix |
|---|-----|-----|
| ~~1~~ | ~~`screen-passkey-enroll:prompt` is only reachable via the Settings "Add Passkey" button — it is not automatically surfaced after a password or OTP sign-in on a device with no passkey~~ | ✅ Fixed — `pw-submit-btn` happy path (password sign-in) and `verify-btn` happy path (OTP sign-in) both set `enrollOrigin = 'post-login'` and navigate to `screen-passkey-enroll:prompt`; the `password-happy`, `otp-happy`, and `cross-device-happy` FLOWS all include enrollment as the final step |
| ~~2~~ | ~~`screen-passkey:notfound` — the "SET UP FACE ID" button (`passkey-setup-enroll-btn`) exists on screen but has no click handler routing it to `screen-passkey-enroll:prompt`~~ | ✅ Fixed — handler added; `enrollOrigin = 'post-login'` set so that skipping enrollment routes to the signed-in confirmation rather than Security Settings |
