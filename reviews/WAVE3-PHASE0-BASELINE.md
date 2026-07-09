# Wave-3 Phase 0 Baseline

Date: 2026-06-17
Scope: Phase 0 only (baseline snapshot), no corrective edits applied.
Source of truth: live prototype flow registry in sign-in.html.
Comparison target: Figma page 198:31 (Prototype Flows), Wave-3 groups.

## Environment Status
- Prototype opened directly from `sign-in.html` (file:// — no server required).

## Prototype Flow Registry Snapshot
Extracted from `const FLOWS` in sign-in.html.

- Total flow definitions: 46
- Group counts:
  - Passkey Sign-In: 8
  - Cross-Device Passkey Sign-In: 6
  - Password Sign-In: 5
  - One-Time Code (OTP) Sign-In: 8
  - Passkey Registration & Enrollment: 6
  - Password Reset: 4
  - Recovery Email Setup: 3
  - Account Settings & Security: 6

### Non-Wave-3 node prefixes (expected exceptions)
These remain on legacy node IDs and are intentionally outside the Wave-3 column comparison set:
- passkey-os-sheet-happy -> 198-63
- passkey-os-sheet-biometric-fail -> 198-68
- passkey-os-sheet-no-passkey -> 198-73
- passkey-os-sheet-enroll-nudge -> 198-78

### Duplicate prototype node mappings (requires review in Phase 1)
- 660-650 used by: password-forgot, reset-happy, reset-edit-different-email
- 660-712 used by: recovery-email-setup-happy, recovery-email-setup-pending, recovery-email-setup-change
- 660-238 used by: passkey-biometric-failed, passkey-failed-fallback-password
- 660-292 used by: cross-device-happy, cross-device-direct

## Figma Wave-3 Inventory Snapshot
Read via Figma `use_figma` from page 198:31.

- Wave-3 group count: 8
- Group inventory:
  - group-w3:Passkey Sign-In (id 660:209): 3 flows
    - 660:213 passkey-happy
    - 660:238 passkey-biometric-failed
    - 660:263 passkey-not-found
  - group-w3:Cross-Device Passkey Sign-In (id 660:288): 5 flows
    - 660:292 cross-device-happy
    - 660:325 cross-device-qr-expired
    - 660:342 cross-device-no-passkey
    - 660:359 cross-device-bluetooth-error
    - 670:181 cross-device-transport-fork
  - group-w3:Password Sign-In (id 660:376): 4 flows
    - 660:380 password-happy
    - 660:413 password-wrong
    - 660:438 password-account-locked
    - 660:471 password-identifier-first
  - group-w3:One-Time Code (OTP) Sign-In (id 660:488): 8 flows
    - 660:492 otp-happy
    - 660:525 otp-wrong-code
    - 660:550 otp-expired
    - 660:575 otp-locked
    - 670:212 otp-resend-cooldown
    - 670:237 otp-resent-confirm
    - 670:262 otp-no-access
    - 670:287 otp-no-access-use-password
  - group-w3:Passkey Registration & Enrollment (id 660:608): 6 flows
    - 660:612 enroll-happy
    - 660:629 enroll-declined-never
    - 670:326 enroll-biometric-fail
    - 670:343 enroll-already-enrolled
    - 670:360 enroll-declined
    - 670:377 enroll-declined-fork
  - group-w3:Recovery Email Setup (id 660:708): 1 flow
    - 660:712 recovery-email-setup-happy
  - group-w3:Password Reset (id 660:646): 3 flows
    - 660:650 reset-happy
    - 660:683 reset-link-expired
    - 670:408 reset-rate-limited
  - group-w3:Account Settings & Security (id 660:745): 6 flows
    - 660:749 settings-activity-log
    - 660:766 settings-active-devices
    - 660:783 settings-remove-last-passkey
    - 670:447 settings-overview
    - 670:464 settings-rename-passkey
    - 670:489 settings-remove-passkey

## Net-New Wave-3 Flow Presence Check
All 13 expected net-new Wave-3 nodes were found in the correct Wave-3 groups:
- 670:181
- 670:212
- 670:237
- 670:262
- 670:287
- 670:326
- 670:343
- 670:360
- 670:377
- 670:408
- 670:447
- 670:464
- 670:489

## Phase 0 Baseline Findings (No Fixes Yet)
1. The Wave-3 column structure is present and grouped correctly by major flow family.
2. The 13 net-new Wave-3 flows exist and are currently discoverable in-group.
3. Prototype has 46 flow definitions while Wave-3 visual groups expose 36 flow frames; the delta appears to be:
   - OS native-sheet design-only placeholders (4)
   - alias/branch mappings that intentionally share screenshots/nodes (remaining delta)
4. Node reuse in prototype mappings is confirmed in four areas and will be validated in Phase 1 as either intentional parity or incorrect screenshot reuse.

## Next Step (Phase 1)
Build the flow-by-flow mismatch matrix using this baseline, evaluating screenshot correctness and branch fidelity against live prototype behavior, then prioritize mismatches by severity.
