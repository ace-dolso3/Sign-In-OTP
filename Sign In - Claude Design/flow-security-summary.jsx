// ARCHIVE — original ideation; not the source of truth.
// See sign-in.html (live prototype) for current behavior.
//
// flow-security-summary.jsx — Account Security Dashboard + Gap Inventory

/* ================================================================
   ACCOUNT SECURITY DASHBOARD
   ================================================================ */
const SecurityDashboardSection = () => (
  <PathSection title="Account Security Dashboard" subtitle="Separate entry point from Account Settings — sign-in activity, devices, remote sign-out" color="#b71c1c">
    <FlowTrack label="Dashboard Entry">
      <FlowNode type="gap" title="Security Overview" desc="Dashboard showing: passkey count, last sign-in method/date, active device count. Links to sub-sections below." wide />
    </FlowTrack>

    <BranchFrom from="Security Overview" condition="taps 'Sign-in activity'" />
    <FlowTrack indent>
      <FlowNode type="gap" title="Sign-In Activity Log" desc="Chronological list: date, method (password/OTP/passkey), device name, location (city). Filter by method or date range." wide />
    </FlowTrack>

    <BranchFrom from="Security Overview" condition="taps 'Devices'" />
    <FlowTrack indent>
      <FlowNode type="gap" title="Active Devices List" desc="Cards per device: name, type (phone/laptop), last active, location. Each has 'Sign out' action. Current device is badged." wide />
    </FlowTrack>

    <BranchFrom from="Active Devices List" condition="taps 'Sign out' on a device" />
    <FlowTrack indent>
      <FlowNode type="gap" title="Remote Sign-Out Confirmation" desc="'Sign out of [device]? They'll need to sign in again.' Confirm (destructive) + cancel." wide />
      <FlowArrow label="confirm" />
      <FlowNode type="converge" title="→ Devices List" desc="Device removed from active list" />
    </FlowTrack>

    <BranchFrom from="Security Overview" condition="taps 'Passkeys'" />
    <FlowTrack indent>
      <FlowNode type="existing" id="11" title="Passkeys List" desc="Existing passkey management screen" />
    </FlowTrack>
  </PathSection>
);

/* ================================================================
   GAP INVENTORY — Complete list of screens that need design
   ================================================================ */
const gapScreens = [
  // Password path
  { screen: 'Wrong Password Error', path: 'Password', priority: 'Critical', notes: 'Inline error state on password field. Show attempt count. Link to forgot password.' },
  { screen: 'Account Locked', path: 'Password', priority: 'High', notes: 'After max failed attempts. Countdown timer + password reset link.' },
  { screen: 'Forgot Password', path: 'Password', priority: 'Critical', notes: 'Email input to request password reset link.' },
  { screen: 'Reset Email Sent', path: 'Password', priority: 'Critical', notes: 'Confirmation with resend option and back-to-sign-in link.' },
  { screen: 'New Password Form', path: 'Password', priority: 'Critical', notes: 'New + confirm password inputs with strength indicator.' },
  { screen: 'Password Reset Success', path: 'Password', priority: 'High', notes: 'Confirmation with CTA to sign in. May auto-redirect.' },
  // OTP path
  { screen: 'Channel Selection', path: 'OTP', priority: 'Critical', notes: 'Email vs. phone picker. Pre-select last used. Show masked values.' },
  { screen: 'OTP Code Entry', path: 'OTP', priority: 'Critical', notes: 'Similar to Screen 17 (recovery) but sign-in context. Reuse OTP input components. Include resend link + countdown.' },
  { screen: 'Wrong Code Error', path: 'OTP', priority: 'High', notes: 'Inline on code entry screen. Show remaining attempts.' },
  { screen: 'Code Expired', path: 'OTP', priority: 'High', notes: 'Clear old code, offer to send new one.' },
  { screen: 'Resend Success', path: 'OTP', priority: 'Low', notes: 'Inline toast or confirmation text. Could be a state on code entry screen rather than standalone.' },
  { screen: 'Cooldown State', path: 'OTP', priority: 'Low', notes: 'Disabled resend with countdown timer. State on code entry screen.' },
  { screen: 'Max Resends Lockout', path: 'OTP', priority: 'High', notes: 'After 3+ resends. Timer + fallback to password or support.' },
  { screen: 'Switch Channel', path: 'OTP', priority: 'Low', notes: 'Link from code entry back to channel selection without losing session.' },
  { screen: 'No Channel Access', path: 'OTP', priority: 'High', notes: 'Fallback when user can\'t access email or phone on file. Links to password + support.' },
  // Passkey path
  { screen: 'QR Failed / Timed Out', path: 'Passkey', priority: 'High', notes: 'QR code expired or phone didn\'t connect. Regenerate or use different method.' },
  { screen: 'Re-Enroll Prompt', path: 'Passkey', priority: 'Low', notes: 'Post-recovery variant of opt-in (Screen 2A). Different copy for lost-device context.' },
  // Security dashboard
  { screen: 'Security Overview', path: 'Security', priority: 'High', notes: 'Dashboard entry: passkey count, last sign-in, active devices. Links to sub-screens.' },
  { screen: 'Sign-In Activity Log', path: 'Security', priority: 'High', notes: 'Chronological log with method, device, location. Filterable.' },
  { screen: 'Active Devices List', path: 'Security', priority: 'High', notes: 'Per-device cards with sign-out action. Current device badged.' },
  { screen: 'Remote Sign-Out Confirmation', path: 'Security', priority: 'High', notes: 'Destructive confirmation dialog. Similar pattern to Screen 13.' },
];

