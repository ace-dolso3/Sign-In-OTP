// ARCHIVE — original ideation; not the source of truth.
// See sign-in.html (live prototype) for current behavior.
//
// screens-gaps.jsx — Passkey gaps, OS screens, Account Security Dashboard

/* ================================================================
   PASSKEY GAPS
   ================================================================ */

/* ---- QR Failed / Timed Out ---- */
const ScreenQRFailed = () => (
  <PhoneFrame>
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
      <QRFailIcon size={52}/>
      <h2 style={{margin:'14px 0 6px',fontSize:20}}>Couldn't connect</h2>
      <p style={{color:WF.sub,fontSize:14,lineHeight:1.5,margin:'0 0 28px'}}>
        The QR code may have expired, or your phone didn't respond in time.
      </p>
      <div style={{width:'100%',display:'flex',flexDirection:'column',gap:10}}>
        <Btn>Generate a new code</Btn>
        <Btn variant="secondary">Use a different method</Btn>
      </div>
    </div>
  </PhoneFrame>
);

/* ---- Post-Recovery Re-Enrollment Prompt ---- */
const ScreenReEnroll = () => (
  <PhoneFrame>
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
      <FaceIDIcon size={60}/>
      <h2 style={{margin:'14px 0 6px',fontSize:21}}>Set up Face ID on this device</h2>
      <p style={{color:WF.sub,fontSize:14,lineHeight:1.6,margin:'0 0 28px'}}>
        You just recovered your account. Set up Face ID so you can sign in with just a glance next time. It's fast, secure, and stays on this device.
      </p>
      <div style={{width:'100%',display:'flex',flexDirection:'column',gap:10}}>
        <Btn>Set up Face ID</Btn>
        <Btn variant="ghost">Maybe later</Btn>
      </div>
    </div>
    <DesignNote>Post-recovery variant of opt-in (Screen 2). Different copy acknowledges the recovery context.</DesignNote>
  </PhoneFrame>
);

/* ================================================================
   OS / BROWSER SCREENS (Not designed by product team)
   ================================================================ */

const ScreenOSBioAuth = () => (
  <OSScreenFrame
    icon={<FaceIDIcon size={56} color="#546e7a"/>}
    title="Face ID Authentication"
    desc="The operating system presents its native Face ID / Touch ID prompt. The user confirms their identity with biometrics. This screen is entirely system-controlled."
  />
);

const ScreenOSBioEnroll = () => (
  <OSScreenFrame
    icon={<FaceIDIcon size={56} color="#546e7a"/>}
    title="Biometric Enrollment"
    desc="The operating system registers the user's biometric credential (Face ID / Touch ID / fingerprint). This is a one-time system prompt during passkey setup."
  />
);

const ScreenOSQR = () => (
  <OSScreenFrame
    icon={<QRIcon size={56}/>}
    title="Cross-Device QR Code"
    desc="The browser generates and displays a QR code for cross-device passkey authentication. The user scans it with their phone's camera. The QR code itself is system-generated."
  />
);

/* ================================================================
   SCREEN 7 VARIANTS (Success Landing by method)
   ================================================================ */

const Screen7Base = ({toast}) => (
  <PhoneFrame>
    <div style={{padding:'12px 0'}}>
      <Toast icon={<CheckCircleIcon size={16} color={WF.green}/>}>
        {toast}
      </Toast>
      <div style={{marginTop:20}}>
        <h2 style={{fontSize:21,margin:'0 0 4px'}}>Welcome back, David</h2>
        <p style={{color:WF.sub,fontSize:13,margin:'0 0 18px'}}>Here's what's new at your local store</p>
        {['My Orders','Rewards Balance','Local Store Info'].map((t,i) => (
          <div key={i} style={{background:'#f0f0f0',borderRadius:8,height:60,marginBottom:10,display:'flex',alignItems:'center',justifyContent:'center',color:WF.sub,fontSize:13}}>
            [ {t} ]
          </div>
        ))}
      </div>
    </div>
  </PhoneFrame>
);

const Screen7Pwd = () => <Screen7Base toast="Signed in with password"/>;
const Screen7OTP = () => <Screen7Base toast="Signed in with one-time code"/>;
const Screen7Recovery = () => <Screen7Base toast="Identity verified — you're signed in"/>;

/* ================================================================
   ACCOUNT SECURITY DASHBOARD
   ================================================================ */

