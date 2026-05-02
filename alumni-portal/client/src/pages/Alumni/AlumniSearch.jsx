import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';

const DEPARTMENTS = ['Computer Science','Information Technology','Electronics','Mechanical','Civil','Chemical','MBA','MCA'];

const Avatar = ({ name='', size=48, url='' }) => {
  const colors = ['#4f46e5','#7c3aed','#db2777','#059669','#d97706','#dc2626','#2563eb'];
  const bg = colors[(name||'').charCodeAt(0) % colors.length];
  const initials = (name||'U').split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
  if (url) return <img src={url} alt={name} style={{ width:size, height:size, borderRadius:'50%', objectFit:'cover', flexShrink:0, border:'2px solid #e2e8f0' }} />;
  return <div style={{ width:size, height:size, borderRadius:'50%', background:bg, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:size*0.34, flexShrink:0 }}>{initials}</div>;
};

const SkillBadge = ({ text }) => (
  <span style={{ background:'#eff6ff', color:'#2563eb', border:'1px solid #bfdbfe', borderRadius:6, padding:'3px 9px', fontSize:11, fontWeight:600 }}>{text}</span>
);

const AlumniCard = ({ profile, onConnect, onView }) => {
  const u = profile.userId;
  const company = profile.currentCompany || profile.company;
  const role    = profile.roleInCompany  || profile.designation;
  const batch   = profile.passOutYear    || profile.batch;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={()=>setHovered(true)}
      onMouseLeave={()=>setHovered(false)}
      style={{
        background:'#fff', borderRadius:16,
        border: hovered ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0',
        padding:20, transition:'all 0.2s',
        boxShadow: hovered ? '0 8px 28px rgba(37,99,235,0.12)' : '0 1px 4px rgba(0,0,0,0.05)',
        transform: hovered ? 'translateY(-3px)' : 'none',
        display:'flex', flexDirection:'column', gap:12,
      }}
    >
      {/* Top row */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <Avatar name={u?.name} size={48} url={profile.avatar||u?.avatar} />
          <div>
            <h3 style={{ fontSize:15, fontWeight:700, color:'#1e293b', margin:'0 0 2px' }}>{u?.name}</h3>
            {role && <p style={{ fontSize:12, color:'#64748b', margin:0 }}>{role}</p>}
          </div>
        </div>
        {profile.isAvailableForMentorship && (
          <span style={{ background:'#dcfce7', color:'#16a34a', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:999, whiteSpace:'nowrap', flexShrink:0 }}>✓ Mentor</span>
        )}
      </div>

      {/* Info chips */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
        {company && (
          <span style={{ background:'#f0fdf4', color:'#15803d', border:'1px solid #bbf7d0', borderRadius:8, padding:'4px 10px', fontSize:12, fontWeight:600 }}>🏢 {company}</span>
        )}
        {batch && (
          <span style={{ background:'#fafafa', color:'#475569', border:'1px solid #e2e8f0', borderRadius:8, padding:'4px 10px', fontSize:12 }}>🎓 Batch {batch}</span>
        )}
        {profile.experience > 0 && (
          <span style={{ background:'#fafafa', color:'#475569', border:'1px solid #e2e8f0', borderRadius:8, padding:'4px 10px', fontSize:12 }}>⏱ {profile.experience}y exp</span>
        )}
        {profile.department && (
          <span style={{ background:'#faf5ff', color:'#7c3aed', border:'1px solid #e9d5ff', borderRadius:8, padding:'4px 10px', fontSize:12 }}>📚 {profile.department}</span>
        )}
      </div>

      {/* Skills */}
      {profile.skills?.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
          {profile.skills.slice(0,4).map(s=><SkillBadge key={s} text={s} />)}
          {profile.skills.length > 4 && <span style={{ color:'#94a3b8', fontSize:11, padding:'3px 9px' }}>+{profile.skills.length-4} more</span>}
        </div>
      )}

      {/* Actions */}
      <div style={{ display:'flex', gap:8, marginTop:'auto' }}>
        <button onClick={()=>onView(profile)} style={{ flex:1, padding:'9px', background:'#2563eb', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:13, cursor:'pointer', transition:'background 0.15s' }}
          onMouseEnter={e=>e.currentTarget.style.background='#1d4ed8'}
          onMouseLeave={e=>e.currentTarget.style.background='#2563eb'}>
          View Profile
        </button>
        <button onClick={()=>onConnect(profile)} style={{ flex:1, padding:'9px', background:'#f8fafc', color:'#374151', border:'1.5px solid #e2e8f0', borderRadius:10, fontWeight:600, fontSize:13, cursor:'pointer', transition:'all 0.15s' }}
          onMouseEnter={e=>{ e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.borderColor='#2563eb'; e.currentTarget.style.color='#2563eb'; }}
          onMouseLeave={e=>{ e.currentTarget.style.background='#f8fafc'; e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.color='#374151'; }}>
          Connect
        </button>
      </div>
    </div>
  );
};

