// ARCHIVE — original ideation; not the source of truth.
// See sign-in.html (live prototype) for current behavior.
//
// flow-components.jsx — Reusable flow diagram primitives

const FC = {
  font: "'Patrick Hand', cursive",
  text: '#2d2d2d',
  sub: '#777',
  types: {
    existing:  { bg: '#fff',     border: '#2d2d2d', badgeBg: '#2d2d2d', badgeText: '#fff' },
    gap:       { bg: '#fffde7',  border: '#e6a000', badgeBg: '#e6a000', badgeText: '#fff' },
    os:        { bg: '#eceff1',  border: '#546e7a', badgeBg: '#546e7a', badgeText: '#fff' },
    converge:  { bg: '#f3e5f5',  border: '#7b1fa2', badgeBg: '#7b1fa2', badgeText: '#fff' },
  },
};

/* ---- Legend ---- */
const Legend = () => (
  <div style={{display:'flex',flexWrap:'wrap',gap:16,padding:'12px 20px',background:'#f7f7f7',borderRadius:10,border:'1px solid #e0e0e0',fontSize:13,fontFamily:FC.font,marginBottom:24}}>
    <span style={{fontWeight:'bold',marginRight:4}}>Legend:</span>
    {[
      ['existing',  'Existing screen (wireframed)'],
      ['gap',       'Needs design'],
      ['os',        'OS / browser prompt'],
      ['converge',  'Shared / convergence point'],
    ].map(([type, label]) => {
      const t = FC.types[type];
      return (
        <div key={type} style={{display:'flex',alignItems:'center',gap:6}}>
          <div style={{width:14,height:14,borderRadius:3,background:t.bg,border:`2px solid ${t.border}`}}></div>
          <span>{label}</span>
        </div>
      );
    })}
    <div style={{display:'flex',alignItems:'center',gap:6}}>
      <div style={{width:14,height:0,borderTop:'2px dashed #bbb'}}></div>
      <span>Optional / conditional</span>
    </div>
  </div>
);

/* ---- Flow Node ---- */
const FlowNode = ({ type = 'existing', id, title, desc, annotation, wide }) => {
  const t = FC.types[type];
  const badges = {
    existing: id ? `Screen ${id}` : null,
    gap: 'NEEDS DESIGN',
    os: 'OS / BROWSER',
    converge: 'SHARED',
  };
  const bgPattern = type === 'os' ? {
    backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 6px,rgba(0,0,0,0.04) 6px,rgba(0,0,0,0.04) 12px)',
  } : {};

  return (
    <div style={{
      width: wide ? 210 : 172, minHeight: 70,
      background: t.bg, border: `2px solid ${t.border}`, borderRadius: 10,
      padding: '8px 10px', fontFamily: FC.font, position: 'relative',
      display: 'flex', flexDirection: 'column', gap: 3,
      boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
      flexShrink: 0, ...bgPattern,
    }}>
      {badges[type] && (
        <div style={{
          position:'absolute', top:-9, left:10,
          background: t.badgeBg, color: t.badgeText,
          fontSize: 9, fontWeight: 'bold', letterSpacing: 0.8,
          padding: '2px 7px', borderRadius: 4,
          textTransform: 'uppercase',
        }}>
          {badges[type]}
        </div>
      )}
      <div style={{fontWeight:'bold', fontSize:14, marginTop: 6, lineHeight:1.25}}>{title}</div>
      {desc && <div style={{fontSize:12, color:FC.sub, lineHeight:1.35}}>{desc}</div>}
      {annotation && (
        <div style={{
          fontSize:10, color:'#8d6e00', background:'#fff8e1',
          border:'1px solid #ffe082', borderRadius:4,
          padding:'3px 6px', marginTop:2, lineHeight:1.3,
        }}>
          ✎ {annotation}
        </div>
      )}
    </div>
  );
};

/* ---- Arrows ---- */
const FlowArrow = ({ label, dashed, down }) => {
  if (down) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'2px 0',alignSelf:'flex-start',marginLeft:50}}>
      <div style={{width:0,height:20,borderLeft: dashed ? '2px dashed #bbb' : '2px solid #999'}}></div>
      <span style={{fontSize:12,color: dashed?'#bbb':'#999',lineHeight:1}}>▼</span>
      {label && <div style={{fontSize:10,color:'#888',fontStyle:'italic',fontFamily:FC.font,marginTop:1}}>{label}</div>}
    </div>
  );
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',alignSelf:'center',minWidth:44,padding:'0 2px',flexShrink:0}}>
      {label && <div style={{fontSize:10,color:'#888',whiteSpace:'nowrap',fontStyle:'italic',fontFamily:FC.font,marginBottom:1}}>{label}</div>}
      <div style={{display:'flex',alignItems:'center',width:'100%'}}>
        <div style={{flex:1,height:0,borderTop: dashed ? '2px dashed #bbb' : '2px solid #999'}}></div>
        <span style={{fontSize:12,color: dashed?'#bbb':'#999',lineHeight:1}}>▶</span>
      </div>
    </div>
  );
};

