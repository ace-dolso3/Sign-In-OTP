// screens-flow.jsx — Groups 1–4: Sign-in, Passkey Creation, Happy Path, Fallbacks

/* ================================================================
   GROUP 1: Updated Sign-In Screen — 3 variations
   ================================================================ */

const Screen1A = () => (
  <PhoneFrame>
    <div style={{textAlign:'center',paddingTop:14}}>
      <KeyIcon size={42}/>
      <h2 style={{margin:'10px 0 2px',fontSize:22}}>Welcome Back</h2>
      <p style={{color:WF.sub,fontSize:14,margin:'0 0 14px'}}>Choose your preferred sign-in method</p>
    </div>
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      <SegControl tabs={['Password','OTP','Face ID']} active={0}/>
      <Input placeholder="Email"/>
      <Input placeholder="Password"/>
      <div><WireLink color={WF.text}>Forgot Password?</WireLink></div>
      <WireCheckbox label="Keep me signed in for 30 days"/>
      <Btn>SIGN IN</Btn>
      <TermsFooter/>
    </div>
    <DesignNote>Three-tab approach — passkey as equal peer alongside existing methods. Minimal disruption; works if three tabs fit the space.</DesignNote>
  </PhoneFrame>
);

const Screen1B = () => (
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
      <SegControl tabs={['Password','One-Time Code']} active={0}/>
      <Input placeholder="Email"/>
      <Input placeholder="Password"/>
      <div><WireLink color={WF.text}>Forgot Password?</WireLink></div>
      <WireCheckbox label="Keep me signed in for 30 days"/>
      <Btn>SIGN IN</Btn>
      <TermsFooter/>
    </div>
    <DesignNote>Passkey as hero CTA above existing methods. Establishes passkey as the recommended option. More visually prominent.</DesignNote>
  </PhoneFrame>
);

const Screen1C = () => (
  <PhoneFrame>
    <div style={{textAlign:'center',paddingTop:14}}>
      <KeyIcon size={42}/>
      <h2 style={{margin:'10px 0 2px',fontSize:22}}>Welcome Back</h2>
      <p style={{color:WF.sub,fontSize:14,margin:'0 0 14px'}}>Choose your preferred sign-in method</p>
    </div>
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      <SegControl tabs={['Password','One-Time Code']} active={0}/>
      <Input placeholder="Email"/>
      <Input placeholder="Password"/>
      <div><WireLink color={WF.text}>Forgot Password?</WireLink></div>
      <WireCheckbox label="Keep me signed in for 30 days"/>
      <Btn>SIGN IN</Btn>
      <OrDivider text="or sign in faster"/>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,padding:'12px 14px',borderRadius:10,border:`1.5px solid ${WF.border}`}}>
        <FaceIDIcon size={22}/>
        <span style={{fontWeight:'bold',fontSize:15}}>Use Face ID</span>
      </div>
      <TermsFooter/>
    </div>
    <DesignNote>Passkey below form as secondary add-on. Least disruptive to existing layout; lowest discoverability.</DesignNote>
  </PhoneFrame>
);

/* ================================================================
   GROUP 2: Passkey Creation Flow
   ================================================================ */

