# Wave-3 Phase 1 Mismatch Matrix (Draft 1)

Date: 2026-06-17 (closed 2026-06-18)
Status: M-001 through M-004 CLOSED — parity-pass on all 5 remapped frames. M-005, M-006 remain as accepted notes.
Source of truth: sign-in.html flow registry + live preview behavior.
Comparison target: Figma Wave-3 groups on page 198:31.

## Summary
- Structural baseline confirms all 8 Wave-3 groups and all 13 net-new Wave-3 flows are present.
- Initial mismatches in this draft are mapping-level and screenshot-parity candidates.
- Corrective remaps and full content parity polish are now applied for the five confirmed branch-fidelity mismatches.

## Candidate Mismatches

| ID | Area | Flow(s) | Severity | Evidence | Proposed Fix | Status |
|---|---|---|---|---|---|---|
| M-001 | Passkey | passkey-failed-fallback-password | High | Live flow playback shows 3 steps ending at Password entry (`3 / 3: Password — entry (chose Use a password)`), while it mapped to node 660-238 shared with Biometric Failed branch. | Added dedicated frame `flow-w3:passkey-failed-fallback-password` and remapped to 677-195. | **CLOSED — parity-pass** (3/3 steps, 3 unique screenshots, branch-accurate captions & userflow strip) |
| M-002 | Cross-device | cross-device-direct | Medium | Live playback for direct entry is a 2-step sequence (`Chooser direct tile -> QR shown`), but it mapped to 660-292 shared with the 4-step happy path. | Added dedicated frame `flow-w3:cross-device-direct` and remapped to 677-248. | **CLOSED — parity-pass** (2/2 steps, 2 unique screenshots, branch-accurate captions & userflow strip) |
| M-003 | Password Reset | reset-edit-different-email | High | Live playback is a distinct 4-step branch (`entry -> reset sent -> edit/back -> reset sent(new address)`), but it mapped to 660-650 shared with reset-happy. | Added dedicated frame `flow-w3:reset-edit-different-email` and remapped to 677-309. | **CLOSED — parity-pass** (4/4 steps, intentional loop-back screen reuse for steps 1/3 and 2/4 with distinct captions) |
| M-004 | Recovery Email Setup | recovery-email-setup-pending, recovery-email-setup-change | High | Live playback confirms distinct terminal states (`pending verification` and `use different email loop-back`) while all three recovery-email flows mapped to 660-712. | Added dedicated frames `flow-w3:recovery-email-setup-pending` and `flow-w3:recovery-email-setup-change`; remapped to 677-370 and 677-431. | **CLOSED — parity-pass** (pending: 4/4 with new `settings-security-recovery-pending` asset; change: 3/3 with intentional loop-back reuse for steps 1/3) |
| M-005 | Password Sign-In | password-forgot | Low | Prototype intentionally hands off from Password group to Password Reset visuals (`Forgot Password -> Reset`). Cross-group mapping is coherent but may reduce scan clarity. | Optional UX polish: add a bridge card in Password group to indicate handoff to Reset group; no mandatory remap. | Accepted with note |
| M-006 | Passkey OS Sheet | passkey-os-sheet-* (4 flows) | Low | 4 flows remain on legacy 198:* nodes and are outside Wave-3 grouped frames. | Keep as exception if intentionally Figma-only placeholders; otherwise create Wave-3 placeholders for parity. | Accepted exception (pending sign-off) |

## Verified Non-Issues
- All 13 net-new Wave-3 node IDs are present inside the correct Wave-3 groups.
- Group hierarchy appears stable (no orphaned net-new flow frames found in baseline scan).

## Live Validation Evidence (Phase 1)
- M-001 comparison:
	- `passkey-biometric-failed` steps: `1 / 3 Chooser — passkey detected`, `2 / 3 Passkey prompt — biometric idle`, `3 / 3 Passkey — biometric failed`
	- `passkey-failed-fallback-password` steps: `1 / 3 Passkey prompt — biometric idle`, `2 / 3 Passkey failed — fallback tiles visible`, `3 / 3 Password — entry (chose Use a password)`
- M-002 comparison:
	- `cross-device-happy`: `4 / 4` with enrollment-offer terminal step
	- `cross-device-direct`: `2 / 2` ending at QR shown
- M-003 comparison:
	- `reset-happy`: `4 / 4` standard reset completion
	- `reset-edit-different-email`: `4 / 4` including edit-and-resend branch behavior
