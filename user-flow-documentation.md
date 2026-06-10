# Ace Hardware Sign-In Flow — User Flow Documentation

> **Purpose:** Reference document mapping all designed user flows to their corresponding prototype screens in `sign-in.html`, and identifying gaps where screens still need to be built.
>
> **Figma file key:** `IDuYbd4aYwGsFgo6c3ThVX` · Flows page ID: `65:2177`
> **Prototype:** `sign-in.html` (local + Vercel)

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Screen exists in prototype and is wired correctly |
| ⚠️ | Screen exists but has a wiring or routing gap |
| ❌ | Screen is missing from the prototype entirely |

---

## Prototype Screen Inventory

All screens currently in `sign-in.html`, including their data-states:

| Screen ID | States | Notes |
|-----------|--------|-------|
| `screen-chooser` | `default`, `passkey-first` | Entry point; state set by passkey detection |
| `screen-passkey` | `idle`, `failed`, `notfound`, `cross-device`, `cross-device-failed` | Passkey sign-in screen |
| `screen-passkey-enroll` | `prompt`, `success`, `error` | Enrollment/upsell screen |
| `screen-verify` | `default`, `cooldown`, `expired`, `locked`, `wrong`, `resent` | OTP/MFA code entry |
| `screen-password` | `default`, `error` | Password sign-in screen |
| `screen-account-locked` | — | Too many password failures |
| `screen-forgot-password` | — | Password reset entry |
| `screen-reset-sent` | — | Reset email confirmation |
| `screen-new-password` | — | Reset link destination |
| `screen-reset-success` | — | Password updated confirmation |
| `screen-otp` | — | OTP channel selection |
| `screen-otp-no-access` | — | Can't receive code fallback |
| `screen-settings-security` | — | Security hub in account settings |
| `screen-activity` | — | Sign-in activity log |
| `screen-active-devices` | — | Active session management |
| `screen-settings-passkeys` | `list`, `rename`, `remove`, `remove-last` | Passkey management |
| `screen-recovery` | — | Account recovery entry |
| `screen-reenroll` | `prompt`, `success`, `error` | Re-enrollment after recovery |

**Notably missing from all flows:** A signed-in / home screen state — every flow terminates at authentication success but the prototype has no destination screen for it.

---

## Flow 1 · Passkey / Face ID

**Figma frame ID:** `78:31`

### Happy Path
*User arrives with a saved passkey on device; signs in with Face ID.*

| Step | Description | Prototype Screen | Status |
|------|-------------|-----------------|--------|
| 1 | Sign-in entry, passkey detected | `screen-chooser:passkey-first` | ✅ |
| 2 | Tap "Use Face ID" | `screen-passkey:idle` | ✅ |
| 3 | OS biometric prompt | *(OS native — no app screen)* | N/A |
| 4 | Authenticated → home | Home screen | ❌ Missing |

---

### Branch A · Biometric Failed `80:31`
*Face ID fails or is cancelled; user falls back to password.*

| Step | Description | Prototype Screen | Status |
|------|-------------|-----------------|--------|
| 1 | Biometric fails / user cancels | `screen-passkey:failed` | ✅ |
| 2 | Tap "Use Password" | `screen-password` | ✅ |
| 3 | Enter password | `screen-password` | ✅ |
| 4 | MFA code entry | `screen-verify:default` | ✅ |
| 5 | Authenticated → home | Home screen | ❌ Missing |

---

### Branch B · No Passkey Found `81:31`
*Chooser loads in default state; user taps Face ID anyway but no passkey exists for their account on this device.*

| Step | Description | Prototype Screen | Status |
|------|-------------|-----------------|--------|
| 1 | Chooser (no passkey detected) | `screen-chooser:default` | ✅ |
| 2 | No passkey for this account | `screen-passkey:notfound` | ✅ |
| 3 | "Sign in another way" | Routes back to chooser / password | ✅ |

> **Note:** Branch C (Cross-Device Passkey) was promoted to its own Flow 6 — see below.

---

## Flow 2 · Password Sign-In

**Figma frame ID:** `86:31`

### Happy Path
*User chooses password; enters credentials; completes MFA.*

| Step | Description | Prototype Screen | Status |
|------|-------------|-----------------|--------|
| 1 | Chooser | `screen-chooser:default` | ✅ |
| 2 | Password entry | `screen-password` | ✅ |
| 3 | MFA code entry | `screen-verify:default` | ✅ |
| 4 | Authenticated → home | Home screen | ❌ Missing |

