import { useAuth } from '../context/AuthContext';

const NAV = {
  student:    [{ id: 'dashboard', label: 'Dashboard', icon: '🏠' }, { id: 'alumni', label: 'Find Alumni', icon: '👥' }, { id: 'jobs', label: 'Jobs & Referrals', icon: '💼' }, { id: 'events', label: 'Events', icon: '📅' }, { id: 'chat', label: 'Messages', icon: '💬' }, { id: 'profile', label: 'My Profile', icon: '👤' }],
  alumni:     [{ id: 'dashboard', label: 'Dashboard', icon: '🏠' }, { id: 'jobs', label: 'Post Jobs', icon: '💼' }, { id: 'events', label: 'Events', icon: '📅' }, { id: 'chat', label: 'Messages', icon: '💬' }, { id: 'profile', label: 'My Profile', icon: '👤' }],
  teacher:    [{ id: 'dashboard', label: 'Dashboard', icon: '🏠' }, { id: 'alumni', label: 'Alumni Network', icon: '👥' }, { id: 'events', label: 'Events', icon: '📅' }, { id: 'chat', label: 'Messages', icon: '💬' }, { id: 'profile', label: 'My Profile', icon: '👤' }],
  admin:      [{ id: 'dashboard', label: 'Dashboard', icon: '🏠' }, { id: 'users', label: 'Manage Users', icon: '👥' }, { id: 'approvals', label: 'Approvals', icon: '✅', badge: true }, { id: 'jobs', label: 'Jobs', icon: '💼' }, { id: 'events', label: 'Events', icon: '📅' }],
  superadmin: [{ id: 'dashboard', label: 'Overview', icon: '🏠' }, { id: 'users', label: 'All Users', icon: '👥' }, { id: 'admins', label: 'Admins', icon: '🛡️' }, { id: 'analytics', label: 'Analytics', icon: '📊' }, { id: 'settings', label: 'System', icon: '⚙️' }],
};

const ROLE_COLORS = {
  student: '#2563eb', alumni: '#059669', teacher: '#7c3aed', admin: '#d97706', superadmin: '#dc2626',
};

const ROLE_LABELS = {
  student: 'Student Portal', alumni: 'Alumni Portal', teacher: 'Teacher Portal', admin: 'Admin Panel', superadmin: 'Super Admin',
};

export default function Sidebar({ activeTab, setActiveTab, pendingCount = 0, collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const items = NAV[user?.role] || NAV.student;
  const color = ROLE_COLORS[user?.role] || '#2563eb';

  const s = {
    sidebar: {
      width: collapsed ? 64 : 240,
      height: '100vh',
      background: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.25s ease',
      flexShrink: 0,
      overflow: 'hidden',
    },
    header: {
      padding: collapsed ? '16px 8px' : '20px 16px',
      background: `linear-gradient(135deg, ${color}, ${color}cc)`,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexShrink: 0,
    },
    logo: {
      width: 36, height: 36, borderRadius: 10,
      background: 'rgba(255,255,255,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 18, flexShrink: 0,
    },
    nav: { flex: 1, padding: '12px 8px', overflowY: 'auto' },
    item: (active) => ({
      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 12px', borderRadius: 12, border: 'none', cursor: 'pointer',
      background: active ? `${color}15` : 'transparent',
      color: active ? color : '#64748b',
      fontWeight: active ? 700 : 500,
      fontSize: 14, textAlign: 'left',
      transition: 'all 0.15s',
      marginBottom: 2,
    }),
    bottom: { padding: '8px', borderTop: '1px solid #e2e8f0', flexShrink: 0 },
  };

  return (
    <div style={s.sidebar}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.logo}>🎓</div>
        {!collapsed && (
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>Alumni Portal</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>{ROLE_LABELS[user?.role]}</div>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav style={s.nav}>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={s.item(activeTab === item.id)}
            onMouseEnter={(e) => { if (activeTab !== item.id) e.currentTarget.style.background = '#f1f5f9'; }}
            onMouseLeave={(e) => { if (activeTab !== item.id) e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
            {!collapsed && (
              <>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && pendingCount > 0 && (
                  <span style={{ background: '#ef4444', color: '#fff', borderRadius: 999, fontSize: 11, padding: '2px 7px', fontWeight: 700 }}>
                    {pendingCount}
                  </span>
                )}
              </>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div style={s.bottom}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={s.item(false)}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <span style={{ fontSize: 18 }}>{collapsed ? '→' : '←'}</span>
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          onClick={logout}
          style={{ ...s.item(false), color: '#ef4444' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <span style={{ fontSize: 18 }}>🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
