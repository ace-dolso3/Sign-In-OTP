// screens-password.jsx — Password path: error states, forgot/reset flow

/* ---- Sign-In with Wrong Password ---- */
const Screen1B_PwdErr = () => (
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
      <Input value="david@email.com"/>
      <InputError value="••••••••" error="Incorrect password. Please try again."/>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <WireLink color={WF.text}>Forgot Password?</WireLink>
        <span style={{fontSize:12,color:'#e65100',fontFamily:WF.font,fontWeight:'bold'}}>2 of 5 attempts left</span>
      </div>
      <WireCheckbox label="Keep me signed in for 30 days"/>
      <Btn>SIGN IN</Btn>
      <TermsFooter/>
    </div>
  </PhoneFrame>
);

/* ---- Account Locked ---- */
const ScreenPwdLocked = () => (
  <PhoneFrame>
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
      <LockIcon size={52}/>
      <h2 style={{margin:'14px 0 6px',fontSize:20}}>Account temporarily locked</h2>
      <p style={{color:WF.sub,fontSize:14,lineHeight:1.5,margin:'0 0 16px'}}>
        Too many failed sign-in attempts. Try again in:
      </p>
      <TimerBadge time="14:32"/>
      <p style={{color:WF.sub,fontSize:13,lineHeight:1.5,margin:'16px 0 28px'}}>
        Or reset your password to sign in now.
      </p>
      <div style={{width:'100%',display:'flex',flexDirection:'column',gap:10}}>
        <Btn>Reset your password</Btn>
        <Btn variant="secondary">Back to sign in</Btn>
      </div>
    </div>
  </PhoneFrame>
);

/* ---- Forgot Password ---- */
const ScreenForgotPwd = () => (
  <PhoneFrame>
    <NavBar title="Forgot Password"/>
    <div style={{paddingTop:8}}>
      <p style={{color:WF.sub,fontSize:14,lineHeight:1.5,margin:'0 0 20px'}}>
        Enter the email associated with your account and we'll send a link to reset your password.
      </p>
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        <Input placeholder="Email address"/>
        <Btn>Send Reset Link</Btn>
        <Btn variant="ghost">Back to sign in</Btn>
      </div>
    </div>
  </PhoneFrame>
);

/* ---- Reset Email Sent ---- */
const ScreenResetSent = () => (
  <PhoneFrame>
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
      <EnvelopeIcon size={52}/>
      <h2 style={{margin:'14px 0 6px',fontSize:21}}>Check your inbox</h2>
      <p style={{color:WF.sub,fontSize:14,lineHeight:1.5,margin:'0 0 4px'}}>
        We sent a password reset link to:
      </p>
      <p style={{fontWeight:'bold',fontSize:15,margin:'0 0 20px'}}>d***@email.com</p>
      <p style={{color:WF.sub,fontSize:13,lineHeight:1.5,margin:'0 0 28px'}}>
        Didn't get it? Check your spam folder or request a new link.
      </p>
      <div style={{width:'100%',display:'flex',flexDirection:'column',gap:10}}>
        <Btn variant="secondary">Resend email</Btn>
        <Btn variant="ghost">Back to sign in</Btn>
      </div>
    </div>
  </PhoneFrame>
);

/* ---- New Password Form ---- */
const ScreenNewPwd = () => (
  <PhoneFrame>
    <NavBar title="Create New Password"/>
    <div style={{paddingTop:8}}>
      <p style={{color:WF.sub,fontSize:14,lineHeight:1.5,margin:'0 0 20px'}}>
        Choose a strong password for your account.
      </p>
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        <div>
          <Input placeholder="New password"/>
          <StrengthBar level={2}/>
        </div>
        <Input placeholder="Confirm new password"/>
        <Btn>Update Password</Btn>
      </div>
      <div style={{marginTop:16}}>
        <p style={{fontSize:12,color:WF.sub,lineHeight:1.5}}>
          Password must be at least 8 characters and include a number and a symbol.
        </p>
      </div>
    </div>
  </PhoneFrame>
);

/* ---- Password Reset Success ---- */
const ScreenResetSuccess = () => (
  <PhoneFrame>
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
      <CheckCircleIcon size={60}/>
      <h2 style={{margin:'14px 0 6px',fontSize:22}}>Password updated!</h2>
      <p style={{color:WF.sub,fontSize:14,lineHeight:1.5,margin:'0 0 28px'}}>
        Your password has been reset. You can now sign in with your new password.
      </p>
      <div style={{width:'100%'}}><Btn>Sign In</Btn></div>
    </div>
  </PhoneFrame>
);

Object.assign(window, {
  Screen1B_PwdErr, ScreenPwdLocked, ScreenForgotPwd,
  ScreenResetSent, ScreenNewPwd, ScreenResetSuccess,
});