- M-004 comparison:
	- `recovery-email-setup-happy`: `4 / 4` ends in `Recovery email verified`
	- `recovery-email-setup-pending`: `4 / 4` ends in `Recovery email pending verification`
	- `recovery-email-setup-change`: `3 / 3` ends in `Use a different email -> back to entry`

## Immediate Next Checks (Phase 1 continuation) — ALL CLOSED 2026-06-18
1. ✅ Replaced cloned/placeholder visuals inside the new frames with branch-specific screenshots/captions.
2. ✅ Re-ran focused parity checks for the 5 remapped flows — all marked parity-pass.
3. ✅ Recounted Wave-3 by stable frame names: 41 total `flow-w3:*` frames, 41 unique names (36 baseline + 5 branch-split). Net-new +13 feature count unchanged.

## Resolved Blocker (Session)
- Figma MCP page `198:31` is now accessible. Dynamic-page model requires `await page.loadAsync()` + `await figma.setCurrentPageAsync(page)` before any node access.
- All blocking polish/recount work has been executed; see Closure Log below.

## Execution Log (2026-06-17)
- Dedicated frame nodes created in Figma:
	- `flow-w3:passkey-failed-fallback-password` -> 677:195
	- `flow-w3:cross-device-direct` -> 677:248
	- `flow-w3:reset-edit-different-email` -> 677:309
	- `flow-w3:recovery-email-setup-pending` -> 677:370
	- `flow-w3:recovery-email-setup-change` -> 677:431
- Prototype remaps applied in `sign-in.html`:
	- `passkey-failed-fallback-password` -> 677-195
	- `cross-device-direct` -> 677-248
	- `reset-edit-different-email` -> 677-309
	- `recovery-email-setup-pending` -> 677-370
	- `recovery-email-setup-change` -> 677-431
- Validation:
	- HTML/lint diagnostics: no file errors
	- Runtime sanity check: nav/flow controls present after reload
	- Flows-tab remap click-through verified for all five targets:
		- `passkey-failed-fallback-password` -> `node-id=677-195`
		- `cross-device-direct` -> `node-id=677-248`
		- `reset-edit-different-email` -> `node-id=677-309`
		- `recovery-email-setup-pending` -> `node-id=677-370`
		- `recovery-email-setup-change` -> `node-id=677-431`
	- Live playback re-verified for remapped branches:
		- `passkey-failed-fallback-password`: `3 / 3` ends at Password entry
		- `cross-device-direct`: `2 / 2` ends at QR shown
		- `reset-edit-different-email`: `4 / 4` ends at reset sent (new address)
		- `recovery-email-setup-pending`: `4 / 4` ends at pending verification
		- `recovery-email-setup-change`: `3 / 3` ends at loop-back state
	- Interim +13 recount from `sign-in.html` confirms all 13 net-new flow IDs remain present and mapped to expected `670-*` nodes.
	- Prototype load issue fixed in `sign-in.html` by restoring missing listener/function wrappers in nav/flow script block.

## Closure Log (2026-06-18)
- Branch-specific assets installed:
	- New `settings-security-recovery-pending` screenshot uploaded; hash `0cf55e5bcc80e17a5ff4ed2cdccda2bb6a3d01371` registered in `figma-export/_phase5-hashes.json`.
	- All 5 frames re-imaged with correct hashes per canonical sequence.
- Content polish completed in all 5 frames:
	- Image rectangles resized to natural aspect at width=346 (no letterboxing).
	- Step descriptions repositioned to sit ~12 px below each image, rewritten with branch-accurate captions.
	- Frame 2 (`cross-device-direct`) trimmed from 4→2 steps; frame 5 (`recovery-email-setup-change`) trimmed from 4→3 steps.
	- Userflow strips repositioned and re-labelled with branch-specific node titles and edge labels.
	- Frame heights recomputed: 1079 / 1012 / 906 / 1165 / 989 px.
- Group-w3 heights re-cascaded; net Wave-3 column compacted by 403 px; zero remaining child overflows.
- Final MCP parity verification (2026-06-18):
	- Counts OK on all 5 frames (images/descs/arrows/userflowNodes/userflowArrows match expected).
	- Every step caption returns `exact` semantic match against canonical.
	- Every userflow node title returns `exact` semantic match against canonical.
	- Cross-step image reuse only present where canonically required (loop-back screens in M-003 and M-004 change variant).
- Prototype-side mapping recheck: `figmaUrl` entries for all 5 remapped flows still resolve to 677-195 / 677-248 / 677-309 / 677-370 / 677-431 (verified via grep in `sign-in.html` lines 6781, 6845, 7141, 7180, 7191).
