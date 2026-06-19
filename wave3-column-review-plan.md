# Wave-3 Column Comprehensive Review Plan

## Goal
Run a full-column Wave-3 parity audit against the live prototype in `sign-in.html`, produce a flow-by-flow mismatch matrix with severity and proposed fixes, and then apply targeted corrections with Wave-3 labeling on the 13 net-new flows.

## Source of Truth
- Live prototype behavior in `sign-in.html` is the source of truth.
- Figma Wave-3 column is the comparison target.
- Existing review artifacts provide the audit lenses and decision rules.

## Phase 0 - Baseline Snapshot
1. Capture a frozen inventory of all Wave-3 flow frames under Figma page node `198:31`, grouped by each `group-w3` container.
2. Extract canonical flow definitions from `sign-in.html` (`FLOWS` registry, figmaUrl mappings, step sequences).
3. Build a baseline map for every flow: `flowId -> expected figmaUrl node -> current Figma frame node -> screenshot/image fill presence`.
4. Record any orphaned, misparented, or visually duplicated Wave-3 frames.

## Phase 1 - Comprehensive Review
1. Audit all Wave-3 groups end-to-end against live prototype behavior.
2. Verify for each flow:
   - correct frame target
   - correct screenshot content
   - correct placement/order inside the group container
   - correct narrative/caption intent
3. Produce a mismatch matrix with severity:
   - Critical: wrong behavior state shown
   - High: wrong screenshot variant or incorrect branch screenshot
   - Medium: placement/layout defect that obscures comparison
   - Low: naming/caption polish only
4. Tag each mismatch with a root-cause category:
   - stale image fill
   - wrong node mapping
   - incorrect parent group
   - outdated flow metadata

## Phase 2 - Correction Design
1. Prepare exact fixes per mismatch with target node IDs and expected screenshot stems.
2. Split corrections into two tracks:
   - Track A: node remap, screenshot stem remap, upload/hash/build artifacts
   - Track B: reparent, relayout, resize, and visual labeling
3. Validate Track A before Track B visual verification.
4. Add rollback checkpoints per group.

## Phase 3 - Wave-3 Labeling
1. Add `NEW IN WAVE-3` labels to these 13 flow nodes only:
   - `670:181`
   - `670:212`, `670:237`, `670:262`, `670:287`
   - `670:326`, `670:343`, `670:360`, `670:377`
   - `670:408`
   - `670:447`, `670:464`, `670:489`
2. Use one consistent label style and placement rule.
3. Confirm no non-new flow receives the label.

## Phase 4 - Verification
1. Recount Wave-2 vs Wave-3 by group to confirm the delta stays at +13.
2. Re-run parity checks per flow: prototype state -> expected screenshot stem -> Figma frame fill.
3. Re-test previously mismatched flows in the live prototype and confirm parity in Figma.
4. Mark each matrix row as Resolved, Deferred-Decision, or Out-of-Scope.

## Deliverables
- Full mismatch matrix, flow by flow.
- Short summary of corrected groups.
- List of deferred decisions that need product input.
- Traceability notes for the next wave.

## Reference Files
- `sign-in.html`
- `reviews/HEURISTIC-ALIGNMENT-MATRIX.md`
- `reviews/QA-PASS-2026-W2.md`
- `reviews/STRUCTURAL-REVIEW.md`
- `reviews/CROSS-FLOW-LEDGER.md`
- `figma-export/wave2-flows.json`
- `figma-export/wave2-nodes.json`
- `figma-export/wave2-narratives.json`
- `figma-export/manifest.json`
- `figma-export/capture_screens.py`
- `figma-export/_phase5-upload.py`
- `figma-export/_phase5-build.py`
