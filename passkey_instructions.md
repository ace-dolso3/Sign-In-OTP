# Passkey instructions — AceHardware.com sign-in redesign

## Project context

This document captures design decisions, open questions, and implementation guidance from a working session on the AceHardware.com sign-in redesign. The project covers three areas:

1. A redesigned sign-in experience supporting both password and one-time password (OTP) entry
2. OTP delivery via email or phone, with full state coverage (cooldown, expiry, lockout, success)
3. A planned passkey system to be added on top of the existing flow

The prototype runs locally from `sign-in.html` (no server required).

---

## Current sign-in flow — what's been designed

### Screen 1 — method selection (password)
- Heading: "Welcome Back"
- Toggle: Password | One-Time Code
- Fields: Email, Password
- Cloudflare CAPTCHA ("Verify you are human")
- Checkbox: "Keep me signed in for 30 days"
- Primary CTA: "Sign In"
- Legal copy + "Don't have an account? Create an Account"

### Screen 2 — method selection (OTP)
- Same heading and toggle
- Channel selector: Email tile | Phone tile (selected state uses a checkmark badge)
- Pre-filled field showing address/number on file (editable — see open issues)
- Helper text: "We'll send a 6-digit code to your email/phone number"
- Checkbox: "Keep me signed in for 30 days"
- Primary CTA: "Send Code"
- Legal copy + "Don't have an account? Create an Account"

### Screen 3 — code entry
- Heading: "Welcome Back" (updated from original "Sign In" — this was a noted fix)
- Subtext: "Please enter the verification code we sent to (***) ***-*924 to verify your identity."
- Expiry: "The code expires in 3 minutes."
- 6 individual OTP input boxes
- Primary CTA: "Verify"
- Secondary: "Resend Code" (text, below button)

---

## OTP states designed

Four states were mocked up matching the Ace Hardware visual language:

### State 1 — cooldown (resend blocked)
- Resend button is visibly disabled
- Amber inline alert between the boxes and the resend button: clock icon + "Resend available in 0:42" with a live countdown
- Verify button remains active (user may still have a valid code)
- Countdown auto-enables the resend button when it hits zero — no page reload

### State 2 — expired code
- Icon changes to a red alert circle
- OTP boxes fill with the user's failed entry in red
- Expiry line reads: "Code expired" in red
- Inline error below boxes: "This code has expired. Request a new one below."
- Primary CTA flips to "Resend code"
- Secondary link below: "Use password instead"

### State 3 — max resends lockout
- Icon changes to a lock
- Subtext reads: "Too many attempts" in red
- OTP boxes are greyed out and disabled
- Red inline alert: "Code requests are temporarily locked. Try again in 15 min or sign in another way."
- Primary CTA: "Sign in with password"
- Secondary link: "Get account help"
- Recommended lockout duration: 15 minutes (long enough to deter bots, short enough not to destroy the shopping trip)

