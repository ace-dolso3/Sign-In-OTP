// screens-otp.jsx — OTP path: channel selection, code entry, all edge case states

/* ---- Sign-In with OTP Tab Selected ---- */
const Screen1B_OTP = () => (
  <PhoneFrame>
    <div style={{textAlign:'center',paddingTop:14}}>
      <KeyIcon size={42}/>
      <h2 style={{margin:'10px 0 2px',fontSize:22}}>Welcome Back</h2>
      <p style={{color:WF.sub,fontSize:14,margin:'0 0 14px'}}>Sign in to your account</p>
    </div>
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      <div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',borderRadius:10,border:`2px solid ${WF.dark}`,background:'#f5f5f5'}}>
        <FaceIDIcon size={28}/>
        <div>
          <div style={{fontWeight:'bold',fontSize:15}}>Sign in with Face ID</div>
          <div style={{fontSize:12,color:WF.sub}}>Fast &amp; secure — recommended</div>
        </div>
      </div>
      <OrDivider text="or sign in with"/>
      <SegControl tabs={['Password','One-Time Code']} active={1}/>
      <Input placeholder="Email address"/>
      <Btn>SEND CODE</Btn>
      <WireCheckbox label="Keep me signed in for 30 days"/>
      <TermsFooter/>
    </div>
    <DesignNote>OTP tab selected — only email field shown, button reads "Send Code" instead of "Sign In."</DesignNote>
  </PhoneFrame>
);

/* ---- Channel Selection ---- */
const ScreenOTPChannel = () => (
  <PhoneFrame>
    <NavBar title="Verification Method"/>
    <div style={{paddingTop:8}}>
      <h3 style={{fontSize:18,margin:'0 0 4px'}}>Where should we send your code?</h3>
      <p style={{color:WF.sub,fontSize:13,lineHeight:1.5,margin:'0 0 18px'}}>
        Choose how you'd like to receive your one-time code.
      </p>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        <RadioOption
          label="Email"
          sublabel="d***@email.com"
          selected={true}
          icon={<EnvelopeIcon size={18} color={WF.dark}/>}
        />
        <RadioOption
          label="Phone"
          sublabel="(***) ***-1234"
          selected={false}
          icon={<PhoneDeviceIcon size={18} color={WF.sub}/>}
        />
      </div>
      <div style={{marginTop:20,display:'flex',flexDirection:'column',gap:10}}>
        <Btn>Send Code</Btn>
        <Btn variant="ghost">Back to sign in</Btn>
      </div>
      <DesignNote>Pre-selects last-used channel. Masked values for security.</DesignNote>
    </div>
  </PhoneFrame>
);

