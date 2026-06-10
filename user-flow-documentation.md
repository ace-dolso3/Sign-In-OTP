# Ace Hardware Sign-In Flow — User Flow Documentation

> **Source of truth:** The `FLOWS` array and `SCREEN_DESCRIPTIONS` object in `sign-in.html`. This document is derived directly from those definitions and reflects the prototype's current wired state as of the last update.
>
> **Figma file key:** `IDuYbd4aYwGsFgo6c3ThVX` · Flows page: "Prototype Flows"
> **Prototype:** `sign-in.html` (local + Vercel — `feature/faceid-passkey` branch)

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
| `screen-chooser` | `default`, `passkey-first` | Entry point; state driven by passkey detection on device |
| `screen-passkey` | `idle`, `failed`, `notfound`, `cross-device`, `cross-device-failed`, `cross-device-no-credential`, `cross-device-transport-error` | Passkey sign-in; multiple error/fallback states |
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
| `screen-recovery` | `default`, `locked` | Account recovery entry; `locked` = OTP rate-limited |
| `screen-reenroll` | `prompt`, `success`, `error` | Passkey re-enrollment after account recovery |

> **Still missing from all happy paths:** A signed-in / home destination screen. Every authenticated flow terminates at the final prototype screen rather than a post-login state.

---

## How to read this document

Each flow has:
- **A scenario summary** — who this user is and what triggered this path
- **Design intent** — why this flow or screen exists; what UX problem it solves
- **A step table** — the screen sequence with a purpose note for each step

Screen states are referenced as `screen-id:state` (e.g. `screen-passkey:notfound`). When state is omitted, the screen has only one visual state.

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
| 4 | Authenticated → home | App receives the WebAuthn assertion and completes the session. | ❌ Missing |

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

### 1c · No Passkey Found `81:31`

**Scenario:** The user tapped "Face ID / Passkey" from the default chooser (no passkey detected on this device), but after initiating the WebAuthn lookup, the browser confirms there is no credential registered for this account on this device. Common when signing in on a new device, after resetting a device, or for an account that has never had passkeys set up.

**Design intent:** This screen serves three distinct needs simultaneously: (1) explain why Face ID didn't work without making the user feel like they did something wrong, (2) offer every realistic forward path — use another device, set up Face ID right now, sign in with password or OTP, (3) provide an escape valve to account recovery for users who are truly locked out. The "Having trouble? Get account help" recovery link is intentionally a small text link at the bottom — recovery is a last resort and shouldn't compete visually with the primary paths.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-chooser:default` | Entry point when no passkey is detected. Face ID / Passkey tile is present but signals it will trigger a lookup first. | ✅ |
| 2 | `screen-passkey:idle` | OS credential lookup runs. For the `notfound` case this is brief — the OS returns immediately with no credential. | ✅ |
| 3 | `screen-passkey:notfound` | Explains the situation and presents: SCAN WITH PHONE (cross-device), Password, One-Time Code, SET UP FACE ID (enrollment), and "Having trouble? Get account help" (recovery). The SET UP FACE ID CTA is specific to this state — it's only shown here, not on the `failed` or `idle` states. | ✅ |

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
| 5 | Authenticated → home | Session completes on the original device. | ❌ Missing |

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

## Group 3 · Password Sign-In

### 3a · Happy Path — Password Sign-In `86:31`

**Scenario:** A user without passkeys (or who chose password from the chooser) signs in with their email and password, completes MFA, and is offered the chance to set up Face ID.

**Design intent:** Password is the fallback for users not yet on passkeys. The flow is intentionally standard and unsurprising — email + password → MFA code → done. The final step (passkey enrollment offer) is the key nudge: this is the primary vector for migrating existing password users onto passkeys. It appears post-authentication (not as a gate) so it never blocks sign-in — users who skip it still get in.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-chooser:default` | No passkey on device. User selects Password. | ✅ |
| 2 | `screen-password` | Email and password entry. Standard credentials form. | ✅ |
| 3 | `screen-verify:default` | MFA second factor. A one-time code was sent to a registered channel. Required after every password sign-in to prevent credential-stuffing attacks from being sufficient on their own. | ✅ |
| 4 | `screen-passkey-enroll:prompt` | Post-login enrollment offer. "Sign in faster with Face ID" — invites the user to set up a passkey now that they've successfully authenticated. Skippable without penalty. | ✅ |

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
| 4 | `screen-passkey-enroll:prompt` | Post-login enrollment offer. Same as password happy path. | ✅ |

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

## Group 7 · Account Recovery

**About this group:** Account recovery is the path of last resort — for users who have lost access to *all* standard sign-in methods. They can't use Face ID (no passkey on this device), they don't know their password (or are locked out), and they can't receive OTP codes on their registered channels.