### State 4 — resend success
- Inline alert (not a snack bar — user's attention is still on the code entry area)
- Green/neutral success tone
- Copy: "New code sent to (***) ***-*924"
- Auto-dismisses after ~4 seconds

**Why inline alert over snack bar:** When the user taps Resend, their eyes are already on the code entry zone waiting for the new code. A snack bar at the bottom requires them to look away. Reserve snack bars for background actions where the user has moved on.

---

## Prototype feedback (from live review of the local sign-in prototype)

### Issues to fix

**Email/phone field should be read-only.** The "Welcome Back" screen implies the system knows who you are. Showing an editable text field for the email or phone undermines that and introduces a security concern (someone at a shared computer could swap in their own address). Replace the editable input with a masked, non-editable display: `d***@acehardware.com` or `(***) ***-*924`. If the user needs to change it, that belongs in account settings — not the sign-in flow.

**Channel selection checkmark is ambiguous.** The checkmark badge on the selected Email/Phone tile looks identical to a "verified" badge, which carries a different meaning in most UIs. Switch to a filled border + background tint — consistent with the pill toggle treatment already used above.

**Transition animation flashes.** The Send Code → code entry transition tore visibly with a washed-out pink/red overlay for ~0.5 seconds. Add a simple fade or directional slide transition. Sign-in screens need to feel trustworthy; glitchy transitions undermine that.

**"Resend Code" needs lower visual weight.** On the verification screen it reads like a second primary button because it's all-caps with equal visual presence to Verify. Lower-case it and use a text link treatment. Verify is the primary action; Resend is the escape hatch.

**No way to change channel after sending.** If the user accidentally sent to phone but meant email, they're stuck. Add a low-prominence link: "Wrong number? Change delivery method" — takes them back to screen 2.

### Things that are working
- "Welcome Back" heading now carries through to the verification screen (was "Sign In" originally — good fix)
- Channel selector (Email/Phone tiles) is clear and well-structured
- The overall card layout and Ace Hardware visual language is clean and consistent
- Verification screen content is appropriately minimal

---

## Other sign-in flow considerations (not yet designed)

- **Wrong number / no access to channel:** User needs a way to switch channels before the code fires, not just after. Consider surfacing email as fallback if phone was selected and vice versa.
- **"I already have a code" / page refresh:** What happens if the user leaves and comes back mid-session? Is the old code still valid? The ambiguous middle state needs to be designed.
- **Deep linking / context preservation:** User was adding to cart, got routed to sign-in — do they land back on the cart after completing OTP? This is easy to miss until QA.
- **Accessibility on OTP boxes:** Six single-character inputs need auto-advancing focus on each keystroke, full-code paste support, and screen reader announcements for state changes (expiry, errors, success).
- **"Keep me signed in for 30 days" on both screens:** Confirm the logic is consistent if a user interacts with both the password and OTP tabs before submitting. Does the checked state carry over?

---

## Passkey addition — what you need to know

### What a passkey is
A passkey is a cryptographic key pair stored on the user's device (phone, laptop, hardware key). The device holds the private key and never shares it — the server only sees the public key. Authentication happens when the device signs a server challenge, unlocked by the user's biometrics (Face ID, Touch ID, Windows Hello) or device PIN. No secret to steal, no code to intercept. Users experience it as "sign in with Face ID."

### The three flows to design

**1. Passkey creation**
Triggered post-login or from account settings. The OS/browser handles the actual cryptographic enrollment — you prompt it and surround it with clear copy. Most users don't know what a passkey is, so lead with the benefit: "Sign in faster with Face ID — no password needed." Do not say "Register a passkey."

**2. Passkey sign-in (happy path)**
If a passkey exists for this site on this device, the browser/OS can prompt biometrics before the user has typed anything. You control the moment before (show a "Sign in with passkey" button, or auto-trigger?) and the moment after (landing destination). Mostly, your job is to not get in the way of the OS sheet.

**3. Passkey sign-in (fallback paths)**
This is the hardest and most under-designed part:
- Passkey not found on this device → offer fallback (password or OTP) and/or cross-device QR
- Biometric failed or cancelled → offer fallback without making it feel like failure
- Cross-device flow (passkey on phone, signing in on desktop) → OS shows a QR code; you control the surrounding instructions
- Lost/wiped device → account recovery via OTP, then option to re-enroll a passkey

**The fallback is password or OTP** — you've confirmed this. That decision makes the fallback design relatively clean: any passkey failure routes back to your existing method toggle.

### The cross-device complication
Passkeys created on one device don't automatically exist on another. If a user sets up a passkey on their iPhone and then signs in on a desktop browser, it works if their passkey synced to iCloud Keychain or Google Password Manager. If it didn't, they need to scan a QR code with their phone to authenticate the desktop session — a flow the OS handles, but users find confusing. You need to design for the user who says "I set this up on my phone but I'm on my work computer now."

### How passkeys fit into the existing toggle
Currently: Password | One-Time Code

Options for adding passkeys:
- Add a third option to the toggle: Password | One-Time Code | Passkey
- Auto-detect passkey availability and lead with it, relegating the others to "other ways to sign in"
- Post-login upsell only (don't surface during sign-in until the user has enrolled)

The auto-detect path is most seamless but requires the most careful fallback design. The explicit toggle gives users control but adds a choice most aren't ready to make confidently.

---

## Full screen list for passkey addition

### Passkey creation
- [ ] Passkey opt-in prompt (post-login or in account settings)
- [ ] Success confirmation after enrollment
- [ ] Error state (enrollment failed or cancelled)

### Passkey sign-in — happy path
- [ ] Passkey detected, pre-biometric prompt screen
- [ ] Success / landing state

### Passkey sign-in — fallback paths
- [ ] Passkey not found on this device (with fallback options)
- [ ] Biometric failed or cancelled (offer password/OTP without framing as failure)
- [ ] Cross-device QR code screen (OS generates QR, you control surrounding UI and instructions)

### Passkey management (account settings)
- [ ] Passkeys list (device nickname, date added, last used)
- [ ] Rename a passkey
- [ ] Remove a passkey (with warning if it's the only one)
- [ ] Add a new passkey from settings

### Account recovery
- [ ] Recovery entry point (when all passkey paths fail)
- [ ] Identity verification step (feeds into existing OTP flow)

### Existing screens to update
- [ ] Sign-in method toggle (add passkey option or restructure hierarchy)
- [ ] Account settings security section (add passkeys management alongside sign-in activity + device management)

**Total: ~15–18 screens**

### Highest-risk screens to not skip
- Cross-device QR screen — low frequency, high confusion
- "Last passkey removed" warning — if they remove their only passkey with no other method set up, they could lock themselves out
- Biometric failure fallback — needs to feel like a normal alternative, not an error

---

## Open questions to resolve before designing passkey screens

1. Will you surface passkey sign-in as an explicit toggle option, or auto-detect and lead with it?
2. What is the copy strategy for users who don't know what a passkey is? (Benefit-led language recommended)
3. Will passkeys sync via iCloud Keychain / Google Password Manager, or are they device-only?
4. What does the "add a passkey" entry point look like in account settings — is that part of this project or a later phase?
5. Is the cross-device QR flow in scope, or are you launching passkeys as mobile-first only?