---

### Branch A · Wrong Password → Account Locked `90:31`
*User enters incorrect password repeatedly until account locks.*

| Step | Description | Prototype Screen | Status |
|------|-------------|-----------------|--------|
| 1 | Wrong password | `screen-password:error` | ✅ |
| 2 | Account locked (too many attempts) | `screen-account-locked` | ✅ |

> **Note:** Flow 2 · Branch B is not represented as a separate frame in Figma. MFA failure paths are fully covered under Flow 3 branches.

---

### Branch C · Forgot Password `92:31`
*User cannot remember password; completes email-based reset.*

| Step | Description | Prototype Screen | Status |
|------|-------------|-----------------|--------|
| 1 | Tap "Forgot password?" | `screen-forgot-password` | ✅ |
| 2 | Reset email sent | `screen-reset-sent` | ✅ |
| 3 | Open link → create new password | `screen-new-password` | ✅ |
| 4 | Password updated confirmation | `screen-reset-success` | ✅ |

---

## Flow 3 · OTP Sign-In

**Figma frame ID:** `93:31`

### Happy Path
*User chooses One-Time Code; selects channel; enters code.*

| Step | Description | Prototype Screen | Status |
|------|-------------|-----------------|--------|
| 1 | Chooser | `screen-chooser:default` | ✅ |
| 2 | Select OTP channel | `screen-otp` | ✅ |
| 3 | Enter 6-digit code | `screen-verify:default` | ✅ |
| 4 | Authenticated → home | Home screen | ❌ Missing |

---

### Branch A · Wrong Code `94:31`
*User enters incorrect code; sees remaining attempts.*

| Step | Description | Prototype Screen | Status |
|------|-------------|-----------------|--------|
| 1 | Incorrect code entered | `screen-verify:wrong` | ✅ |

---

### Branch B · Resend Cooldown `96:31`
*User requests resend; must wait before requesting another.*

| Step | Description | Prototype Screen | Status |
|------|-------------|-----------------|--------|
| 1 | New code sent | `screen-verify:resent` | ✅ |
| 2 | Resend on cooldown | `screen-verify:cooldown` | ✅ |

---

### Branch C · Expired Code `97:31`
*Verification code time window passes before user submits.*

| Step | Description | Prototype Screen | Status |
|------|-------------|-----------------|--------|
| 1 | Code expired | `screen-verify:expired` | ✅ |

---

### Branch D · Account Locked `98:31`
*Too many incorrect attempts; further resends blocked.*

| Step | Description | Prototype Screen | Status |
|------|-------------|-----------------|--------|
| 1 | Too many wrong attempts | `screen-verify:locked` | ✅ |
| 2 | Can't access any channel | `screen-otp-no-access` | ✅ |

---

## Flow 4 · Passkey-First Chooser Path

**Figma frame ID:** `100:31`

### Happy Path
*Device has a saved passkey; passkey-first chooser shown; sign-in completes.*

| Step | Description | Prototype Screen | Status |
|------|-------------|-----------------|--------|
| 1 | Passkey detected on device | `screen-chooser:passkey-first` | ✅ |
| 2 | Face ID presented | `screen-passkey:idle` | ✅ |
| 3 | Authenticated → home | Home screen | ❌ Missing |

---

### Branch A · Biometric Fails `101:31`
*Face ID fails in the passkey-first flow.*

| Step | Description | Prototype Screen | Status |
|------|-------------|-----------------|--------|
| 1 | Biometric fails / cancelled | `screen-passkey:failed` | ✅ |

---

### Branch B · No Passkey Enrolled `102:31`
*Passkey-first chooser shows, but no credential exists for this account on this device.*

| Step | Description | Prototype Screen | Status |
|------|-------------|-----------------|--------|
| 1 | Passkey not found for account | `screen-passkey:notfound` | ✅ |

---

### Branch C · Passkey Enrollment Offered `103:31`
*After a failed/missing passkey attempt, user is offered corrective enrollment ("Set up the Face ID sign-in you tried to use").*

| Step | Description | Prototype Screen | Status |
|------|-------------|-----------------|--------|
| 1 | Enrollment interstitial | `screen-passkey-enroll:prompt` | ⚠️ Only reachable via `settings-add-passkey-btn` — not wired from notfound path |
| 2 | Biometric success → enrolled | `screen-passkey-enroll:success` | ✅ |
| 3 | Biometric error / cancelled | `screen-passkey-enroll:error` | ✅ |

