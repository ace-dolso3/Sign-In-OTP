// Audit harness — injected into the page via Playwright.
// Exposes:
//   window.__audit.goto(step)             // jump to {screen, state, banner}
//   window.__audit.currentStep()           // read current {screen, state, banner}
//   window.__audit.clickables()            // list visible clickable elements
//   window.__audit.matches(expectedStep)   // does current === expected?
//
// Usage from the orchestrator:
//   1. inject() once after page load
//   2. for each (stepFrom, stepTo) in a flow:
//        goto(stepFrom); baseline = clickables();
//        for each c of baseline:
//          goto(stepFrom); clickById(c.id); wait(); record currentStep();
//        flag transition broken if none matches stepTo.
//
// Notes:
//   - Some screens use multiple state-setters; this helper tries them in order
//     and falls back to switchScreen alone.
//   - "matches" ignores `label` (descriptive only) and ignores banner unless
//     the expected step explicitly sets one.

(function (root) {
  'use strict';

  // Per-screen state attribute name (used by both goto and currentStep).
  // For screens not in this map, fall back to `data-state`.
  const STATE_ATTR = {
    'screen-chooser': 'data-chooser-state',
    'screen-passkey': 'data-passkey-state',
    'screen-otp': 'data-otp-state',
    'screen-passkey-enroll': 'data-enroll-state',
    'screen-forgot-password': 'data-forgotpw-state',
    'screen-recovery': 'data-recovery-state',
    'screen-reenroll': 'data-reenroll-state',
    'screen-settings-security': 'data-settings-state',
    'screen-settings-passkeys': 'data-settings-state',
    'screen-settings-recovery-email': 'data-recovery-email-state',
  };

  // Flow-defined "state" tokens that don't map to a DOM attribute; they describe
  // a sub-panel of the screen (visible via [hidden] toggling) rather than the
  // top-level state attribute. The audit treats screen-only match as OK for
  // these but flags them as "loose-match" for triage.
  const PANEL_ONLY_STATES = {
    'screen-otp': new Set(['wrong', 'cooldown', 'expired', 'locked', 'resent']),
    'screen-password': new Set(['error']),
    'screen-new-password': new Set(['expired']),
    'screen-forgot-password': new Set(['rate-limited']),
  };

  // The OTP "entered" panel is the canonical attribute value, but flow
  // definitions call this state "default". Translate when goto-ing or matching.
  const STATE_ALIAS = {
    'screen-otp': { 'default': 'entered' },
  };

  function resolveStateValue(screenId, flowState) {
    if (!flowState) return null;
    const aliases = STATE_ALIAS[screenId];
    if (aliases && aliases[flowState]) return aliases[flowState];
    return flowState;
  }

  const SCREEN_SETTERS = {
    'screen-chooser': function (state, banner) {
      // chooser uses two state knobs: data-chooser-state (default | passkey-first)
      // and an optional banner via setChooserBanner.
      if (state) {
        const el = document.getElementById('screen-chooser');
        if (el) el.setAttribute('data-chooser-state', state);
      }
      if (typeof root.setChooserBanner === 'function') {
        root.setChooserBanner(banner || null);
      }
    },
    'screen-passkey': function (state) {
      // passkey screen has many states; setPasskeyState handles most,
      // setBiometricState handles the inline biometric prompt states.
      if (!state) return;
      if (typeof root.setPasskeyState === 'function') {
        try { root.setPasskeyState(state); return; } catch (_) {}
      }
      if (typeof root.setBiometricState === 'function') {
        try { root.setBiometricState(state); } catch (_) {}
      }
    },
    'screen-password': function (state) {
      const el = document.getElementById('screen-password');
      if (el && state) el.setAttribute('data-state', state);
    },
    'screen-otp': function (state) {
      // OTP has two phases (request + verify); pick the right setter from the state name.
      if (!state) return;
      if (state === 'request' && typeof root.setOtpRequestState === 'function') {
        try { root.setOtpRequestState('default'); return; } catch (_) {}
      }
      if (typeof root.setVerifyState === 'function') {
        try { root.setVerifyState(state); return; } catch (_) {}
      }
      const el = document.getElementById('screen-otp');
      if (el) el.setAttribute('data-state', state);
    },
    'screen-otp-no-access': function () {},
    'screen-passkey-enroll': function (state) {
      if (state && typeof root.setEnrollState === 'function') {
        try { root.setEnrollState(state); } catch (_) {}
      }
    },
    'screen-forgot-password': function (state) {
      const el = document.getElementById('screen-forgot-password');
      if (el && state) el.setAttribute('data-state', state);
    },
    'screen-reset-sent': function () {},
    'screen-new-password': function (state) {
      const el = document.getElementById('screen-new-password');
      if (el && state) el.setAttribute('data-state', state);
    },
    'screen-reset-success': function () {},
    'screen-account-locked': function () {},
    'screen-settings-security': function () {},
    'screen-settings-passkeys': function (state) {
      if (state && typeof root.setSettingsState === 'function') {
        try { root.setSettingsState(state); } catch (_) {}
      }
    },
    'screen-settings-recovery-email': function (state) {
      if (state && typeof root.setRecoveryEmailState === 'function') {
        try { root.setRecoveryEmailState(state); } catch (_) {}
      }
    },
    'screen-activity': function () {},
    'screen-active-devices': function () {},
  };

  function findScreen(id) {
    return document.getElementById(id);
  }

  // Find a demo-nav button that matches the target screen+state. This is the
  // ONLY reliable way to route into a screen because the prototype's JS holds
  // `currentScreen` in a closure — clicking the demo nav triggers the same
  // handler the user would use, which calls switchScreen() AND updates
  // currentScreen. Falls back to nav button with no data-nav-state if the
  // exact state match isn't found.
  function findNavButton(screen, state) {
    const all = document.querySelectorAll('.proto-nav-item[data-nav-target]');
    let exact = null;
    let screenOnly = null;
    for (const btn of all) {
      if (btn.getAttribute('data-nav-target') !== screen) continue;
      const navState = btn.getAttribute('data-nav-state') || null;
      if (navState === state) { exact = btn; break; }
      if (!navState && !screenOnly) screenOnly = btn;
      if (!screenOnly) screenOnly = btn; // first match as fallback
    }
    return exact || screenOnly;
  }

  function goto(step) {
    if (!step || !step.screen) return false;
    const target = findScreen(step.screen);
    if (!target) return false;
    // Cancel any in-flight switchScreen animation so siblings can be hidden.
    try { if (root.animating) root.animating = false; } catch (_) {}
    // PRIMARY ROUTE: click the demo-nav button for this (screen,state). This
    // triggers the real navigation handler in sign-in.html which keeps the
    // closure-scoped `currentScreen` variable in sync — essential because
    // many in-prototype handlers do `switchScreen(currentScreen, target)` and
    // will animate from the wrong source if currentScreen is stale.
    const resolvedState = resolveStateValue(step.screen, step.state);
    const navBtn = findNavButton(step.screen, resolvedState);
    if (navBtn) {
      try { navBtn.click(); } catch (_) {}
      // Demo-nav nav has ~280ms animation; we don't await here, callers should
      // already sleep after goto(). But also force the state attribute below
      // in case the demo-nav handler doesn't set the exact substate we need.
    } else {
      // FALLBACK: instant hide/show when no demo-nav entry exists for this
      // screen (e.g. screen-otp-no-access has no nav button).
      const siblings = document.querySelectorAll('#screens-container > div');
      siblings.forEach(s => {
        s.removeAttribute('style');
        s.setAttribute('hidden', '');
      });
      target.removeAttribute('hidden');
      const container = document.getElementById('screens-container');
      if (container) container.removeAttribute('style');
    }
    // Run any screen-specific setter (handles compound state like banner,
    // and ensures fine-grained substates are correctly applied even after
    // demo-nav routing).
    const setter = SCREEN_SETTERS[step.screen];
    if (setter) {
      try { setter(step.state, step.banner); } catch (_) {}
    }
    // Final belt-and-braces: write the canonical state attribute.
    if (step.state) {
      const attr = STATE_ATTR[step.screen] || 'data-state';
      target.setAttribute(attr, resolvedState);
    }
    return true;
  }

  function currentStep() {
    const visible = Array.from(document.querySelectorAll('#screens-container > div')).find(d => !d.hidden);
    if (!visible) return { screen: null, state: null, banner: null };
    const id = visible.id;
    let state = null;
    const attr = STATE_ATTR[id] || 'data-state';
    state = visible.getAttribute(attr) || null;
    // For screens without a top-level state attr, try to infer substate from
    // a visible panel inside the screen (e.g. screen-password error panel,
    // screen-otp wrong/cooldown/etc panels).
    if (!state) {
      // Look for panels with [data-substate] that are visible.
      const panel = visible.querySelector('[data-substate]:not([hidden])');
      if (panel) state = panel.getAttribute('data-substate');
    }
    // Banner (chooser only currently)
    let banner = null;
    if (id === 'screen-chooser') {
      const bannerEl = visible.querySelector('[data-chooser-banner]:not([hidden])');
      if (bannerEl) banner = bannerEl.getAttribute('data-chooser-banner');
    }
    return { screen: id, state, banner };
  }

  function isClickable(el) {
    if (!el || el.hidden || !el.offsetParent) return false;
    const tag = el.tagName;
    if (tag === 'BUTTON' || tag === 'A') return true;
    if (tag === 'LI' && el.getAttribute('role') === 'button') return true;
    if (el.getAttribute('role') === 'button') return true;
    if (el.classList.contains('proto-nav-item')) return false; // demo nav, not in-prototype
    return false;
  }

  function clickables() {
    const visibleScreen = Array.from(document.querySelectorAll('#screens-container > div')).find(d => !d.hidden);
    if (!visibleScreen) return [];
    const all = visibleScreen.querySelectorAll('*');
    const out = [];
    all.forEach((el, idx) => {
      if (!isClickable(el)) return;
      // Skip elements that are inside a hidden parent
      if (el.closest('[hidden]')) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const id = el.id || null;
      const role = (el.getAttribute('role') || el.tagName).toLowerCase();
      const cls = el.className?.toString().slice(0, 100) || '';
      const text = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80);
      const href = el.getAttribute('href');
      const dataAction = el.getAttribute('data-action');
      out.push({
        idx,
        id,
        role,
        tag: el.tagName,
        cls,
        text,
        href,
        dataAction,
        // selector that's stable for re-finding
        selector: id ? `#${CSS.escape(id)}` : null,
      });
    });
    return out;
  }

  function clickByIdOrIdx(c) {
    const visibleScreen = Array.from(document.querySelectorAll('#screens-container > div')).find(d => !d.hidden);
    if (!visibleScreen) return false;
    let el = null;
    if (c.id) el = document.getElementById(c.id);
    if (!el) {
      const all = Array.from(visibleScreen.querySelectorAll('*'));
      el = all[c.idx] || null;
    }
    if (!el) return false;
    el.click();
    return true;
  }

  function fillForms() {
    // Some primary CTAs require a non-empty input first. Pre-fill common fields.
    const fillers = {
      'chooser-id-input': 'shopper@example.com',
      'pw-email': 'shopper@example.com',
      'pw-password': 'CorrectPassword123!',
      'otp-email': 'shopper@example.com',
      'otp-phone': '5555550100',
      'reset-email': 'shopper@example.com',
      'newpw-input': 'NewPassword456!',
      'newpw-confirm': 'NewPassword456!',
      'recovery-email-input': 'recovery@example.com',
      'rename-input': 'My iPhone',
    };
    Object.entries(fillers).forEach(([id, v]) => {
      const el = document.getElementById(id);
      if (el && 'value' in el && !el.value) {
        el.value = v;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    // OTP code inputs (often a set of 6)
    const codeInputs = document.querySelectorAll('[id^="otp-code-"], input[name="otp-code"], .otp-code-input');
    if (codeInputs.length) {
      codeInputs.forEach((el, i) => {
        el.value = ['1','2','3','4','5','6'][i] || '0';
        el.dispatchEvent(new Event('input', { bubbles: true }));
      });
    }
  }

  function matches(expected) {
    if (!expected) return false;
    const cur = currentStep();
    if (cur.screen !== expected.screen) return false;
    if (expected.state != null) {
      const resolved = resolveStateValue(expected.screen, expected.state);
      const panelOnly = PANEL_ONLY_STATES[expected.screen] && PANEL_ONLY_STATES[expected.screen].has(expected.state);
      if (cur.state !== resolved) {
        // For panel-only states, accept screen-level match (loose).
        if (!panelOnly) return false;
      }
    }
    if (expected.banner && cur.banner !== expected.banner) return false;
    return true;
  }

  // Loose match: same screen, ignore state. Useful when audit only cares
  // that the user reached the right screen, not the precise sub-state.
  function matchesScreen(expected) {
    if (!expected) return false;
    return currentStep().screen === expected.screen;
  }

  root.__audit = {
    goto, currentStep, clickables, clickByIdOrIdx, fillForms, matches, matchesScreen,
  };

  // ── Audit guards ───────────────────────────────────────────────────────
  // Intercept events that would cause a full page navigation during audit:
  //   1. Form submissions (`<form>` without preventDefault) reload the URL.
  //   2. `<a href="#">` clicks add `#` to URL — harmless but inflates noise.
  //   3. `<a href="https://...">` clicks would navigate away entirely.
  // These guards run in CAPTURE phase and short-circuit before app handlers.
  function installGuards() {
    document.addEventListener('submit', function (e) {
      e.preventDefault();
    }, true);
    document.addEventListener('click', function (e) {
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href === '#' || href.startsWith('#') || href.startsWith('http')) {
        // Block real navigation but still let in-app handlers (delegated to the link) run.
        e.preventDefault();
      }
    }, true);
  }
  try { installGuards(); } catch (_) {}
})(window);

console.log('[audit] harness ready');
