// ARCHIVE — original ideation; not the source of truth.
// See sign-in.html (live prototype) for current behavior.
//
// wireframe-kit-ext.jsx — Additional components for gap screens

/* ---- Additional Icons ---- */
const LockIcon = ({size=48,color=WF.dark}) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="10" y="22" width="28" height="20" rx="4"/><path d="M16 22v-6a8 8 0 0116 0v6"/>
    <circle cx="24" cy="33" r="2" fill={color} stroke="none"/>
    <line x1="24" y1="35" x2="24" y2="38"/>
  </svg>
);

const EnvelopeIcon = ({size=48,color=WF.dark}) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="10" width="40" height="28" rx="4"/><polyline points="4,14 24,28 44,14"/>
  </svg>
);

const ClockIcon = ({size=48,color=WF.dark}) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
    <circle cx="24" cy="24" r="20"/><polyline points="24,12 24,24 32,28"/>
  </svg>
);

const QRFailIcon = ({size=48,color='#e65100'}) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke={color} strokeWidth="2"/>
    <rect x="8" y="8" width="8" height="8" rx="1" fill={color}/>
    <rect x="28" y="4" width="16" height="16" rx="2" fill="none" stroke={color} strokeWidth="2"/>
    <rect x="32" y="8" width="8" height="8" rx="1" fill={color}/>
    <rect x="4" y="28" width="16" height="16" rx="2" fill="none" stroke={color} strokeWidth="2"/>
    <rect x="8" y="32" width="8" height="8" rx="1" fill={color}/>
    <line x1="30" y1="30" x2="42" y2="42" stroke={color} strokeWidth="3" strokeLinecap="round"/>
    <line x1="42" y1="30" x2="30" y2="42" stroke={color} strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const ActivityIcon = ({size=20,color=WF.dark}) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
    <circle cx="10" cy="10" r="8"/><polyline points="10,5 10,10 13,12"/>
  </svg>
);

/* ---- Error Input ---- */
const InputError = ({placeholder,value,error}) => (
  <div>
    <div style={{fontFamily:WF.font,fontSize:16,padding:'13px 16px',borderRadius:8,border:'2px solid #e53935',background:'#fff5f5',color:value?WF.text:WF.sub,boxSizing:'border-box'}}>
      {value||placeholder}
    </div>
    {error && <div style={{fontSize:12,color:'#e53935',marginTop:4,fontFamily:WF.font}}>{error}</div>}
  </div>
);

/* ---- Strength Bar ---- */
const StrengthBar = ({level=2}) => {
  const colors = ['#e53935','#fb8c00','#fdd835','#66bb6a'];
  const labels = ['Weak','Fair','Good','Strong'];
  return (
    <div style={{display:'flex',alignItems:'center',gap:8,marginTop:4}}>
      <div style={{display:'flex',gap:3,flex:1}}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{flex:1,height:4,borderRadius:2,background:i<=level?colors[level]:'#e0e0e0'}}></div>
        ))}
      </div>
      <span style={{fontSize:11,color:colors[level],fontWeight:'bold',fontFamily:WF.font}}>{labels[level]}</span>
    </div>
  );
};

/* ---- Radio Option ---- */
const RadioOption = ({label,sublabel,selected,icon}) => (
  <div style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',borderRadius:10,border:`2px solid ${selected?WF.dark:WF.border}`,background:selected?'#f5f5f5':WF.bg,cursor:'pointer'}}>
    <div style={{width:20,height:20,borderRadius:10,border:`2px solid ${selected?WF.dark:WF.border}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
      {selected && <div style={{width:10,height:10,borderRadius:5,background:WF.dark}}></div>}
    </div>
    {icon && <span>{icon}</span>}
    <div>
      <div style={{fontWeight:'bold',fontSize:15,fontFamily:WF.font}}>{label}</div>
      {sublabel && <div style={{fontSize:12,color:WF.sub,fontFamily:WF.font}}>{sublabel}</div>}
    </div>
  </div>
);

/* ---- OS Screen Frame (Not Designed) ---- */
const OSScreenFrame = ({icon,title,desc}) => (
  <div style={{width:'100%',height:'100%',background:'#e8eaf6',fontFamily:WF.font,color:'#37474f',display:'flex',flexDirection:'column',boxSizing:'border-box',
    backgroundImage:'repeating-linear-gradient(45deg,transparent,transparent 10px,rgba(84,110,122,0.06) 10px,rgba(84,110,122,0.06) 20px)'}}>
    <StatusBar/>
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'0 28px',textAlign:'center'}}>
      <div style={{background:'#546e7a',color:'#fff',padding:'5px 14px',borderRadius:6,fontSize:10,fontWeight:'bold',letterSpacing:1.2,textTransform:'uppercase',marginBottom:6}}>
        OS / Browser Prompt
      </div>
      <div style={{fontSize:11,color:'#78909c',fontWeight:'bold',letterSpacing:0.8,textTransform:'uppercase',marginBottom:20}}>
        Not designed by product team
      </div>
      <div style={{border:'2px dashed #90a4ae',borderRadius:16,padding:'24px 20px',width:'100%',background:'rgba(255,255,255,0.5)'}}>
        {icon}
        <h3 style={{margin:'12px 0 6px',fontSize:18,color:'#37474f'}}>{title}</h3>
        <p style={{fontSize:13,color:'#78909c',lineHeight:1.5,margin:0}}>{desc}</p>
      </div>
    </div>
    <HomeIndicator/>
  </div>
);

/* ---- Timer Badge ---- */
const TimerBadge = ({time='14:32'}) => (
  <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'6px 14px',borderRadius:20,background:'#fff3e0',border:'1px solid #ffcc02',fontSize:14,fontWeight:'bold',fontFamily:WF.font,color:'#e65100'}}>
    <ClockIcon size={16} color="#e65100"/> {time}
  </div>
);

/* ---- Activity Row ---- */
const ActivityRow = ({method,device,date,location}) => (
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #eee'}}>
    <div>
      <div style={{fontWeight:'bold',fontSize:14}}>{method}</div>
      <div style={{fontSize:11,color:WF.sub}}>{device}</div>
    </div>
    <div style={{textAlign:'right'}}>
      <div style={{fontSize:12,color:WF.sub}}>{date}</div>
      <div style={{fontSize:11,color:WF.sub}}>{location}</div>
    </div>
  </div>
);

/* ---- Device Card ---- */
const DeviceCard = ({name,icon,lastActive,location,current}) => (
  <div style={{border:`1.5px solid ${current?WF.dark:WF.border}`,borderRadius:10,padding:'12px 14px',marginBottom:10}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
      <div style={{display:'flex',gap:10,alignItems:'center'}}>
        {icon}
        <div>
          <div style={{fontWeight:'bold',fontSize:14}}>
            {name} {current && <span style={{fontSize:10,background:WF.dark,color:'#fff',padding:'1px 6px',borderRadius:4,marginLeft:4}}>This device</span>}
          </div>
          <div style={{fontSize:11,color:WF.sub}}>Last active {lastActive} · {location}</div>
        </div>
      </div>
    </div>
    {!current && (
      <div style={{marginTop:8}}><WireLink color={WF.red}>Sign out</WireLink></div>
    )}
  </div>
);

Object.assign(window, {
  LockIcon, EnvelopeIcon, ClockIcon, QRFailIcon, ActivityIcon,
  InputError, StrengthBar, RadioOption, OSScreenFrame, TimerBadge,
  ActivityRow, DeviceCard,
});
