// wireframe-kit.jsx — Shared wireframe UI components for passkey flow

const WF = {
  font: "'Patrick Hand', cursive",
  text: '#2d2d2d',
  sub: '#777',
  border: '#bbb',
  inputBg: '#f4f4f4',
  bg: '#ffffff',
  dark: '#2d2d2d',
  red: '#c62828',
  green: '#2e7d32',
};

/* ---- Status Bar ---- */
const StatusBar = () => (
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 20px',fontSize:13,fontWeight:'bold',color:WF.text,fontFamily:WF.font}}>
    <span>9:41</span>
    <div style={{display:'flex',gap:5,alignItems:'center'}}>
      <svg width="15" height="11" viewBox="0 0 15 11"><rect x="0" y="7" width="3" height="4" fill={WF.text}/><rect x="4" y="5" width="3" height="6" fill={WF.text}/><rect x="8" y="2" width="3" height="9" fill={WF.text}/><rect x="12" y="0" width="3" height="11" fill={WF.text}/></svg>
      <svg width="20" height="11" viewBox="0 0 20 11"><rect x="0" y="0.5" width="16" height="10" rx="2" stroke={WF.text} strokeWidth="1.2" fill="none"/><rect x="2" y="2.5" width="10" height="6" rx="1" fill={WF.text}/><rect x="17" y="3" width="2" height="5" rx="0.5" fill={WF.text}/></svg>
    </div>
  </div>
);

/* ---- Home Indicator ---- */
const HomeIndicator = () => (
  <div style={{padding:'6px 0 10px',display:'flex',justifyContent:'center'}}>
    <div style={{width:100,height:4,borderRadius:2,background:'#ccc'}}></div>
  </div>
);

/* ---- Phone Frame ---- */
const PhoneFrame = ({ children }) => (
  <div style={{width:'100%',height:'100%',background:WF.bg,fontFamily:WF.font,color:WF.text,display:'flex',flexDirection:'column',boxSizing:'border-box'}}>
    <StatusBar />
    <div style={{flex:1,padding:'0 24px',display:'flex',flexDirection:'column'}}>
      {children}
    </div>
    <HomeIndicator />
  </div>
);

/* ======== ICONS ======== */

const KeyIcon = ({size=48}) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="22" fill={WF.dark}/>
    <circle cx="19" cy="24" r="6" fill="none" stroke="#fff" strokeWidth="2.5"/>
    <line x1="25" y1="24" x2="37" y2="24" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="31" y1="24" x2="31" y2="19" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="36" y1="24" x2="36" y2="19" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const FaceIDIcon = ({size=48,color=WF.dark}) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
    <path d="M14 6h-4a4 4 0 00-4 4v4"/><path d="M34 6h4a4 4 0 014 4v4"/>
    <path d="M14 42h-4a4 4 0 01-4-4v-4"/><path d="M34 42h4a4 4 0 004-4v-4"/>
    <circle cx="18" cy="20" r="1.5" fill={color} stroke="none"/>
    <circle cx="30" cy="20" r="1.5" fill={color} stroke="none"/>
    <line x1="24" y1="20" x2="24" y2="28"/><path d="M18 32c2 3 10 3 12 0"/>
  </svg>
);

const CheckCircleIcon = ({size=48,color=WF.green}) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="20" fill="none" stroke={color} strokeWidth="2.5"/>
    <polyline points="15,24 22,31 33,18" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const WarningIcon = ({size=48,color='#e65100'}) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path d="M24 4L2 44h44L24 4z" fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round"/>
    <line x1="24" y1="18" x2="24" y2="30" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="24" cy="36" r="1.5" fill={color}/>
  </svg>
);

