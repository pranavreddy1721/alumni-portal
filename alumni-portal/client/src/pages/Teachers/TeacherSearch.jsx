import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';

const DEPARTMENTS = ['Computer Science','Information Technology','Electronics','Mechanical','Civil','Chemical','MBA','MCA'];

const Avatar = ({ name='', size=48, url='' }) => {
  const colors = ['#7c3aed','#4f46e5','#0891b2','#059669','#d97706'];
  const bg = colors[(name||'').charCodeAt(0) % colors.length];
  const initials = (name||'T').split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
  if (url) return <img src={url} alt={name} style={{ width:size, height:size, borderRadius:'50%', objectFit:'cover', flexShrink:0, border:'2px solid #e2e8f0' }} />;
  return <div style={{ width:size, height:size, borderRadius:'50%', background:bg, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:size*0.34, flexShrink:0 }}>{initials}</div>;
};

const TeacherCard = ({ profile, onView }) => {
  const u = profile.userId;
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{ background:'#fff', borderRadius:16, border: hovered?'1.5px solid #7c3aed':'1.5px solid #e2e8f0', padding:20, transition:'all 0.2s', boxShadow:hovered?'0 8px 28px rgba(124,58,237,0.12)':'0 1px 4px rgba(0,0,0,0.05)', transform:hovered?'translateY(-3px)':'none' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
        <Avatar name={u?.name} size={52} url={profile.avatar||u?.avatar} />
        <div style={{ flex:1, minWidth:0 }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:'#1e293b', margin:'0 0 3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u?.name}</h3>
          <p style={{ fontSize:12, color:'#7c3aed', fontWeight:600, margin:0 }}>{profile.qualification||'Faculty'}</p>
        </div>
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
        {profile.teacherDepartment && <span style={{ background:'#f5f3ff', color:'#7c3aed', border:'1px solid #e9d5ff', borderRadius:8, padding:'4px 10px', fontSize:12, fontWeight:600 }}>🏫 {profile.teacherDepartment}</span>}
        {profile.yearsOfExperience > 0 && <span style={{ background:'#fafafa', color:'#475569', border:'1px solid #e2e8f0', borderRadius:8, padding:'4px 10px', fontSize:12 }}>⏱ {profile.yearsOfExperience}y exp</span>}
      </div>
      {profile.subjectsTaught?.length > 0 && (
        <div style={{ marginBottom:14 }}>
          <p style={{ fontSize:11, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', letterSpacing:0.5, margin:'0 0 6px' }}>Subjects</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
            {profile.subjectsTaught.slice(0,3).map((s,i)=>(
              <span key={i} style={{ background:'#f5f3ff', color:'#7c3aed', borderRadius:6, padding:'3px 9px', fontSize:11, fontWeight:600 }}>{s}</span>
            ))}
            {profile.subjectsTaught.length > 3 && <span style={{ color:'#94a3b8', fontSize:11, padding:'3px 6px' }}>+{profile.subjectsTaught.length-3}</span>}
          </div>
        </div>
      )}
      {profile.bio && <p style={{ fontSize:13, color:'#64748b', lineHeight:1.5, margin:'0 0 14px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{profile.bio}</p>}
      <button onClick={()=>onView(profile)} style={{ width:'100%', padding:'10px', background:'#7c3aed', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:13, cursor:'pointer' }}
        onMouseEnter={e=>e.currentTarget.style.background='#6d28d9'} onMouseLeave={e=>e.currentTarget.style.background='#7c3aed'}>
        View Profile
      </button>
    </div>
  );
};

export default function TeacherSearch() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({ name:'', department:'' });

  const fetch = useCallback(async (f=filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.name)       params.set('name', f.name);
      if (f.department) params.set('department', f.department);
      const r = await API.get(`/profiles/teachers/search?${params}`);
      setProfiles(r.data.profiles||[]);
    } catch { toast.error('Failed to load teachers.'); }
    finally { setLoading(false); }
  }, []); // eslint-disable-line

  useEffect(()=>{ fetch(); }, []); // eslint-disable-line

  const inp = { padding:'10px 14px', borderRadius:10, border:'1.5px solid #e2e8f0', fontSize:13, outline:'none', background:'#f8fafc', color:'#1e293b', width:'100%', boxSizing:'border-box' };

  return (
    <div style={{ padding:20 }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:'#1e293b', margin:'0 0 4px' }}>👨‍🏫 Our Teachers</h1>
        <p style={{ color:'#64748b', fontSize:14, margin:0 }}>{profiles.length} faculty members</p>
      </div>

      <form onSubmit={e=>{e.preventDefault();fetch(filters);}} style={{ background:'#fff', borderRadius:16, padding:20, border:'1px solid #e2e8f0', marginBottom:24, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12, marginBottom:12 }}>
          <input value={filters.name} onChange={e=>setFilters(f=>({...f,name:e.target.value}))} placeholder="🔍 Search by name" style={inp}
            onFocus={e=>e.target.style.borderColor='#7c3aed'} onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
          <select value={filters.department} onChange={e=>setFilters(f=>({...f,department:e.target.value}))} style={inp}>
            <option value="">🏫 All Departments</option>
            {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button type="button" onClick={()=>{ setFilters({name:'',department:''}); fetch({name:'',department:''}); }} style={{ padding:'9px 18px', background:'#f8fafc', color:'#64748b', border:'1.5px solid #e2e8f0', borderRadius:10, fontWeight:600, fontSize:13, cursor:'pointer' }}>Clear</button>
          <button type="submit" style={{ padding:'9px 24px', background:'#7c3aed', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:13, cursor:'pointer' }}>Search</button>
        </div>
      </form>

      {loading ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#64748b' }}><div style={{ fontSize:40, marginBottom:12 }}>⏳</div><p>Loading teachers...</p></div>
      ) : profiles.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#64748b' }}><div style={{ fontSize:56, marginBottom:12 }}>👨‍🏫</div><h3 style={{ color:'#1e293b', margin:'0 0 8px' }}>No teachers found</h3><p style={{ fontSize:14 }}>Try different filters.</p></div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:16 }}>
          {profiles.map(p=><TeacherCard key={p._id} profile={p} onView={prof=>navigate(`/profile/${prof.userId?._id}`)} />)}
        </div>
      )}
    </div>
  );
}
