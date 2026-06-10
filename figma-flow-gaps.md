# Figma User Flow — Gap Analysis
*Last updated: June 3, 2026*

## What's Already in Figma ✅

| Flow | Main Path | Branches |
|---|---|---|
| **Flow 1 · Passkey / Face ID** | Idle → OS Biometric → Signed In | A: Biometric Failed; B: No Passkey Found (QR + Recovery) |
| **Flow 2 · Password** | Sign In → Password → Signed In | A: Wrong Password; C: Forgot Password → full reset |
| **Flow 3 · OTP Sign-In** | OTP Entry → Verify → Signed In | A: Wrong Code; B: Resend Cooldown; C: Expired Code; D: Account Locked |
| **Flow 4 · Passkey Sign-In (OS native)** | Sign In → Passkey Prompt → Biometric → Signed In | A: Biometric Fails; B: No Passkey Enrolled; C: Enrollment Nudge |
| **Flow 5 · Password Reset** | Forgot → Recovery Email → Reset Link → New Password → Signed In | A: Reset Link Expired; B: Email Not Found; C: Rate Limiting |
| **Flow 6 · Cross-Device Passkey** | QR Displayed → Scan → Phone Biometric → Signed In | A: QR Expired; B: No Passkey on Phone; C: Bluetooth Error |
| **Flow 7 · Passkey Registration** | Post-login prompt → Biometric/PIN → Enrolled | A: Biometric Fails/User Cancels; B: Already Exists; C: User Declines |

---

## Minor Gaps in Existing Flows ✅ All added June 9, 2026

| # | Flow | Gap | Added as |
|---|---|---|---|
| 1 | Flow 2 — Password | **Account Locked (terminal state)** | Flow 2 · Branch B: Account Locked |
| 2 | Flow 3 — OTP | **"Code Resent" confirmation screen** | Flow 3 · Branch E: Code Resent Confirmation |
| 3 | Flow 3 — OTP | **Branch F: Can't Access Code** | Flow 3 · Branch F: Can't Access Code |

---

## Missing Flows — Full Groups ❌

### Flow 8 · Account Recovery ✅ Added June 9, 2026
*User has no passkey, lost account access, or failed all primary auth methods.*

| Screen | State Key | Description |
|---|---|---|
| Recovery entry | `recovery:default` | User enters email to start recovery |
| Rate limited | `recovery:locked` | Too many recovery attempts → cooldown message |
| Re-enroll prompt | `reenroll:default` | Post-recovery nudge to set up a passkey |
| Re-enroll success | `reenroll:success` | Passkey successfully created after recovery |
| Re-enroll failed | `reenroll:error` | WebAuthn creation failed during re-enrollment |

### Flow 9 · Account Settings & Security ✅ Added June 9, 2026
*User manages sign-in methods and reviews account security after being signed in.*

| Screen | State Key | Description |
|---|---|---|
| Security hub | `settings:security-hub` | Overview dashboard — sign-in methods, activity, devices |
| Sign-in activity log | `settings:sign-in-activity` | Timestamped log of recent sign-in events |
| Active devices | `settings:active-devices` | List of active sessions with "Sign out" actions |
| Remote sign-out confirmation | `settings:remote-signout` | Confirm signing out a specific remote device |
| Passkeys list | `settings:passkeys` | Manage enrolled passkeys |
| Rename passkey | `settings:passkey-rename` | Edit passkey display name |
| Remove passkey (has others) | `settings:passkey-remove` | Standard removal confirmation |
| Remove last passkey | `settings:passkey-remove-last` | Warning: last credential on account |

---

## Summary

| Category | Count |
|---|---|
| Flows already in Figma | 7 (27 branches) |
| Minor gaps in existing flows | 3 |
| Entirely missing flow groups | 2 (Flows 8 & 9) |
| Missing screens total | ~13 |

**Priority order (suggested):**
1. Flow 8 · Account Recovery — directly connected to passkey not-found and re-enroll states already in prototype
2. Minor gaps in Flows 2 & 3 — small additions to existing flows
3. Flow 9 · Account Settings & Security — standalone section, lower urgency for sign-in core flow
