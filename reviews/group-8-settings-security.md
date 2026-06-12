# Group 8 · Account Settings & Security — Review

**Status:** Review-only. No code changes. Recommendations queued by tier into [CROSS-FLOW-LEDGER.md](CROSS-FLOW-LEDGER.md) and the SYNTHESIS pass (Plan v6 Phase 2).

**Sources cross-referenced**
- [user-flow-documentation.md § Group 8](../user-flow-documentation.md) (6 sub-flows: 8a–8f)
- Live Figma frames `198:389` (8a), `198:394` (8b), `198:402` (8c), `198:410` (8d), `198:418` (8e), `421:2` (8f) — cached in `.review-tmp/group-8/`
- Prototype: [sign-in.html](../sign-in.html)
  - Markup:
    - `screen-settings-security` L3072–3186 (hub)
    - `screen-activity` L3189–3245
    - `screen-active-devices` L3248–3303 (incl. sign-out modal L3290–3302)
    - `screen-settings-passkeys` (4 panels: list/rename/remove/remove-last) L3306–3387
    - `screen-settings-recovery-email` (2 panels: request/sent) L3389–3439 — **not documented in Group 8 doc**
  - Handlers:
    - `setSettingsState` L4569
    - Hub navigation: `security-passkeys-btn` L6120, `security-recovery-email-btn` L6157, `security-manage-devices-btn` L6244, `security-activity-link` L6250
    - Passkey actions (rename/remove): list-delegation L4844, rename-save L4862, rename-cancel L4865, remove-confirm L4870, remove-cancel L4873, remove-last-confirm L4877, remove-last-cancel L4880, add-passkey L4886
    - Recovery email: `setRecoveryEmailState` L6132, `refreshRecoveryEmailHubRow` L6135, send L6194, resend L6223, change L6228, simulate-verify L6235, cooldown L6173
    - Sign-out modal: open L6262, close L6270, confirm L6289, all-devices L6282, individual L6275
  - FLOWS array entries: `settings-overview` L5564, `settings-activity-log` L5573, `settings-active-devices` L5582, `settings-rename-passkey` L5591, `settings-remove-passkey` L5601, `settings-remove-last-passkey` L5611, **plus undocumented `recovery-email-setup-happy` / `pending` / `change` L5523–5557**
- [reviews/CROSS-FLOW-LEDGER.md](CROSS-FLOW-LEDGER.md) — 20 themes after Chunk 6

---

## 1 · Sub-flow alignment matrix

| Sub-flow | Doc anchor | Figma node | Prototype FLOWS id | Steps (Doc → Figma → Prototype) | Verdict |
|---|---|---|---|---|---|
| **8a Security Settings Overview** | `165:31` | `198:389` | `settings-overview` | 1 → **5 (incl. Signed In, Account Settings, Section Selected, Detail View)** → 1 | ⚠️ doc step minimal, **Recovery Email row absent from Figma** |
| **8b Sign-In Activity Log** | `165:57` | `198:394` | `settings-activity-log` | 2 → 3 → 2 | ✅ aligned |
| **8c Active Devices & Remote Sign-Out** | `165:73` | `198:402` | `settings-active-devices` | 2 → **5 (incl. Sign-Out Confirmation modal + Device Signed Out)** → 2 + modal | ✅ aligned |
| **8d Rename a Passkey** | `165:99` | `198:410` | `settings-rename-passkey` | 3 → 4 (incl. "Rename Saved" toast node) → 3 | ⚠️ **Figma toast not implemented; rename doesn't actually update list** |
| **8e Remove a Passkey** | `165:120` | `198:418` | `settings-remove-passkey` | 3 → **6 (incl. Remove Last branch + Passkey Removed toast)** → 3 | ⚠️ **Figma toast not implemented; remove doesn't actually remove item** |
| **8f Remove Last Passkey** | `421:2` | `421:2` | `settings-remove-last-passkey` | 3 → 4 (incl. "Passkeys List (empty)" terminal) → 3 | ⚠️ **empty-state terminus not implemented; item not removed from DOM** |
| **(Undocumented) Recovery Email Setup** | _(missing)_ | _(no Group 8 frame)_ | `recovery-email-setup-happy` / `pending` / `change` | _(none)_ → _(none)_ → 4 + 2 sub-states | ❌ **whole flow undocumented in Group 8 §** |

