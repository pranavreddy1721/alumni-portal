import { useState, useEffect } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';

const StatCard = ({ emoji, label, value, color, badge }) => (
  <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'relative' }}>
    {badge > 0 && <span style={{ position: 'absolute', top: 12, right: 12, background: '#ef4444', color: '#fff', borderRadius: 999, fontSize: 11, padding: '2px 8px', fontWeight: 700 }}>{badge}</span>}
    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 12 }}>{emoji}</div>
    <p style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', margin: 0 }}>{value}</p>
    <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{label}</p>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/admin/stats'),
      API.get('/admin/pending-alumni'),
    ]).then(([s, p]) => {
      setStats(s.data.stats);
      setPending(p.data.users);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id, approve) => {
    try {
      await API.put(`/admin/users/${id}/approve`, { isApproved: approve });
      toast.success(approve ? 'Alumni approved! ✅' : 'Alumni rejected.');
      setPending((prev) => prev.filter((u) => u._id !== id));
      setStats((prev) => prev ? { ...prev, pendingAlumni: prev.pendingAlumni - 1 } : prev);
    } catch (err) {
      toast.error(err.message || 'Action failed.');
    }
  };

  if (loading) return <div style={{ padding: 24, color: '#64748b' }}>Loading dashboard...</div>;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: 0 }}>Admin Dashboard 🛡️</h1>
        <p style={{ color: '#64748b', marginTop: 6, fontSize: 14 }}>Manage your alumni portal.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard emoji="👥" label="Total Users" value={stats?.totalUsers || 0} color="#2563eb" />
        <StatCard emoji="⏳" label="Pending Approvals" value={stats?.pendingAlumni || 0} color="#d97706" badge={stats?.pendingAlumni} />
        <StatCard emoji="💼" label="Active Jobs" value={stats?.totalJobs || 0} color="#059669" />
        <StatCard emoji="📅" label="Total Events" value={stats?.totalEvents || 0} color="#7c3aed" />
      </div>

      {/* Pending Alumni */}
      {pending.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1.5px solid #fed7aa', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            ⏳ Pending Alumni Approvals
            <span style={{ background: '#ef4444', color: '#fff', borderRadius: 999, fontSize: 12, padding: '2px 8px', fontWeight: 700 }}>{pending.length}</span>
          </h2>
          {pending.map((u) => (
            <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px', background: '#fffbeb', borderRadius: 12, border: '1px solid #fde68a', marginBottom: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#d97706', flexShrink: 0, fontSize: 16 }}>{u.name[0]}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, color: '#1e293b', fontSize: 14, margin: 0 }}>{u.name}</p>
                <p style={{ color: '#64748b', fontSize: 12, margin: '2px 0 0' }}>{u.email} · Registered {new Date(u.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleApprove(u._id, true)} style={{ padding: '8px 16px', background: '#059669', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>✅ Approve</button>
                <button onClick={() => handleApprove(u._id, false)} style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>❌ Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Users */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 16px' }}>👥 Recent Users</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                {['Name', 'Role', 'Verified', 'Status', 'Joined'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#64748b', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(stats?.recentUsers || []).map((u) => (
                <tr key={u._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#2563eb', fontSize: 13 }}>{u.name[0]}</div>
                      <div>
                        <p style={{ fontWeight: 600, color: '#1e293b', margin: 0 }}>{u.name}</p>
                        <p style={{ color: '#94a3b8', fontSize: 11, margin: 0 }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}><span style={{ background: '#eff6ff', color: '#2563eb', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, textTransform: 'capitalize' }}>{u.role}</span></td>
                  <td style={{ padding: '12px' }}><span style={{ fontSize: 16 }}>{u.isEmailVerified ? '✅' : '❌'}</span></td>
                  <td style={{ padding: '12px' }}><span style={{ background: u.isApproved ? '#dcfce7' : '#fef9c3', color: u.isApproved ? '#16a34a' : '#ca8a04', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>{u.isApproved ? 'Active' : 'Pending'}</span></td>
                  <td style={{ padding: '12px', color: '#64748b', fontSize: 12 }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
