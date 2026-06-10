// app.jsx — All screens organized by user flow

const App = () => (
  <DesignCanvas>
    {/* ============================================================
        SIGN-IN ENTRY POINT — 3 layout options
        ============================================================ */}
    <DCSection id="entry" title="Sign-In Screen — Layout Options" subtitle="Three approaches for where the passkey option lives. Recommended: Option B (passkey as hero).">
      <DCArtboard id="1a" label="Option A · Three-Tab Control" width={375} height={720}
        description="The initial sign-in screen offering passkey, password, and OTP as equal peers in a tab control. Users arrive here from any 'Sign In' entry point across Ace Hardware.">
        <Screen1A/>
      </DCArtboard>
      <DCArtboard id="1b" label="Option B · Passkey as Hero ★" width={375} height={810}
        description="The initial sign-in screen that elevates passkey as the recommended option above traditional methods. Users arrive here from any 'Sign In' trigger across Ace Hardware.">
        <Screen1B/>
      </DCArtboard>
      <DCArtboard id="1c" label="Option C · Passkey Below Form" width={375} height={790}
        description="The initial sign-in screen with the traditional email/password form prominent and passkey offered below as a secondary nudge. Users arrive here from 'Sign In' and may be drawn toward passkey after seeing it.">
        <Screen1C/>
      </DCArtboard>
    </DCSection>

    {/* ============================================================
        PASSWORD FLOW
        ============================================================ */}
    <DCSection id="pwd-flow" title="Password Flow" subtitle="Happy path → success, plus wrong password, account lock, and full forgot/reset password chain">
      <DCArtboard id="pwd-error" label="Wrong Password" width={375} height={850}
        description="Shown after the user submits an incorrect password on the sign-in screen. Inline error prompts another try or navigation to forgot password.">
        <Screen1B_PwdErr/>
      </DCArtboard>
      <DCArtboard id="pwd-locked" label="Account Locked" width={375} height={520}
        description="Shown after too many failed password attempts trigger a temporary account lock. User must wait or reset their password to regain access.">
        <ScreenPwdLocked/>
      </DCArtboard>
      <DCArtboard id="pwd-forgot" label="Forgot Password" width={375} height={420}
        description="Reached by tapping 'Forgot password?' from the sign-in or wrong-password screen. User enters their email to receive a reset link.">
        <ScreenForgotPwd/>
      </DCArtboard>
      <DCArtboard id="pwd-sent" label="Reset Email Sent" width={375} height={500}
        description="Confirmation shown after the user submits their email for a password reset. Instructs them to check their inbox and provides a resend option.">
        <ScreenResetSent/>
      </DCArtboard>
      <DCArtboard id="pwd-new" label="New Password Form" width={375} height={470}
        description="Reached via the reset link in the user's email. User creates and confirms a new password to replace the forgotten one.">
        <ScreenNewPwd/>
      </DCArtboard>
      <DCArtboard id="pwd-success" label="Password Reset Success" width={375} height={430}
        description="Confirmation that the password was successfully updated. User is prompted to continue to sign in.">
        <ScreenResetSuccess/>
      </DCArtboard>
      <DCArtboard id="pwd-landing" label="Success Landing (Password)" width={375} height={560}
        description="The authenticated landing screen reached after signing in with a password. May prompt passkey setup to simplify future logins.">
        <Screen7Pwd/>
      </DCArtboard>
    </DCSection>

    {/* ============================================================
        OTP FLOW
        ============================================================ */}
    <DCSection id="otp-flow" title="OTP Flow" subtitle="One-time code path: sign-in tab, channel selection, code entry, and all edge case states">
      <DCArtboard id="otp-tab" label="Sign-In · OTP Tab" width={375} height={760}
        description="The sign-in screen with the OTP tab active for users who prefer a one-time code. Reached by selecting the 'Code' option on the entry screen.">
        <Screen1B_OTP/>
      </DCArtboard>
      <DCArtboard id="otp-channel" label="Channel Selection" width={375} height={560}
        description="Asks which contact method (email or phone) should receive the one-time code. Reached after tapping 'Send me a code' on the OTP tab.">
        <ScreenOTPChannel/>
      </DCArtboard>
      <DCArtboard id="otp-entry" label="Code Entry" width={375} height={460}
        description="Where the user types the 6-digit code sent to their chosen channel. Reached automatically after the channel is confirmed.">
        <ScreenOTPEntry/>
      </DCArtboard>
      <DCArtboard id="otp-wrong" label="Wrong Code" width={375} height={500}
        description="Shown when the user enters an incorrect code. Offers a retry and resend option along with the remaining attempt count.">
        <ScreenOTPWrong/>
      </DCArtboard>
      <DCArtboard id="otp-expired" label="Code Expired" width={375} height={520}
        description="Displayed when the code's time window has passed before entry. Offers a 'Resend code' action to request a fresh one.">
        <ScreenOTPExpired/>
      </DCArtboard>
      <DCArtboard id="otp-lockout" label="Max Resends Lockout" width={375} height={520}
        description="Triggered after too many code requests in a single session. Temporarily blocks further resends with a countdown.">
        <ScreenOTPLockout/>
      </DCArtboard>
      <DCArtboard id="otp-noaccess" label="No Channel Access" width={375} height={530}
        description="Shown when the user indicates they can't access any registered channel. Routes them toward account recovery as an alternative.">
        <ScreenOTPNoAccess/>
      </DCArtboard>
      <DCArtboard id="otp-landing" label="Success Landing (OTP)" width={375} height={560}
        description="The authenticated landing screen after a successful OTP verification. May prompt passkey setup to simplify future logins.">
        <Screen7OTP/>
      </DCArtboard>
    </DCSection>

    {/* ============================================================
        PASSKEY SIGN-IN FLOW
        ============================================================ */}
    <DCSection id="pk-signin" title="Passkey Sign-In Flow" subtitle="Happy path through biometric auth, plus fallbacks: bio failed, not found, cross-device QR">
      <DCArtboard id="pk-detected" label="Passkey Detected" width={375} height={490}
        description="Shown when a passkey for the account is found on this device. Prompts the user to authenticate via biometrics.">
        <Screen6/>
      </DCArtboard>
      <DCArtboard id="os-bio-auth" label="⬡ OS Biometric Prompt" width={375} height={470}
        description="The native OS biometric dialog (Face ID / Touch ID) that takes over to verify identity. This is OS-controlled UI, not custom Ace Hardware design.">
        <ScreenOSBioAuth/>
      </DCArtboard>
      <DCArtboard id="pk-success" label="Success Landing (Face ID)" width={375} height={560}
        description="The authenticated landing screen after a successful passkey biometric. No further action required — user is fully signed in.">
        <Screen7/>
      </DCArtboard>
      <DCArtboard id="pk-biofail" label="Biometric Failed" width={375} height={530}
        description="Shown when the biometric scan fails or is canceled. Offers a retry or fallback to another sign-in method.">
        <Screen9/>
      </DCArtboard>
      <DCArtboard id="pk-notfound" label="Passkey Not Found" width={375} height={520}
        description="Displayed when no passkey is found for the account on this device. Routes the user to sign in with password or OTP instead.">
        <Screen8/>
      </DCArtboard>
      <DCArtboard id="pk-qr" label="Cross-Device QR" width={375} height={660}
        description="Shown when the user wants to authenticate using a passkey on a different device. Displays a QR code for the nearby device to scan.">
        <Screen10/>
      </DCArtboard>
      <DCArtboard id="os-qr" label="⬡ OS QR Code" width={375} height={470}
        description="The native OS dialog managing cross-device passkey sign-in. The user scans this with their other device's camera to complete authentication.">
        <ScreenOSQR/>
      </DCArtboard>
      <DCArtboard id="pk-qrfail" label="QR Failed / Timed Out" width={375} height={460}
        description="Displayed when the cross-device QR session expires or fails before completion. Offers a retry or fallback to password/OTP.">
        <ScreenQRFailed/>
      </DCArtboard>
    </DCSection>

    {/* ============================================================
        ACCOUNT RECOVERY
        ============================================================ */}
    <DCSection id="recovery" title="Account Recovery" subtitle="When all sign-in methods fail — identity verification via OTP, then optional passkey re-enrollment">
      <DCArtboard id="rec-entry" label="Recovery Entry Point" width={375} height={520}
        description="Reached when the user has lost access to all standard sign-in methods. Initiates identity verification through available fallback channels.">
        <Screen16/>
      </DCArtboard>
      <DCArtboard id="rec-verify" label="Identity Verification" width={375} height={620}
        description="The step where the user proves their identity via a trusted OTP channel during recovery. Once verified, they regain account access.">
        <Screen17/>
      </DCArtboard>
      <DCArtboard id="rec-landing" label="Success Landing (Recovery)" width={375} height={560}
        description="Confirmation that account recovery is complete and the user is signed in. Immediately prompts passkey re-enrollment to prevent future lockouts.">
        <Screen7Recovery/>
      </DCArtboard>
      <DCArtboard id="rec-reenroll" label="Re-Enroll Passkey Prompt" width={375} height={500}
        description="Shown after recovery to encourage re-enrolling a passkey. Helps restore strong authentication to avoid another recovery scenario.">
        <ScreenReEnroll/>
      </DCArtboard>
    </DCSection>

    {/* ============================================================
        PASSKEY CREATION / ENROLLMENT
        ============================================================ */}
    <DCSection id="pk-create" title="Passkey Creation Flow" subtitle="Opt-in prompt (2 variants), OS enrollment, success and error states">
      <DCArtboard id="pk-optin-sheet" label="Opt-In · Bottom Sheet" width={375} height={680}
        description="A bottom sheet shown after a successful login when no passkey exists. Invites the user to create one for faster future sign-ins.">
        <Screen2A/>
      </DCArtboard>
      <DCArtboard id="pk-optin-full" label="Opt-In · Full Page" width={375} height={580}
        description="A full-page variant of the passkey opt-in prompt for contexts where a bottom sheet would be disruptive. Same goal — enroll a passkey post-authentication.">
        <Screen2B/>
      </DCArtboard>
      <DCArtboard id="pk-enroll-ctx" label="Enrollment Context" width={375} height={540}
        description="An education screen shown just before the OS biometric prompt. Explains what a passkey is and what the user is about to do, reducing drop-off.">
        <Screen3/>
      </DCArtboard>
      <DCArtboard id="os-bio-enroll" label="⬡ OS Biometric Enrollment" width={375} height={470}
        description="The native OS dialog that registers the user's biometric to create the passkey. OS-controlled; not custom Ace Hardware UI.">
        <ScreenOSBioEnroll/>
      </DCArtboard>
      <DCArtboard id="pk-setup-ok" label="Setup Success" width={375} height={480}
        description="Confirmation that the passkey was successfully created and saved to the device. User can now sign in biometrically in future sessions.">
        <Screen4/>
      </DCArtboard>
      <DCArtboard id="pk-setup-err" label="Setup Error / Cancelled" width={375} height={520}
        description="Shown when passkey creation fails or the user cancels the OS biometric step. Offers a retry or an option to skip enrollment.">
        <Screen5/>
      </DCArtboard>
    </DCSection>

    {/* ============================================================
        PASSKEY MANAGEMENT (Account Settings)
        ============================================================ */}
    <DCSection id="pk-manage" title="Passkey Management" subtitle="Account Settings — list, rename, remove (standard + last-passkey warning), empty state, add from settings">
      <DCArtboard id="pk-list" label="Passkeys List" width={375} height={560}
        description="Found in Account Settings, listing all passkeys the user has registered across their devices. Arrived at via Settings → Security → Passkeys.">
        <Screen11/>
      </DCArtboard>
      <DCArtboard id="pk-empty" label="Passkeys List (Empty)" width={375} height={480}
        description="The Passkeys settings page when no passkeys are registered yet. Prompts the user to add their first passkey.">
        <Screen11Empty/>
      </DCArtboard>
      <DCArtboard id="pk-rename" label="Rename Passkey" width={375} height={380}
        description="A modal triggered from the passkey list to rename a specific passkey entry. Helps users distinguish between multiple registered devices.">
        <Screen12/>
      </DCArtboard>
      <DCArtboard id="pk-remove" label="Remove Warning" width={375} height={400}
        description="A confirmation dialog before deleting a passkey. Warns the user that another sign-in method will be required after removal.">
        <Screen13/>
      </DCArtboard>
      <DCArtboard id="pk-lastremove" label="Last Passkey Warning" width={375} height={440}
        description="A stricter confirmation shown when removing the user's only passkey. Highlights that biometric sign-in will be unavailable entirely.">
        <Screen14/>
      </DCArtboard>
      <DCArtboard id="pk-add-settings" label="Add Passkey (Settings)" width={375} height={500}
        description="The entry point for adding a passkey from within Settings, outside the post-login flow. Initiates the same OS biometric enrollment process.">
        <Screen15/>
      </DCArtboard>
    </DCSection>

    {/* ============================================================
        ACCOUNT SECURITY DASHBOARD
        ============================================================ */}
    <DCSection id="security" title="Account Security Dashboard" subtitle="Security overview, sign-in activity log, active devices, and remote sign-out">
      <DCArtboard id="sec-dash" label="Security Overview" width={375} height={580}
        description="A summary in Account Settings showing the user's current security posture — passkeys, recent sign-ins, and linked devices.">
        <ScreenSecurityDash/>
      </DCArtboard>
      <DCArtboard id="sec-activity" label="Sign-In Activity Log" width={375} height={580}
        description="A chronological log of recent sign-in events with device, location, and method. Arrived at from the Security Overview to help users spot unauthorized access.">
        <ScreenActivityLog/>
      </DCArtboard>
      <DCArtboard id="sec-devices" label="Active Devices" width={375} height={560}
        description="Lists all devices with an active session for the account. Arrived at from the Security Overview to review and optionally revoke access.">
        <ScreenActiveDevices/>
      </DCArtboard>
      <DCArtboard id="sec-signout" label="Remote Sign-Out" width={375} height={400}
        description="A confirmation screen for remotely signing out a specific device from the Active Devices list. Terminates that session immediately upon confirm.">
        <ScreenRemoteSignOut/>
      </DCArtboard>
    </DCSection>
  </DesignCanvas>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
