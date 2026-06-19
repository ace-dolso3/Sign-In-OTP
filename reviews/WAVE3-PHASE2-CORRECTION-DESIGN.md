# Wave-3 Phase 2 Correction Design

Date: 2026-06-17
Input: Verified mismatches from Phase 1.
Goal: define and execute exact Wave-3 frame additions/remaps for branch-fidelity mismatches.
Status: Node creation and prototype remaps completed; visual/content parity pass pending.

## Confirmed Correction Set
- M-001 passkey-failed-fallback-password
- M-002 cross-device-direct
- M-003 reset-edit-different-email
- M-004 recovery-email-setup-pending
- M-004 recovery-email-setup-change

## Target Group Containers (existing)
- Passkey Sign-In: group node 660:209
- Cross-Device Passkey Sign-In: group node 660:288
- Password Reset: group node 660:646
- Recovery Email Setup: group node 660:708

## Proposed New Flow Frames

### 1) Passkey fallback branch
- New frame name: flow-w3:passkey-failed-fallback-password
- Parent group: 660:209
- Replace mapping for prototype flow id `passkey-failed-fallback-password`
- Previous mapping: 660-238
- Implemented mapping: 677-195
- Expected visual sequence:
  1. passkey-idle
  2. passkey-failed
  3. password-default (or password-prefilled if identifier strip is intended)

### 2) Cross-device direct-entry branch
- New frame name: flow-w3:cross-device-direct
- Parent group: 660:288
- Replace mapping for prototype flow id `cross-device-direct`
- Previous mapping: 660-292
- Implemented mapping: 677-248
- Expected visual sequence:
  1. chooser-default (direct tile entry emphasis)
  2. passkey-cross-device (QR shown)

### 3) Reset edit-different-email branch
- New frame name: flow-w3:reset-edit-different-email
- Parent group: 660:646
- Replace mapping for prototype flow id `reset-edit-different-email`
- Previous mapping: 660-650
- Implemented mapping: 677-309
- Expected visual sequence:
  1. forgot-password
  2. reset-sent
  3. forgot-password (edit path)
  4. reset-sent (new address)

### 4) Recovery email pending variant
- New frame name: flow-w3:recovery-email-setup-pending
- Parent group: 660:708
- Replace mapping for prototype flow id `recovery-email-setup-pending`
- Previous mapping: 660-712
- Implemented mapping: 677-370
- Expected visual sequence:
  1. settings-security-notset
  2. recovery-email-request
  3. recovery-email-sent
  4. settings-security-pending

### 5) Recovery email change-loop variant
- New frame name: flow-w3:recovery-email-setup-change
- Parent group: 660:708
- Replace mapping for prototype flow id `recovery-email-setup-change`
- Previous mapping: 660-712
- Implemented mapping: 677-431
- Expected visual sequence:
  1. recovery-email-request
  2. recovery-email-sent
  3. recovery-email-request (loop-back after "Use a different email")

## Naming and Structure Rules
- Keep Wave-3 naming format: `flow-w3:<flow-id>`.
- Keep internal child names in existing style:
  - `img-w3:<flow-id>:<step-index>:<stem>`
  - `stepdesc-w3:<flow-id>:<step-index>`
  - `userflow-w3:<flow-id>` and `node-w3:*` chain
- Maintain visual parity with sibling flow cards in each group:
  - title + subtitle block
  - image strip and arrows
  - userflow node strip

## Mapping Update Plan (sign-in.html)
Updated these `figmaUrl` entries:
- passkey-failed-fallback-password
- cross-device-direct
- reset-edit-different-email
- recovery-email-setup-pending
- recovery-email-setup-change

Do not change these currently accepted mappings:
- password-forgot -> 660-650
- OS sheet Figma-only flows -> 198:63/68/73/78

## Verification Gates Before Execution
1. New frames are present under correct parent `group-w3:*` containers. (Done)
2. Each remapped flow opens the correct Figma URL from Flows tab. (Done)
3. Flow-step playback labels in prototype still match screenshot sequence intent. (Done)
4. Wave-3 net-new +13 count remains unchanged (these are branch-fidelity splits, not net-new feature additions). **(CLOSED 2026-06-18 — in-file MCP recount: 41 total `flow-w3:*` frames, 41 unique stable names = 36 baseline + 5 branch-split frames added by M-001..M-004. The 13 net-new feature flow IDs on `670-*` nodes remain unchanged.)**

## Execution Note
The five `flow-w3:*` dedicated frames were allocated and remapped successfully:
- 677:195 `flow-w3:passkey-failed-fallback-password`
- 677:248 `flow-w3:cross-device-direct`
- 677:309 `flow-w3:reset-edit-different-email`
- 677:370 `flow-w3:recovery-email-setup-pending`
- 677:431 `flow-w3:recovery-email-setup-change`

Next action is branch-specific content polish inside these frames (replace cloned placeholders with correct screenshot/caption sequences), then run final parity verification and close M-001 to M-004.

## Additional Execution Notes
- Live prototype loading regression was resolved by restoring missing wrappers in the nav/flow script block (`toggle` click handler, `proto-nav-item` click handler wrapper, and `goToFlowStep` function declaration).
- Post-fix runtime behavior is healthy: chooser renders, flows list builds (`46` flow buttons and links), and remapped links resolve to expected nodes.
- MCP page-load blocker resolved using `await page.loadAsync()` + `await figma.setCurrentPageAsync(page)` (dynamic-page model requirement).
- Phase-3 content polish executed in full per `reviews/WAVE3-PHASE3-CONTENT-POLISH-QUEUE.md`; final parity verification returned `exact` matches on every step caption and userflow node title across all 5 frames.
- Wave-3 column re-cascade: zero remaining child overflows; net column compaction -403 px.
- M-001 through M-004 closed in `reviews/WAVE3-PHASE1-MISMATCH-DRAFT.md` (Closure Log 2026-06-18).