---

## Flow 5 · Account Recovery

**Figma frame ID:** `104:31`

### Happy Path
*User has lost access to all standard methods; identity verified; account recovered; passkey re-enrolled.*

| Step | Description | Prototype Screen | Status |
|------|-------------|-----------------|--------|
| 1 | Recovery entry | `screen-recovery` | ✅ |
| 2 | Identity verified, reset link sent | `screen-reset-sent` | ✅ |
| 3 | Create new password | `screen-new-password` | ✅ |
| 4 | Password updated | `screen-reset-success` | ✅ |
| 5 | Re-enrollment prompt | `screen-reenroll:prompt` | ✅ |
| 6 | Re-enrollment success | `screen-reenroll:success` | ✅ |
| 7 | Authenticated → home | Home screen | ❌ Missing |

---

### Branch A · Reset Link Expired `109:31`
*User receives recovery email but the link expires before use.*

| Step | Description | Prototype Screen | Status |
|------|-------------|-----------------|--------|
| 1 | Reset link opens after expiry | `screen-new-password` | ⚠️ No expired-link error state on `screen-new-password` — screen only shows form, no expired variant |

---

### Branch B · Email Not Found `107:31`
*User enters an email address not associated with any account.*

| Step | Description | Prototype Screen | Status |
|------|-------------|-----------------|--------|
| 1 | Unknown email submitted | `screen-forgot-password` | ⚠️ No inline error state for unrecognised email — screen does not surface this case |

---

### Branch C · Rate Limiting `113:31`
*User submits recovery requests too frequently; temporarily blocked.*

| Step | Description | Prototype Screen | Status |
|------|-------------|-----------------|--------|
| 1 | Too many recovery attempts | *(no screen)* | ❌ Missing — no rate-limit / too-many-requests screen exists |

---

## Flow 6 · Passkey Cross-Device

**Figma frame ID:** `116:31`

### Happy Path
*User signs in using a passkey stored on a nearby phone by scanning a QR code.*

| Step | Description | Prototype Screen | Status |
|------|-------------|-----------------|--------|
| 1 | Tap "Use a different device" | `screen-passkey:cross-device` | ✅ |
| 2 | QR displayed; phone scans | *(phone-side — external)* | N/A |
| 3 | Biometric on phone; approved | *(phone-side — external)* | N/A |
| 4 | Authenticated → home | Home screen | ❌ Missing |

---

### Branch A · QR Code Expired `120:31`
*QR session expires before phone scans or completes.*

| Step | Description | Prototype Screen | Status |
|------|-------------|-----------------|--------|
| 1 | QR session expires | `screen-passkey:cross-device-failed` | ✅ |

---

### Branch B · No Passkey on Phone `123:31`
*Phone scans QR successfully but has no passkey enrolled for this account.*

| Step | Description | Prototype Screen | Status |
|------|-------------|-----------------|--------|
| 1 | Phone has no matching passkey | `screen-passkey:cross-device-failed` | ⚠️ `cross-device-failed` exists but its copy is scoped to timeout — no distinct "no credential on phone" state |

---

### Branch C · Bluetooth / Proximity Error `126:31`
*Hybrid transport (CTAP2 BLE/caBLE) fails due to proximity or connectivity.*

| Step | Description | Prototype Screen | Status |
|------|-------------|-----------------|--------|
| 1 | Transport / proximity error | *(no screen)* | ❌ Missing — no dedicated screen for Bluetooth/caBLE failure; `cross-device-failed` is timeout-only |

---

## Flow 7 · Passkey Registration (Post-Login Enrollment)

**Figma frame ID:** `129:31`

### Happy Path
*After a successful password sign-in, user accepts the proactive "Sign in faster with Face ID" offer.*

| Step | Description | Prototype Screen | Status |
|------|-------------|-----------------|--------|
| 1 | Signed in via password | *(post-auth state, home/continuation)* | ❌ Missing — no screen triggers the upsell post-login |
| 2 | Enrollment interstitial shown | `screen-passkey-enroll:prompt` | ⚠️ Exists but only reachable via `settings-add-passkey-btn`. Not wired from post-login password path. |
| 3 | Biometric success → enrolled | `screen-passkey-enroll:success` | ✅ |
| 4 | Continue to home | Home screen | ❌ Missing |

