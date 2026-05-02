import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';

const DEPARTMENTS = ['Computer Science','Information Technology','Electronics','Mechanical','Civil','Chemical','MBA','MCA'];
const YEARS = ['1st','2nd','3rd','4th'];

const Avatar = ({ name='', size=48, url='' }) => {
  const colors = ['#2563eb','#7c3aed','#059669','#d97706','#dc2626'];
  const bg = colors[(name||'').charCodeAt(0) % colors.length];
  const initials = (name||'S').split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
  if (url) return <img src={url} alt={name} style={{ width:size, height:size, borderRadius:'50%', objectFit:'cover', flexShrink:0, border:'2px solid #e2e8f0' }} />;
  return <div style={{ width:size, height:size, borderRadius:'50%', background:bg, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:size*0.34, flexShrink:0 }}>{initials}</div>;
};

const StudentCard = ({ profile, onView }) => {
  const u = profile.userId;
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{ background:'#fff', borderRadius:16, border:hovered?'1.5px solid #2563eb':'1.5px solid #e2e8f0', padding:20, transition:'all 0.2s', boxShadow:hovered?'0 8px 24px rgba(37,99,235,0.12)':'0 1px 4px rgba(0,0,0,0.05)', transform:hovered?'translateY(-3px)':'none' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
        <Avatar name={u?.name} size={48} url={profile.avatar||u?.avatar} />
        <div style={{ flex:1, minWidth:0 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:'#1e293b', margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u?.name}</h3>
          <p style={{ fontSize:12, color:'#64748b', margin:0 }}>
            {profile.year && `${profile.year} Year`}{profile.section && ` · Sec ${profile.section}`}
          </p>
        </div>
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:10 }}>
        {profile.department && <span style={{ background:'#eff6ff', color:'#2563eb', border:'1px solid #bfdbfe', borderRadius:8, padding:'3px 9px', fontSize:11, fontWeight:600 }}>📚 {profile.department}</span>}
      </div>
      {profile.skills?.length > 0 && (
        <div style={{ marginBottom:10 }}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
            {profile.skills.slice(0,3).map((s,i)=><span key={i} style={{ background:'#f8fafc', color:'#475569', border:'1px solid #e2e8f0', borderRadius:6, padding:'2px 8px', fontSize:11 }}>{s}</span>)}
            {profile.skills.length > 3 && <span style={{ color:'#94a3b8', fontSize:11 }}>+{profile.skills.length-3}</span>}
          </div>
        </div>
      )}
      {profile.interests?.length > 0 && (
        <p style={{ fontSize:12, color:'#64748b', margin:'0 0 12px' }}>❤️ {profile.interests.slice(0,2).join(', ')}{profile.interests.length>2?'...':''}</p>
      )}
      <button onClick={()=>onView(profile)} style={{ width:'100%', padding:'9px', background:'#2563eb', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:13, cursor:'pointer' }}
        onMouseEnter={e=>e.currentTarget.style.background='#1d4ed8'} onMouseLeave={e=>e.currentTarget.style.background='#2563eb'}>
        View Profile
      </button>
    </div>
  );
};

export default function StudentSearch() {
  const navigate  = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({ name:'', department:'', year:'' });

  const fetch = useCallback(async (f=filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.name)       params.set('name', f.name);
      if (f.department) params.set('department', f.department);
      if (f.year)       params.set('year', f.year);
      const r = await API.get(`/profiles/students/search?${params}`);
      setProfiles(r.data.profiles||[]);
    } catch { toast.error('Failed to load students.'); }
    finally { setLoading(false); }
  }, []); // eslint-disable-line

  useEffect(()=>{ fetch(); }, []); // eslint-disable-line

  const inp = { padding:'10px 14px', borderRadius:10, border:'1.5px solid #e2e8f0', fontSize:13, outline:'none', background:'#f8fafc', color:'#1e293b', width:'100%', boxSizing:'border-box' };

  return (
    <div style={{ padding:20 }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:'#1e293b', margin:'0 0 4px' }}>👨‍🎓 Students</h1>
        <p style={{ color:'#64748b', fontSize:14, margin:0 }}>{profiles.length} students</p>
      </div>

      <form onSubmit={e=>{e.preventDefault();fetch(filters);}} style={{ background:'#fff', borderRadius:16, padding:20, border:'1px solid #e2e8f0', marginBottom:24, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12, marginBottom:12 }}>
          <input value={filters.name} onChange={e=>setFilters(f=>({...f,name:e.target.value}))} placeholder="🔍 Search by name" style={inp}
            onFocus={e=>e.target.style.borderColor='#2563eb'} onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
          <select value={filters.department} onChange={e=>setFilters(f=>({...f,department:e.target.value}))} style={inp}>
            <option value="">📚 All Departments</option>
            {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filters.year} onChange={e=>setFilters(f=>({...f,year:e.target.value}))} style={inp}>
            <option value="">📅 All Years</option>
            {YEARS.map(y=><option key={y} value={y}>{y} Year</option>)}
          </select>
        </div>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button type="button" onClick={()=>{ setFilters({name:'',department:'',year:''}); fetch({name:'',department:'',year:''}); }} style={{ padding:'9px 18px', background:'#f8fafc', color:'#64748b', border:'1.5px solid #e2e8f0', borderRadius:10, fontWeight:600, fontSize:13, cursor:'pointer' }}>Clear</button>
          <button type="submit" style={{ padding:'9px 24px', background:'#2563eb', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:13, cursor:'pointer' }}>Search</button>
        </div>
      </form>

      {loading ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#64748b' }}><div style={{ fontSize:40, marginBottom:12 }}>⏳</div><p>Loading students...</p></div>
      ) : profiles.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#64748b' }}><div style={{ fontSize:56, marginBottom:12 }}>👨‍🎓</div><h3 style={{ color:'#1e293b', margin:'0 0 8px' }}>No students found</h3><p style={{ fontSize:14 }}>Try different filters.</p></div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))', gap:16 }}>
          {profiles.map(p=><StudentCard key={p._id} profile={p} onView={prof=>navigate(`/profile/${prof.userId?._id}`)} />)}
        </div>
      )}
    </div>
  );
}
