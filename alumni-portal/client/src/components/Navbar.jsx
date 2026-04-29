import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ROLE_COLORS = {
  student: '#2563eb', alumni: '#059669', teacher: '#7c3aed', admin: '#d97706', superadmin: '#dc2626',
};

const Avatar = ({ name, size = 36 }) => {
  const colors = ['#4f46e5', '#7c3aed', '#db2777', '#059669', '#d97706', '#dc2626', '#2563eb'];
  const bg = colors[(name || '').charCodeAt(0) % colors.length];
  const initials = (name || 'U').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.35, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
};

export default function Navbar({ onSearch }) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const color = ROLE_COLORS[user?.role] || '#2563eb';

  return (
    <div style={{
      height: 64, background: '#fff', borderBottom: '1px solid #e2e8f0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', flexShrink: 0, gap: 16,
    }}>
      {/* Search */}
      <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 16 }}>🔍</span>
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); onSearch?.(e.target.value); }}
          placeholder="Search alumni, jobs, events..."
          style={{
            width: '100%', padding: '9px 12px 9px 36px', borderRadius: 12,
            border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: 14,
            color: '#374151', outline: 'none',
          }}
        />
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Notification bell */}
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, position: 'relative' }}>
          🔔
          <span style={{
            position: 'absolute', top: -2, right: -2, width: 8, height: 8,
            background: '#ef4444', borderRadius: '50%', border: '2px solid #fff',
          }} />
        </button>

        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={user?.name} size={36} />
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{user?.name}</div>
            <div style={{
              fontSize: 11, color: color, fontWeight: 600, textTransform: 'capitalize',
              background: `${color}15`, padding: '1px 8px', borderRadius: 999,
            }}>
              {user?.role}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Avatar };