/* ---- Security Overview ---- */
const ScreenSecurityDash = () => (
  <PhoneFrame>
    <NavBar title="Account Security"/>
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      {/* Stats cards */}
      <div style={{display:'flex',gap:10}}>
        <div style={{flex:1,background:WF.inputBg,borderRadius:10,padding:'12px',textAlign:'center'}}>
          <div style={{fontSize:24,fontWeight:'bold'}}>2</div>
          <div style={{fontSize:11,color:WF.sub}}>Passkeys</div>
        </div>
        <div style={{flex:1,background:WF.inputBg,borderRadius:10,padding:'12px',textAlign:'center'}}>
          <div style={{fontSize:24,fontWeight:'bold'}}>3</div>
          <div style={{fontSize:11,color:WF.sub}}>Active Devices</div>
        </div>
      </div>
      <div style={{background:WF.inputBg,borderRadius:10,padding:'12px 14px'}}>
        <div style={{fontSize:12,color:WF.sub}}>Last sign-in</div>
        <div style={{fontSize:14,fontWeight:'bold'}}>Today, 2:14 PM · Face ID · iPhone 15</div>
      </div>
      {/* Navigation links */}
      {[
        {label:'Passkeys',desc:'Manage Face ID & biometric sign-in'},
        {label:'Sign-In Activity',desc:'View recent sign-in history'},
        {label:'Active Devices',desc:'See devices signed in to your account'},
      ].map((item,i) => (
        <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px',border:`1.5px solid ${WF.border}`,borderRadius:10}}>
          <div>
            <div style={{fontWeight:'bold',fontSize:15}}>{item.label}</div>
            <div style={{fontSize:12,color:WF.sub}}>{item.desc}</div>
          </div>
          <span style={{color:WF.sub,fontSize:18}}>›</span>
        </div>
      ))}
    </div>
  </PhoneFrame>
);

/* ---- Sign-In Activity Log ---- */
const ScreenActivityLog = () => (
  <PhoneFrame>
    <NavBar title="Sign-In Activity"/>
    <p style={{color:WF.sub,fontSize:12,margin:'0 0 10px'}}>Recent sign-in events for your account</p>
    <ActivityRow method="Face ID" device="David's iPhone 15" date="Today, 2:14 PM" location="Portland, OR"/>
    <ActivityRow method="Password" device="MacBook Pro · Chrome" date="May 28, 10:22 AM" location="Portland, OR"/>
    <ActivityRow method="One-Time Code" device="iPad Air · Safari" date="May 25, 8:45 PM" location="Seattle, WA"/>
    <ActivityRow method="Face ID" device="David's iPhone 15" date="May 22, 7:30 AM" location="Portland, OR"/>
    <ActivityRow method="Password" device="Windows PC · Edge" date="May 18, 3:12 PM" location="Portland, OR"/>
    <div style={{textAlign:'center',marginTop:12}}>
      <WireLink color={WF.sub}>Load more</WireLink>
    </div>
  </PhoneFrame>
);

/* ---- Active Devices ---- */
const ScreenActiveDevices = () => (
  <PhoneFrame>
    <NavBar title="Active Devices"/>
    <p style={{color:WF.sub,fontSize:12,margin:'0 0 14px'}}>Devices currently signed in to your account</p>
    <DeviceCard name="David's iPhone 15" icon={<PhoneDeviceIcon size={18}/>} lastActive="now" location="Portland, OR" current={true}/>
    <DeviceCard name="MacBook Pro" icon={<LaptopIcon size={18}/>} lastActive="2 hrs ago" location="Portland, OR" current={false}/>
    <DeviceCard name="iPad Air" icon={<LaptopIcon size={18}/>} lastActive="3 days ago" location="Seattle, WA" current={false}/>
    <div style={{marginTop:6}}>
      <Btn variant="ghost" style={{color:WF.red}}>Sign out of all other devices</Btn>
    </div>
  </PhoneFrame>
);

/* ---- Remote Sign-Out Confirmation ---- */
const ScreenRemoteSignOut = () => (
  <ModalShell>
    <h3 style={{margin:'0 0 6px',fontSize:18}}>Sign out of this device?</h3>
    <p style={{color:WF.sub,fontSize:14,lineHeight:1.5,margin:'0 0 4px'}}>
      Sign out of "MacBook Pro"?
    </p>
    <p style={{color:WF.sub,fontSize:13,lineHeight:1.5,margin:'0 0 18px'}}>
      They'll need to sign in again to access your account on that device.
    </p>
    <div style={{display:'flex',gap:10}}>
      <div style={{flex:1}}><Btn variant="secondary">Cancel</Btn></div>
      <div style={{flex:1}}><Btn variant="destructive">Sign Out</Btn></div>
    </div>
  </ModalShell>
);

Object.assign(window, {
  ScreenQRFailed, ScreenReEnroll,
  ScreenOSBioAuth, ScreenOSBioEnroll, ScreenOSQR,
  Screen7Base, Screen7Pwd, Screen7OTP, Screen7Recovery,
  ScreenSecurityDash, ScreenActivityLog, ScreenActiveDevices, ScreenRemoteSignOut,
});
