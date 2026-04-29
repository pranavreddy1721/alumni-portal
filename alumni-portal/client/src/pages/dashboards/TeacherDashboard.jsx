import { useAuth } from '../../context/AuthContext';

const StatCard = ({ emoji, label, value, color }) => (
  <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 12 }}>{emoji}</div>
    <p style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', margin: 0 }}>{value}</p>
    <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{label}</p>
  </div>
);

const topStudents = [
  { name: 'Ravi Sharma', cgpa: '9.2', dept: 'Computer Science' },
  { name: 'Priya Nair', cgpa: '8.9', dept: 'Information Tech' },
  { name: 'Ankit Jain', cgpa: '8.7', dept: 'Computer Science' },
  { name: 'Sneha Patel', cgpa: '8.5', dept: 'Electronics' },
];

export default function TeacherDashboard() {
  const { user } = useAuth();

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: 0 }}>Welcome, {user?.name?.split(' ')[0]}! 👨‍🏫</h1>
        <p style={{ color: '#64748b', marginTop: 6, fontSize: 14 }}>Guide students and connect them with the alumni network.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard emoji="👨‍🎓" label="My Students" value="145" color="#7c3aed" />
        <StatCard emoji="🎓" label="Alumni Network" value="320" color="#2563eb" />
        <StatCard emoji="📅" label="Events Created" value="5" color="#059669" />
        <StatCard emoji="⭐" label="Recommendations" value="32" color="#d97706" />
      </div>

      {/* Top Students */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 16px' }}>⭐ Top Students to Recommend</h2>
        {topStudents.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#7c3aed', flexShrink: 0 }}>{s.name[0]}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, color: '#1e293b', fontSize: 14, margin: 0 }}>{s.name}</p>
              <p style={{ color: '#64748b', fontSize: 12, margin: '2px 0 0' }}>{s.dept} · CGPA {s.cgpa}</p>
            </div>
            <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999 }}>CGPA {s.cgpa}</span>
            <button style={{ padding: '6px 14px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Recommend</button>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 16px' }}>⚡ Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {[{ label: 'Create Event', emoji: '📅', color: '#7c3aed' }, { label: 'Browse Alumni', emoji: '👥', color: '#2563eb' }, { label: 'Send Message', emoji: '💬', color: '#059669' }].map((a) => (
            <button key={a.label} style={{ padding: '14px', background: `${a.color}10`, border: `1.5px solid ${a.color}30`, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, color: a.color, fontSize: 14 }}>
              <span style={{ fontSize: 20 }}>{a.emoji}</span>{a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