---

## 2 · Findings (severity order)

### Issue 1 · 🚨 **Major / Functional — Passkey rename and remove handlers don't actually mutate the list**

```js
// L4862-4865 · Rename
document.getElementById('rename-save-btn').addEventListener('click', () => {
  setSettingsState('list');   // returns to list — but never updates the .passkey-list-name DOM
});

// L4870-4881 · Remove (3 of 4 handlers)
document.getElementById('remove-confirm-btn').addEventListener('click', () => {
  setSettingsState('list');   // returns to list — but the passkey is still there
});
document.getElementById('remove-last-confirm-btn').addEventListener('click', () => {
  setSettingsState('list');   // same — item not removed from DOM, no empty state
});
```

Compare to the **same-flow precedent** for active-device sign-out (L6289–6306):

```js
document.getElementById('signout-modal-confirm').addEventListener('click', () => {
  if (pendingSignoutDeviceId === 'all') {
    document.querySelectorAll('#devices-full-list [data-device-id]:not([data-device-id="d1"])').forEach(el => el.remove());
    document.getElementById('device-signout-all-btn').textContent = 'No other active devices';
    …
  } else if (pendingSignoutDeviceId) {
    const item = document.querySelector(`#devices-full-list [data-device-id="${pendingSignoutDeviceId}"]`);
    if (item) item.remove();        // ✓ ACTUALLY removes the item
    …
  }
});
```

Sign-out works correctly. Rename and remove don't.

**Why it matters**
- A usability test participant taps **REMOVE PASSKEY**, gets returned to the list with the passkey *still there*, and concludes the action failed.
- **8f Remove Last** is the most affected: Figma 8f explicitly specifies the empty-state terminus — *"List refreshed. If no passkeys remain, list shows empty state with 'Add a passkey' CTA"* — but the prototype doesn't render any empty state because the item never leaves the DOM.
- Rename is the same shape: input pre-fills correctly (L4856), `maxlength="40"` is enforced, but on **SAVE NAME** the `.passkey-list-name` element is never updated with the input value.
- This blocks meaningful usability testing of all of 8d, 8e, 8f.

**Comparison to Theme 8/18:** This is a **new theme** distinct from those — Theme 8/18 cover *terminal-step* stubs (alert vs navigation). This is a *mid-flow data-mutation* stub: the handler completes, the screen state updates, but the underlying data the user is acting on never changes.

**Recommendation (Tier A, Wave 1):**
- Rename save: read `#rename-input` value, find the matching `.passkey-list-item[data-pk-id]`, update its `.passkey-list-name`, call `setSettingsState('list')`.
- Remove confirm / remove-last confirm: find the item via the cached `pkId` from the click delegation, call `item.remove()`, then check if the list is empty → if so, render the empty-state CTA per Figma 8f, else `setSettingsState('list')`.
- Empty-state markup: add a `<div class="passkey-list-empty">` panel with the "Add a passkey" CTA (Figma 8f spec); show via CSS when `#passkey-list` has no `.passkey-list-item` children.

**Tier:** **A (Wave 1)** — the canonical fix for **new Theme 21**.

---

### Issue 2 · 🚨 **Major / Documentation — Recovery Email Setup flow is implemented in the prototype but absent from `user-flow-documentation.md` Group 8**

The doc's Group 8 § enumerates 6 sub-flows: 8a Overview, 8b Activity, 8c Devices, 8d Rename, 8e Remove, 8f Remove Last. **No mention of Recovery Email.**

