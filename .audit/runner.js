// Per-flow transition audit. Run by Playwright. Returns a result object for one flow.
// Caller passes `flow` as JSON.
//
// For each consecutive (stepA, stepB) pair in flow.steps:
//   - goto stepA, fillForms()
//   - snapshot visible clickables
//   - for each clickable C: goto stepA again, fillForms(), click C, await 350ms, record currentStep
//   - mark "forward path" = any clickable that lands on stepB (state-tolerant match)
//
// Returns:
// {
//   flowId, label, steps,
//   transitions: [
//     {
//       fromIdx, toIdx, from, to,
//       clickables: [{ id|idx, text, role, landed, isForward }],
//       forwardPaths: [ id|idx, ... ],
//       broken: boolean,
//     }
//   ]
// }

window.__runFlowAudit = async function (flow) {
  const a = window.__audit;
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  // After goto() (which now clicks the demo-nav and triggers a real
  // 280ms switchScreen animation), wait long enough for the animation to
  // settle. ANIM_DUR is in closure scope so we can't peek at it; use a
  // fixed buffer instead.
  const ANIM_SETTLE = 380;
  // Poll-based wait: returns as soon as state changes from `before`, up to maxMs.
  // Used after each click to allow long biometric/network simulations (e.g. Face ID
  // takes ~2.5s) without sleeping that long for every clickable.
  const waitForStateChange = async (before, maxMs = 4000, step = 100) => {
    const start = Date.now();
    while (Date.now() - start < maxMs) {
      await sleep(step);
      const now = a.currentStep();
      if (now.screen !== before.screen || now.state !== before.state || now.banner !== before.banner) {
        // give it one more frame to settle
        await sleep(60);
        return a.currentStep();
      }
    }
    return a.currentStep();
  };

  const result = {
    flowId: flow.id,
    label: flow.label,
    group: flow.group,
    steps: flow.steps,
    transitions: [],
    setupError: null,
  };

  if (!a.goto(flow.steps[0])) {
    result.setupError = 'cannot-goto-step-0';
    return result;
  }

  for (let i = 0; i < flow.steps.length - 1; i++) {
    const from = flow.steps[i];
    const to = flow.steps[i + 1];

    // Skip transitions explicitly marked as non-clickable (timer-driven,
    // post-auth auto-trigger, etc.). The flow definition documents them but
    // the audit shouldn't expect a CTA to drive them.
    if (to.trigger === 'auto' || to.trigger === 'timer' || to.trigger === 'simulated') {
      result.transitions.push({
        fromIdx: i, toIdx: i + 1, from, to,
        skipped: true, skipReason: to.trigger,
        broken: false, forwardPaths: [], forwardScreenOnly: [],
      });
      continue;
    }

    a.goto(from);
    await sleep(ANIM_SETTLE);
    a.fillForms();
    await sleep(40);
    const baseline = a.clickables();
    const landingActual = a.currentStep();

    const trans = {
      fromIdx: i,
      toIdx: i + 1,
      from,
      to,
      fromActual: landingActual,
      fromMatched: a.matches(from),
      clickables: [],
      forwardPaths: [],         // CTAs that land on exact (screen + state) match
      forwardScreenOnly: [],    // CTAs that land on the right screen but wrong/missing state
      broken: false,
      notes: [],
    };

    for (let ci = 0; ci < baseline.length; ci++) {
      const c = baseline[ci];
      a.goto(from);
      await sleep(ANIM_SETTLE);
      a.fillForms();
      await sleep(40);
      const before = a.currentStep();
      const ok = a.clickByIdOrIdx(c);
      const landed = await waitForStateChange(before, 4000);
      const isForwardScreen = landed.screen === to.screen;
      const isForwardExact = a.matches(to) || (
        isForwardScreen &&
        (to.state == null || landed.state === to.state) &&
        (!to.banner || landed.banner === to.banner)
      );
      // currentStep after waitForStateChange is `landed`; for accurate match
      // call we need to be on that page state. Recompute via direct check.
      trans.clickables.push({
        idx: c.idx,
        id: c.id,
        text: c.text,
        role: c.role,
        href: c.href,
        clicked: ok,
        landed,
        isForwardScreen,
        isForwardExact,
      });
      const cid = c.id || `idx:${c.idx}`;
      if (isForwardExact) trans.forwardPaths.push(cid);
      else if (isForwardScreen) trans.forwardScreenOnly.push(cid);
    }

    // Transition is "broken" only if NO clickable reaches even the right screen.
    trans.broken = trans.forwardPaths.length === 0 && trans.forwardScreenOnly.length === 0;
    result.transitions.push(trans);
  }

  return result;
};

console.log('[audit] runner ready');
