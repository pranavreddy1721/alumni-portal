import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const Avatar = ({ name='', size=36, url='' }) => {
  const colors = ['#4f46e5','#7c3aed','#db2777','#059669','#d97706','#dc2626','#2563eb'];
  const bg = colors[(name||'').charCodeAt(0) % colors.length];
  const initials = (name||'U').split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
  if (url) return (
    <img src={url} alt={name} style={{ width:size, height:size, borderRadius:'50%', objectFit:'cover', flexShrink:0, border:'2px solid #e2e8f0' }} />
  );
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:bg, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:size*0.36, flexShrink:0 }}>
      {initials}
    </div>
  );
};

const ROLE_COLORS = { student:'#2563eb', alumni:'#059669', teacher:'#7c3aed', admin:'#d97706', superadmin:'#dc2626' };

export default function Navbar({ onMenuToggle }) {
  const { user } = useAuth();
  const color = ROLE_COLORS[user?.role] || '#2563eb';

  return (
    <div style={{
      height:64, background:'#fff', borderBottom:'1px solid #e2e8f0',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 20px', flexShrink:0, gap:12,
    }}>
      {/* Menu toggle (mobile) */}
      <button onClick={onMenuToggle} style={{ background:'none', border:'none', cursor:'pointer', fontSize:22, color:'#64748b', display:'flex', alignItems:'center', padding:6, borderRadius:8 }}>
        ☰
      </button>

      {/* Search */}
      <div style={{ flex:1, maxWidth:400, position:'relative' }}>
        <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:15, color:'#94a3b8' }}>🔍</span>
        <input placeholder="Search alumni, jobs, events..."
          style={{ width:'100%', padding:'9px 12px 9px 36px', borderRadius:12, border:'1.5px solid #e2e8f0', background:'#f8fafc', fontSize:13, color:'#374151', outline:'none' }}
          onFocus={e => { e.target.style.borderColor='#2563eb'; e.target.style.background='#fff'; }}
          onBlur={e  => { e.target.style.borderColor='#e2e8f0'; e.target.style.background='#f8fafc'; }}
        />
      </div>

      {/* Right */}
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <button style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, position:'relative', padding:4 }}>
          🔔
          <span style={{ position:'absolute', top:2, right:2, width:8, height:8, background:'#ef4444', borderRadius:'50%', border:'2px solid #fff' }} />
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Avatar name={user?.name} size={36} url={user?.avatar} />
          <div style={{ display:'none', lineHeight:1.3 }} className="navbar-userinfo">
            <div style={{ fontWeight:700, fontSize:14, color:'#1e293b' }}>{user?.name}</div>
            <div style={{ fontSize:11, color:'#fff', fontWeight:600, background:color, padding:'1px 8px', borderRadius:999, textTransform:'capitalize', display:'inline-block' }}>{user?.role}</div>
          </div>
        </div>
      </div>

      <style>{`
        @media(min-width:640px){.navbar-userinfo{display:block !important;}}
      `}</style>
    </div>
  );
}