export default function AlumniSearch() {
  const navigate = useNavigate();
  const [profiles, setProfiles]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filters, setFilters]       = useState({ name:'', skills:'', company:'', batch:'', department:'', mentorship:false });
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);

  const fetchAlumni = useCallback(async (p=1, f=filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page:p, limit:12 });
      if (f.name)       params.set('name', f.name);
      if (f.skills)     params.set('skills', f.skills);
      if (f.company)    params.set('company', f.company);
      if (f.batch)      params.set('batch', f.batch);
      if (f.department) params.set('department', f.department);
      if (f.mentorship) params.set('mentorship','true');
      const r = await API.get(`/profiles/alumni/search?${params}`);
      setProfiles(r.data.profiles||[]);
      setTotalPages(r.data.pages||1);
      setTotal(r.data.total||0);
    } catch { toast.error('Failed to load alumni.'); }
    finally { setLoading(false); }
  }, []); // eslint-disable-line

  useEffect(() => { fetchAlumni(); }, []); // eslint-disable-line

  const handleSearch = e => { e.preventDefault(); setPage(1); fetchAlumni(1, filters); };
  const clearFilters = () => {
    const f = { name:'', skills:'', company:'', batch:'', department:'', mentorship:false };
    setFilters(f); setPage(1); fetchAlumni(1, f);
  };

  const inp = { padding:'10px 14px', borderRadius:10, border:'1.5px solid #e2e8f0', fontSize:13, outline:'none', background:'#f8fafc', color:'#1e293b', width:'100%', boxSizing:'border-box' };

  return (
    <div style={{ padding:20 }}>
      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:'#1e293b', margin:'0 0 4px' }}>🎓 Find Alumni</h1>
        <p style={{ color:'#64748b', fontSize:14, margin:0 }}>{total} alumni in network</p>
      </div>

      {/* Filter card */}
      <form onSubmit={handleSearch} style={{ background:'#fff', borderRadius:16, padding:20, border:'1px solid #e2e8f0', marginBottom:24, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, marginBottom:14 }}>
          <input value={filters.name} onChange={e=>setFilters(f=>({...f,name:e.target.value}))} placeholder="🔍 Search by name" style={inp}
            onFocus={e=>e.target.style.borderColor='#2563eb'} onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
          <input value={filters.company} onChange={e=>setFilters(f=>({...f,company:e.target.value}))} placeholder="🏢 Company" style={inp}
            onFocus={e=>e.target.style.borderColor='#2563eb'} onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
          <input value={filters.skills} onChange={e=>setFilters(f=>({...f,skills:e.target.value}))} placeholder="🛠 Skills (comma sep.)" style={inp}
            onFocus={e=>e.target.style.borderColor='#2563eb'} onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
          <input value={filters.batch} onChange={e=>setFilters(f=>({...f,batch:e.target.value}))} placeholder="🎓 Pass-out Year" maxLength={4} style={inp}
            onFocus={e=>e.target.style.borderColor='#2563eb'} onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
          <select value={filters.department} onChange={e=>setFilters(f=>({...f,department:e.target.value}))} style={inp}>
            <option value="">📚 All Departments</option>
            {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
          <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, color:'#374151', fontWeight:500 }}>
            <input type="checkbox" checked={filters.mentorship} onChange={e=>setFilters(f=>({...f,mentorship:e.target.checked}))} style={{ width:16, height:16, accentColor:'#2563eb' }} />
            Show mentors only
          </label>
          <div style={{ display:'flex', gap:8, marginLeft:'auto' }}>
            <button type="button" onClick={clearFilters} style={{ padding:'9px 18px', background:'#f8fafc', color:'#64748b', border:'1.5px solid #e2e8f0', borderRadius:10, fontWeight:600, fontSize:13, cursor:'pointer' }}>Clear</button>
            <button type="submit" style={{ padding:'9px 24px', background:'#2563eb', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:13, cursor:'pointer' }}>Search</button>
          </div>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#64748b' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>⏳</div>
          <p>Loading alumni...</p>
        </div>
      ) : profiles.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#64748b' }}>
          <div style={{ fontSize:56, marginBottom:12 }}>🔍</div>
          <h3 style={{ color:'#1e293b', margin:'0 0 8px' }}>No alumni found</h3>
          <p style={{ fontSize:14 }}>Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16, marginBottom:28 }}>
            {profiles.map(p=>(
              <AlumniCard key={p._id} profile={p}
                onView={prof => navigate(`/profile/${prof.userId?._id}`)}
                onConnect={prof => toast.success(`Connection request sent to ${prof.userId?.name}!`)}
              />
            ))}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:8 }}>
              <button onClick={()=>{ setPage(p=>Math.max(1,p-1)); fetchAlumni(Math.max(1,page-1)); }} disabled={page===1}
                style={{ padding:'8px 16px', borderRadius:8, border:'1.5px solid #e2e8f0', background:'#fff', color:'#374151', cursor:'pointer', fontWeight:600, opacity:page===1?0.5:1 }}>
                ← Prev
              </button>
              {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={()=>{ setPage(p); fetchAlumni(p); }}
                  style={{ width:36, height:36, borderRadius:8, border:'1.5px solid', borderColor:p===page?'#2563eb':'#e2e8f0', background:p===page?'#2563eb':'#fff', color:p===page?'#fff':'#374151', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                  {p}
                </button>
              ))}
              <button onClick={()=>{ setPage(p=>Math.min(totalPages,p+1)); fetchAlumni(Math.min(totalPages,page+1)); }} disabled={page===totalPages}
                style={{ padding:'8px 16px', borderRadius:8, border:'1.5px solid #e2e8f0', background:'#fff', color:'#374151', cursor:'pointer', fontWeight:600, opacity:page===totalPages?0.5:1 }}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
