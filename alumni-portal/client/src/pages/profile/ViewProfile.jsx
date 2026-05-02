import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';

const Badge = ({ text, color='#2563eb', bg='#eff6ff' }) => (
  <span style={{ background:bg, color, border:`1px solid ${color}30`, borderRadius:8, padding:'4px 12px', fontSize:12, fontWeight:600, display:'inline-block', margin:'0 5px 5px 0' }}>{text}</span>
);

const InfoRow = ({ icon, label, value }) => value ? (
  <div style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 0', borderBottom:'1px solid #f1f5f9' }}>
    <span style={{ fontSize:18, flexShrink:0, width:28 }}>{icon}</span>
    <div>
      <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 }}>{label}</div>
      <div style={{ fontSize:14, color:'#1e293b', fontWeight:500, marginTop:2 }}>{value}</div>
    </div>
  </div>
) : null;

export default function ViewProfile() {
  const { userId } = useParams();
  const navigate   = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    API.get(`/profiles/${userId}`)
      .then(r => setProfile(r.data.profile))
      .catch(err => setError(err.message || 'Profile not found or access denied.'))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:12 }}>
      <div style={{ fontSize:40 }}>⏳</div>
      <p style={{ color:'#64748b' }}>Loading profile...</p>
    </div>
  );

  if (error) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:56 }}>🔒</div>
      <h2 style={{ color:'#1e293b', margin:0 }}>Access Denied</h2>
      <p style={{ color:'#64748b', fontSize:14 }}>{error}</p>
      <button onClick={()=>navigate(-1)} style={{ padding:'10px 24px', background:'#2563eb', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontWeight:700 }}>← Go Back</button>
    </div>
  );

  const u    = profile?.userId;
  const role = u?.role;
  const roleColors = { student:'#2563eb', alumni:'#059669', teacher:'#7c3aed', admin:'#d97706' };
  const rc   = roleColors[role] || '#2563eb';
  const initials = (u?.name||'U').split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);

  return (
    <div style={{ padding:20, maxWidth:800, margin:'0 auto' }}>
      <button onClick={()=>navigate(-1)} style={{ background:'none', border:'none', color:'#2563eb', cursor:'pointer', fontWeight:600, fontSize:14, marginBottom:20, display:'flex', alignItems:'center', gap:6, padding:0 }}>
        ← Back
      </button>

      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg,${rc},${rc}cc)`, borderRadius:20, padding:'32px 28px', marginBottom:20, color:'#fff', position:'relative', overflow:'hidden', boxShadow:`0 8px 32px ${rc}40` }}>
        <div style={{ position:'absolute', top:-40, right:-40, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.07)' }} />
        <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap', position:'relative' }}>
          {profile?.avatar || u?.avatar
            ? <img src={profile.avatar||u.avatar} alt={u?.name} style={{ width:90, height:90, borderRadius:'50%', objectFit:'cover', border:'4px solid rgba(255,255,255,0.4)', flexShrink:0 }} />
            : <div style={{ width:90, height:90, borderRadius:'50%', background:'rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:34, fontWeight:800, border:'4px solid rgba(255,255,255,0.4)', flexShrink:0 }}>{initials}</div>
          }
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:6 }}>
              <h1 style={{ fontSize:24, fontWeight:800, margin:0 }}>{u?.name}</h1>
              {profile?.isAvailableForMentorship && (
                <span style={{ background:'#bbf7d0', color:'#065f46', padding:'3px 12px', borderRadius:999, fontSize:12, fontWeight:700 }}>✓ Mentor</span>
              )}
            </div>
            {/* Role-specific subtitle */}
            {role==='alumni' && (profile?.roleInCompany||profile?.designation) && (
              <p style={{ margin:'0 0 8px', opacity:0.9, fontSize:15 }}>
                {profile.roleInCompany||profile.designation}
                {(profile.currentCompany||profile.company) && ` @ ${profile.currentCompany||profile.company}`}
              </p>
            )}
            {role==='teacher' && profile?.teacherDepartment && (
              <p style={{ margin:'0 0 8px', opacity:0.9, fontSize:15 }}>
                {profile.qualification || 'Teacher'} · {profile.teacherDepartment} Dept.
              </p>
            )}
            {role==='student' && profile?.department && (
              <p style={{ margin:'0 0 8px', opacity:0.9, fontSize:15 }}>
                {profile.year ? `${profile.year} Year · ` : ''}{profile.department}
                {profile.section ? ` · Section ${profile.section}` : ''}
              </p>
            )}
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <span style={{ background:'rgba(255,255,255,0.2)', padding:'3px 12px', borderRadius:999, fontSize:12, fontWeight:700, textTransform:'capitalize' }}>{role}</span>
              {profile?.location && <span style={{ background:'rgba(255,255,255,0.15)', padding:'3px 12px', borderRadius:999, fontSize:12 }}>📍 {profile.location}</span>}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))', gap:16 }}>
        {/* Left col */}
        <div>
          {/* About */}
          {profile?.bio && (
            <div style={{ background:'#fff', borderRadius:16, padding:20, border:'1px solid #e2e8f0', marginBottom:16, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:'#1e293b', margin:'0 0 12px', display:'flex', alignItems:'center', gap:8 }}>📝 About</h3>
              <p style={{ color:'#475569', fontSize:14, lineHeight:1.7, margin:0 }}>{profile.bio}</p>
            </div>
          )}

          {/* Role-specific details */}
          <div style={{ background:'#fff', borderRadius:16, padding:20, border:'1px solid #e2e8f0', marginBottom:16, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:'#1e293b', margin:'0 0 8px', display:'flex', alignItems:'center', gap:8 }}>
              {role==='student' ? '📚 Academic Info' : role==='teacher' ? '👨‍🏫 Teacher Info' : '💼 Professional Info'}
            </h3>

            {role==='alumni' && <>
              <InfoRow icon="🏢" label="Current Company" value={profile?.currentCompany||profile?.company} />
              <InfoRow icon="💼" label="Role" value={profile?.roleInCompany||profile?.designation} />
              <InfoRow icon="🎓" label="Pass-out Year" value={profile?.passOutYear||profile?.batch} />
              <InfoRow icon="📚" label="Department" value={profile?.department} />
              <InfoRow icon="⏱" label="Experience" value={profile?.experience ? `${profile.experience} year(s)` : null} />
            </>}

            {role==='teacher' && <>
              <InfoRow icon="🏫" label="Department" value={profile?.teacherDepartment} />
              <InfoRow icon="🎓" label="Qualification" value={profile?.qualification} />
              <InfoRow icon="⏱" label="Experience" value={profile?.yearsOfExperience ? `${profile.yearsOfExperience} year(s)` : null} />
            </>}

            {role==='student' && <>
              <InfoRow icon="🏫" label="Department" value={profile?.department} />
              <InfoRow icon="📅" label="Year & Section" value={profile?.year ? `${profile.year} Year${profile?.section ? ` · Section ${profile.section}` : ''}` : null} />
            </>}
          </div>
        </div>

        {/* Right col */}
        <div>
          {/* Skills */}
          {(profile?.skills?.length > 0) && (
            <div style={{ background:'#fff', borderRadius:16, padding:20, border:'1px solid #e2e8f0', marginBottom:16, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:'#1e293b', margin:'0 0 12px', display:'flex', alignItems:'center', gap:8 }}>🛠️ Skills</h3>
              <div>{profile.skills.map((s,i)=><Badge key={i} text={s} color={rc} bg={`${rc}12`} />)}</div>
            </div>
          )}

          {/* Interests (students) */}
          {(profile?.interests?.length > 0) && (
            <div style={{ background:'#fff', borderRadius:16, padding:20, border:'1px solid #e2e8f0', marginBottom:16, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:'#1e293b', margin:'0 0 12px', display:'flex', alignItems:'center', gap:8 }}>❤️ Interests</h3>
              <div>{profile.interests.map((s,i)=><Badge key={i} text={s} color="#7c3aed" bg="#f5f3ff" />)}</div>
            </div>
          )}

          {/* Subjects (teachers) */}
          {(profile?.subjectsTaught?.length > 0) && (
            <div style={{ background:'#fff', borderRadius:16, padding:20, border:'1px solid #e2e8f0', marginBottom:16, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:'#1e293b', margin:'0 0 12px', display:'flex', alignItems:'center', gap:8 }}>📖 Subjects Taught</h3>
              <div>{profile.subjectsTaught.map((s,i)=><Badge key={i} text={s} color="#7c3aed" bg="#f5f3ff" />)}</div>
            </div>
          )}

          {/* Links */}
          {(profile?.linkedin || profile?.github || profile?.website || profile?.resume) && (
            <div style={{ background:'#fff', borderRadius:16, padding:20, border:'1px solid #e2e8f0', marginBottom:16, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:'#1e293b', margin:'0 0 12px', display:'flex', alignItems:'center', gap:8 }}>🔗 Links</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:8, color:'#0a66c2', fontSize:14, fontWeight:600, textDecoration:'none' }}>💼 LinkedIn Profile</a>}
                {profile.github   && <a href={profile.github}   target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:8, color:'#24292e', fontSize:14, fontWeight:600, textDecoration:'none' }}>🐙 GitHub Profile</a>}
                {profile.website  && <a href={profile.website}  target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:8, color:'#2563eb', fontSize:14, fontWeight:600, textDecoration:'none' }}>🌐 Website / Portfolio</a>}
                {profile.resume   && <a href={profile.resume}   target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:8, color:'#dc2626', fontSize:14, fontWeight:600, textDecoration:'none' }}>📄 Download Resume</a>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display:'flex', gap:12, marginTop:8, flexWrap:'wrap' }}>
        <button onClick={()=>toast.success('Connection request sent!')} style={{ flex:1, minWidth:140, padding:'13px', background:rc, color:'#fff', border:'none', borderRadius:12, fontWeight:700, fontSize:14, cursor:'pointer', boxShadow:`0 4px 16px ${rc}40` }}>
          🤝 Connect
        </button>
        <button onClick={()=>toast.success('Message feature coming soon!')} style={{ flex:1, minWidth:140, padding:'13px', background:'#f8fafc', color:'#374151', border:'1.5px solid #e2e8f0', borderRadius:12, fontWeight:700, fontSize:14, cursor:'pointer' }}>
          💬 Send Message
        </button>
      </div>
    </div>
  );
}
