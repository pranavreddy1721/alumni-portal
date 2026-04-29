import { useState, useEffect } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    API.get('/admin/stats').then((r) => setStats(r.data.stats)).catch(() => {});
  }, []);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) { toast.error('All fields required.'); return; }
    setCreating(true);
    try {
      await API.post('/admin/create-admin', newAdmin);
      toast.success('Admin created successfully!');
      setShowForm(false);
      setNewAdmin({ name: '', email: '', password: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to create admin.');
    } finally { setCreating(false); }
  };

  const roleColors = { student: '#2563eb', alumni: '#059669', teacher: '#7c3aed', admin: '#d97706', superadmin: '#dc2626' };
  const usersByRole = stats?.usersByRole || [];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: 0 }}>Super Admin — System Overview 🛡️</h1>
          <p style={{ color: '#64748b', marginTop: 6, fontSize: 14 }}>Full control over the Alumni Portal system.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          {showForm ? '✕ Cancel' : '+ Create Admin'}
        </button>
      </div>

      {/* Create Admin Form */}
      {showForm && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '2px solid #fca5a5', marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 20px', color: '#1e293b', fontSize: 16, fontWeight: 700 }}>🛡️ Create New Admin</h3>
          <form onSubmit={handleCreateAdmin}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
              {[{ key: 'name', label: 'Full Name', placeholder: 'Admin Name', type: 'text' }, { key: 'email', label: 'Email', placeholder: 'admin@college.edu', type: 'email' }, { key: 'password', label: 'Password', placeholder: 'Min 8 chars', type: 'password' }].map((f) => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{f.label}</label>
                  <input type={f.type} value={newAdmin[f.key]} onChange={(e) => setNewAdmin({ ...newAdmin, [f.key]: e.target.value })} placeholder={f.placeholder}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <button type="submit" disabled={creating} style={{ padding: '10px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', height: 42 }}>
                {creating ? '...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { emoji: '👥', label: 'Total Users', value: stats?.totalUsers || 0, color: '#2563eb' },
          { emoji: '💼', label: 'Active Jobs', value: stats?.totalJobs || 0, color: '#059669' },
          { emoji: '📅', label: 'Total Events', value: stats?.totalEvents || 0, color: '#7c3aed' },
          { emoji: '⏳', label: 'Pending Alumni', value: stats?.pendingAlumni || 0, color: '#d97706' },
        ].map((s) => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 12 }}>{s.emoji}</div>
            <p style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Users by Role */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 20px' }}>📊 Users by Role</h2>
          {usersByRole.map((r) => {
            const color = roleColors[r._id] || '#64748b';
            const max = Math.max(...usersByRole.map((x) => x.count), 1);
            return (
              <div key={r._id} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', textTransform: 'capitalize' }}>{r._id}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{r.count}</span>
                </div>
                <div style={{ height: 8, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(r.count / max) * 100}%`, background: color, borderRadius: 999, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* System Health */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 20px' }}>🔧 System Health</h2>
          {[
            { name: 'MongoDB Atlas', used: '92 MB / 512 MB', status: 'Healthy', pct: 18, color: '#059669' },
            { name: 'Cloudinary Storage', used: '3.6 GB / 25 GB', status: 'Healthy', pct: 14, color: '#059669' },
            { name: 'Firebase Firestore', used: '125 MB / 1 GB', status: 'Healthy', pct: 12, color: '#059669' },
            { name: 'Render Backend', used: '720 / 750 hrs', status: 'Warning', pct: 96, color: '#d97706' },
          ].map((s) => (
            <div key={s.name} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{s.name}</span>
                  <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 8 }}>{s.used}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: `${s.color}15`, padding: '2px 8px', borderRadius: 999 }}>{s.status}</span>
              </div>
              <div style={{ height: 6, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${s.pct}%`, background: s.color, borderRadius: 999 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