const ShieldIcon = ({size=48,color=WF.dark}) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="2.5">
    <path d="M24 4L6 12v12c0 11 8 18 18 22 10-4 18-11 18-22V12L24 4z"/>
    <polyline points="17,24 22,29 31,19" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const QRIcon = ({size=48}) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill={WF.dark}>
    <rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke={WF.dark} strokeWidth="2"/>
    <rect x="8" y="8" width="8" height="8" rx="1"/>
    <rect x="28" y="4" width="16" height="16" rx="2" fill="none" stroke={WF.dark} strokeWidth="2"/>
    <rect x="32" y="8" width="8" height="8" rx="1"/>
    <rect x="4" y="28" width="16" height="16" rx="2" fill="none" stroke={WF.dark} strokeWidth="2"/>
    <rect x="8" y="32" width="8" height="8" rx="1"/>
    <rect x="28" y="28" width="4" height="4"/><rect x="36" y="28" width="4" height="4"/>
    <rect x="28" y="36" width="4" height="4"/><rect x="36" y="36" width="8" height="8" rx="1"/>
  </svg>
);

const PhoneDeviceIcon = ({size=20,color=WF.dark}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
    <rect x="5" y="2" width="14" height="20" rx="3"/><line x1="10" y1="19" x2="14" y2="19"/>
  </svg>
);

const LaptopIcon = ({size=20}) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={WF.dark} strokeWidth="1.5">
    <rect x="2" y="3" width="16" height="11" rx="2"/><line x1="1" y1="17" x2="19" y2="17"/>
  </svg>
);

const BackArrow = ({size=20}) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={WF.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="12,4 6,10 12,16"/>
  </svg>
);

const SpinnerDots = ({size=40}) => (
  <svg width={size} height={size/3} viewBox="0 0 40 14">
    <circle cx="8" cy="7" r="3" fill={WF.sub} opacity="0.35"/>
    <circle cx="20" cy="7" r="3" fill={WF.sub} opacity="0.6"/>
    <circle cx="32" cy="7" r="3" fill={WF.sub} opacity="0.9"/>
  </svg>
);

const FaceIDFailIcon = ({size=48,color='#e65100'}) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" strokeWidth="2.5" strokeLinecap="round">
    <g stroke={color}>
      <path d="M14 6h-4a4 4 0 00-4 4v4"/><path d="M34 6h4a4 4 0 014 4v4"/>
      <path d="M14 42h-4a4 4 0 01-4-4v-4"/><path d="M34 42h4a4 4 0 004-4v-4"/>
    </g>
    <line x1="17" y1="17" x2="31" y2="31" stroke={color} strokeWidth="3"/>
    <line x1="31" y1="17" x2="17" y2="31" stroke={color} strokeWidth="3"/>
  </svg>
);

const KeyXIcon = ({size=48,color='#e65100'}) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="20" fill="none" stroke={color} strokeWidth="2"/>
    <circle cx="18" cy="22" r="5" fill="none" stroke={color} strokeWidth="2"/>
    <line x1="23" y1="22" x2="34" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <line x1="30" y1="22" x2="30" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <line x1="16" y1="34" x2="32" y2="34" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

/* ======== UI COMPONENTS ======== */

const Btn = ({children, variant='primary', style}) => {
  const base = {fontFamily:WF.font,fontSize:16,padding:'13px 0',borderRadius:8,border:'none',width:'100%',textAlign:'center',cursor:'pointer',fontWeight:'bold',letterSpacing:0.3,boxSizing:'border-box'};
  const v = {
    primary:     {background:WF.dark,color:'#fff'},
    secondary:   {background:'transparent',color:WF.text,border:`1.5px solid ${WF.border}`},
    destructive: {background:WF.red,color:'#fff'},
    ghost:       {background:'transparent',color:WF.sub,padding:'10px 0',fontWeight:'normal'},
  };
  return <div style={{...base,...v[variant],...style}}>{children}</div>;
};

const Input = ({placeholder,value}) => (
  <div style={{fontFamily:WF.font,fontSize:16,padding:'13px 16px',borderRadius:8,border:`1.5px solid ${WF.border}`,background:WF.inputBg,color:value?WF.text:WF.sub,boxSizing:'border-box'}}>
    {value||placeholder}
  </div>
);