const Screen2A = () => (
  <PhoneFrame>
    {/* Dimmed background content */}
    <div style={{opacity:0.25,padding:'14px 0'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:36,height:36,borderRadius:18,background:'#ddd',margin:'0 auto 8px'}}></div>
        <div style={{height:12,background:'#ddd',borderRadius:4,width:'50%',margin:'0 auto 6px'}}></div>
        <div style={{height:8,background:'#eee',borderRadius:4,width:'70%',margin:'0 auto'}}></div>
      </div>
      <div style={{marginTop:16}}>
        <div style={{height:40,background:'#f0f0f0',borderRadius:8,marginBottom:8}}></div>
        <div style={{height:40,background:'#f0f0f0',borderRadius:8,marginBottom:8}}></div>
        <div style={{height:40,background:'#f0f0f0',borderRadius:8}}></div>
      </div>
    </div>
    {/* Bottom sheet */}
    <div style={{marginTop:'auto',borderTop:`2px solid #ddd`,borderRadius:'16px 16px 0 0',padding:'16px 0 0',boxShadow:'0 -4px 20px rgba(0,0,0,0.08)'}}>
      <div style={{width:36,height:4,borderRadius:2,background:'#ccc',margin:'0 auto 14px'}}></div>
      <div style={{textAlign:'center'}}>
        <FaceIDIcon size={40}/>
        <h3 style={{margin:'10px 0 4px',fontSize:19}}>Sign in faster next time</h3>
        <p style={{color:WF.sub,fontSize:13,lineHeight:1.5,margin:'0 0 18px'}}>
          Use Face ID to sign in with just a glance. No more typing passwords.
        </p>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        <Btn>Set up Face ID</Btn>
        <Btn variant="ghost">Not now</Btn>
      </div>
    </div>
    <DesignNote>Bottom sheet — non-blocking prompt after login. User can dismiss easily.</DesignNote>
  </PhoneFrame>
);

const Screen2B = () => (
  <PhoneFrame>
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
      <FaceIDIcon size={60}/>
      <h2 style={{margin:'14px 0 6px',fontSize:21}}>Sign in faster next time</h2>
      <p style={{color:WF.sub,fontSize:14,lineHeight:1.6,margin:'0 0 28px'}}>
        Skip the password. Set up Face ID to sign in to your account with just a glance. It's fast, secure, and works only on this device.
      </p>
      <div style={{width:'100%',display:'flex',flexDirection:'column',gap:10}}>
        <Btn>Set up Face ID</Btn>
        <Btn variant="secondary">Remind me later</Btn>
        <Btn variant="ghost">Skip</Btn>
      </div>
    </div>
    <DesignNote>Full-page prompt — more room for explanation. Better when there's no rush to show content.</DesignNote>
  </PhoneFrame>
);

const Screen3 = () => (
  <PhoneFrame>
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
      <p style={{fontSize:13,color:WF.sub,margin:'0 0 6px'}}>Setting up your passkey…</p>
      <h3 style={{margin:'0 0 18px',fontSize:17}}>Your device will ask you to confirm with Face ID</h3>
      <SystemPlaceholder label="OS biometric enrollment prompt appears here" height={130}/>
      <p style={{fontSize:12,color:WF.sub,margin:'16px 0 0'}}>This only takes a second.</p>
      <div style={{marginTop:20,width:'100%'}}>
        <Btn variant="ghost">Cancel setup</Btn>
      </div>
    </div>
  </PhoneFrame>
);

const Screen4 = () => (
  <PhoneFrame>
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
      <CheckCircleIcon size={60}/>
      <h2 style={{margin:'14px 0 6px',fontSize:22}}>You're all set!</h2>
      <p style={{color:WF.sub,fontSize:14,lineHeight:1.5,margin:'0 0 28px'}}>
        You can now sign in with Face ID on this device. No more passwords needed.
      </p>
      <div style={{width:'100%'}}><Btn>Continue</Btn></div>
    </div>
  </PhoneFrame>
);

const Screen5 = () => (
  <PhoneFrame>
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
      <WarningIcon size={52}/>
      <h2 style={{margin:'14px 0 6px',fontSize:20}}>Setup wasn't completed</h2>
      <p style={{color:WF.sub,fontSize:14,lineHeight:1.5,margin:'0 0 28px'}}>
        No worries — you can try again anytime, or keep using your password to sign in.
      </p>
      <div style={{width:'100%',display:'flex',flexDirection:'column',gap:10}}>
        <Btn>Try again</Btn>
        <Btn variant="secondary">Skip for now</Btn>
      </div>
    </div>
    <DesignNote>Recovery tone — "No worries" framing. Not a failure page; it's a fork.</DesignNote>
  </PhoneFrame>
);

/* ================================================================
   GROUP 3: Passkey Sign-In — Happy Path
   ================================================================ */

