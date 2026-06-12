// ARCHIVE — original ideation; not the source of truth.
// See sign-in.html (live prototype) for current behavior.
//
// flow-app.jsx — Main app composing all flow diagram sections

const FlowApp = () => (
  <div style={{
    maxWidth: 1000, margin: '0 auto', padding: '24px 20px 60px',
    fontFamily: FC.font, color: FC.text,
  }}>
    {/* Header */}
    <div style={{marginBottom:24}}>
      <h1 style={{fontSize:28,margin:'0 0 4px'}}>Sign-In User Flow Diagram</h1>
      <p style={{color:FC.sub,fontSize:15,margin:'0 0 6px'}}>
        Passkey / Face ID integration — complete branching flow with gap analysis
      </p>
      <p style={{fontSize:12,color:FC.sub,margin:0}}>
        <a href="Passkey Wireframes.html" style={{color:'#1976d2'}}>← Back to wireframes</a>
        {' · '}17 existing screens · 21 gap screens identified · 6 annotations
      </p>
    </div>

    <Legend />

    <EntrySection />
    <PasswordSection />
    <OTPSection />
    <PasskeySignInSection />
    <PasskeyCreationSection />
    <PasskeyManagementSection />
    <SecurityDashboardSection />
    <GapInventorySection />
  </div>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<FlowApp />);
