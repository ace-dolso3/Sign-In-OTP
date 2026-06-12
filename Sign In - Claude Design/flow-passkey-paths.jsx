// ARCHIVE — original ideation; not the source of truth.
// See sign-in.html (live prototype) for current behavior.
//
// flow-passkey-paths.jsx — Passkey Sign-In, Creation, and Management paths

/* ================================================================
   PASSKEY SIGN-IN — HAPPY PATH + FALLBACKS
   ================================================================ */
const PasskeySignInSection = () => (
  <PathSection title="Passkey Sign-In" subtitle="Biometric authentication paths — happy path, fallbacks, and cross-device flow" color="#1b5e20">
    {/* Happy path */}
    <FlowTrack label="Happy Path — Passkey Detected on This Device">
      <FlowNode type="existing" id="6" title="Passkey Detected" desc="Auto-prompt: 'Signing you in…' with spinner and Face ID icon" />
      <FlowArrow />
      <FlowNode type="os" title="OS Biometric Prompt" desc="System Face ID / Touch ID sheet — not product UI" />
      <FlowArrow label="success" />
      <FlowNode type="existing" id="7" title="Success Landing" desc="Signed in + Face ID toast" annotation="Toast reads 'Signed in with Face ID'" />
    </FlowTrack>

    {/* Biometric failed */}
    <BranchFrom from="OS Biometric Prompt" condition="Face ID fails or user cancels" />
    <FlowTrack indent>
      <FlowNode type="existing" id="9" title="Biometric Failed" desc="'Couldn't verify — let's try another way.' Three options below." />
      <FlowArrow label="try again" />
      <FlowNode type="os" title="OS Biometric Prompt" desc="Re-triggers Face ID" />
    </FlowTrack>
    <BranchFrom from="Biometric Failed" condition="chooses password" />
    <FlowTrack indent>
      <FlowNode type="converge" title="→ Sign-In (Password)" desc="Returns to sign-in with password tab selected" />
    </FlowTrack>
    <BranchFrom from="Biometric Failed" condition="chooses OTP" />
    <FlowTrack indent>
      <FlowNode type="converge" title="→ Sign-In (OTP)" desc="Returns to sign-in with OTP tab selected" />
    </FlowTrack>

    {/* Passkey not found */}
    <div style={{borderTop:'1px dashed #ccc',margin:'14px 0'}}></div>
    <FlowTrack label="Alternate Path — No Passkey on This Device">
      <FlowNode type="existing" id="1B" title="Sign-In Screen" desc="User taps Face ID button" />
      <FlowArrow />
      <FlowNode type="converge" title="Passkey Lookup" desc="System checks for enrolled passkey" />
      <FlowArrow label="not found" />
      <FlowNode type="existing" id="8" title="Passkey Not Found" desc="'No passkey on this device.' Two options: other method or cross-device." />
    </FlowTrack>

    <BranchFrom from="Passkey Not Found" condition="'Use another sign-in method'" />
    <FlowTrack indent>
      <FlowNode type="converge" title="→ Sign-In Screen" desc="Returns to password/OTP tabs" />
    </FlowTrack>

    <BranchFrom from="Passkey Not Found" condition="'Sign in from another device'" />
    <FlowTrack indent>
      <FlowNode type="existing" id="10" title="Cross-Device QR" desc="Instructions + QR code placeholder. Status: 'Waiting for your phone…'" />
      <FlowArrow />
      <FlowNode type="os" title="OS QR Code" desc="System-generated QR code displayed within Screen 10's placeholder area" />
      <FlowArrow label="phone confirms" />
      <FlowNode type="existing" id="7" title="Success Landing" desc="Signed in from phone's passkey" annotation="Success toast: 'Signed in with passkey from your phone'" />
    </FlowTrack>

    <BranchFrom from="Cross-Device QR" condition="QR scan fails or times out" />
    <FlowTrack indent>
      <FlowNode type="gap" title="QR Failed / Timed Out" desc="'Couldn't connect. The code may have expired.' CTAs: generate new code, use different method." wide />
      <FlowArrow label="new code" dashed />
      <FlowNode type="converge" title="↩ Cross-Device QR" desc="Fresh QR generated" />
    </FlowTrack>

    {/* All paths exhausted → recovery */}
    <div style={{borderTop:'1px dashed #ccc',margin:'14px 0'}}></div>
    <FlowTrack label="Dead End — All Passkey Paths Failed">
      <FlowNode type="converge" title="All Methods Failed" desc="No passkey, QR failed, can't use password or OTP" />
      <FlowArrow />
      <FlowNode type="existing" id="16" title="Recovery Entry" desc="'Having trouble getting in?' Shield icon, empathetic copy, verify CTA" />
      <FlowArrow />
      <FlowNode type="existing" id="17" title="Identity Verification" desc="Email OTP: send code → 6-digit entry → verify" annotation="Reuses existing OTP components from sign-in OTP path" />
      <FlowArrow label="verified" />
      <FlowNode type="existing" id="7" title="Success Landing" desc="Account recovered, signed in" annotation="Toast: 'Identity verified — you're signed in'" />
    </FlowTrack>

    <BranchFrom from="Success (Recovery)" condition="prompt to re-enroll passkey" />
    <FlowTrack indent>
      <FlowNode type="gap" title="Re-Enroll Prompt" desc="Variant of opt-in: 'Set up Face ID on this new device?' Same layout as Screen 2A but with recovery context copy." wide />
      <FlowArrow label="set up" dashed />
      <FlowNode type="converge" title="→ Passkey Creation" desc="Enters enrollment flow" />
    </FlowTrack>
  </PathSection>
);