/* ---- OTP Code Entry (Happy State) ---- */
const ScreenOTPEntry = () => (
  <PhoneFrame>
    <NavBar title="Enter Code"/>
    <div style={{paddingTop:8,textAlign:'center'}}>
      <h3 style={{fontSize:18,margin:'0 0 6px'}}>Enter your code</h3>
      <p style={{color:WF.sub,fontSize:13,margin:'0 0 20px'}}>
        We sent a 6-digit code to <strong>d***@email.com</strong>
      </p>
      <div style={{display:'flex',gap:7,justifyContent:'center',marginBottom:20}}>
        {[1,2,3,4,5,6].map(i => (
          <div key={i} style={{width:38,height:44,borderRadius:8,border:`1.5px solid ${WF.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,background:WF.inputBg}}>
          </div>
        ))}
      </div>
      <Btn>Verify</Btn>
      <div style={{display:'flex',justifyContent:'center',gap:16,marginTop:16}}>
        <WireLink color={WF.sub}>Resend code</WireLink>
        <WireLink color={WF.sub}>Send to a different method</WireLink>
      </div>
    </div>
  </PhoneFrame>
);

/* ---- OTP Wrong Code ---- */
const ScreenOTPWrong = () => (
  <PhoneFrame>
    <NavBar title="Enter Code"/>
    <div style={{paddingTop:8,textAlign:'center'}}>
      <h3 style={{fontSize:18,margin:'0 0 6px'}}>Enter your code</h3>
      <p style={{color:WF.sub,fontSize:13,margin:'0 0 20px'}}>
        We sent a 6-digit code to <strong>d***@email.com</strong>
      </p>
      <div style={{display:'flex',gap:7,justifyContent:'center',marginBottom:6}}>
        {[8,3,1,9,0,5].map((d,i) => (
          <div key={i} style={{width:38,height:44,borderRadius:8,border:'2px solid #e53935',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,background:'#fff5f5',color:'#e53935',fontWeight:'bold'}}>
            {d}
          </div>
        ))}
      </div>
      <p style={{color:'#e53935',fontSize:13,margin:'0 0 4px',fontWeight:'bold'}}>That code isn't right. Check and try again.</p>
      <p style={{color:'#e65100',fontSize:12,margin:'0 0 16px'}}>3 attempts remaining</p>
      <Btn>Verify</Btn>
      <div style={{display:'flex',justifyContent:'center',gap:16,marginTop:16}}>
        <WireLink color={WF.sub}>Resend code</WireLink>
        <WireLink color={WF.sub}>Send to a different method</WireLink>
      </div>
    </div>
  </PhoneFrame>
);

/* ---- OTP Code Expired ---- */
const ScreenOTPExpired = () => (
  <PhoneFrame>
    <NavBar title="Enter Code"/>
    <div style={{paddingTop:8,textAlign:'center'}}>
      <h3 style={{fontSize:18,margin:'0 0 6px'}}>Enter your code</h3>
      <p style={{color:WF.sub,fontSize:13,margin:'0 0 20px'}}>
        We sent a 6-digit code to <strong>d***@email.com</strong>
      </p>
      <div style={{display:'flex',gap:7,justifyContent:'center',marginBottom:6}}>
        {[1,2,3,4,5,6].map(i => (
          <div key={i} style={{width:38,height:44,borderRadius:8,border:'1.5px solid #e0e0e0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,background:'#f0f0f0',color:'#bbb'}}>
          </div>
        ))}
      </div>
      <div style={{background:'#fff3e0',border:'1px solid #ffcc80',borderRadius:8,padding:'10px 14px',margin:'8px 0 16px'}}>
        <p style={{color:'#e65100',fontSize:14,fontWeight:'bold',margin:'0 0 2px'}}>This code has expired</p>
        <p style={{color:'#bf360c',fontSize:12,margin:0}}>Codes are valid for 5 minutes</p>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        <Btn>Send a new code</Btn>
        <Btn variant="secondary">Use a different method</Btn>
      </div>
    </div>
  </PhoneFrame>
);

/* ---- OTP Max Resends Lockout ---- */
const ScreenOTPLockout = () => (
  <PhoneFrame>
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
      <LockIcon size={52}/>
      <h2 style={{margin:'14px 0 6px',fontSize:20}}>Too many code requests</h2>
      <p style={{color:WF.sub,fontSize:14,lineHeight:1.5,margin:'0 0 16px'}}>
        You've requested too many codes. Try again in:
      </p>
      <TimerBadge time="14:58"/>
      <p style={{color:WF.sub,fontSize:13,lineHeight:1.5,margin:'16px 0 28px'}}>
        You can also sign in with your password instead.
      </p>
      <div style={{width:'100%',display:'flex',flexDirection:'column',gap:10}}>
        <Btn>Sign in with password</Btn>
        <Btn variant="ghost">Contact support</Btn>
      </div>
    </div>
  </PhoneFrame>
);

/* ---- OTP No Channel Access ---- */
const ScreenOTPNoAccess = () => (
  <PhoneFrame>
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
      <WarningIcon size={52} color="#e65100"/>
      <h2 style={{margin:'14px 0 6px',fontSize:20}}>Can't access your email or phone?</h2>
      <p style={{color:WF.sub,fontSize:14,lineHeight:1.5,margin:'0 0 28px'}}>
        If you can't reach <strong>d***@email.com</strong> or <strong>(***) ***-1234</strong>, you can sign in with your password or contact support for help.
      </p>
      <div style={{width:'100%',display:'flex',flexDirection:'column',gap:10}}>
        <Btn>Sign in with password</Btn>
        <Btn variant="secondary">Contact support</Btn>
        <Btn variant="ghost">Back to sign in</Btn>
      </div>
    </div>
  </PhoneFrame>
);

Object.assign(window, {
  Screen1B_OTP, ScreenOTPChannel, ScreenOTPEntry,
  ScreenOTPWrong, ScreenOTPExpired, ScreenOTPLockout, ScreenOTPNoAccess,
});