/* ---- Flow Track (horizontal row of nodes + arrows) ---- */
const FlowTrack = ({ label, children, indent }) => (
  <div style={{marginLeft: indent ? 28 : 0, marginBottom:2}}>
    {label && (
      <div style={{fontSize:12,fontWeight:'bold',color:FC.sub,fontFamily:FC.font,marginBottom:6,textTransform:'uppercase',letterSpacing:1}}>
        {label}
      </div>
    )}
    <div style={{display:'flex',alignItems:'flex-start',gap:4,flexWrap:'wrap',rowGap:10}}>
      {children}
    </div>
  </div>
);

/* ---- Branch Indicator ---- */
const BranchFrom = ({ from, condition }) => (
  <div style={{display:'flex',alignItems:'center',gap:6,margin:'6px 0 4px 12px',color:'#888',fontSize:12,fontFamily:FC.font}}>
    <span style={{fontSize:16,lineHeight:1}}>↳</span>
    <span>From <strong style={{color:FC.text}}>{from}</strong>{condition ? `: ${condition}` : ''}</span>
  </div>
);

/* ---- Path Section ---- */
const PathSection = ({ title, subtitle, color = '#2d2d2d', children }) => (
  <div style={{
    border: `2px solid ${color}`, borderRadius: 14,
    marginBottom: 20, overflow: 'hidden',
    fontFamily: FC.font,
  }}>
    <div style={{background: color, padding:'10px 18px'}}>
      <h3 style={{margin:0, color:'#fff', fontSize:17, fontWeight:'bold'}}>{title}</h3>
      {subtitle && <div style={{color:'rgba(255,255,255,0.8)',fontSize:12,marginTop:2}}>{subtitle}</div>}
    </div>
    <div style={{padding:'18px 16px 14px',overflowX:'auto'}}>
      {children}
    </div>
  </div>
);

/* ---- Gap Summary Table ---- */
const GapTable = ({ items }) => (
  <table style={{width:'100%',borderCollapse:'collapse',fontFamily:FC.font,fontSize:13}}>
    <thead>
      <tr style={{borderBottom:'2px solid #2d2d2d',textAlign:'left'}}>
        <th style={{padding:'6px 10px',width:40}}>#</th>
        <th style={{padding:'6px 10px'}}>Screen</th>
        <th style={{padding:'6px 10px'}}>Path</th>
        <th style={{padding:'6px 10px'}}>Priority</th>
        <th style={{padding:'6px 10px',width:'35%'}}>Notes</th>
      </tr>
    </thead>
    <tbody>
      {items.map((item,i) => (
        <tr key={i} style={{borderBottom:'1px solid #e0e0e0',background: i%2===0?'#fafafa':'#fff'}}>
          <td style={{padding:'6px 10px',color:FC.sub}}>{i+1}</td>
          <td style={{padding:'6px 10px',fontWeight:'bold'}}>{item.screen}</td>
          <td style={{padding:'6px 10px'}}>{item.path}</td>
          <td style={{padding:'6px 10px'}}>
            <span style={{
              fontSize:11, fontWeight:'bold', padding:'2px 8px', borderRadius:4,
              background: item.priority === 'Critical' ? '#ffcdd2' : item.priority === 'High' ? '#ffe0b2' : '#e8f5e9',
              color: item.priority === 'Critical' ? '#b71c1c' : item.priority === 'High' ? '#e65100' : '#2e7d32',
            }}>{item.priority}</span>
          </td>
          <td style={{padding:'6px 10px',color:FC.sub,fontSize:12}}>{item.notes}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

/* ---- Annotation List ---- */
const AnnotationList = ({ items }) => (
  <div style={{display:'flex',flexDirection:'column',gap:8,fontFamily:FC.font}}>
    {items.map((item,i) => (
      <div key={i} style={{display:'flex',gap:10,padding:'8px 12px',background:'#fff8e1',border:'1px solid #ffe082',borderRadius:8,fontSize:13}}>
        <div style={{fontWeight:'bold',flexShrink:0,color:'#8d6e00'}}>Screen {item.id}</div>
        <div style={{color:'#5d4e00'}}>{item.note}</div>
      </div>
    ))}
  </div>
);

Object.assign(window, {
  FC, Legend, FlowNode, FlowArrow, FlowTrack, BranchFrom, PathSection,
  GapTable, AnnotationList,
});
