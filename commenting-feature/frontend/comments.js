/* ─── Comments overlay (prototype review tool) ─────────────────────────
   Self-contained IIFE. Drop into any HTML prototype that has a stage
   container with switchable screen children.

   Owner-only writes via Bearer token (stored in localStorage).
   Public reads — anyone viewing the preview URL sees the dots.
   Backend: /api/comments  (api/comments.js + Vercel KV)
   Storage isolation: by git branch (VERCEL_GIT_COMMIT_REF on the server).

   Configuration (optional). Set BEFORE this script loads:

     window.COMMENTS_CONFIG = {
       apiUrl:             '/api/comments',            // backend endpoint
       stageSelector:      '#screens-container',        // parent of screens
       screenSelector:     '#screens-container > div',  // each screen
       flowsGlobal:        '__protoFlows',              // optional flow registry
       navItemSelector:    '.proto-nav-item[data-nav-target]',
       flowButtonSelector: '.proto-flow-btn[data-flow-id]',
     };

   See commenting-feature/LLM-INTEGRATION.md for the full integration runbook.
─────────────────────────────────────────────────────────────────────── */
(function commentsOverlay() {
  'use strict';

  // ── Config (read once at IIFE start) ──────────────────────
  const cfg = (typeof window !== 'undefined' && window.COMMENTS_CONFIG) || {};
  const API_URL = cfg.apiUrl || '/api/comments';
  const STAGE_SELECTOR = cfg.stageSelector || '#screens-container';
  const SCREEN_SELECTOR = cfg.screenSelector || '#screens-container > div';
  const FLOWS_GLOBAL = cfg.flowsGlobal || '__protoFlows';
  const NAV_ITEM_SELECTOR = cfg.navItemSelector || '.proto-nav-item[data-nav-target]';
  const FLOW_BTN_SELECTOR = cfg.flowButtonSelector || '.proto-flow-btn[data-flow-id]';

  const LS_TOKEN = 'comments.token';
  const LS_MODE = 'comments.mode';
  const OVERLAY_CLASS = 'comments-overlay-layer';

  // ── State ────────────────────────────────────────────────
  let comments = [];          // all comments for current branch
  let commentMode = false;    // is comment-mode active?
  let activePopover = null;   // currently-open popover element
  let activeDotId = null;     // id of comment whose popover is open (or 'new')
  let pendingNewPoint = null; // { screenId, xPct, yPct } for unsaved new comment
  let toggleBtn = null;
  let countPill = null;
  let lastRenderedScreenId = null;

  // ── Token + auth helpers ─────────────────────────────────
  function getToken() {
    try { return localStorage.getItem(LS_TOKEN) || ''; }
    catch (_) { return ''; }
  }
  function setToken(t) {
    try { localStorage.setItem(LS_TOKEN, t); } catch (_) {}
  }
  function clearToken() {
    try { localStorage.removeItem(LS_TOKEN); } catch (_) {}
  }
  // Returns a Promise<string|null>. Uses an in-page modal instead of
  // window.prompt() because Chrome can silently suppress native prompts
  // (esp. after the user has dismissed one), which would make Save look
  // broken with no feedback.
  let __authModalPromise = null;
  function promptForToken() {
    if (__authModalPromise) return __authModalPromise;
    __authModalPromise = new Promise((resolve) => {
      const existing = getToken();
      const overlay = document.createElement('div');
      overlay.className = 'comments-auth-modal';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'comments-auth-modal-title');
      overlay.innerHTML = ''
        + '<div class="comments-auth-modal-card">'
        +   '<h3 id="comments-auth-modal-title">Sign in to save comments</h3>'
        +   '<p>Paste your <strong>COMMENT_WRITE_TOKEN</strong> to save, edit, resolve, or delete comments. Anyone can view; only people with the token can write.</p>'
        +   '<input type="text" autocomplete="off" spellcheck="false" placeholder="Paste token here\u2026" aria-label="Comment write token" />'
        +   '<p class="comments-auth-modal-error" style="display:none;"></p>'
        +   '<div class="comments-auth-modal-actions">'
        +     '<button type="button" data-action="cancel">Cancel</button>'
        +     '<button type="button" class="primary" data-action="save" disabled>Save token</button>'
        +   '</div>'
        + '</div>';
      document.body.appendChild(overlay);
      const input = overlay.querySelector('input');
      const saveBtn = overlay.querySelector('[data-action="save"]');
      const cancelBtn = overlay.querySelector('[data-action="cancel"]');
      const errEl = overlay.querySelector('.comments-auth-modal-error');
      if (existing) input.value = existing;
      const sync = () => { saveBtn.disabled = !input.value.trim(); };
      sync();
      input.addEventListener('input', sync);
      const finish = (value) => {
        document.removeEventListener('keydown', onKey, true);
        overlay.remove();
        __authModalPromise = null;
        resolve(value);
      };
      const onSave = () => {
        const v = (input.value || '').trim();
        if (!v) { input.focus(); return; }
        setToken(v);
        finish(v);
      };
      const onCancel = () => finish(null);
      const onKey = (e) => {
        if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
        else if (e.key === 'Enter' && document.activeElement === input) { e.preventDefault(); onSave(); }
      };
      saveBtn.addEventListener('click', onSave);
      cancelBtn.addEventListener('click', onCancel);
      document.addEventListener('keydown', onKey, true);
      setTimeout(() => { input.focus(); input.select(); }, 0);
    });
    return __authModalPromise;
  }
  function authHeaders() {
    const t = getToken();
    return t ? { 'Authorization': 'Bearer ' + t } : {};
  }

  // ── API client ───────────────────────────────────────────
  async function apiLoad() {
    try {
      const res = await fetch(API_URL, { method: 'GET' });
      if (!res.ok) throw new Error('GET ' + res.status);
      const data = await res.json();
      comments = Array.isArray(data.comments) ? data.comments : [];
      return comments;
    } catch (err) {
      console.warn('[comments] load failed:', err);
      comments = [];
      return comments;
    }
  }
  async function apiCreate(payload) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload),
    });
    if (res.status === 401) {
      if (await promptForToken()) return apiCreate(payload);
      throw new Error('unauthorized');
    }
    if (!res.ok) throw new Error('POST ' + res.status);
    const data = await res.json();
    return data.comment || data;
  }
  async function apiUpdate(id, patch) {
    const res = await fetch(API_URL + '?id=' + encodeURIComponent(id), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(patch),
    });
    if (res.status === 401) {
      if (await promptForToken()) return apiUpdate(id, patch);
      throw new Error('unauthorized');
    }
    if (!res.ok) throw new Error('PATCH ' + res.status);
    const data = await res.json();
    return data.comment || data;
  }
  async function apiDelete(id) {
    const res = await fetch(API_URL + '?id=' + encodeURIComponent(id), {
      method: 'DELETE',
      headers: { ...authHeaders() },
    });
    if (res.status === 401) {
      if (await promptForToken()) return apiDelete(id);
      throw new Error('unauthorized');
    }
    if (res.status !== 204 && !res.ok) throw new Error('DELETE ' + res.status);
  }

  // ── Screen detection ─────────────────────────────────────
  function getActiveScreen() {
    const stage = document.querySelector(STAGE_SELECTOR);
    if (!stage) return null;
    const visible = Array.from(stage.children).filter(
      (el) => el.nodeType === 1 && !el.hasAttribute('hidden')
    );
    if (visible.length === 0) return null;
    if (visible.length === 1) return visible[0];
    // Mid-animation: incoming screen has no pointer-events:none inline
    const incoming = visible.find((el) => el.style.pointerEvents !== 'none');
    return incoming || visible[visible.length - 1];
  }
  function getScreenStateAttrs(screen) {
    if (!screen || !screen.attributes) return {};
    const out = {};
    for (const attr of Array.from(screen.attributes)) {
      if (attr.name && attr.name.indexOf('data-') === 0) {
        out[attr.name] = attr.value;
      }
    }
    return out;
  }
  // True iff the comment belongs to the active screen variant. Same
  // screenId AND identical data-* attributes (missing values treated
  // as ''). Comments stored without stateAttrs (legacy/raw API writes)
  // match any state so we never silently lose them.
  function commentMatchesActiveScreen(c, screen) {
    if (!screen) return false;
    if (!c || c.screenId !== screen.id) return false;
    const commentAttrs = c.stateAttrs || null;
    if (!commentAttrs || Object.keys(commentAttrs).length === 0) return true;
    const screenAttrs = getScreenStateAttrs(screen);
    const keys = new Set([
      ...Object.keys(screenAttrs),
      ...Object.keys(commentAttrs),
    ]);
    for (const k of keys) {
      if ((screenAttrs[k] || '') !== (commentAttrs[k] || '')) return false;
    }
    return true;
  }
  function ensureOverlay(screen) {
    if (!screen) return null;
    let overlay = screen.querySelector(':scope > .' + OVERLAY_CLASS);
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = OVERLAY_CLASS;
      screen.appendChild(overlay);
    }
    return overlay;
  }

  // Dots live on a single body-level layer (NOT inside the screen
  // card) so they are never clipped by ancestor `overflow: hidden`
  // rules. Each dot is positioned with explicit page-coord pixels
  // computed from the active screen's bounding rect + the stored
  // xPct/yPct (which can be < 0 or > 1 for off-card placements).
  const DOTS_LAYER_ID = 'comments-dots-layer';
  function ensureDotsLayer() {
    let layer = document.getElementById(DOTS_LAYER_ID);
    if (!layer) {
      layer = document.createElement('div');
      layer.id = DOTS_LAYER_ID;
      // Zero-size container at the document origin; dots sit on top
      // with absolute page-coord left/top.
      layer.style.cssText = 'position:absolute;top:0;left:0;width:0;height:0;pointer-events:none;z-index:60;';
      document.body.appendChild(layer);
    }
    return layer;
  }

  // ── Render dots on the active screen ─────────────────────
  function renderDots() {
    const screen = getActiveScreen();
    if (!screen) return;
    lastRenderedScreenId = screen.id;
    // Wipe any stale legacy per-screen overlays from older builds.
    document.querySelectorAll('.' + OVERLAY_CLASS).forEach((el) => {
      el.innerHTML = '';
    });
    const layer = ensureDotsLayer();
    layer.innerHTML = '';
    const screenComments = comments.filter((c) => commentMatchesActiveScreen(c, screen));
    // Sort: open first, then resolved; within each group by createdAt
    screenComments.sort((a, b) => {
      if (a.status !== b.status) return a.status === 'open' ? -1 : 1;
      return (a.createdAt || 0) - (b.createdAt || 0);
    });
    const r = screen.getBoundingClientRect();
    const sx = window.scrollX;
    const sy = window.scrollY;
    let i = 1;
    for (const c of screenComments) {
      const dot = document.createElement('div');
      dot.className = 'comments-dot';
      dot.dataset.id = c.id;
      dot.dataset.status = c.status || 'open';
      const pageX = r.left + sx + (c.xPct || 0) * r.width;
      const pageY = r.top  + sy + (c.yPct || 0) * r.height;
      dot.style.left = pageX + 'px';
      dot.style.top  = pageY + 'px';
      dot.textContent = String(i);
      dot.title = (c.text || '').slice(0, 80);
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openPopoverForComment(c, dot);
      });
      layer.appendChild(dot);
      i += 1;
    }
    updateCountPill();
  }

  function updateCountPill() {
    if (!countPill) return;
    // Scope the toggle's pill to the currently viewed screen *variant*
    // (state-aware) so it mirrors exactly what's rendered as dots.
    // Per-screen and per-flow totals still live in the nav.
    const screen = getActiveScreen();
    const open = screen
      ? comments.filter((c) => c.status === 'open' && commentMatchesActiveScreen(c, screen)).length
      : 0;
    if (open > 0) {
      countPill.textContent = open > 99 ? '99+' : String(open);
      countPill.style.display = '';
    } else {
      countPill.style.display = 'none';
    }
    updateNavItemPills();
  }

  // ── Per-screen / per-flow badges in the nav (optional) ──────────────
  // Renders only if the host project provides matching nav DOM. Red pill
  // when ≥1 open comment exists for the row's screen-state (or any step
  // of the row's flow). Grey pill when zero open but ≥1 resolved comment
  // exists. Hidden when no comments at all.
  function commentMatchesNavItem(c, item) {
    if (c.screenId !== item.dataset.navTarget) return false;
    const navState = item.dataset.navState;
    if (!navState) return true; // catch-all variant
    const commentAttrs = (c && c.stateAttrs) || {};
    const values = Object.values(commentAttrs);
    if (navState === 'default') {
      // Legacy comments without stateAttrs fall into the default
      // bucket; explicit 'default' or empty values also match.
      if (values.length === 0) return true;
      return values.some((v) => !v || v === 'default');
    }
    return values.some((v) => v === navState);
  }
  function commentMatchesFlowStep(c, step) {
    if (c.screenId !== step.screen) return false;
    const commentAttrs = (c && c.stateAttrs) || {};
    const values = Object.values(commentAttrs);
    if (!step.state) {
      if (values.length === 0) return true;
      return values.some((v) => !v || v === 'default');
    }
    return values.some((v) => v === step.state);
  }
  function countForFlow(flow, pool) {
    if (!flow || !Array.isArray(flow.steps)) return 0;
    let n = 0;
    for (const c of pool) {
      if (flow.steps.some((s) => commentMatchesFlowStep(c, s))) n += 1;
    }
    return n;
  }
  function upsertNavPill(host, openCount, resolvedCount) {
    let pill = host.querySelector(':scope > .comments-nav-pill');
    if (openCount === 0 && resolvedCount === 0) {
      if (pill) pill.remove();
      return;
    }
    if (!pill) {
      pill = document.createElement('span');
      pill.className = 'comments-nav-pill';
      host.appendChild(pill);
    }
    const n = openCount > 0 ? openCount : resolvedCount;
    pill.textContent = n > 99 ? '99+' : String(n);
    pill.classList.toggle('is-resolved', openCount === 0);
  }
  function updateNavItemPills() {
    const open = comments.filter((c) => c.status === 'open');
    const resolved = comments.filter((c) => c.status === 'resolved');
    // Screens tab — silently does nothing if selector matches nothing
    document.querySelectorAll(NAV_ITEM_SELECTOR).forEach((item) => {
      const o = open.reduce((acc, c) => acc + (commentMatchesNavItem(c, item) ? 1 : 0), 0);
      const r = resolved.reduce((acc, c) => acc + (commentMatchesNavItem(c, item) ? 1 : 0), 0);
      upsertNavPill(item, o, r);
    });
    // Flows tab — needs the project to expose a flow registry on window
    const flowsList = window[FLOWS_GLOBAL];
    if (!Array.isArray(flowsList)) return;
    document.querySelectorAll(FLOW_BTN_SELECTOR).forEach((btn) => {
      if (btn.classList.contains('figma-only')) {
        const stale = btn.querySelector(':scope > .comments-nav-pill');
        if (stale) stale.remove();
        return;
      }
      const flow = flowsList.find((f) => f && f.id === btn.dataset.flowId);
      if (!flow) return;
      const o = countForFlow(flow, open);
      const r = countForFlow(flow, resolved);
      upsertNavPill(btn, o, r);
    });
  }

  // ── Popover (compose / view / edit) ──────────────────────
  function closePopover() {
    if (activePopover && activePopover.parentNode) {
      activePopover.parentNode.removeChild(activePopover);
    }
    activePopover = null;
    activeDotId = null;
    pendingNewPoint = null;
    // Remove active highlight
    document.querySelectorAll('.comments-dot.is-active').forEach((el) => {
      el.classList.remove('is-active');
    });
  }

  function makePopoverShell() {
    const pop = document.createElement('div');
    pop.className = 'comments-popover';
    // Stop body click-to-place from firing inside the popover
    pop.addEventListener('click', (e) => e.stopPropagation());
    pop.addEventListener('mousedown', (e) => e.stopPropagation());
    return pop;
  }

  // Popover is appended to <body> with position:absolute in page
  // coords, then clamped to the viewport so it stays fully visible no
  // matter where the user clicks (including the right edge of a screen
  // or outside the screen card entirely).
  function placePopoverAtPagePoint(pop, pageX, pageY) {
    document.body.appendChild(pop);
    pop.style.position = 'absolute';
    pop.style.transform = 'none';
    pop.style.left = '0px';
    pop.style.top = '0px';
    pop.style.visibility = 'hidden';
    // Force layout so offsetWidth/Height are accurate
    const popW = pop.offsetWidth || 260;
    const popH = pop.offsetHeight || 160;
    const margin = 8;
    const gap = 12;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const sx = window.scrollX;
    const sy = window.scrollY;
    // Default: centered horizontally on anchor, just below it
    let left = pageX - popW / 2;
    let top = pageY + gap;
    // Flip above anchor if it would overflow the bottom of the viewport
    if (top + popH > sy + vh - margin) {
      top = pageY - popH - gap;
    }
    // Clamp to viewport (with small margin) in page coords
    left = Math.max(sx + margin, Math.min(left, sx + vw - popW - margin));
    top = Math.max(sy + margin, Math.min(top, sy + vh - popH - margin));
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
    pop.style.visibility = '';
  }

  // Convert a comment's screen-relative xPct/yPct into page coords for
  // popover placement. Falls back to viewport center if the screen has
  // no layout (e.g. hidden).
  function pagePointForComment(comment) {
    const screen = document.getElementById(comment.screenId) || getActiveScreen();
    if (screen) {
      const r = screen.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        return {
          x: r.left + window.scrollX + (comment.xPct || 0) * r.width,
          y: r.top  + window.scrollY + (comment.yPct || 0) * r.height,
        };
      }
    }
    return {
      x: window.scrollX + window.innerWidth / 2,
      y: window.scrollY + window.innerHeight / 2,
    };
  }

  function openPopoverForNew(screen, xPct, yPct, pageX, pageY) {
    closePopover();
    pendingNewPoint = { screenId: screen.id, xPct, yPct };
    const pop = makePopoverShell();
    pop.innerHTML = ''
      + '<p class="comments-popover-meta"><span>New comment · ' + screen.id + '</span></p>'
      + '<textarea placeholder="Write a note about this spot…"></textarea>'
      + '<p class="comments-popover-error" style="display:none;"></p>'
      + '<div class="comments-popover-actions">'
      +   '<button type="button" data-action="cancel">Cancel</button>'
      +   '<button type="button" class="primary" data-action="save">Save</button>'
      + '</div>';
    placePopoverAtPagePoint(pop, pageX, pageY);
    activePopover = pop;
    activeDotId = 'new';
    const ta = pop.querySelector('textarea');
    const errEl = pop.querySelector('.comments-popover-error');
    setTimeout(() => ta && ta.focus(), 50);
    pop.querySelector('[data-action="cancel"]').addEventListener('click', closePopover);
    pop.querySelector('[data-action="save"]').addEventListener('click', async () => {
      const text = (ta.value || '').trim();
      if (!text) { ta.focus(); return; }
      if (!getToken() && !(await promptForToken())) return;
      try {
        const created = await apiCreate({
          screenId: screen.id,
          stateAttrs: getScreenStateAttrs(screen),
          xPct,
          yPct,
          text,
        });
        comments.push(created);
        closePopover();
        renderDots();
      } catch (err) {
        errEl.textContent = 'Save failed: ' + err.message;
        errEl.style.display = '';
      }
    });
    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        pop.querySelector('[data-action="save"]').click();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closePopover();
      }
    });
  }

  function openPopoverForComment(comment, dotEl) {
    closePopover();
    activeDotId = comment.id;
    if (dotEl) dotEl.classList.add('is-active');
    const screen = getActiveScreen();
    if (!screen) return;
    const pop = makePopoverShell();
    const when = comment.createdAt
      ? new Date(comment.createdAt).toLocaleString()
      : '';
    const statusLabel = comment.status === 'resolved' ? 'resolved' : 'open';
    const resolveLabel = comment.status === 'resolved' ? 'Reopen' : 'Resolve';
    pop.innerHTML = ''
      + '<p class="comments-popover-meta">'
      +   '<span>' + escapeHtml(when) + '</span>'
      +   '<span class="comments-popover-status" data-status="' + statusLabel + '">' + statusLabel + '</span>'
      + '</p>'
      + '<p class="comments-popover-body"></p>'
      + '<p class="comments-popover-error" style="display:none;"></p>'
      + '<div class="comments-popover-actions">'
      +   '<button type="button" data-action="edit">Edit</button>'
      +   '<button type="button" data-action="toggle">' + resolveLabel + '</button>'
      +   '<button type="button" class="danger" data-action="delete">Delete</button>'
      + '</div>';
    pop.querySelector('.comments-popover-body').textContent = comment.text || '';
    // Anchor on the dot if we still have it; otherwise compute from the
    // comment's stored screen-relative position.
    let anchorX, anchorY;
    if (dotEl && dotEl.isConnected) {
      const dr = dotEl.getBoundingClientRect();
      anchorX = dr.left + window.scrollX + dr.width / 2;
      anchorY = dr.top  + window.scrollY + dr.height / 2;
    } else {
      const p = pagePointForComment(comment);
      anchorX = p.x;
      anchorY = p.y;
    }
    placePopoverAtPagePoint(pop, anchorX, anchorY);
    activePopover = pop;
    const errEl = pop.querySelector('.comments-popover-error');
    const actionsRow = pop.querySelector('.comments-popover-actions');
    // Two-step in-popover delete confirmation. Native confirm() is
    // unreliable here: it's triggered from a button inside a floating
    // popover whose outside-click handler runs on the same event's
    // bubble phase, and on some platforms the native dialog can be
    // auto-dismissed by focus shifts. Using an inline confirm strip
    // sidesteps all of that and gives us a better UX.
    pop.querySelector('[data-action="delete"]').addEventListener('click', () => {
      if (pop.querySelector('.comments-popover-confirm')) return;
      actionsRow.style.display = 'none';
      const confirmRow = document.createElement('div');
      confirmRow.className = 'comments-popover-actions comments-popover-confirm';
      confirmRow.innerHTML = ''
        + '<span class="comments-popover-confirm-label">Delete this comment?</span>'
        + '<button type="button" data-action="confirm-delete" class="danger">Yes, delete</button>'
        + '<button type="button" data-action="cancel-delete">Cancel</button>';
      actionsRow.parentNode.insertBefore(confirmRow, actionsRow.nextSibling);
      const cancelBtn = confirmRow.querySelector('[data-action="cancel-delete"]');
      const confirmBtn = confirmRow.querySelector('[data-action="confirm-delete"]');
      const dismiss = () => {
        confirmRow.remove();
        actionsRow.style.display = '';
      };
      cancelBtn.addEventListener('click', dismiss);
      confirmBtn.addEventListener('click', async () => {
        if (!getToken() && !(await promptForToken())) { dismiss(); return; }
        confirmBtn.disabled = true;
        cancelBtn.disabled = true;
        try {
          await apiDelete(comment.id);
          comments = comments.filter((c) => c.id !== comment.id);
          closePopover();
          renderDots();
        } catch (err) {
          errEl.textContent = 'Delete failed: ' + err.message;
          errEl.style.display = '';
          dismiss();
        }
      });
      // Focus the safer (Cancel) option by default so a stray Enter
      // press doesn't delete the comment.
      cancelBtn.focus();
    });
    pop.querySelector('[data-action="toggle"]').addEventListener('click', async () => {
      if (!getToken() && !(await promptForToken())) return;
      const prevStatus = comment.status;
      const newStatus = prevStatus === 'resolved' ? 'open' : 'resolved';
      try {
        const updated = await apiUpdate(comment.id, { status: newStatus });
        const idx = comments.findIndex((c) => c.id === comment.id);
        if (idx >= 0) comments[idx] = updated;
        closePopover();
        renderDots();
        const msg = newStatus === 'resolved' ? 'Comment resolved' : 'Comment reopened';
        showToast(msg, 'Undo', async () => {
          try {
            const reverted = await apiUpdate(comment.id, { status: prevStatus });
            const j = comments.findIndex((c) => c.id === comment.id);
            if (j >= 0) comments[j] = reverted;
            renderDots();
            showToast(prevStatus === 'resolved' ? 'Re-resolved' : 'Reopened');
          } catch (e) {
            showToast('Undo failed: ' + e.message);
          }
        });
      } catch (err) {
        errEl.textContent = 'Update failed: ' + err.message;
        errEl.style.display = '';
      }
    });
    pop.querySelector('[data-action="edit"]').addEventListener('click', () => {
      // Swap body for textarea
      const bodyEl = pop.querySelector('.comments-popover-body');
      const ta = document.createElement('textarea');
      ta.value = comment.text || '';
      bodyEl.replaceWith(ta);
      // Replace actions
      const actions = pop.querySelector('.comments-popover-actions');
      actions.innerHTML = ''
        + '<button type="button" data-action="cancel-edit">Cancel</button>'
        + '<button type="button" class="primary" data-action="save-edit">Save</button>';
      setTimeout(() => ta.focus(), 30);
      actions.querySelector('[data-action="cancel-edit"]').addEventListener('click', () => {
        openPopoverForComment(comment, document.querySelector('.comments-dot[data-id="' + comment.id + '"]'));
      });
      actions.querySelector('[data-action="save-edit"]').addEventListener('click', async () => {
        const text = (ta.value || '').trim();
        if (!text) { ta.focus(); return; }
        if (!getToken() && !(await promptForToken())) return;
        try {
          const updated = await apiUpdate(comment.id, { text });
          const idx = comments.findIndex((c) => c.id === comment.id);
          if (idx >= 0) comments[idx] = updated;
          closePopover();
          renderDots();
        } catch (err) {
          errEl.textContent = 'Save failed: ' + err.message;
          errEl.style.display = '';
        }
      });
    });
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ── Toast (action confirmation w/ optional Undo) ────────
  let toastEl = null;
  let toastTimer = null;
  function showToast(message, actionLabel, onAction) {
    if (toastTimer) { clearTimeout(toastTimer); toastTimer = null; }
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'comments-toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = '';
    const span = document.createElement('span');
    span.textContent = message;
    toastEl.appendChild(span);
    if (actionLabel && typeof onAction === 'function') {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = actionLabel;
      btn.addEventListener('click', () => {
        hideToast();
        try { onAction(); } catch (_) {}
      });
      toastEl.appendChild(btn);
    }
    // Force reflow so transition runs even on rapid successive calls
    void toastEl.offsetWidth;
    toastEl.classList.add('is-visible');
    toastTimer = setTimeout(hideToast, 5000);
  }
  function hideToast() {
    if (!toastEl) return;
    toastEl.classList.remove('is-visible');
    if (toastTimer) { clearTimeout(toastTimer); toastTimer = null; }
  }

  // ── Mode toggle ──────────────────────────────────────────
  // Mode is intentionally NOT persisted across reloads: every fresh
  // page load starts with comment mode off so the toggle's next click
  // always means "enter commenting", never an invisible "exit".
  function enterMode() {
    if (commentMode) return;
    commentMode = true;
    document.body.classList.add('comments-mode-on');
    if (toggleBtn) toggleBtn.setAttribute('aria-pressed', 'true');
    showToast('Comment mode on — click anywhere to add a comment');
  }
  function exitMode() {
    if (!commentMode) return;
    commentMode = false;
    document.body.classList.remove('comments-mode-on');
    if (toggleBtn) toggleBtn.setAttribute('aria-pressed', 'false');
    closePopover();
    hideToast();
  }
  function toggleMode() {
    if (commentMode) exitMode(); else enterMode();
  }

  // ── Click-to-place handler (capture phase) ───────────────
  // Selector for chrome we never want to hijack — the user must still
  // be able to operate the comment toggle, open existing comments, and
  // navigate via any prototype nav while comment mode is on.
  const COMMENT_IGNORE_SEL = [
    '.comments-toggle-wrap',
    '.comments-popover',
    '.comments-dot',
    '.comments-toast',
    '.comments-auth-modal',
    '#proto-nav-toggle',
    '#proto-nav-panel',
  ].join(',');

  function onStageClick(e) {
    if (!commentMode) return;
    if (e.target.closest && e.target.closest(COMMENT_IGNORE_SEL)) return;
    const screen = getActiveScreen();
    if (!screen) return;
    const rect = screen.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    // xPct/yPct are computed relative to the active screen so the dot
    // travels with the screen, but they are intentionally NOT clamped
    // to [0,1] — a click in the gutter or below the screen places a
    // dot at a negative or >100% coordinate, which still renders
    // because the overlay layer and the stage both allow overflow. The
    // page-level click point is what we use to anchor the compose
    // popover, so it always opens right under the cursor.
    const xPct = (e.clientX - rect.left) / rect.width;
    const yPct = (e.clientY - rect.top)  / rect.height;
    const pageX = e.pageX != null ? e.pageX : e.clientX + window.scrollX;
    const pageY = e.pageY != null ? e.pageY : e.clientY + window.scrollY;
    openPopoverForNew(screen, xPct, yPct, pageX, pageY);
  }

  // ── Toggle button injection (fixed top-right, below header) ──
  function injectToggleButton() {
    const wrap = document.createElement('span');
    wrap.className = 'comments-toggle-wrap';
    wrap.id = 'comments-toggle-wrap';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'comments-toggle';
    btn.className = 'comments-toggle';
    btn.setAttribute('aria-label', 'Toggle comment mode');
    btn.setAttribute('aria-pressed', 'false');
    btn.title = 'Toggle comment mode (place notes on the prototype)';
    btn.innerHTML =
      '<svg viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true">'
      + '<path d="M240-400h320v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM80-80v-760q0-33 23.5-56.5T160-920h640q33 0 56.5 23.5T880-840v520q0 33-23.5 56.5T800-240H240L80-80Z"/>'
      + '</svg>';
    const pill = document.createElement('span');
    pill.className = 'comments-count-pill';
    pill.style.display = 'none';
    pill.textContent = '0';
    wrap.appendChild(btn);
    wrap.appendChild(pill);
    document.body.appendChild(wrap);
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMode();
    });
    toggleBtn = btn;
    countPill = pill;
    return btn;
  }

  // ── MutationObserver to re-render on screen swap ─────────
  function installObservers() {
    const stage = document.querySelector(STAGE_SELECTOR);
    if (!stage) {
      console.warn('[comments] stage selector "' + STAGE_SELECTOR + '" matched nothing — toggle will appear but click-to-place will be a no-op until the stage exists.');
      return;
    }
    let pending = false;
    const reRender = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        const screen = getActiveScreen();
        if (!screen) return;
        if (screen.id !== lastRenderedScreenId) {
          closePopover();
        }
        renderDots();
      });
    };
    const mo = new MutationObserver(reRender);
    mo.observe(stage, {
      attributes: true,
      subtree: true,
      attributeFilter: ['hidden'],
    });
    // Re-render on resize/scroll so body-level dots stay glued to
    // the active screen as it moves with the viewport.
    let resizePending = false;
    const onViewportChange = () => {
      if (resizePending) return;
      resizePending = true;
      requestAnimationFrame(() => {
        resizePending = false;
        renderDots();
      });
    };
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, { passive: true });
    // Esc to exit mode / close popover
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (activePopover) { closePopover(); return; }
      if (commentMode) { exitMode(); }
    });
    // Capture-phase click for click-to-place (only fires in comment mode)
    document.addEventListener('click', onStageClick, true);
    // Bubble-phase click to dismiss an open popover when clicking outside
    document.addEventListener('click', (e) => {
      if (!activePopover) return;
      if (!e.target.closest) return;
      // Ignore clicks inside the popover, on any dot, on the toggle button,
      // or inside the auth modal (which can overlay the popover).
      if (e.target.closest('.comments-popover')) return;
      if (e.target.closest('.comments-dot')) return;
      if (e.target.closest('.comments-toggle-wrap')) return;
      if (e.target.closest('.comments-auth-modal')) return;
      closePopover();
    });
  }

  // ── Init ─────────────────────────────────────────────────
  async function init() {
    try {
      injectToggleButton();
      installObservers();
      await apiLoad();
      // Mode always starts off after a reload — force-clear any stale
      // persisted flag from older builds so the toggle behaves predictably.
      try { localStorage.removeItem(LS_MODE); } catch (_) {}
      renderDots();
    } catch (err) {
      console.warn('[comments] init failed:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  // Expose tiny debug API for the owner (no writes, just visibility)
  window.__comments = {
    list: () => comments.slice(),
    reload: async () => { await apiLoad(); renderDots(); },
    enter: enterMode,
    exit: exitMode,
    clearToken,
  };
})();