/* ================================================================
   PASSKEY CREATION FLOW
   ================================================================ */
const PasskeyCreationSection = () => (
  <PathSection title="Passkey Creation" subtitle="Enrollment flow — triggered post-login or from account settings" color="#4a148c">
    {/* Post-login trigger */}
    <FlowTrack label="Post-Login Enrollment (after password/OTP sign-in)">
      <FlowNode type="existing" id="7" title="Success Landing" desc="User just signed in" />
      <FlowArrow label="no passkey" />
      <FlowNode type="existing" id="2A" title="Opt-In Prompt" desc="Bottom sheet: 'Sign in faster' with Face ID setup CTA" annotation="Two variants wireframed: 2A (bottom sheet) and 2B (full page)" />
      <FlowArrow label="set up" />
      <FlowNode type="existing" id="3" title="Enrollment Context" desc="Brief instruction + OS prompt placeholder" />
      <FlowArrow />
      <FlowNode type="os" title="OS Biometric Enrollment" desc="System-level Face ID / Touch ID registration" />
    </FlowTrack>

    <BranchFrom from="OS Enrollment" condition="success" />
    <FlowTrack indent>
      <FlowNode type="existing" id="4" title="Setup Success" desc="'You're all set!' Confirmation + continue CTA" />
      <FlowArrow />
      <FlowNode type="converge" title="→ Continue to App" desc="Returns to main content" />
    </FlowTrack>

    <BranchFrom from="OS Enrollment" condition="failed or cancelled" />
    <FlowTrack indent>
      <FlowNode type="existing" id="5" title="Setup Error" desc="'Setup wasn't completed.' Try again + skip options" />
      <FlowArrow label="try again" dashed />
      <FlowNode type="converge" title="↩ Enrollment Context" desc="Re-triggers OS prompt" />
    </FlowTrack>
    <BranchFrom from="Setup Error" condition="skip" />
    <FlowTrack indent>
      <FlowNode type="converge" title="→ Continue to App" desc="Skips enrollment" />
    </FlowTrack>

    <BranchFrom from="Opt-In Prompt" condition="'Not now' / dismissed" />
    <FlowTrack indent>
      <FlowNode type="converge" title="→ Continue to App" desc="Prompt dismissed. May re-surface on next sign-in." />
    </FlowTrack>

    {/* Settings trigger */}
    <div style={{borderTop:'1px dashed #ccc',margin:'14px 0'}}></div>
    <FlowTrack label="From Account Settings">
      <FlowNode type="existing" id="11" title="Passkeys List" desc="Existing passkeys + 'Add' CTA" />
      <FlowArrow label="add new" />
      <FlowNode type="existing" id="15" title="Add Passkey" desc="Face ID icon + explanation + setup CTA" />
      <FlowArrow />
      <FlowNode type="existing" id="3" title="Enrollment Context" desc="OS prompt placeholder" />
      <FlowArrow />
      <FlowNode type="os" title="OS Enrollment" desc="Biometric registration" />
      <FlowArrow label="success" />
      <FlowNode type="existing" id="4" title="Setup Success" desc="Confirmation" />
      <FlowArrow />
      <FlowNode type="converge" title="→ Passkeys List" desc="Returns to list, new passkey visible" />
    </FlowTrack>
  </PathSection>
);

/* ================================================================
   PASSKEY MANAGEMENT
   ================================================================ */
const PasskeyManagementSection = () => (
  <PathSection title="Passkey Management" subtitle="Account Settings — list, rename, remove enrolled passkeys" color="#311b92">
    <FlowTrack label="Passkeys List (Populated)">
      <FlowNode type="existing" id="11" title="Passkeys List" desc="Device rows with name, date added, last used. Actions: rename, remove." />
    </FlowTrack>

    {/* Rename */}
    <BranchFrom from="Passkeys List" condition="taps 'Rename'" />
    <FlowTrack indent>
      <FlowNode type="existing" id="12" title="Rename Modal" desc="Pre-filled name input, save + cancel" />
      <FlowArrow label="save" />
      <FlowNode type="converge" title="→ Passkeys List" desc="Updated name shown" />
    </FlowTrack>

    {/* Remove — standard */}
    <BranchFrom from="Passkeys List" condition="taps 'Remove' (has other passkeys)" />
    <FlowTrack indent>
      <FlowNode type="existing" id="13" title="Remove Warning" desc="'Remove [device]? You won't be able to use Face ID on this device.'" />
      <FlowArrow label="confirm" />
      <FlowNode type="converge" title="→ Passkeys List" desc="Device removed from list" />
    </FlowTrack>

    {/* Remove — last passkey */}
    <BranchFrom from="Passkeys List" condition="taps 'Remove' (last/only passkey)" />
    <FlowTrack indent>
      <FlowNode type="existing" id="14" title="Last Passkey Warning" desc="Elevated warning: 'This is your only passkey.' Suggests adding another first." wide />
      <FlowArrow label="remove anyway" />
      <FlowNode type="converge" title="→ Passkeys List" desc="Now empty — shows empty state" />
    </FlowTrack>

    {/* Empty state */}
    <div style={{borderTop:'1px dashed #ccc',margin:'14px 0'}}></div>
    <FlowTrack label="Passkeys List (Empty State)">
      <FlowNode type="existing" id="11e" title="Empty State" desc="'No passkeys yet.' CTA to add first passkey." />
      <FlowArrow label="add" />
      <FlowNode type="converge" title="→ Passkey Creation" desc="Enters enrollment flow from settings" />
    </FlowTrack>
  </PathSection>
);

Object.assign(window, { PasskeySignInSection, PasskeyCreationSection, PasskeyManagementSection });