const screenAnnotations = [
  { id: '7', note: 'Success landing is shared across all paths. The toast message should be context-specific: "Signed in with password", "Signed in with one-time code", "Signed in with Face ID", or "Identity verified — you\'re signed in" (recovery).' },
  { id: '17', note: 'Identity verification screen can be reused for OTP sign-in code entry. Adjust header copy from recovery context ("Verify your identity") to sign-in context ("Enter your code"). Reuse same 6-digit input component.' },
  { id: '2A/2B', note: 'Opt-in prompt has two variants (bottom sheet and full page). Post-recovery re-enrollment needs a third copy variant: "Set up Face ID on this device?" with context that their previous passkey was on a different device.' },
  { id: '1B', note: 'Recommended sign-in screen variant. The Face ID hero CTA should only appear if the browser supports WebAuthn. If not, fall back to variant 1A (password/OTP only) — consider adding a gap screen for the no-WebAuthn state.' },
  { id: '10', note: 'Cross-device QR screen has a "Waiting for your phone…" status message. Needs a state transition when the phone responds: "Waiting…" → "Connected — confirm on your phone" → signed in. Consider adding a gap screen for the "connected" intermediate state.' },
  { id: '4', note: 'Setup success is used in both post-login and settings contexts. The "Continue" CTA destination differs: post-login goes to app, settings goes back to passkeys list. The CTA label could adapt: "Continue shopping" vs. "Back to settings".' },
];

const GapInventorySection = () => (
  <div style={{fontFamily:FC.font}}>
    <PathSection title="Gap Inventory" subtitle={"" + gapScreens.length + " screens identified that need design — prioritized by user impact"} color="#e65100">
      <GapTable items={gapScreens} />
    </PathSection>

    <PathSection title="Screen Annotations" subtitle="Existing screens that need context-specific adjustments" color="#8d6e00">
      <AnnotationList items={screenAnnotations} />
    </PathSection>

    <div style={{padding:'16px 20px',background:'#f0f4f8',borderRadius:10,border:'1px solid #d0d8e0',fontSize:13,lineHeight:1.6,color:FC.text}}>
      <strong style={{fontSize:14}}>Summary</strong>
      <ul style={{paddingLeft:20,margin:'8px 0 0'}}>
        <li><strong>17 screens</strong> already wireframed (in wireframes document)</li>
        <li><strong>{gapScreens.length} gap screens</strong> identified that need design</li>
        <li><strong>{gapScreens.filter(g => g.priority==='Critical').length} critical</strong> — must-have for launch (password reset, OTP core flow)</li>
        <li><strong>{gapScreens.filter(g => g.priority==='High').length} high priority</strong> — important for completeness (error states, security dashboard)</li>
        <li><strong>{gapScreens.filter(g => g.priority==='Low').length} low priority</strong> — polish and edge cases (resend states, channel switching)</li>
        <li><strong>{screenAnnotations.length} annotations</strong> on existing screens for context-specific adjustments</li>
      </ul>
    </div>
  </div>
);

Object.assign(window, { SecurityDashboardSection, GapInventorySection });
