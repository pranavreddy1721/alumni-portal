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

export default function StudentDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    API.get('/jobs?limit=4').then((r) => setJobs(r.data.jobs || [])).catch(() => {});
    API.get('/events?limit=3&upcoming=true').then((r) => setEvents(r.data.events || [])).catch(() => {});
  }, []);

  return (
    <div style={{ padding: 24 }}>
      {/* Welcome */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: 0 }}>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p style={{ color: '#64748b', marginTop: 6, fontSize: 14 }}>Here's what's happening in your portal today.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard emoji="👥" label="Alumni Connected" value="12" color="#2563eb" />
        <StatCard emoji="💼" label="Jobs Applied" value="5" color="#059669" />
        <StatCard emoji="📅" label="Events Joined" value="3" color="#7c3aed" />
        <StatCard emoji="💬" label="New Messages" value="8" color="#d97706" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Latest Jobs */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 16px' }}>💼 Latest Jobs</h2>
          {jobs.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 13 }}>No jobs yet. Check back soon!</p>
          ) : jobs.map((job) => (
            <div key={job._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <p style={{ fontWeight: 600, color: '#1e293b', fontSize: 14, margin: 0 }}>{job.title}</p>
                <p style={{ color: '#64748b', fontSize: 12, margin: '2px 0 0' }}>{job.company} · {job.location}</p>
              </div>
              <span style={{ background: job.type === 'internship' ? '#fffbeb' : '#eff6ff', color: job.type === 'internship' ? '#d97706' : '#2563eb', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999 }}>
                {job.type}
              </span>
            </div>
          ))}
        </div>

        {/* Upcoming Events */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 16px' }}>📅 Upcoming Events</h2>
          {events.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 13 }}>No upcoming events.</p>
          ) : events.map((ev) => (
            <div key={ev._id} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <p style={{ fontWeight: 600, color: '#1e293b', fontSize: 14, margin: 0 }}>{ev.title}</p>
              <p style={{ color: '#64748b', fontSize: 12, margin: '2px 0 0' }}>📍 {ev.venue} · {new Date(ev.date).toLocaleDateString('en-IN')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