But the prototype has:
- A full screen `screen-settings-recovery-email` with 2 panels (request/sent) — L3389–3439.
- Three FLOWS array entries (L5523–5557): `recovery-email-setup-happy`, `recovery-email-setup-pending`, `recovery-email-setup-change`.
- A persisted in-memory store (`recoveryEmailStore`) tracking `address` + `verified` status.
- A hub-row reflector (`refreshRecoveryEmailHubRow`) that updates the hub badge to `Not set` / `Pending` / `Verified`.
- Hub-row entry at L3099 with `id="security-recovery-email-btn"`.
- Cooldown timer + email-format validation + change-email loop-back.

The implementation is **substantially better than the doc's Group 8 coverage** (3 sub-flows + state-aware re-entry + persistent hub status), but a doc reader would never know it exists.

**Cross-reference to FLOWS comment** (L5523):
> *"Documents the backup-email enrollment journey from the Security hub. Mirrors Figma frame 463-475 'flow:recovery-email-enrollment'."*

So Figma has a `463:475` frame for this. It just isn't cited in the doc as part of Group 8.

**Why it matters**
- Onboarding a new contributor reading the doc, they'd never know about an entire enrollment surface.
- The doc's **"Remaining Gaps" §** still lists the home destination as "missing" but doesn't acknowledge the Recovery Email flow as **fixed and present**.
- Figma `463:475` likely belongs in a sub-flow callout under Group 8, parallel to 8a.

**Recommendation (Tier B, Wave 2 — doc fix):**
- Add `8g Recovery Email Setup` § to `user-flow-documentation.md` Group 8, citing FLOWS ids `recovery-email-setup-happy/pending/change` and Figma `463:475`. Cover all 3 sub-flows.
- Cross-link from 8a (the hub) to 8g (entry point: tapping the Recovery Email row).
- Consider whether Recovery Email belongs as its own Group rather than under 8 — it has 3 sub-flows of its own and stands apart from passkey/device/activity management.

**Tier:** **B (Wave 2)** — doc consolidation.

---

### Issue 3 · 🚨 **Major — Figma 8d/8e specify a "Passkey renamed" / "Passkey removed" toast that isn't implemented (Theme 18 instance)**

Figma 8d annotation (`339:846`-ish region): *"Saves → Rename Saved → Toast: 'Passkey renamed.' No sign-out triggered."*  
Figma 8e annotation: *"Confirms → Passkey Removed → Toast: 'Passkey removed.' List refreshed."*

Prototype: silent success. The user sees the screen flip back to the list (with the unchanged item, per Issue 1). Combined with Issue 1, the rename/remove gestures feel like nothing happened.

**Cross-references**
- This is a **fourth and fifth Theme 18 instance** if implemented as `alert()` (which would be wrong); it's also a **fourth and fifth Theme 8 instance** (missing user-facing confirmation of an action's success).
- The right shape here is the same toast/banner component the Wave 1 Theme 18 consolidation will produce. **G8 needs that component.**

**Recommendation (Tier A, Wave 1):**
- Pair with the Wave 1 Theme 18 toast component build. Trigger toasts after both rename-save and remove-confirm/remove-last-confirm:
  - `'"<name>" renamed.'` (rename)
  - `'"<name>" removed.'` (single remove)
  - `'"<name>" removed. You can sign in with password or a one-time code.'` (remove-last — escalated copy reflecting the consequence)

**Tier:** **A (Wave 1)** — same batch as Theme 18.

---

### Issue 4 · ⚠️ **Major — Hub data is fully hardcoded; doesn't reflect prototype's actual state**

`screen-settings-security` displays:
- **Passkey count** "2 passkeys saved" (L3094) — hardcoded, won't update if the user removes one.
- **Recent Sign-In Activity** — 4 items hardcoded (iPhone Face ID / MacBook Face ID / Chrome OTP / iPhone Face ID).
- **Trusted Devices** — iPhone 15 Pro + MacBook Pro hardcoded.

