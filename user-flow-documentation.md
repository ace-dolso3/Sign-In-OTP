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

## Group 1 · Passkey Sign-In

### 1a · Happy Path — Passkey / Face ID `78:31`
*Device has a saved passkey; user signs in with Face ID.*

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-chooser:passkey-first` — passkey detected | ✅ |
| 2 | `screen-passkey:idle` — biometric prompt | ✅ |
| 3 | OS biometric sheet | — (OS native) |
| 4 | Authenticated → home | ❌ Missing |

---

### 1b · Biometric Failed `80:31`
*Face ID fails or is cancelled; user falls back.*

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-chooser:passkey-first` | ✅ |
| 2 | `screen-passkey:idle` | ✅ |
| 3 | `screen-passkey:failed` — biometric failed | ✅ |

---

### 1c · No Passkey Found `81:31`
*User taps Face ID / Passkey from the default chooser, but no credential exists for their account on this device.*

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-chooser:default` — no passkey | ✅ |
| 2 | `screen-passkey:idle` — initiating auth | ✅ |
| 3 | `screen-passkey:notfound` — no passkey on device | ✅ |

> **Entry note:** Users reach this screen by tapping the "Face ID / Passkey" tile on the default chooser. The OS passkey lookup runs, finds no credential for this account, and the app transitions to the `notfound` state. From here they can: scan with another device, set up Face ID on this device, sign in another way, or tap "Having trouble? Get account help" to begin account recovery.

---

### 1d–1g · OS Native Sheet Variants `100–103:31`
*These flows model the native iOS WebAuthn sheet behavior: happy path, biometric failure, no passkey enrolled, and enrollment nudge. The OS sheet is not part of the app's UI — no prototype screens exist for these steps.*

| Flow | Figma Frame | Prototype Steps |
|------|-------------|----------------|
| OS Sheet — Happy Path | `100:31` | Figma reference only |
| Biometric Fails (OS Sheet) | `101:31` | Figma reference only |
| No Passkey Enrolled (OS Sheet) | `102:31` | Figma reference only |
| Enrollment Nudge (OS Sheet) | `103:31` | Figma reference only |

---

## Group 2 · Cross-Device Passkey Sign-In

### 2a · Happy Path — Cross-Device via QR `116:31`
*User signs in using a passkey on a nearby phone by scanning a QR code.*

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-chooser:default` | ✅ |
| 2 | `screen-passkey:idle` — "Use a passkey from another device" | ✅ |
| 3 | `screen-passkey:cross-device` — QR shown | ✅ |
| 4 | Phone scans QR; biometric on phone | — (phone-side, external) |
| 5 | Authenticated → home | ❌ Missing |

---

### 2b · QR Code Expired `120:31`
*QR session times out before the phone completes authentication.*

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-passkey:cross-device` — QR shown | ✅ |
| 2 | `screen-passkey:cross-device-failed` — QR expired | ✅ |

---

### 2c · No Passkey on Phone `123:31`
*Phone scans QR successfully but has no passkey enrolled for this account.*

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-passkey:cross-device` — QR shown | ✅ |
| 2 | `screen-passkey:cross-device-no-credential` — phone has no matching passkey | ✅ |

---

### 2d · Bluetooth / Proximity Error `126:31`
*Hybrid transport (caBLE/BLE) fails before authentication completes.*

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-passkey:cross-device` — QR shown | ✅ |
| 2 | `screen-passkey:cross-device-transport-error` — Bluetooth error | ✅ |

---

### 2e · Transport Error Fork `183:31`
*After a Bluetooth error, user can retry the QR flow or switch to another sign-in method.*

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-passkey:cross-device-transport-error` | ✅ |
| 2a | `screen-passkey:cross-device` — retry QR | ✅ |
| 2b | `screen-chooser:default` — sign in another way | ✅ |

---

## Group 3 · Password Sign-In

### 3a · Happy Path — Password Sign-In `86:31`
*User chooses password; enters credentials; completes MFA; sees passkey enrollment offer.*

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-chooser:default` | ✅ |
| 2 | `screen-password` — email + password entry | ✅ |
| 3 | `screen-verify:default` — MFA code entry | ✅ |
| 4 | `screen-passkey-enroll:prompt` — post-login enrollment offer | ✅ |

> **Note:** The enrollment offer (step 4) is wired as a flow step. In production this screen would appear automatically after a successful sign-in on a device without a saved passkey.

---

### 3b · Wrong Password `90:31`
*User enters an incorrect password.*

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-chooser:default` | ✅ |
| 2 | `screen-password` | ✅ |
| 3 | `screen-password:error` — wrong password warning | ✅ |

