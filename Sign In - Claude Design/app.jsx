// app.jsx — All screens organized by user flow

const App = () => (
  <DesignCanvas>
    {/* ============================================================
        SIGN-IN ENTRY POINT — 3 layout options
        ============================================================ */}
    <DCSection id="entry" title="Sign-In Screen — Layout Options" subtitle="Three approaches for where the passkey option lives. Recommended: Option B (passkey as hero).">
      <DCArtboard id="1a" label="Option A · Three-Tab Control" width={375} height={720}>
        <Screen1A/>
      </DCArtboard>
      <DCArtboard id="1b" label="Option B · Passkey as Hero ★" width={375} height={810}>
        <Screen1B/>
      </DCArtboard>
      <DCArtboard id="1c" label="Option C · Passkey Below Form" width={375} height={790}>
        <Screen1C/>
      </DCArtboard>
    </DCSection>

    {/* ============================================================
        PASSWORD FLOW
        ============================================================ */}
    <DCSection id="pwd-flow" title="Password Flow" subtitle="Happy path → success, plus wrong password, account lock, and full forgot/reset password chain">
      <DCArtboard id="pwd-error" label="Wrong Password" width={375} height={850}>
        <Screen1B_PwdErr/>
      </DCArtboard>
      <DCArtboard id="pwd-locked" label="Account Locked" width={375} height={520}>
        <ScreenPwdLocked/>
      </DCArtboard>
      <DCArtboard id="pwd-forgot" label="Forgot Password" width={375} height={420}>
        <ScreenForgotPwd/>
      </DCArtboard>
      <DCArtboard id="pwd-sent" label="Reset Email Sent" width={375} height={500}>
        <ScreenResetSent/>
      </DCArtboard>
      <DCArtboard id="pwd-new" label="New Password Form" width={375} height={470}>
        <ScreenNewPwd/>
      </DCArtboard>
      <DCArtboard id="pwd-success" label="Password Reset Success" width={375} height={430}>
        <ScreenResetSuccess/>
      </DCArtboard>
      <DCArtboard id="pwd-landing" label="Success Landing (Password)" width={375} height={560}>
        <Screen7Pwd/>
      </DCArtboard>
    </DCSection>

    {/* ============================================================
        OTP FLOW
        ============================================================ */}
    <DCSection id="otp-flow" title="OTP Flow" subtitle="One-time code path: sign-in tab, channel selection, code entry, and all edge case states">
      <DCArtboard id="otp-tab" label="Sign-In · OTP Tab" width={375} height={760}>
        <Screen1B_OTP/>
      </DCArtboard>
      <DCArtboard id="otp-channel" label="Channel Selection" width={375} height={560}>
        <ScreenOTPChannel/>
      </DCArtboard>
      <DCArtboard id="otp-entry" label="Code Entry" width={375} height={460}>
        <ScreenOTPEntry/>
      </DCArtboard>
      <DCArtboard id="otp-wrong" label="Wrong Code" width={375} height={500}>
        <ScreenOTPWrong/>
      </DCArtboard>
      <DCArtboard id="otp-expired" label="Code Expired" width={375} height={520}>
        <ScreenOTPExpired/>
      </DCArtboard>
      <DCArtboard id="otp-lockout" label="Max Resends Lockout" width={375} height={520}>
        <ScreenOTPLockout/>
      </DCArtboard>
      <DCArtboard id="otp-noaccess" label="No Channel Access" width={375} height={530}>
        <ScreenOTPNoAccess/>
      </DCArtboard>
      <DCArtboard id="otp-landing" label="Success Landing (OTP)" width={375} height={560}>
        <Screen7OTP/>
      </DCArtboard>
    </DCSection>

    {/* ============================================================
        PASSKEY SIGN-IN FLOW
        ============================================================ */}
    <DCSection id="pk-signin" title="Passkey Sign-In Flow" subtitle="Happy path through biometric auth, plus fallbacks: bio failed, not found, cross-device QR">
      <DCArtboard id="pk-detected" label="Passkey Detected" width={375} height={490}>
        <Screen6/>
      </DCArtboard>
      <DCArtboard id="os-bio-auth" label="⬡ OS Biometric Prompt" width={375} height={470}>
        <ScreenOSBioAuth/>
      </DCArtboard>
      <DCArtboard id="pk-success" label="Success Landing (Face ID)" width={375} height={560}>
        <Screen7/>
      </DCArtboard>
      <DCArtboard id="pk-biofail" label="Biometric Failed" width={375} height={530}>
        <Screen9/>
      </DCArtboard>
      <DCArtboard id="pk-notfound" label="Passkey Not Found" width={375} height={520}>
        <Screen8/>
      </DCArtboard>
      <DCArtboard id="pk-qr" label="Cross-Device QR" width={375} height={660}>
        <Screen10/>
      </DCArtboard>
      <DCArtboard id="os-qr" label="⬡ OS QR Code" width={375} height={470}>
        <ScreenOSQR/>
      </DCArtboard>
      <DCArtboard id="pk-qrfail" label="QR Failed / Timed Out" width={375} height={460}>
        <ScreenQRFailed/>
      </DCArtboard>
    </DCSection>

    {/* ============================================================
        ACCOUNT RECOVERY
        ============================================================ */}
    <DCSection id="recovery" title="Account Recovery" subtitle="When all sign-in methods fail — identity verification via OTP, then optional passkey re-enrollment">
      <DCArtboard id="rec-entry" label="Recovery Entry Point" width={375} height={520}>
        <Screen16/>
      </DCArtboard>
      <DCArtboard id="rec-verify" label="Identity Verification" width={375} height={620}>
        <Screen17/>
      </DCArtboard>
      <DCArtboard id="rec-landing" label="Success Landing (Recovery)" width={375} height={560}>
        <Screen7Recovery/>
      </DCArtboard>
      <DCArtboard id="rec-reenroll" label="Re-Enroll Passkey Prompt" width={375} height={500}>
        <ScreenReEnroll/>
      </DCArtboard>
    </DCSection>

    {/* ============================================================
        PASSKEY CREATION / ENROLLMENT
        ============================================================ */}
    <DCSection id="pk-create" title="Passkey Creation Flow" subtitle="Opt-in prompt (2 variants), OS enrollment, success and error states">
      <DCArtboard id="pk-optin-sheet" label="Opt-In · Bottom Sheet" width={375} height={680}>
        <Screen2A/>
      </DCArtboard>
      <DCArtboard id="pk-optin-full" label="Opt-In · Full Page" width={375} height={580}>
        <Screen2B/>
      </DCArtboard>
      <DCArtboard id="pk-enroll-ctx" label="Enrollment Context" width={375} height={540}>
        <Screen3/>
      </DCArtboard>
      <DCArtboard id="os-bio-enroll" label="⬡ OS Biometric Enrollment" width={375} height={470}>
        <ScreenOSBioEnroll/>
      </DCArtboard>
      <DCArtboard id="pk-setup-ok" label="Setup Success" width={375} height={480}>
        <Screen4/>
      </DCArtboard>
      <DCArtboard id="pk-setup-err" label="Setup Error / Cancelled" width={375} height={520}>
        <Screen5/>
      </DCArtboard>
    </DCSection>

    {/* ============================================================
        PASSKEY MANAGEMENT (Account Settings)
        ============================================================ */}
    <DCSection id="pk-manage" title="Passkey Management" subtitle="Account Settings — list, rename, remove (standard + last-passkey warning), empty state, add from settings">
      <DCArtboard id="pk-list" label="Passkeys List" width={375} height={560}>
        <Screen11/>
      </DCArtboard>
      <DCArtboard id="pk-empty" label="Passkeys List (Empty)" width={375} height={480}>
        <Screen11Empty/>
      </DCArtboard>
      <DCArtboard id="pk-rename" label="Rename Passkey" width={375} height={380}>
        <Screen12/>
      </DCArtboard>
      <DCArtboard id="pk-remove" label="Remove Warning" width={375} height={400}>
        <Screen13/>
      </DCArtboard>
      <DCArtboard id="pk-lastremove" label="Last Passkey Warning" width={375} height={440}>
        <Screen14/>
      </DCArtboard>
      <DCArtboard id="pk-add-settings" label="Add Passkey (Settings)" width={375} height={500}>
        <Screen15/>
      </DCArtboard>
    </DCSection>

    {/* ============================================================
        ACCOUNT SECURITY DASHBOARD
        ============================================================ */}
    <DCSection id="security" title="Account Security Dashboard" subtitle="Security overview, sign-in activity log, active devices, and remote sign-out">
      <DCArtboard id="sec-dash" label="Security Overview" width={375} height={580}>
        <ScreenSecurityDash/>
      </DCArtboard>
      <DCArtboard id="sec-activity" label="Sign-In Activity Log" width={375} height={580}>
        <ScreenActivityLog/>
      </DCArtboard>
      <DCArtboard id="sec-devices" label="Active Devices" width={375} height={560}>
        <ScreenActiveDevices/>
      </DCArtboard>
      <DCArtboard id="sec-signout" label="Remote Sign-Out" width={375} height={400}>
        <ScreenRemoteSignOut/>
      </DCArtboard>
    </DCSection>
  </DesignCanvas>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
