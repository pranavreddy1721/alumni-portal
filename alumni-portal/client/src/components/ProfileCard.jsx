import { Avatar } from './Navbar';

export default function ProfileCard({ profile, onConnect, onView }) {
  const user = profile.userId;
  const skills = profile.skills || [];

  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0',
      transition: 'all 0.2s', cursor: 'default',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'none'; }}
    >
      {/* Top */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={user?.name} size={48} />
          <div>
            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 15 }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{profile.designation || 'Alumni'}</div>
          </div>
        </div>
        {profile.isAvailableForMentorship && (
          <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>
            Mentor ✓
          </span>
        )}
      </div>

      {/* Company & Batch */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {profile.company && (
          <span style={{ background: '#eff6ff', color: '#2563eb', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 8 }}>
            🏢 {profile.company}
          </span>
        )}
        {profile.batch && (
          <span style={{ background: '#f1f5f9', color: '#475569', fontSize: 12, padding: '4px 10px', borderRadius: 8 }}>
            🎓 Batch {profile.batch}
          </span>
        )}
        {profile.experience > 0 && (
          <span style={{ background: '#f1f5f9', color: '#475569', fontSize: 12, padding: '4px 10px', borderRadius: 8 }}>
            ⏱ {profile.experience}y exp
          </span>
        )}
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {skills.slice(0, 4).map((skill) => (
            <span key={skill} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontSize: 11, padding: '3px 8px', borderRadius: 6 }}>
              {skill}
            </span>
          ))}
          {skills.length > 4 && (
            <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#94a3b8', fontSize: 11, padding: '3px 8px', borderRadius: 6 }}>
              +{skills.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => onConnect?.(profile)}
          style={{
            flex: 1, padding: '9px 0', background: '#2563eb', color: '#fff',
            border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#1d4ed8'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#2563eb'; }}
        >
          Connect
        </button>
        <button
          onClick={() => onView?.(profile)}
          style={{
            flex: 1, padding: '9px 0', background: '#f8fafc', color: '#374151',
            border: '1.5px solid #e2e8f0', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
        >
          View Profile
        </button>
      </div>
    </div>
  );
}