---

### Branch A · Biometric Fails / User Cancels `137:31`
*User accepts the offer but Face ID fails or they cancel the OS dialog.*

| Step | Description | Prototype Screen | Status |
|------|-------------|-----------------|--------|
| 1 | Biometric fails or cancelled | `screen-passkey-enroll:error` | ✅ |

---

### Branch B · Passkey Already Exists `139:31`
*WebAuthn returns `InvalidStateError` — a credential for this account already exists on this authenticator.*

| Step | Description | Prototype Screen | Status |
|------|-------------|-----------------|--------|
| 1 | Duplicate credential detected | *(no screen)* | ❌ Missing — no informational "already enrolled" screen state |

---

### Branch C · User Declines Setup Prompt `141:31`
*User taps "Maybe Later" (snooze) or "Don't Ask Again" (permanent suppress).*

| Step | Description | Prototype Screen | Status |
|------|-------------|-----------------|--------|
| 1 | User declines enrollment offer | *(no screen)* | ❌ Missing — `screen-passkey-enroll` has no declined/skipped state; "Maybe Later" / "Don't Ask Again" are not modelled |

---

## Screens in Prototype Not Covered by Any Flow

These screens exist in the prototype but have no corresponding user flow diagram:

| Screen | Description | Recommended Action |
|--------|-------------|-------------------|
| `screen-settings-security` | Security hub — shows passkeys, recent activity, active devices | Consider adding a Flow 8: Settings / Security Hub |
| `screen-activity` | Sign-in activity log | Part of a potential Flow 8 |
| `screen-active-devices` | Active session list + remote sign-out | Part of a potential Flow 8 |
| `screen-settings-passkeys:list` | All enrolled passkeys | Part of a potential Flow 8 |
| `screen-settings-passkeys:rename` | Rename a passkey | Part of a potential Flow 8 |
| `screen-settings-passkeys:remove` | Remove a passkey | Part of a potential Flow 8 |
| `screen-settings-passkeys:remove-last` | Remove last passkey (strict confirm) | Part of a potential Flow 8 |
| `screen-reenroll:error` | Re-enrollment failure after recovery | Not covered in Flow 5 branches |

---

## Gap Summary

### Screens to Build

| # | Missing Screen / State | Affects Flow(s) | Priority |
|---|----------------------|----------------|---------|
| 1 | **Home / signed-in state** (authenticated destination) | Flows 1–7 (all happy paths) | High |
| 2 | **Post-login passkey upsell trigger** (wire `screen-passkey-enroll:prompt` from password happy path, not just settings) | Flow 7 Happy Path | High |
| 3 | **Recovery rate-limit screen** (too many recovery requests) | Flow 5 Branch C | Medium |
| 4 | `screen-new-password` **expired-link state** | Flow 5 Branch A | Medium |
| 5 | `screen-forgot-password` **email not found inline error** | Flow 5 Branch B | Medium |
| 6 | `screen-passkey:cross-device-failed` **no-credential-on-phone variant** | Flow 6 Branch B | Medium |
| 7 | **Bluetooth / proximity error screen** (distinct from QR timeout) | Flow 6 Branch C | Low |
| 8 | **"Already enrolled" informational screen** (`InvalidStateError` branch) | Flow 7 Branch B | Low |
| 9 | **Enrollment declined / skipped state** ("Maybe Later" / "Don't Ask Again") | Flow 7 Branch C | Low |

### Wiring Gaps (Screen Exists, Routing Broken)

| # | Gap | Affects | Fix |
|---|-----|---------|-----|
| 1 | `screen-passkey-enroll` only reachable via `settings-add-passkey-btn`, not from post-login password path | Flow 4 Branch C, Flow 7 Happy Path | Wire enrollment interstitial as a post-auth step after successful password sign-in |
| 2 | `screen-passkey:notfound` does not route to `screen-passkey-enroll:prompt` | Flow 4 Branch C | Add "Set Up Passkey" CTA on the notfound screen that navigates to enroll:prompt |

### Flow Diagrams to Create

| Flow | Description |
|------|-------------|
| **Flow 8 · Account Settings & Passkey Management** | Covers `screen-settings-security`, `screen-activity`, `screen-active-devices`, and all `screen-settings-passkeys` states |
| **Flow 5 · Branch D: Re-enrollment Failure** | Covers `screen-reenroll:error` after account recovery |
