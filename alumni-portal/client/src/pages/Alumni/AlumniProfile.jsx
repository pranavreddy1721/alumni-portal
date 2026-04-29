import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';

export default function AlumniProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/profiles/${id}`)
      .then((r) => setProfile(r.data.profile))
      .catch(() => toast.error('Profile not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading profile...</div>;
  if (!profile) return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Profile not found.</div>;

  const user = profile.userId;

  const colors = ['#4f46e5','#7c3aed','#db2777','#059669','#d97706'];
  const avatarColor = colors[(user?.name || '').charCodeAt(0) % colors.length];
  const initials = (user?.name || 'U').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
        ← Back to Search
      </button>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', borderRadius: 20, padding: 32, marginBottom: 20, color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800, border: '4px solid rgba(255,255,255,0.3)', flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>{user?.name}</h1>
            <p style={{ margin: '4px 0 0', opacity: 0.85, fontSize: 15 }}>{profile.designation || 'Alumni'} {profile.company ? `@ ${profile.company}` : ''}</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
              {profile.batch && <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>🎓 Batch {profile.batch}</span>}
              {profile.experience > 0 && <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>⏱ {profile.experience}y exp</span>}
              {profile.location && <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>📍 {profile.location}</span>}
              {profile.isAvailableForMentorship && <span style={{ background: '#bbf7d0', color: '#065f46', padding: '3px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>✓ Available for Mentorship</span>}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Bio */}
        {profile.bio && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', gridColumn: '1 / -1' }}>
            <h3 style={{ margin: '0 0 10px', color: '#1e293b', fontSize: 15, fontWeight: 700 }}>📝 About</h3>
            <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{profile.bio}</p>
          </div>
        )}

        {/* Skills */}
        {profile.skills?.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 12px', color: '#1e293b', fontSize: 15, fontWeight: 700 }}>🛠 Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {profile.skills.map((s) => (
                <span key={s} style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '5px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {profile.achievements?.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 12px', color: '#1e293b', fontSize: 15, fontWeight: 700 }}>🏆 Achievements</h3>
            {profile.achievements.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <span style={{ color: '#f59e0b', flexShrink: 0 }}>⭐</span>
                <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{a}</p>
              </div>
            ))}
          </div>
        )}

        {/* Links */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 12px', color: '#1e293b', fontSize: 15, fontWeight: 700 }}>🔗 Links</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {profile.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0a66c2', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                💼 LinkedIn Profile
              </a>
            )}
            {profile.github && (
              <a href={profile.github} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#24292e', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                🐙 GitHub Profile
              </a>
            )}
            {profile.resume && (
              <a href={profile.resume} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                📄 Download Resume
              </a>
            )}
            {!profile.linkedin && !profile.github && !profile.resume && (
              <p style={{ color: '#94a3b8', fontSize: 13 }}>No links added yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <button onClick={() => toast.success('Connection request sent!')} style={{ flex: 1, padding: '14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
          🤝 Connect
        </button>
        <button onClick={() => toast.success('Message sent!')} style={{ flex: 1, padding: '14px', background: '#f8fafc', color: '#374151', border: '1.5px solid #e2e8f0', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          💬 Send Message
        </button>
      </div>
    </div>
  );
}
