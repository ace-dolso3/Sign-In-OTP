// flow-auth-paths.jsx — Entry Point, Password Path, OTP Path

/* ================================================================
   ENTRY POINT
   ================================================================ */
const EntrySection = () => (
  <PathSection title="Entry Point" subtitle="User arrives at the sign-in screen — three authentication methods branch from here" color="#2d2d2d">
    <FlowTrack>
      <FlowNode type="existing" id="1B" title="Sign-In Screen" desc="Updated with passkey hero CTA, password & OTP tabs below" annotation="Recommended: variant 1B (passkey as hero). See wireframes for 3 options." wide />
      <FlowArrow label="selects method" />
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        <div style={{display:'flex',alignItems:'center',gap:4}}>
          <FlowArrow label="Password tab" />
          <FlowNode type="converge" title="→ Password Path" desc="Email + password sign-in" />
        </div>
        <div style={{display:'flex',alignItems:'center',gap:4}}>
          <FlowArrow label="OTP tab" />
          <FlowNode type="converge" title="→ OTP Path" desc="One-time code via email or phone" />
        </div>
        <div style={{display:'flex',alignItems:'center',gap:4}}>
          <FlowArrow label="Face ID button" />
          <FlowNode type="converge" title="→ Passkey Path" desc="Biometric sign-in" />
        </div>
      </div>
    </FlowTrack>
  </PathSection>
);

/* ================================================================
   PASSWORD PATH
   ================================================================ */
const PasswordSection = () => (
  <PathSection title="Password Path" subtitle="Traditional email + password authentication" color="#455a64">
    {/* Happy path */}
    <FlowTrack label="Happy Path">
      <FlowNode type="existing" id="1B" title="Sign-In (Password Tab)" desc="Email + password fields, 'Keep me signed in' checkbox" />
      <FlowArrow label="submit" />
      <FlowNode type="converge" title="Server Validates" desc="Credentials checked against account" />
      <FlowArrow label="success" />
      <FlowNode type="existing" id="7" title="Success Landing" desc="Welcome back + success toast" annotation="Toast reads 'Signed in with password' instead of Face ID" />
    </FlowTrack>

    {/* Wrong password */}
    <BranchFrom from="Server Validates" condition="wrong password" />
    <FlowTrack indent>
      <FlowNode type="gap" title="Wrong Password" desc="Inline error on password field: 'Incorrect password. Try again.' Attempt counter visible." />
      <FlowArrow label="retry" dashed />
      <FlowNode type="converge" title="↩ Sign-In Screen" desc="User retries with correct password" />
    </FlowTrack>

    {/* Account locked */}
    <BranchFrom from="Wrong Password" condition="max failed attempts" />
    <FlowTrack indent>
      <FlowNode type="gap" title="Account Locked" desc="'Too many attempts. Try again in 15 minutes or reset your password.' Timer + reset CTA." wide />
      <FlowArrow label="reset" dashed />
      <FlowNode type="converge" title="→ Forgot Password" desc="Enters reset flow below" />
    </FlowTrack>

    {/* Forgot password */}
    <BranchFrom from="Sign-In Screen" condition="taps 'Forgot Password?'" />
    <FlowTrack indent>
      <FlowNode type="gap" title="Forgot Password" desc="Enter email to receive a password reset link" />
      <FlowArrow label="submit" />
      <FlowNode type="gap" title="Reset Email Sent" desc="'Check your inbox for a reset link.' Resend option + back to sign-in." />
      <FlowArrow label="clicks link" />
      <FlowNode type="gap" title="New Password Form" desc="New password + confirm password fields with strength indicator" />
      <FlowArrow label="submit" />
      <FlowNode type="gap" title="Password Reset Success" desc="'Password updated.' CTA to sign in with new password." />
    </FlowTrack>

    {/* Post-login passkey upsell */}
    <BranchFrom from="Success Landing" condition="no passkey enrolled on device" />
    <FlowTrack indent>
      <FlowNode type="existing" id="2A" title="Passkey Opt-In" desc="Bottom sheet: 'Sign in faster next time' with Face ID setup CTA" annotation="Only shown if user doesn't have a passkey on this device yet" />
      <FlowArrow label="set up" dashed />
      <FlowNode type="converge" title="→ Passkey Creation" desc="Enters enrollment flow" />
    </FlowTrack>
  </PathSection>
);

/* ================================================================
   OTP PATH
   ================================================================ */
