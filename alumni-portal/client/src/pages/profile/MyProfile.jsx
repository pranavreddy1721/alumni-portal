import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import toast from 'react-hot-toast';

const DEPARTMENTS = ['Computer Science','Information Technology','Electronics','Mechanical','Civil','Chemical','MBA','MCA','Other'];
const YEARS = ['1st','2nd','3rd','4th'];

const Card = ({ title, icon, children }) => (
  <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e2e8f0', overflow:'hidden', marginBottom:20, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
    <div style={{ padding:'14px 20px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:10, background:'#fafbfc' }}>
      <span style={{ fontSize:20 }}>{icon}</span>
      <h3 style={{ fontSize:15, fontWeight:700, color:'#1e293b', margin:0 }}>{title}</h3>
    </div>
    <div style={{ padding:20 }}>{children}</div>
  </div>
);

const Field = ({ label, children }) => (
  <div style={{ marginBottom:16 }}>
    <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#64748b', marginBottom:6, textTransform:'uppercase', letterSpacing:0.8 }}>{label}</label>
    {children}
  </div>
);

const inp = { width:'100%', padding:'10px 14px', borderRadius:10, border:'1.5px solid #e2e8f0', fontSize:14, outline:'none', background:'#f8fafc', color:'#1e293b', boxSizing:'border-box', transition:'border-color 0.15s, background 0.15s' };

const Tag = ({ text, onRemove }) => (
  <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:'#eff6ff', color:'#2563eb', border:'1px solid #bfdbfe', borderRadius:8, padding:'4px 10px', fontSize:12, fontWeight:600, margin:'0 5px 6px 0' }}>
    {text}
    {onRemove && <button onClick={onRemove} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:15, lineHeight:1, padding:0 }}>×</button>}
  </span>
);