Compare:
- `screen-active-devices` does mutate (sign-out actually removes items per Issue 1's comparison).
- `recoveryEmailStore` is properly persisted in-memory and reflected on the hub.

So *some* parts of the hub mutate (recovery-email row), and *some* don't (passkey count, activity, trusted devices). Inconsistent.

**Why it matters**
- **8e/8f experience is broken-feeling**: even if Issue 1 is fixed and the passkey is removed from `#passkey-list`, the hub will still show "2 passkeys saved" — a third surface where the data lies.
- **Activity log mismatch**: hub preview shows 4 items; activity-page shows 6 items; "View all" implies "more here than the preview shows" — *but the hub items ARE the same 4 prefixes*, just truncated. So no mismatch in the hardcoded values, but if either list is regenerated dynamically, drift becomes likely.

**Recommendation (Tier B, Wave 2):**
- Centralize the prototype's authoritative state in a single object (`{ passkeys: [...], recoveryEmail: {...}, devices: [...], recentActivity: [...] }`).
- Render hub from that state. Trigger re-render on any mutation (passkey add/remove, device sign-out, recovery-email change).
- Optional: lift `pwAttempts`, `enrollOrigin`, `recoveryEmailStore` into the same object to consolidate.

**Tier:** **B (Wave 2)** — affects multiple flows; consolidation pass.

---

### Issue 5 · ⚠️ **Major — Activity log is read-only with no anchored anomaly action (cross-flow nav burden)**

Doc 8b: *"The log is read-only — actions live on the active devices screen."*

The doc's design intent is intentional: keep the log clean, push remediation to the right surface. Reasonable.

But: a user who sees "May 18, 3:12 PM · Chicago, IL · Windows PC · Edge · Password" and thinks *"that wasn't me"* has to:
1. Note the device + time mentally.
2. Tap the breadcrumb back to **Sign-In & Security**.
3. Tap **Trusted Devices › Manage** → arrives on Active Devices.
4. Find the device by sight.
5. Tap **Sign out**.
6. (Realize the device that signed in isn't even in the active-devices list, because that list shows currently-active sessions, not historical sign-ins.)

That last point is the wedge: **the activity log lists devices that may not be in the active-devices list**. So "actions live on the active devices screen" only works for the subset of activity entries that are ongoing sessions.

For a suspicious *historical* sign-in, the right action is **change password** + **review enrolled passkeys**. Neither is one tap from the activity log.

**Recommendation (Tier B, Wave 2 — UX architecture):**
- Add a "Don't recognize this?" inline link on each activity item, opening a small action sheet:
  - **Change my password** → routes to forgot-password flow with email pre-filled
  - **Sign out all other devices** → routes to active-devices `#device-signout-all-btn`
  - **Review my passkeys** → routes to settings-passkeys list
- Or, if minimal: a single "Something looks wrong?" button at the bottom of the activity list opening the same sheet.

**Tier:** **B (Wave 2)** — meaningful UX upgrade with cross-flow plumbing. Could also be flagged as **structural (Chunk 8)** since it questions the read-only-log intent.

---

### Issue 6 · 🟡 **Minor — Sign-out button case inconsistency within the same flow**

On `screen-active-devices`:
- Per-device button label: `Sign out` (sentence case) — `.device-signout-btn` L3275, L3285
- Modal confirmation primary button: `SIGN OUT` (UPPERCASE) — `.signout-confirm-btn` L3299
- Modal cancel button: `Cancel` (Title) — L3298
- Bulk sign-out button: `Sign out of all other devices` (sentence) — L3289

Four cases in one screen (sentence / UPPER / Title / sentence). The pattern across the rest of the prototype is UPPERCASE for primary submit-style CTAs and sentence/Title for tertiary/destructive — but `Sign out` per-row is a destructive primary action and should match the modal's `SIGN OUT`.

**Recommendation (Tier A, Wave 1):** Pair with Theme 2 consolidation. Provisional: per-device row → `SIGN OUT` (UPPER, matches modal); bulk → `SIGN OUT OF ALL OTHER DEVICES` (UPPER); modal cancel → `Cancel` (sentence, matches Theme 2 secondary-action rule).

**Tier:** **A (Wave 1)** — single Theme 2 batch.

---

### Issue 7 · 🟡 **Minor — Activity-log "Load older events" is a stub**

```js
// L6256-6259
document.getElementById('activity-load-more-btn').addEventListener('click', function () {
  this.textContent = 'No older events';
  this.disabled = true;
});
```

Not an `alert()`, but a **silent self-disable**. Different mechanism than Theme 18; same family (stub feedback for an unimplemented action). The button label-flip via direct `textContent` is at least the canonical pattern from Theme 14 (DOM text, not pseudo-element) — but the user gets no acknowledgment that "older events were checked and there are none" vs. "this is a placeholder for a future feature."

**Recommendation (Tier B, Wave 2):** Either remove the button (the page header says "last 30 days" — make that explicit and accept the static window), or replace with a paginated-fetch stub that returns a fake "+3 older events" once for demo. Don't leave the silent self-disable — it's hard to interpret.

**Tier:** **B (Wave 2)** — small UX upgrade. Pair with Theme 12 demo-control consolidation.

---

### Issue 8 · 🟡 **Minor — No back / breadcrumb-tap navigation on settings screens**

Settings screens use a breadcrumb topbar:
```html
<span class="settings-breadcrumb">Account Settings &rsaquo; Sign-In &amp; Security</span>
<h2 class="settings-section-heading">Active Devices</h2>
```

But the breadcrumb is **not interactive** — it's a `<span>`, not a button or link. The user can't tap it to go back. The only escape is the prototype-nav side panel.

Compare to G6's `screen-forgot-password` rate-limited panel: has `BACK TO SIGN IN` button. G2/G4: have `SIGN IN ANOTHER WAY`. G5: enrollment screens have `Maybe Later` / `Skip for now`.

The settings group is the only group reviewed where there's no in-flow back button. Mobile users without OS-level gesture-back will be stuck on detail screens.

**Recommendation (Tier A, Wave 1):**
- Make the breadcrumb tappable: `<button class="settings-breadcrumb-link">…</button>` that navigates back to `screen-settings-security`.
- Or, add an explicit chevron-back affordance in the topbar matching Apple HIG / Material patterns.
- Same fix applies to `screen-active-devices`, `screen-activity`, `screen-settings-passkeys`, `screen-settings-recovery-email` — all 4 detail screens.

**Tier:** **A (Wave 1)** — small markup change; pair with Theme 11 escape-hatch consolidation.

---

### Issue 9 · 🟡 **Minor — Rename character hint is static, not dynamic**

```html
<input class="settings-text-input" id="rename-input" type="text" maxlength="40" placeholder="e.g. My iPhone" autocomplete="off" />
<p class="settings-char-hint" id="rename-char-hint">40 characters max</p>
```

The hint says "40 characters max" but never updates as the user types. Common pattern is `"X / 40"` countdown. Not blocking — the input enforces the cap silently — but a 40-char passkey name is a weird limit (what is it for? device sync? backend constraint?) and a counter would help users not feel like the field is mysteriously rejecting input.

**Recommendation (Tier C, Wave 3):** Bind the hint to `input` event: `${value.length} / 40 characters`. Tiny enhancement.

**Tier:** **C (Wave 3)** — nit.

---

### Issue 10 · ℹ️ **Info — Sign-out modal is the prototype's only true modal pattern; promote as canonical**

`#signout-modal` (L3290–3302) + handlers (L6262–6306) is the cleanest dialog implementation in the prototype:

✓ Backdrop element separate from modal (proper overlay pattern)  
✓ `role="dialog"` `aria-modal="true"` `aria-labelledby="signout-modal-title"` — full ARIA  
✓ Focus moved to **confirm** button on open (L6268: `document.getElementById('signout-modal-confirm').focus()`)  
✓ Backdrop click dismisses (L6287)  
✓ Cancel + Confirm split actions  
✓ Device name interpolated dynamically (L6263)

What's missing for AAA-grade modal:
- No focus trap (Tab can escape the modal back to underlying screen)
- No Escape-key dismissal handler
- Focus return on close not explicit (L6270 just hides; doesn't restore focus to the triggering button)
- No `aria-describedby` linking the body text

**Why it matters**
- **Every other "confirmation"** in the prototype is implemented as a different *screen* (e.g., `data-settings-state="remove"` is a panel that replaces the list, not a true modal over it). The sign-out modal is the *only* modal-as-overlay in the entire prototype.
- This raises a structural question: should passkey rename/remove (8d/8e/8f) also be modals overlaying the list, rather than panel-replacements? Modal would let the user see *which item* they're acting on while confirming.

**Tier:** **Info / Strength** today; **Structural (Chunk 8)** for the modal-vs-panel question.

---

## 3 · Strengths to preserve

1. **Recovery Email enrollment is the most polished sub-flow in any group reviewed:**
   - Real email-format validation with focus management + `aria-invalid` (L6202) + inline color-shift hint (L6203) — error self-clears on next valid submit.
   - Persistent draft: re-entering the recovery-email screen mid-verify resumes on the `sent` panel, not the request panel (L6160–6166). State preservation across navigation.
   - Hub-row reflector (`refreshRecoveryEmailHubRow`) updates badge based on `verified ∧ address` truth-table.
   - Graceful `Use a different email` loop-back that pre-fills the prior address (L6228).
2. **Sign-out confirmation modal** — see Issue 10. Strongest dialog pattern in the codebase.
3. **`screen-active-devices` "This device" badge** (L3265) — clear self-identification on the row that *can't* be signed out, prevents footgun.
4. **Trusted-Devices section on hub** uses neutral platform icons (phone/laptop/tablet SVG paths) without forcing brand-specific colors. Reads cleanly.
5. **Stricter "Remove Last" warning** (`screen-settings-passkeys[data-settings-state="remove-last"]`):
   - Triangle warning icon in muted-red container (color: `#B71C1C`, bg: 8% red) — not full alarm-red.
   - Heading reframes the situation ("This is your only passkey") rather than echoing the action.
   - Primary CTA escalates from `REMOVE PASSKEY` → `REMOVE ANYWAY`.
   - Cancel relabels as `Keep passkey` — grounds the user in what they're preserving (Nielsen #5 error prevention done well).
6. **Hub uses subtle "Active" / "Verified" / "Pending" / "Not set" badges** — color-tier discipline matches the canonical 4-tier palette identified in G4/G5.
7. **Activity log's `activity-method-tag`** color-coding (`activity-method--faceid` / `--otp` / `--password`) lets the user scan for method patterns. Subtle but useful for anomaly detection.
8. **Breadcrumb topbar pattern** is consistent across all 4 detail screens — same shape, same level of indent. Just needs to be tappable (Issue 8).

---

## 4 · Tier queue (Group 8 contributions)

### Tier A — Phase 3 Wave 1 (functional / wiring fixes)

- **8.1** Make passkey rename/remove handlers actually mutate the list DOM. Fix empty-state for remove-last per Figma 8f. **Highest priority** — blocks usability testing of 8d/8e/8f.
- **8.3** Add toast confirmations to rename / remove / remove-last per Figma 8d/8e annotations — pair with Theme 18 toast component.
- **8.6** Standardize sign-out button case across `screen-active-devices` — pair with Theme 2.
- **8.8** Make breadcrumb topbar tappable on all 4 detail screens — pair with Theme 11 escape-hatch.

### Tier B — Phase 3 Wave 2 (UX / consolidation)

- **8.2** Add `8g Recovery Email Setup` to `user-flow-documentation.md` covering 3 sub-flows + Figma `463:475`. Consider promoting to its own group.
- **8.4** Centralize hub data; remove hardcoded passkey count, activity preview, trusted devices.
- **8.5** Activity-log anomaly-action affordance ("Don't recognize this?" inline action sheet) — *or* flag as **Structural** if it questions read-only intent.
- **8.7** Activity-log "Load older events" — replace silent self-disable with explicit "showing last 30 days" copy or paginated-fetch stub.

### Tier C — Phase 3 Wave 3 (nits)

- **8.9** Rename character hint dynamic counter.

### Structural — Chunk 8 (Plan v6)

- **8.S1** **Modal-vs-panel for confirmations.** Sign-out is a modal; passkey rename/remove are panel-replacements. Should they be unified? Modals preserve list-context (user sees what they're acting on); panels are simpler markup. Decide a house rule.
- **8.S2** **Activity-log action-affordance scope.** Doc says read-only is intentional; Issue 5 questions whether that's user-friendly for the suspicious-sign-in case. JTBD pass.
- **8.S3** **Recovery Email's place in the IA.** Currently a row on Sign-In & Security hub; doc puts it nowhere. Is it a peer of passkeys? A sub-feature? Should `screen-settings-security` group "Sign-in methods" (passkeys + recovery email) separate from "Account hygiene" (activity + devices)?

---

## 5 · Theme contributions to ledger

| Theme | What G8 adds |
|---|---|
| **Theme 1** (Figma node-ID drift) | Doc anchors `165:31/57/73/99/120 + 421:2` map to live `198:389/394/402/410/418 + 421:2`. |
| **Theme 2** (case) | All H2s Title Case (Sign-In & Security / Sign-In Activity / Active Devices / Passkeys); all primary buttons UPPER; sign-out has 4 cases on one screen (Issue 6). |
| **Theme 3** (banner palette) | Hub uses `--success` + `--muted` badges cleanly (Active/Verified/Pending/Not set). Reinforces 4-tier palette. |
| **Theme 4** (failed-state heading color) | Remove-last uses muted-red container (8% red bg, `#B71C1C` icon) + neutral heading — reinforces "red = terminal only" rule. |
| **Theme 7** (stale Figma flow frames) | Figma 8a's hub doesn't show the Recovery Email row (`security-recovery-email-btn`) that the prototype has. Tier C re-capture needed. |
| **Theme 8** (signed-in destination) | **6th + 7th + 8th instances** — rename / remove / remove-last all silent on success (no toast, no confirmation). Fixes pair with Theme 18 component. |
| **Theme 11** (escape-hatch) | **New flavor** — settings detail screens have non-tappable breadcrumb (Issue 8). Different shape from prior groups (which had explicit back-buttons or omitted them). |
| **Theme 12** (visible demo controls) | New candidate: `activity-load-more-btn` silent self-disable (Issue 7). |
| **Theme 14** (DOM-text label swaps) | `activity-load-more-btn` uses `this.textContent = 'No older events'` — clean DOM-text precedent reinforcing Theme 14 canonical pattern. |
| **Theme 17** (time-value drift) | **Confirms** the `recovery-email` "30 minutes" outlier flagged in Chunk 6 — same surface as G6's reset-link "15 min". Two adjacent recovery email/link timers with different values. |
| **Theme 18** (stub `alert()` confirmations) | **G8 has zero `alert()` calls.** Confirms G6's clean precedent. The rename/remove silence (Issue 3) is *missing* a toast, not stubbed with an alert — different defect, same Wave 1 component fix. |
| **Theme 20a** (terminus structural) | New question — see 8.S1 (modal-vs-panel) and 8.S3 (Recovery Email IA placement). |

### Two new themes → ledger now **22 total**

- **Theme 21 · Stub data-mutation handlers** — handlers update screen state but never mutate the underlying data the user is acting on. G8 has 3 instances (rename, remove, remove-last). Distinct from Theme 8 (terminal stub) and Theme 18 (alert mechanism). Wave 1 fix: implement the mutations + render proper post-mutation states (incl. empty state per Figma 8f).
- **Theme 22 · Modal/dialog pattern is single-instance and partial** — `#signout-modal` is the only true modal; lacks focus trap, Escape handler, focus return. Decide canonical modal pattern (or punt to "no modals — always panels") in structural pass.

---

*Chunk 7 of 7 in the per-group review pass. Per-group phase complete. Next: Chunk 8 · Structural pass (Plan v6) → `reviews/STRUCTURAL-REVIEW.md`. Then Phase 2 SYNTHESIS → Phase 3 Waves.*
