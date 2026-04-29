import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

const StatCard = ({ emoji, label, value, color }) => (
  <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 12 }}>{emoji}</div>
    <p style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', margin: 0 }}>{value}</p>
    <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{label}</p>
  </div>
);

export default function AlumniDashboard() {
  const { user } = useAuth();
  const [myJobs, setMyJobs] = useState([]);

  useEffect(() => {
    API.get('/jobs?limit=5').then((r) => setMyJobs(r.data.jobs?.filter((j) => j.postedBy?._id === user?.id) || [])).catch(() => {});
  }, [user]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: 0 }}>Welcome, {user?.name?.split(' ')[0]}! 🎓</h1>
        <p style={{ color: '#64748b', marginTop: 6, fontSize: 14 }}>Make an impact — mentor students and share opportunities.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard emoji="👨‍🎓" label="Students Helped" value="28" color="#059669" />
        <StatCard emoji="💼" label="Jobs Posted" value={myJobs.length} color="#2563eb" />
        <StatCard emoji="💬" label="Messages" value="14" color="#7c3aed" />
        <StatCard emoji="⭐" label="Mentorship Requests" value="5" color="#d97706" />
      </div>

      {/* My Posted Jobs */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 16px' }}>💼 My Posted Jobs</h2>
        {myJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <p style={{ color: '#94a3b8', fontSize: 14 }}>You haven't posted any jobs yet.</p>
            <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Go to Jobs tab to post your first referral!</p>
          </div>
        ) : myJobs.map((job) => (
          <div key={job._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <p style={{ fontWeight: 600, color: '#1e293b', fontSize: 14, margin: 0 }}>{job.title}</p>
              <p style={{ color: '#64748b', fontSize: 12, margin: '2px 0 0' }}>{job.company} · {job.applicants?.length || 0} applicants</p>
            </div>
            <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>Active</span>
          </div>
        ))}
      </div>

      {/* Student Requests */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 16px' }}>🤝 Mentorship Requests</h2>
        {['Ananya Singh', 'Ravi Kumar', 'Preet Kaur'].map((name, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#2563eb', flexShrink: 0 }}>
              {name[0]}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, color: '#1e293b', fontSize: 14, margin: 0 }}>{name}</p>
              <p style={{ color: '#64748b', fontSize: 12, margin: '2px 0 0' }}>Requesting mentorship · {i + 1}d ago</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ padding: '6px 14px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Accept</button>
              <button style={{ padding: '6px 14px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Decline</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
