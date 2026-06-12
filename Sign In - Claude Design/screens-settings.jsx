// ARCHIVE — original ideation; not the source of truth.
// See sign-in.html (live prototype) for current behavior.
//
// screens-settings.jsx — Groups 5–6: Passkey Management & Account Recovery

/* ================================================================
   GROUP 5: Passkey Management in Account Settings
   ================================================================ */

const PasskeyRow = ({name, icon, dateAdded, lastUsed}) => (
  <div style={{border:`1.5px solid ${WF.border}`,borderRadius:10,marginBottom:10,padding:'12px 14px'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
      <div>
        <div style={{fontWeight:'bold',fontSize:15}}>{name}</div>
        <div style={{fontSize:11,color:WF.sub,marginTop:2}}>Added {dateAdded} · Last used {lastUsed}</div>
      </div>
      {icon}
    </div>
    <div style={{display:'flex',gap:14,marginTop:8}}>
      <WireLink color={WF.text}>Rename</WireLink>
      <WireLink color={WF.red}>Remove</WireLink>
    </div>
  </div>
);

const Screen11 = () => (
  <PhoneFrame>
    <NavBar title="Security Settings"/>
    <h3 style={{fontSize:17,margin:'0 0 4px'}}>Passkeys</h3>
    <p style={{color:WF.sub,fontSize:12,margin:'0 0 14px',lineHeight:1.4}}>
      Manage devices that can sign in with Face ID or biometrics.
    </p>
    <PasskeyRow
      name="David's iPhone 15"
      icon={<PhoneDeviceIcon size={18}/>}
      dateAdded="Mar 12"
      lastUsed="today"
    />
    <PasskeyRow
      name="David's MacBook Pro"
      icon={<LaptopIcon size={18}/>}
      dateAdded="Jan 5"
      lastUsed="May 28"
    />
    <div style={{marginTop:4}}>
      <Btn variant="secondary">+ Add a new passkey</Btn>
    </div>
  </PhoneFrame>
);

const Screen11Empty = () => (
  <PhoneFrame>
    <NavBar title="Security Settings"/>
    <h3 style={{fontSize:17,margin:'0 0 4px'}}>Passkeys</h3>
    <p style={{color:WF.sub,fontSize:12,margin:'0 0 20px',lineHeight:1.4}}>
      Manage devices that can sign in with Face ID or biometrics.
    </p>
    <div style={{textAlign:'center',padding:'28px 16px',border:`1.5px dashed ${WF.border}`,borderRadius:10,marginBottom:14}}>
      <FaceIDIcon size={36} color={WF.sub}/>
      <p style={{color:WF.sub,fontSize:14,margin:'10px 0 2px'}}>No passkeys yet</p>
      <p style={{color:WF.sub,fontSize:12,margin:0}}>Set up a passkey to sign in faster with biometrics</p>
    </div>
    <Btn>+ Add a passkey</Btn>
  </PhoneFrame>
);

/* ---- Dialogs (12–14) rendered as centered modals ---- */

const ModalShell = ({children}) => (
  <PhoneFrame>
    {/* dimmed background */}
    <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.15)',zIndex:0}}></div>
    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',zIndex:1}}>
      <div style={{width:'100%',background:'#fff',borderRadius:14,border:`1.5px solid ${WF.border}`,padding:20,boxShadow:'0 6px 24px rgba(0,0,0,0.12)'}}>
        {children}
      </div>
    </div>
  </PhoneFrame>
);

const Screen12 = () => (
  <ModalShell>
    <h3 style={{margin:'0 0 14px',fontSize:18}}>Rename passkey</h3>
    <Input value="David's iPhone 15"/>
    <div style={{display:'flex',gap:10,marginTop:16}}>
      <div style={{flex:1}}><Btn variant="secondary">Cancel</Btn></div>
      <div style={{flex:1}}><Btn>Save</Btn></div>
    </div>
  </ModalShell>
);

const Screen13 = () => (
  <ModalShell>
    <h3 style={{margin:'0 0 6px',fontSize:18}}>Remove passkey?</h3>
    <p style={{color:WF.sub,fontSize:14,lineHeight:1.5,margin:'0 0 4px'}}>
      Remove "David's iPhone 15"?
    </p>
    <p style={{color:WF.sub,fontSize:13,lineHeight:1.5,margin:'0 0 18px'}}>
      You won't be able to use Face ID on this device to sign in.
    </p>
    <div style={{display:'flex',gap:10}}>
      <div style={{flex:1}}><Btn variant="secondary">Cancel</Btn></div>
      <div style={{flex:1}}><Btn variant="destructive">Remove</Btn></div>
    </div>
  </ModalShell>
);

const Screen14 = () => (
  <ModalShell>
    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
      <WarningIcon size={22} color="#e65100"/>
      <h3 style={{margin:0,fontSize:17,color:'#e65100'}}>This is your only passkey</h3>
    </div>
    <p style={{color:WF.sub,fontSize:13,lineHeight:1.5,margin:'0 0 4px'}}>
      Removing "David's iPhone 15" means you'll need to use your password or one-time code to sign in.
    </p>
    <p style={{fontSize:13,color:WF.text,margin:'0 0 18px',fontWeight:'bold'}}>
      Consider adding another passkey first.
    </p>
    <div style={{display:'flex',gap:10}}>
      <div style={{flex:1}}><Btn variant="secondary">Cancel</Btn></div>
      <div style={{flex:1}}><Btn variant="destructive">Remove anyway</Btn></div>
    </div>
    <DesignNote>Elevated warning — stronger copy and "remove anyway" make the action deliberate.</DesignNote>
  </ModalShell>
);

const Screen15 = () => (
  <PhoneFrame>
    <NavBar title="Passkeys"/>
    <div style={{textAlign:'center',padding:'20px 0'}}>
      <FaceIDIcon size={52}/>
      <h2 style={{margin:'14px 0 6px',fontSize:20}}>Add a new passkey</h2>
      <p style={{color:WF.sub,fontSize:13,lineHeight:1.5,margin:'0 0 6px'}}>
        Set up Face ID or biometrics on this device to sign in faster.
      </p>
      <p style={{color:WF.sub,fontSize:12,lineHeight:1.5,margin:'0 0 24px'}}>
        Your device will ask you to verify your identity.
      </p>
    </div>
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      <Btn>Set up passkey</Btn>
      <Btn variant="ghost">Cancel</Btn>
    </div>
    <DesignNote>Same enrollment flow as post-login (screens 3–5), entered from Settings context instead.</DesignNote>
  </PhoneFrame>
);

/* ================================================================
   GROUP 6: Account Recovery
   ================================================================ */

const Screen16 = () => (
  <PhoneFrame>
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
      <ShieldIcon size={52}/>
      <h2 style={{margin:'14px 0 6px',fontSize:21}}>Having trouble getting in?</h2>
      <p style={{color:WF.sub,fontSize:14,lineHeight:1.6,margin:'0 0 6px'}}>
        We can help you verify your identity and get back into your account.
      </p>
      <p style={{color:WF.sub,fontSize:13,lineHeight:1.5,margin:'0 0 28px'}}>
        Your account and data are safe.
      </p>
      <div style={{width:'100%',display:'flex',flexDirection:'column',gap:10}}>
        <Btn>Verify my identity</Btn>
        <Btn variant="secondary">Back to sign in</Btn>
      </div>
    </div>
    <DesignNote>Hand-holding moment — empathetic headline, data-safety reassurance.</DesignNote>
  </PhoneFrame>
);

const Screen17 = () => (
  <PhoneFrame>
    <div style={{paddingTop:16}}>
      <h2 style={{fontSize:19,margin:'0 0 6px'}}>Verify your identity</h2>
      <p style={{color:WF.sub,fontSize:13,lineHeight:1.5,margin:'0 0 16px'}}>
        We'll send a 6-digit verification code to:
      </p>
      <div style={{textAlign:'center',padding:'10px',background:WF.inputBg,borderRadius:8,marginBottom:16}}>
        <strong style={{fontSize:15}}>d***@email.com</strong>
      </div>
      <Btn>Send verification code</Btn>
      <Divider style={{margin:'18px 0'}}/>
      <p style={{color:WF.sub,fontSize:13,textAlign:'center',margin:'0 0 12px'}}>Enter the 6-digit code</p>
      <div style={{display:'flex',gap:7,justifyContent:'center',marginBottom:16}}>
        {[1,2,3,4,5,6].map(i => (
          <div key={i} style={{width:38,height:44,borderRadius:8,border:`1.5px solid ${WF.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,background:WF.inputBg}}>
            {i <= 3 ? '•' : ''}
          </div>
        ))}
      </div>
      <Btn variant="secondary">Verify</Btn>
      <div style={{display:'flex',justifyContent:'center',gap:16,marginTop:14}}>
        <WireLink color={WF.sub}>Resend code</WireLink>
        <WireLink color={WF.sub}>Try a different method</WireLink>
      </div>
    </div>
    <DesignNote>Hands off to existing OTP flow — reuse existing OTP input components in Figma.</DesignNote>
  </PhoneFrame>
);

Object.assign(window, {
  Screen11, Screen11Empty, Screen12, Screen13, Screen14, Screen15,
  Screen16, Screen17,
});
