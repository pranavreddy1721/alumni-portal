import { useAuth } from '../context/AuthContext';

const NAV = {
  student:    [
    { id:'dashboard', label:'Dashboard',      icon:'🏠' },
    { id:'alumni',    label:'Find Alumni',     icon:'🎓' },
    { id:'teachers',  label:'Our Teachers',    icon:'👨‍🏫' },
    { id:'jobs',      label:'Jobs & Referrals',icon:'💼' },
    { id:'events',    label:'Events',          icon:'📅' },
    { id:'chat',      label:'Messages',        icon:'💬' },
    { id:'profile',   label:'My Profile',      icon:'👤' },
  ],
  alumni:     [
    { id:'dashboard', label:'Dashboard',       icon:'🏠' },
    { id:'students',  label:'Students',        icon:'👨‍🎓' },
    { id:'teachers',  label:'Teachers',        icon:'👨‍🏫' },
    { id:'jobs',      label:'Post Jobs',       icon:'💼' },
    { id:'events',    label:'Events',          icon:'📅' },
    { id:'chat',      label:'Messages',        icon:'💬' },
    { id:'profile',   label:'My Profile',      icon:'👤' },
  ],
  teacher:    [
    { id:'dashboard', label:'Dashboard',       icon:'🏠' },
    { id:'students',  label:'Students',        icon:'👨‍🎓' },
    { id:'alumni',    label:'Alumni Network',  icon:'🎓' },
    { id:'events',    label:'Events',          icon:'📅' },
    { id:'chat',      label:'Messages',        icon:'💬' },
    { id:'profile',   label:'My Profile',      icon:'👤' },
  ],
  admin:      [
    { id:'dashboard', label:'Dashboard',       icon:'🏠' },
    { id:'users',     label:'Manage Users',    icon:'👥' },
    { id:'approvals', label:'Approvals',       icon:'✅', badge:true },
    { id:'jobs',      label:'Jobs',            icon:'💼' },
    { id:'events',    label:'Events',          icon:'📅' },
  ],
  superadmin: [
    { id:'dashboard', label:'Overview',        icon:'🏠' },
    { id:'users',     label:'All Users',       icon:'👥' },
    { id:'admins',    label:'Admins',          icon:'🛡️' },
    { id:'analytics', label:'Analytics',       icon:'📊' },
    { id:'settings',  label:'System',          icon:'⚙️' },
  ],
};

const COLORS = {
  student:'#2563eb', alumni:'#059669', teacher:'#7c3aed',
  admin:'#d97706',   superadmin:'#dc2626',
};
const LABELS = {
  student:'Student Portal', alumni:'Alumni Portal', teacher:'Teacher Portal',
  admin:'Admin Panel',      superadmin:'Super Admin',
};

export default function Sidebar({ activeTab, setActiveTab, pendingCount=0, collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const items  = NAV[user?.role] || NAV.student;
  const color  = COLORS[user?.role] || '#2563eb';

  const handleTab = (id) => {
    setActiveTab(id);
    setMobileOpen?.(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen?.(false)}
      />

      <div style={{
        width: collapsed ? 64 : 240,
        minWidth: collapsed ? 64 : 240,
        height: '100vh',
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease, min-width 0.25s ease',
        flexShrink: 0,
        overflow: 'hidden',
        position: 'relative',
        zIndex: 50,
      }}
        className={`sidebar-mobile-hidden ${mobileOpen ? 'sidebar-mobile-open' : ''}`}
        style={{
          width: collapsed ? 64 : 240,
          minWidth: collapsed ? 64 : 240,
          height: '100vh',
          background: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.25s ease',
          flexShrink: 0,
          overflow: 'hidden',
          zIndex: 50,
        }}
      >
        {/* Header */}
        <div style={{
          padding: collapsed ? '16px 8px' : '18px 16px',
          background: `linear-gradient(135deg, ${color}, ${color}dd)`,
          display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>🎓</div>
          {!collapsed && (
            <div style={{ overflow:'hidden' }}>
              <div style={{ color:'#fff', fontWeight:800, fontSize:13, lineHeight:1.2, whiteSpace:'nowrap' }}>Alumni Portal</div>
              <div style={{ color:'rgba(255,255,255,0.75)', fontSize:11, whiteSpace:'nowrap' }}>{LABELS[user?.role]}</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'10px 8px', overflowY:'auto', overflowX:'hidden' }}>
          {items.map(item => {
            const active = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => handleTab(item.id)} style={{
                width:'100%', display:'flex', alignItems:'center',
                gap:10, padding:'10px 12px', borderRadius:12,
                border:'none', cursor:'pointer',
                background: active ? `${color}18` : 'transparent',
                color: active ? color : '#64748b',
                fontWeight: active ? 700 : 500,
                fontSize:14, textAlign:'left',
                marginBottom:2, transition:'all 0.15s',
                whiteSpace:'nowrap', overflow:'hidden',
              }}
                onMouseEnter={e => { if(!active) e.currentTarget.style.background='#f1f5f9'; }}
                onMouseLeave={e => { if(!active) e.currentTarget.style.background='transparent'; }}
              >
                <span style={{ fontSize:18, flexShrink:0 }}>{item.icon}</span>
                {!collapsed && <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis' }}>{item.label}</span>}
                {!collapsed && item.badge && pendingCount > 0 && (
                  <span style={{ background:'#ef4444', color:'#fff', borderRadius:999, fontSize:11, padding:'1px 7px', fontWeight:700 }}>{pendingCount}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding:'8px', borderTop:'1px solid #e2e8f0', flexShrink:0 }}>
          <button onClick={() => setCollapsed(!collapsed)} style={{
            width:'100%', display:'flex', alignItems:'center', gap:10,
            padding:'9px 12px', borderRadius:12, border:'none',
            cursor:'pointer', background:'transparent', color:'#64748b',
            fontSize:14, fontWeight:500, marginBottom:2,
          }}
            onMouseEnter={e => e.currentTarget.style.background='#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}
          >
            <span style={{ fontSize:18 }}>{collapsed ? '→' : '←'}</span>
            {!collapsed && <span>Collapse</span>}
          </button>
          <button onClick={logout} style={{
            width:'100%', display:'flex', alignItems:'center', gap:10,
            padding:'9px 12px', borderRadius:12, border:'none',
            cursor:'pointer', background:'transparent', color:'#ef4444',
            fontSize:14, fontWeight:500,
          }}
            onMouseEnter={e => e.currentTarget.style.background='#fef2f2'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}
          >
            <span style={{ fontSize:18 }}>🚪</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
}