**Entry point — intentional design:** Every recovery flow starts at `screen-passkey:notfound`. This is by design: to enter recovery, the user must first prove that passkey sign-in failed on this device. The "Having trouble? Get account help" link is a plain text link at the bottom of the notfound screen — visually subordinate to all other options. This placement is deliberate: recovery is high-friction by design because it bypasses normal authentication. It should not be the first thing users reach for.

---

### 7a · Happy Path — Account Recovery `154:31`

**Scenario:** User successfully proves their identity via OTP during recovery and re-enrolls a passkey so they won't be locked out again.

**Design intent:** The recovery triage screen (`screen-recovery`) focuses on identity verification, not authentication — the user needs to prove who they are, not sign in. OTP is the primary verification channel. After verification, the re-enrollment prompt closes the loop: if the user just recovered their account because they had no passkey, now is the ideal moment to set one up so this doesn't happen again.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-passkey:notfound` | User taps "Having trouble? Get account help." | ✅ |
| 2 | `screen-recovery` | Recovery triage. Offers: "Send a one-time code" (primary) or "Use password instead" (if they remember it). This is identity verification, not sign-in. | ✅ |
| 3 | `screen-verify:default` | OTP code entry for identity verification. | ✅ |
| 4 | `screen-reenroll:prompt` | Post-recovery re-enrollment offer. Framed specifically around recovery prevention — "Don't get locked out again." | ✅ |
| 5 | `screen-reenroll:success` | Face ID re-enrolled. Account is fully recovered. | ✅ |

---

### 7b · Recovery Rate Limited `154:57`

**Scenario:** The user (or someone using their credentials maliciously) has requested too many OTP codes during the recovery flow in a short window.

**Design intent:** Recovery OTP requests are rate-limited separately from standard OTP sign-in because recovery is a higher-risk path. The lockout is intentionally 15 minutes and blocks OTP and the recovery help link — both are the vectors being rate-limited. Critically, the password sign-in path remains available as an escape valve for legitimate users who were just hitting retry too fast.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-passkey:notfound` | Recovery entry. | ✅ |
| 2 | `screen-recovery` | OTP requested too many times. | ✅ |
| 3 | `screen-recovery:locked` | Rate-limited panel with 15-min countdown. OTP and help link blocked. Password path still available. | ✅ |

---

### 7c · Re-Enroll Failed `154:73`

**Scenario:** The user successfully recovered their account via OTP verification, but the passkey re-enrollment step failed — either Face ID failed or they cancelled the OS dialog.

**Design intent:** The account is recovered — the user is authenticated. The failed re-enrollment is a missed opportunity to strengthen their account going forward, not a blocker to using it now. The screen treats it that way: the failure is acknowledged, a retry is offered, and a "Continue without re-enrolling" path exits cleanly. They can always set up Face ID later from Account Settings.

| Step | Screen | Purpose | Status |
|------|--------|---------|--------|
| 1 | `screen-passkey:notfound` | Recovery entry. | ✅ |
| 2 | `screen-recovery` | Verification channel chosen. | ✅ |
| 3 | `screen-verify:default` | Identity verified via OTP. | ✅ |
| 4 | `screen-reenroll:prompt` | Re-enrollment attempted. | ✅ |
| 5 | `screen-reenroll:error` | Biometric failed or cancelled. Account is recovered; re-enrollment is optional. Retry or continue. | ✅ |

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

## Remaining Gaps

### Screens / States Still Missing from the Prototype

| # | Gap | Affects | Priority |
|---|-----|---------|----------|
| 1 | **Home / signed-in destination** — every happy path terminates at the last auth screen rather than a post-login state | All groups | High |
| ~~2~~ | ~~`screen-passkey-enroll:declined` — "Don't Ask Again" exit has no distinct confirmation screen~~ | ~~Group 5e~~ | ✅ Fixed |
| ~~3~~ | ~~`screen-settings-passkeys:remove-last` — exists in prototype but has no named flow or Figma frame~~ | ~~Group 8e~~ | ✅ Fixed |

### Wiring Gaps (Screen Exists, but Organic Routing Is Missing)

| # | Gap | Fix |
|---|-----|-----|
| ~~1~~ | ~~`screen-passkey-enroll:prompt` is only reachable via the Settings "Add Passkey" button — it is not automatically surfaced after a password or OTP sign-in on a device with no passkey~~ | ✅ Fixed — `verify-btn` happy path sets `enrollOrigin = 'post-login'` and navigates to `screen-passkey-enroll:prompt`; both `password-happy` and `otp-happy` FLOWS include enrollment as the final step |
| ~~2~~ | ~~`screen-passkey:notfound` — the "SET UP FACE ID" button (`passkey-setup-enroll-btn`) exists on screen but has no click handler routing it to `screen-passkey-enroll:prompt`~~ | ✅ Fixed — handler added; `enrollOrigin = 'post-login'` set so that skipping enrollment routes to the signed-in confirmation rather than Security Settings |