const OTPSection = () => (
  <PathSection title="OTP Path" subtitle="One-time code authentication via email or phone" color="#37474f">
    {/* Happy path */}
    <FlowTrack label="Happy Path">
      <FlowNode type="existing" id="1B" title="Sign-In (OTP Tab)" desc="User selects One-Time Code tab" annotation="Existing OTP tab from sign-in screen" />
      <FlowArrow />
      <FlowNode type="gap" title="Channel Selection" desc="Choose where to receive code: email (d***@email.com) or phone (***-1234). Pre-selects last used." wide />
      <FlowArrow label="send code" />
      <FlowNode type="gap" title="OTP Code Entry" desc="6-digit input, masked email/phone shown, 'Resend code' link, countdown timer" annotation="Similar to Screen 17 but for sign-in context, not recovery. Reuse OTP input component." wide />
      <FlowArrow label="correct code" />
      <FlowNode type="existing" id="7" title="Success Landing" desc="Signed in + success toast" annotation="Toast reads 'Signed in with one-time code'" />
    </FlowTrack>

    {/* Wrong code */}
    <BranchFrom from="OTP Code Entry" condition="wrong code entered" />
    <FlowTrack indent>
      <FlowNode type="gap" title="Wrong Code Error" desc="Inline error: 'That code isn't right. Check and try again.' Input clears, focus returns. Remaining attempts shown." wide />
      <FlowArrow label="retry" dashed />
      <FlowNode type="converge" title="↩ Code Entry" desc="User re-enters code" />
    </FlowTrack>

    {/* Code expired */}
    <BranchFrom from="OTP Code Entry" condition="code expires (5 min)" />
    <FlowTrack indent>
      <FlowNode type="gap" title="Code Expired" desc="'This code has expired.' CTA to send a new code. Clear state, back to fresh entry." />
      <FlowArrow label="resend" dashed />
      <FlowNode type="converge" title="↩ New Code Sent" desc="Fresh code, timer restarts" />
    </FlowTrack>

    {/* Resend flow */}
    <BranchFrom from="OTP Code Entry" condition="taps 'Resend code'" />
    <FlowTrack indent>
      <FlowNode type="gap" title="Resend Success" desc="Inline confirmation: 'New code sent!' Countdown timer resets (30s cooldown before next resend)." wide />
    </FlowTrack>

    {/* Cooldown */}
    <BranchFrom from="Resend Success" condition="taps resend again too soon" />
    <FlowTrack indent>
      <FlowNode type="gap" title="Cooldown State" desc="Resend link disabled with countdown: 'Resend in 0:27'. Prevents spam." />
    </FlowTrack>

    {/* Max resends */}
    <BranchFrom from="Cooldown State" condition="max resends reached (3)" />
    <FlowTrack indent>
      <FlowNode type="gap" title="Max Resends Lockout" desc="'You've requested too many codes. Try again in 15 minutes or use a different sign-in method.' Links to password and help." wide />
      <FlowArrow dashed />
      <FlowNode type="converge" title="→ Sign-In Screen" desc="Fallback to password" />
    </FlowTrack>

    {/* Wrong channel */}
    <BranchFrom from="Channel Selection" condition="user selects wrong channel" />
    <FlowTrack indent>
      <FlowNode type="gap" title="Switch Channel" desc="From code entry: 'Send to a different email/phone instead?' Link returns to channel selection without losing context." wide />
      <FlowArrow dashed />
      <FlowNode type="converge" title="↩ Channel Selection" desc="Pick different channel" />
    </FlowTrack>

    {/* No access to channel */}
    <BranchFrom from="Channel Selection" condition="can't access email or phone on file" />
    <FlowTrack indent>
      <FlowNode type="gap" title="No Channel Access" desc="'Can't access these? Sign in with your password or contact support for help.' Links to password sign-in and support." wide />
      <FlowArrow dashed />
      <FlowNode type="converge" title="→ Password or Support" desc="Fallback paths" />
    </FlowTrack>

    {/* Post-login passkey upsell */}
    <BranchFrom from="Success Landing" condition="no passkey enrolled" />
    <FlowTrack indent>
      <FlowNode type="existing" id="2A" title="Passkey Opt-In" desc="Bottom sheet: 'Sign in faster next time'" />
      <FlowArrow label="set up" dashed />
      <FlowNode type="converge" title="→ Passkey Creation" desc="Enters enrollment flow" />
    </FlowTrack>
  </PathSection>
);

Object.assign(window, { EntrySection, PasswordSection, OTPSection });