const Screen6 = () => (
  <PhoneFrame>
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
      <div style={{position:'relative',marginBottom:6}}>
        <FaceIDIcon size={52}/>
        <div style={{position:'absolute',bottom:-2,right:-2,width:14,height:14,borderRadius:7,background:'#4caf50',border:'2px solid #fff'}}></div>
      </div>
      <SpinnerDots size={36}/>
      <h3 style={{margin:'10px 0 4px',fontSize:18}}>Signing you in…</h3>
      <p style={{color:WF.sub,fontSize:14,lineHeight:1.5,margin:'0 0 20px'}}>
        We found a passkey for your account. Confirm with Face ID to continue.
      </p>
      <Btn variant="ghost">Use a different sign-in method</Btn>
    </div>
  </PhoneFrame>
);

const Screen7 = () => (
  <PhoneFrame>
    <div style={{padding:'12px 0'}}>
      <Toast icon={<CheckCircleIcon size={16} color={WF.green}/>}>
        Signed in with Face ID
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

/* ================================================================
   GROUP 4: Passkey Sign-In — Fallback Paths
   ================================================================ */

const Screen8 = () => (
  <PhoneFrame>
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
      <KeyXIcon size={52}/>
      <h2 style={{margin:'14px 0 6px',fontSize:20}}>No passkey on this device</h2>
      <p style={{color:WF.sub,fontSize:14,lineHeight:1.5,margin:'0 0 24px'}}>
        We didn't find a passkey saved on this device. You can sign in another way.
      </p>
      <div style={{width:'100%',display:'flex',flexDirection:'column',gap:10}}>
        <Btn>Use another sign-in method</Btn>
        <Btn variant="secondary">Sign in from another device</Btn>
      </div>
      <div style={{marginTop:14}}>
        <WireLink color={WF.sub}>Need help? Contact support</WireLink>
      </div>
    </div>
    <DesignNote>Two equal-weight options — neither dead-ends the user.</DesignNote>
  </PhoneFrame>
);

const Screen9 = () => (
  <PhoneFrame>
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
      <FaceIDFailIcon size={52}/>
      <h2 style={{margin:'14px 0 6px',fontSize:20}}>Couldn't verify</h2>
      <p style={{color:WF.sub,fontSize:14,lineHeight:1.5,margin:'0 0 24px'}}>
        Face ID didn't recognize you. Let's try another way.
      </p>
      <div style={{width:'100%',display:'flex',flexDirection:'column',gap:10}}>
        <Btn>Try Face ID again</Btn>
        <Btn variant="secondary">Sign in with password</Btn>
        <Btn variant="ghost">Sign in with one-time code</Btn>
      </div>
    </div>
    <DesignNote>Fork, not failure — multiple pathways keep the user moving forward.</DesignNote>
  </PhoneFrame>
);

const Screen10 = () => (
  <PhoneFrame>
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',paddingTop:16}}>
      <QRIcon size={32}/>
      <h2 style={{margin:'10px 0 6px',fontSize:19}}>Sign in with your phone</h2>
      <div style={{textAlign:'left',width:'100%',margin:'10px 0 16px'}}>
        {['Open your phone camera','Scan the code below','Follow the prompt on your phone'].map((s,i) => (
          <div key={i} style={{display:'flex',gap:8,marginBottom:5,fontSize:13,color:WF.sub}}>
            <span style={{fontWeight:'bold',color:WF.text}}>{i+1}.</span> {s}
          </div>
        ))}
      </div>
      <SystemPlaceholder label="OS-generated QR code appears here" height={140}/>
      <div style={{display:'flex',alignItems:'center',gap:6,margin:'14px 0',color:WF.sub,fontSize:13}}>
        <SpinnerDots size={24}/> Waiting for your phone…
      </div>
      <div style={{width:'100%'}}>
        <Btn variant="ghost">Use a different method</Btn>
      </div>
    </div>
  </PhoneFrame>
);

Object.assign(window, {
  Screen1A, Screen1B, Screen1C,
  Screen2A, Screen2B, Screen3, Screen4, Screen5,
  Screen6, Screen7,
  Screen8, Screen9, Screen10,
});