---

### 3c · Account Locked `169:32`
*Too many failed password attempts lock the account.*

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-chooser:default` | ✅ |
| 2 | `screen-password` | ✅ |
| 3 | `screen-password:error` | ✅ |
| 4 | `screen-account-locked` — lockout with countdown | ✅ |

---

### 3d · Forgot Password → Reset `92:31`
*User cannot remember password; completes email-based reset.*

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-chooser:default` | ✅ |
| 2 | `screen-password` | ✅ |
| 3 | `screen-forgot-password` — email entry | ✅ |
| 4 | `screen-reset-sent` — reset email sent | ✅ |
| 5 | `screen-new-password` — create new password | ✅ |
| 6 | `screen-reset-success` — password updated | ✅ |

---

## Group 4 · One-Time Code (OTP) Sign-In

### 4a · Happy Path — OTP Sign-In `93:31`
*User chooses One-Time Code; selects channel; enters code; sees enrollment offer.*

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-chooser:default` | ✅ |
| 2 | `screen-otp` — select delivery channel | ✅ |
| 3 | `screen-verify:default` — enter 6-digit code | ✅ |
| 4 | `screen-passkey-enroll:prompt` — post-login enrollment offer | ✅ |

---

### 4b · Wrong Code `94:31`

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-chooser:default` | ✅ |
| 2 | `screen-otp` | ✅ |
| 3 | `screen-verify:default` | ✅ |
| 4 | `screen-verify:wrong` — incorrect code warning | ✅ |

---

### 4c · Resend Cooldown `96:31`
*User requests a resend; must wait before requesting another.*

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-otp` | ✅ |
| 2 | `screen-verify:default` | ✅ |
| 3 | `screen-verify:cooldown` — resend blocked | ✅ |

---

### 4d · Expired Code `97:31`

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-otp` | ✅ |
| 2 | `screen-verify:default` | ✅ |
| 3 | `screen-verify:expired` — code window passed | ✅ |

---

### 4e · Account Locked `98:31`
*Too many incorrect attempts; further resends blocked.*

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-otp` | ✅ |
| 2 | `screen-verify:default` | ✅ |
| 3 | `screen-verify:wrong` | ✅ |
| 4 | `screen-verify:locked` — locked out | ✅ |

---

### 4f · Code Resent Confirmation `169:53`

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-verify:default` | ✅ |
| 2 | `screen-verify:resent` — new code sent confirmation | ✅ |

---

### 4g · Can't Access Code `169:74`
*User cannot receive a code on any registered channel.*

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-verify:default` | ✅ |
| 2 | `screen-otp-no-access` — no channel available | ✅ |

---

## Group 5 · Passkey Registration & Enrollment

### 5a · Happy Path — Passkey Registration `129:31`

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-passkey-enroll:prompt` — opt-in offer | ✅ |
| 2 | `screen-passkey-enroll:success` — enrolled | ✅ |

---

### 5b · Biometric Fails / User Cancels `137:31`

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-passkey-enroll:prompt` | ✅ |
| 2 | `screen-passkey-enroll:error` — failed or cancelled | ✅ |

---

### 5c · Passkey Already Exists `139:31`
*WebAuthn returns `InvalidStateError` — credential already exists for this authenticator.*

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-passkey-enroll:prompt` | ✅ |
| 2 | `screen-passkey-enroll:already-enrolled` — reassurance screen | ✅ |

---

### 5d · User Declines Setup `141:31`

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-passkey-enroll:prompt` | ✅ |
| 2 | `screen-passkey-enroll:declined` — "Maybe Later" or "Don't Ask Again" options | ✅ |

---

### 5e · Declined Fork `176:31`
*After declining, user either snoozes (returns to chooser) or permanently suppresses the offer.*

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-passkey-enroll:declined` | ✅ |
| 2a | `screen-chooser:default` — "Maybe Later" snooze | ✅ |
| 2b | *(suppress stored silently; returns to app)* | ⚠️ No distinct "suppressed" confirmation screen |

---

## Group 6 · Password Reset