export default function MyProfile() {
  const { user } = useAuth();
  const [form, setForm]         = useState({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [tagInput, setTagInput] = useState({ skills:'', interests:'', subjectsTaught:'' });
  const [avatarPrev, setAvatarPrev] = useState('');

  useEffect(() => {
    API.get('/profiles/me').then(r => {
      const p = r.data.profile || {};
      setForm(p);
      setAvatarPrev(p.avatar || user?.avatar || '');
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, [user]);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const addTag = field => {
    const val = (tagInput[field]||'').trim();
    if (!val) return;
    const arr = form[field]||[];
    if (!arr.includes(val)) set(field,[...arr,val]);
    setTagInput(t=>({...t,[field]:''}));
  };
  const removeTag = (field,idx) => set(field,(form[field]||[]).filter((_,i)=>i!==idx));

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.put('/profiles/me', form);
      toast.success('Profile saved successfully! ✅');
    } catch(err){ toast.error(err.message||'Save failed.'); }
    finally{ setSaving(false); }
  };

  const handleAvatarChange = async e => {
    const file = e.target.files[0]; if(!file) return;
    if(file.size > 2*1024*1024){ toast.error('Image must be under 2MB'); return; }
    const fd = new FormData(); fd.append('avatar',file);
    try {
      const r = await API.post('/profiles/upload-avatar', fd, { headers:{'Content-Type':'multipart/form-data'} });
      setAvatarPrev(r.data.avatar);
      toast.success('Photo uploaded! ✅');
    } catch { toast.error('Upload failed.'); }
  };

  if (loading) return <div style={{ padding:40, textAlign:'center', color:'#64748b' }}>Loading your profile...</div>;

  const roleColors = { student:'#2563eb', alumni:'#059669', teacher:'#7c3aed', admin:'#d97706', superadmin:'#dc2626' };
  const rc = roleColors[user?.role] || '#2563eb';
  const initials = (user?.name||'U').split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);

  const focus = e => { e.target.style.borderColor=rc; e.target.style.background='#fff'; };
  const blur  = e => { e.target.style.borderColor='#e2e8f0'; e.target.style.background='#f8fafc'; };

  return (
    <div style={{ padding:'20px', maxWidth:860, margin:'0 auto' }}>
      {/* Hero card */}
      <div style={{ background:`linear-gradient(135deg,${rc},${rc}cc)`, borderRadius:20, padding:'28px 24px', marginBottom:24, color:'#fff', display:'flex', alignItems:'center', gap:20, flexWrap:'wrap', boxShadow:`0 8px 32px ${rc}40` }}>
        <div style={{ position:'relative', flexShrink:0 }}>
          {avatarPrev
            ? <img src={avatarPrev} alt="avatar" style={{ width:80, height:80, borderRadius:'50%', objectFit:'cover', border:'3px solid rgba(255,255,255,0.5)' }} />
            : <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, fontWeight:800, border:'3px solid rgba(255,255,255,0.4)' }}>{initials}</div>
          }
          <label title="Upload photo" style={{ position:'absolute', bottom:0, right:0, background:'#fff', borderRadius:'50%', width:26, height:26, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.25)', fontSize:13 }}>
            📷<input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display:'none' }} />
          </label>
        </div>
        <div style={{ flex:1, minWidth:180 }}>
          <h1 style={{ fontSize:22, fontWeight:800, margin:'0 0 4px' }}>{user?.name}</h1>
          <p style={{ opacity:0.85, fontSize:13, margin:'0 0 8px' }}>{user?.email}</p>
          <span style={{ background:'rgba(255,255,255,0.25)', padding:'3px 14px', borderRadius:999, fontSize:12, fontWeight:700, textTransform:'capitalize' }}>{user?.role}</span>
        </div>
        <button onClick={handleSave} disabled={saving} style={{ padding:'12px 28px', background:'rgba(255,255,255,0.2)', border:'2px solid rgba(255,255,255,0.6)', borderRadius:12, color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer' }}>
          {saving ? '⏳ Saving...' : '💾 Save Profile'}
        </button>
      </div>

      {/* Basic info */}
      <Card title="Basic Information" icon="📝">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:16 }}>
          <Field label="Bio / About Me">
            <textarea value={form.bio||''} onChange={e=>set('bio',e.target.value)} rows={3} placeholder="Write a short bio about yourself..." style={{ ...inp, resize:'vertical' }} onFocus={focus} onBlur={blur} />
          </Field>
          <Field label="Location">
            <input value={form.location||''} onChange={e=>set('location',e.target.value)} placeholder="City, State" style={inp} onFocus={focus} onBlur={blur} />
          </Field>
        </div>
      </Card>

      {/* STUDENT */}
      {user?.role==='student' && <>
        <Card title="Academic Details" icon="📚">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16 }}>
            <Field label="Full Name"><input value={form.fullName||''} onChange={e=>set('fullName',e.target.value)} placeholder="Your full name" style={inp} onFocus={focus} onBlur={blur} /></Field>
            <Field label="Department">
              <select value={form.department||''} onChange={e=>set('department',e.target.value)} style={inp}>
                <option value="">Select Department</option>
                {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Year">
              <select value={form.year||''} onChange={e=>set('year',e.target.value)} style={inp}>
                <option value="">Select Year</option>
                {YEARS.map(y=><option key={y} value={y}>{y} Year</option>)}
              </select>
            </Field>
            <Field label="Section"><input value={form.section||''} onChange={e=>set('section',e.target.value)} placeholder="e.g. A, B, C" style={inp} onFocus={focus} onBlur={blur} /></Field>
          </div>
        </Card>
        <Card title="Skills & Interests" icon="🛠️">
          <Field label="Skills (press Enter or click Add)">
            <div style={{ display:'flex', gap:8, marginBottom:8, flexWrap:'wrap' }}>
              <input value={tagInput.skills} onChange={e=>setTagInput(t=>({...t,skills:e.target.value}))} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addTag('skills');}}} placeholder="e.g. Python, React..." style={{ ...inp, flex:1, minWidth:160 }} onFocus={focus} onBlur={blur} />
              <button onClick={()=>addTag('skills')} style={{ padding:'10px 18px', background:rc, color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontWeight:700, whiteSpace:'nowrap' }}>+ Add</button>
            </div>
            <div>{(form.skills||[]).map((s,i)=><Tag key={i} text={s} onRemove={()=>removeTag('skills',i)} />)}</div>
          </Field>
          <Field label="Interests">
            <div style={{ display:'flex', gap:8, marginBottom:8, flexWrap:'wrap' }}>
              <input value={tagInput.interests} onChange={e=>setTagInput(t=>({...t,interests:e.target.value}))} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addTag('interests');}}} placeholder="e.g. Machine Learning, Music..." style={{ ...inp, flex:1, minWidth:160 }} onFocus={focus} onBlur={blur} />
              <button onClick={()=>addTag('interests')} style={{ padding:'10px 18px', background:rc, color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontWeight:700, whiteSpace:'nowrap' }}>+ Add</button>
            </div>
            <div>{(form.interests||[]).map((s,i)=><Tag key={i} text={s} onRemove={()=>removeTag('interests',i)} />)}</div>
          </Field>
        </Card>
      </>}

      {/* ALUMNI */}
      {user?.role==='alumni' && <>
        <Card title="Professional Information" icon="💼">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16 }}>
            <Field label="Pass-out Year"><input value={form.passOutYear||''} onChange={e=>set('passOutYear',e.target.value)} placeholder="e.g. 2020" maxLength={4} style={inp} onFocus={focus} onBlur={blur} /></Field>
            <Field label="Current Company"><input value={form.currentCompany||''} onChange={e=>set('currentCompany',e.target.value)} placeholder="e.g. Google, TCS" style={inp} onFocus={focus} onBlur={blur} /></Field>
            <Field label="Role / Designation"><input value={form.roleInCompany||''} onChange={e=>set('roleInCompany',e.target.value)} placeholder="e.g. Senior Engineer" style={inp} onFocus={focus} onBlur={blur} /></Field>
            <Field label="Years of Experience"><input type="number" value={form.experience||''} onChange={e=>set('experience',Number(e.target.value))} placeholder="e.g. 3" min={0} max={50} style={inp} onFocus={focus} onBlur={blur} /></Field>
            <Field label="Department Studied">
              <select value={form.department||''} onChange={e=>set('department',e.target.value)} style={inp}>
                <option value="">Select Department</option>
                {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Mentorship Availability">
            <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontSize:14, color:'#374151' }}>
              <input type="checkbox" checked={!!form.isAvailableForMentorship} onChange={e=>set('isAvailableForMentorship',e.target.checked)} style={{ width:18, height:18, accentColor:rc }} />
              Yes, I'm available to mentor students
            </label>
          </Field>
        </Card>
        <Card title="Skills" icon="🛠️">
          <div style={{ display:'flex', gap:8, marginBottom:8, flexWrap:'wrap' }}>
            <input value={tagInput.skills} onChange={e=>setTagInput(t=>({...t,skills:e.target.value}))} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addTag('skills');}}} placeholder="e.g. React, Node.js..." style={{ ...inp, flex:1, minWidth:160 }} onFocus={focus} onBlur={blur} />
            <button onClick={()=>addTag('skills')} style={{ padding:'10px 18px', background:rc, color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontWeight:700 }}>+ Add</button>
          </div>
          <div>{(form.skills||[]).map((s,i)=><Tag key={i} text={s} onRemove={()=>removeTag('skills',i)} />)}</div>
        </Card>
      </>}

      {/* TEACHER */}
      {user?.role==='teacher' && (
        <Card title="Teacher Details" icon="👨‍🏫">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16 }}>
            <Field label="Department">
              <select value={form.teacherDepartment||''} onChange={e=>set('teacherDepartment',e.target.value)} style={inp}>
                <option value="">Select Department</option>
                {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Qualification"><input value={form.qualification||''} onChange={e=>set('qualification',e.target.value)} placeholder="e.g. M.Tech, PhD" style={inp} onFocus={focus} onBlur={blur} /></Field>
            <Field label="Years of Experience"><input type="number" value={form.yearsOfExperience||''} onChange={e=>set('yearsOfExperience',Number(e.target.value))} placeholder="e.g. 10" min={0} style={inp} onFocus={focus} onBlur={blur} /></Field>
          </div>
          <Field label="Subjects Taught">
            <div style={{ display:'flex', gap:8, marginBottom:8, flexWrap:'wrap' }}>
              <input value={tagInput.subjectsTaught} onChange={e=>setTagInput(t=>({...t,subjectsTaught:e.target.value}))} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addTag('subjectsTaught');}}} placeholder="e.g. Data Structures, DBMS..." style={{ ...inp, flex:1, minWidth:160 }} onFocus={focus} onBlur={blur} />
              <button onClick={()=>addTag('subjectsTaught')} style={{ padding:'10px 18px', background:rc, color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontWeight:700 }}>+ Add</button>
            </div>
            <div>{(form.subjectsTaught||[]).map((s,i)=><Tag key={i} text={s} onRemove={()=>removeTag('subjectsTaught',i)} />)}</div>
          </Field>
        </Card>
      )}

      {/* Links */}
      <Card title="Social & Professional Links" icon="🔗">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:16 }}>
          <Field label="LinkedIn URL"><input value={form.linkedin||''} onChange={e=>set('linkedin',e.target.value)} placeholder="https://linkedin.com/in/..." style={inp} onFocus={focus} onBlur={blur} /></Field>
          <Field label="GitHub URL"><input value={form.github||''} onChange={e=>set('github',e.target.value)} placeholder="https://github.com/..." style={inp} onFocus={focus} onBlur={blur} /></Field>
          <Field label="Website / Portfolio"><input value={form.website||''} onChange={e=>set('website',e.target.value)} placeholder="https://yourwebsite.com" style={inp} onFocus={focus} onBlur={blur} /></Field>
        </div>
      </Card>

      <button onClick={handleSave} disabled={saving} style={{ width:'100%', padding:'14px', background:`linear-gradient(135deg,${rc},${rc}bb)`, color:'#fff', border:'none', borderRadius:14, fontSize:16, fontWeight:700, cursor:'pointer', boxShadow:`0 4px 20px ${rc}50`, marginBottom:40 }}>
        {saving ? '⏳ Saving Profile...' : '💾 Save All Changes'}
      </button>
    </div>
  );
}