const SegControl = ({tabs,active}) => (
  <div style={{display:'flex',background:'#e5e5e5',borderRadius:24,padding:3}}>
    {tabs.map((t,i) => (
      <div key={i} style={{flex:1,textAlign:'center',padding:'9px 6px',borderRadius:22,fontSize: tabs.length>2?13:14,fontWeight:'bold',fontFamily:WF.font,
        background:i===active?WF.dark:'transparent',color:i===active?'#fff':WF.text}}>
        {t}
      </div>
    ))}
  </div>
);

const WireCheckbox = ({label,checked}) => (
  <div style={{display:'flex',alignItems:'center',gap:10,fontSize:14,fontFamily:WF.font}}>
    <div style={{width:18,height:18,borderRadius:3,border:`1.5px solid ${WF.border}`,display:'flex',alignItems:'center',justifyContent:'center',background:checked?WF.dark:'#fff',flexShrink:0}}>
      {checked && <svg width="10" height="10" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>}
    </div>
    <span>{label}</span>
  </div>
);

const Divider = ({style}) => <div style={{borderTop:'1px solid #ddd',...style}}></div>;

const WireLink = ({children,color=WF.red}) => (
  <span style={{color,textDecoration:'underline',cursor:'pointer',fontFamily:WF.font,fontSize:14}}>{children}</span>
);

const SystemPlaceholder = ({label,height=120}) => (
  <div style={{
    border:`2px dashed ${WF.border}`,borderRadius:12,padding:16,textAlign:'center',
    display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
    minHeight:height,background:'#f9f9f9',color:WF.sub,fontSize:13,fontFamily:WF.font,
    backgroundImage:'repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(0,0,0,0.03) 8px,rgba(0,0,0,0.03) 16px)',
  }}>
    <span style={{fontSize:10,textTransform:'uppercase',letterSpacing:1.5,marginBottom:6,fontWeight:'bold',color:'#aaa'}}>System UI</span>
    {label}
  </div>
);

const DesignNote = ({children}) => (
  <div style={{fontSize:11,fontFamily:WF.font,color:'#8d6e00',background:'#fffde7',border:'1px solid #ffe082',borderRadius:6,padding:'6px 10px',marginTop:10,lineHeight:1.4}}>
    <strong>Design note:</strong> {children}
  </div>
);

const NavBar = ({title}) => (
  <div style={{display:'flex',alignItems:'center',gap:8,padding:'4px 0 14px',borderBottom:'1px solid #eee',marginBottom:14}}>
    <BackArrow />
    <span style={{fontSize:17,fontWeight:'bold'}}>{title}</span>
  </div>
);

const Toast = ({children,icon}) => (
  <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 14px',borderRadius:10,background:'#e8f5e9',border:'1px solid #a5d6a7',fontSize:14,fontFamily:WF.font,color:WF.green}}>
    {icon}{children}
  </div>
);

const OrDivider = ({text='or'}) => (
  <div style={{display:'flex',alignItems:'center',gap:10,color:WF.sub,fontSize:13,margin:'2px 0'}}>
    <Divider style={{flex:1}}/><span>{text}</span><Divider style={{flex:1}}/>
  </div>
);

const TermsFooter = () => (
  <React.Fragment>
    <p style={{fontSize:11,color:WF.sub,textAlign:'center',lineHeight:1.5,margin:0}}>
      By continuing, I agree to the Terms of Use and Privacy Policy.
    </p>
    <Divider style={{margin:'4px 0'}}/>
    <p style={{fontSize:13,textAlign:'center',color:WF.sub,margin:0}}>
      Don't have an account? <WireLink>Create an Account</WireLink>
    </p>
  </React.Fragment>
);

Object.assign(window, {
  WF, PhoneFrame, StatusBar, HomeIndicator,
  KeyIcon, FaceIDIcon, CheckCircleIcon, WarningIcon, ShieldIcon, QRIcon,
  PhoneDeviceIcon, LaptopIcon, BackArrow, SpinnerDots, FaceIDFailIcon, KeyXIcon,
  Btn, Input, SegControl, WireCheckbox, Divider, WireLink, SystemPlaceholder,
  DesignNote, NavBar, Toast, OrDivider, TermsFooter,
});