### 6a · Happy Path — Password Reset `104:31`

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-forgot-password` — email entry | ✅ |
| 2 | `screen-reset-sent` — reset email sent | ✅ |
| 3 | `screen-new-password` — create new password | ✅ |
| 4 | `screen-reset-success` — password updated | ✅ |

---

### 6b · Reset Link Expired `109:31`
*User clicks the reset link after it has expired.*

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-forgot-password` | ✅ |
| 2 | `screen-reset-sent` | ✅ |
| 3 | `screen-new-password:expired` — link expired error | ✅ |

---

### 6c · Email Not Found `107:31`
*Submitted email has no matching account.*

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-forgot-password` | ✅ |
| 2 | `screen-forgot-password:not-found` — inline email error | ✅ |

---

### 6d · Rate Limiting `113:31`
*Too many reset requests from the same account or IP.*

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-forgot-password` | ✅ |
| 2 | `screen-forgot-password:rate-limited` — lockout with countdown | ✅ |

---

## Group 7 · Account Recovery

> **Entry point:** All three recovery flows begin at `screen-passkey:notfound`. The user must first try Face ID / Passkey, see the "no passkey found" screen, then tap **"Having trouble? Get account help"** to enter recovery. This link is only shown in the `notfound` state.

### 7a · Happy Path — Account Recovery `154:31`
*User verifies identity via OTP, then re-enrolls a passkey.*

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-passkey:notfound` — tap "Get account help" | ✅ |
| 2 | `screen-recovery` — choose fallback method | ✅ |
| 3 | `screen-verify:default` — verify OTP code | ✅ |
| 4 | `screen-reenroll:prompt` — set up passkey again | ✅ |
| 5 | `screen-reenroll:success` — re-enrollment complete | ✅ |

---

### 7b · Recovery Rate Limited `154:57`
*User requests too many OTP codes during recovery; temporarily blocked.*

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-passkey:notfound` | ✅ |
| 2 | `screen-recovery` | ✅ |
| 3 | `screen-recovery:locked` — OTP rate limited (15-min block) | ✅ |

---

### 7c · Re-Enroll Failed `154:73`
*Identity verified, but passkey re-enrollment fails after recovery.*

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-passkey:notfound` | ✅ |
| 2 | `screen-recovery` | ✅ |
| 3 | `screen-verify:default` | ✅ |
| 4 | `screen-reenroll:prompt` | ✅ |
| 5 | `screen-reenroll:error` — re-enrollment failed | ✅ |

---

## Group 8 · Account Settings & Security

### 8a · Security Settings Overview `165:31`

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-settings-security` — security hub | ✅ |

---

### 8b · Sign-In Activity Log `165:57`

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-settings-security` | ✅ |
| 2 | `screen-activity` — recent sign-in events | ✅ |

---

### 8c · Active Devices & Remote Sign-Out `165:73`

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-settings-security` | ✅ |
| 2 | `screen-active-devices` — session list | ✅ |

---

### 8d · Rename a Passkey `165:99`

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-settings-security` | ✅ |
| 2 | `screen-settings-passkeys:list` | ✅ |
| 3 | `screen-settings-passkeys:rename` — edit name field | ✅ |

---

### 8e · Remove a Passkey `165:120`

| Step | Screen | Status |
|------|--------|--------|
| 1 | `screen-settings-security` | ✅ |
| 2 | `screen-settings-passkeys:list` | ✅ |
| 3 | `screen-settings-passkeys:remove` — confirm removal | ✅ |

> **Note:** `screen-settings-passkeys:remove-last` (stricter confirmation when removing the final passkey) exists in the prototype but is not yet mapped to a named flow or Figma frame.

---

## Remaining Gaps

### Screens / States Still Missing

| # | Gap | Affects | Priority |
|---|-----|---------|----------|
| 1 | **Home / signed-in destination** — every happy path terminates at the last auth screen | All groups | High |
| 2 | `screen-passkey-enroll:declined` — "Don't Ask Again" has no confirmation or distinct exit screen | Group 5e | Low |
| 3 | `screen-settings-passkeys:remove-last` — exists in prototype, no named flow or Figma frame | Group 8 | Low |

### Wiring Gaps (Screen Exists, Organic Routing Missing)

| # | Gap | Fix |
|---|-----|-----|
| 1 | `screen-passkey-enroll:prompt` is only reachable via the Settings "Add Passkey" button, not automatically after a non-passkey sign-in | Wire enrollment interstitial as automatic post-auth step after password or OTP sign-in on a device with no saved passkey |
| 2 | `screen-passkey:notfound` "SET UP FACE ID" button exists but does not route to `screen-passkey-enroll:prompt` | Add click handler from `passkey-setup-enroll-btn` → enroll:prompt |

