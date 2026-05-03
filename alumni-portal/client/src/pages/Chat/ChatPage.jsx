import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

// ── Avatar ────────────────────────────────────────────────────
const Avatar = ({ name='', size=40, url='' }) => {
  const colors = ['#4f46e5','#7c3aed','#db2777','#059669','#d97706','#dc2626','#2563eb'];
  const bg = colors[(name||'').charCodeAt(0) % colors.length];
  const initials = (name||'?').split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
  if (url) return <img src={url} alt={name} style={{ width:size,height:size,borderRadius:'50%',objectFit:'cover',flexShrink:0,border:'2px solid #e2e8f0' }} />;
  return <div style={{ width:size,height:size,borderRadius:'50%',background:bg,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:size*0.36,flexShrink:0 }}>{initials}</div>;
};

const ROLE_COLORS = { student:'#2563eb', alumni:'#059669', teacher:'#7c3aed', admin:'#d97706' };

const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date), now = new Date(), diff = now - d;
  if (diff < 60000)    return 'now';
  if (diff < 3600000)  return `${Math.floor(diff/60000)}m`;
  if (diff < 86400000) return d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
  return d.toLocaleDateString('en-IN',{day:'numeric',month:'short'});
};

const formatMsgTime = (date) =>
  date ? new Date(date).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) : '';

const isSameDay = (a, b) =>
  new Date(a).toDateString() === new Date(b).toDateString();

// ── Contact Item ──────────────────────────────────────────────
const ContactItem = ({ contact, active, unread=0, onClick }) => (
  <button onClick={onClick} style={{
    width:'100%',display:'flex',alignItems:'center',gap:12,
    padding:'12px 14px',border:'none',cursor:'pointer',
    background: active ? '#eff6ff' : 'transparent',
    borderLeft: `3px solid ${active ? '#2563eb' : 'transparent'}`,
    transition:'all 0.15s',textAlign:'left',
  }}
    onMouseEnter={e=>{ if(!active) e.currentTarget.style.background='#f8fafc'; }}
    onMouseLeave={e=>{ if(!active) e.currentTarget.style.background='transparent'; }}
  >
    <div style={{ position:'relative',flexShrink:0 }}>
      <Avatar name={contact.name} size={44} url={contact.avatar} />
      {contact.online && <span style={{ position:'absolute',bottom:1,right:1,width:10,height:10,background:'#22c55e',borderRadius:'50%',border:'2px solid #fff' }} />}
    </div>
    <div style={{ flex:1,minWidth:0 }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:2 }}>
        <span style={{ fontWeight:700,fontSize:14,color:'#1e293b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1 }}>{contact.name}</span>
        {contact.lastTime && <span style={{ fontSize:11,color:'#94a3b8',marginLeft:6,flexShrink:0 }}>{formatTime(contact.lastTime)}</span>}
      </div>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <span style={{ fontSize:12,color:'#64748b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1 }}>
          {contact.lastMsg || <em style={{ color:'#cbd5e1' }}>Start a conversation</em>}
        </span>
        {unread > 0 && <span style={{ background:'#2563eb',color:'#fff',borderRadius:999,fontSize:11,fontWeight:700,padding:'1px 6px',marginLeft:4,flexShrink:0 }}>{unread}</span>}
      </div>
      <span style={{ fontSize:10,color:ROLE_COLORS[contact.role]||'#94a3b8',fontWeight:600,textTransform:'capitalize' }}>{contact.role}</span>
    </div>
  </button>
);

// ── Message Bubble ────────────────────────────────────────────
const Bubble = ({ msg, isMe, name, avatar }) => (
  <div style={{ display:'flex',flexDirection:isMe?'row-reverse':'row',alignItems:'flex-end',gap:8,marginBottom:10 }}>
    {!isMe && <Avatar name={name} size={28} url={avatar} />}
    <div style={{ maxWidth:'68%' }}>
      {!isMe && <span style={{ fontSize:11,color:'#94a3b8',fontWeight:600,marginBottom:3,display:'block',marginLeft:2 }}>{name}</span>}
      <div style={{
        background: isMe ? 'linear-gradient(135deg,#2563eb,#1d4ed8)' : '#fff',
        color: isMe ? '#fff' : '#1e293b',
        borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        padding:'10px 14px',fontSize:14,lineHeight:1.55,
        boxShadow: isMe ? '0 2px 8px rgba(37,99,235,0.25)' : '0 1px 4px rgba(0,0,0,0.07)',
        border: isMe ? 'none' : '1px solid #e2e8f0',
        wordBreak:'break-word',
      }}>
        {msg.message}
      </div>
      <div style={{ fontSize:11,color:'#94a3b8',marginTop:3,textAlign:isMe?'right':'left' }}>
        {formatMsgTime(msg.createdAt)}{isMe && <span style={{ marginLeft:3 }}>{msg.isRead?'✓✓':'✓'}</span>}
      </div>
    </div>
  </div>
);

// ── Date Divider ──────────────────────────────────────────────
const DateDivider = ({ date }) => (
  <div style={{ display:'flex',alignItems:'center',gap:10,margin:'16px 0' }}>
    <div style={{ flex:1,height:1,background:'#e2e8f0' }} />
    <span style={{ fontSize:11,color:'#94a3b8',fontWeight:600,background:'#f8fafc',padding:'2px 12px',borderRadius:999,border:'1px solid #e2e8f0',whiteSpace:'nowrap' }}>
      {new Date(date).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'})}
    </span>
    <div style={{ flex:1,height:1,background:'#e2e8f0' }} />
  </div>
);

// ── Typing Dots ───────────────────────────────────────────────
const TypingDots = ({ name, avatar }) => (
  <div style={{ display:'flex',alignItems:'flex-end',gap:8,marginBottom:10 }}>
    <Avatar name={name} size={28} url={avatar} />
    <div style={{ background:'#fff',borderRadius:'18px 18px 18px 4px',padding:'10px 16px',border:'1px solid #e2e8f0',boxShadow:'0 1px 4px rgba(0,0,0,0.07)' }}>
      <div style={{ display:'flex',gap:4,alignItems:'center',height:14 }}>
        {[0,1,2].map(i=>(
          <div key={i} style={{ width:7,height:7,borderRadius:'50%',background:'#94a3b8',animation:`dot-bounce 1.2s infinite ${i*0.2}s` }} />
        ))}
      </div>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════
// MAIN CHAT PAGE
// ════════════════════════════════════════════════════════════
export default function ChatPage() {
  const { user } = useAuth();
  const [contacts, setContacts]         = useState([]);
  const [selected, setSelected]         = useState(null);
  const [messages, setMessages]         = useState([]);
  const [input, setInput]               = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMsgs, setLoadingMsgs]   = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [search, setSearch]             = useState('');
  const [socket, setSocket]             = useState(null);
  const [onlineUsers, setOnlineUsers]   = useState(new Set());
  const [showContacts, setShowContacts] = useState(true); // mobile toggle

  const endRef      = useRef(null);
  const typingRef   = useRef(null);
  const inputRef    = useRef(null);
  const isTypingRef = useRef(false);

  // ── Init socket ─────────────────────────────────────────────
  useEffect(() => {
    const base = (process.env.REACT_APP_API_URL||'http://localhost:5000/api').replace('/api','');
    const s = io(base, { transports:['websocket','polling'] });
    setSocket(s);

    s.on('receive_message', msg => {
      setMessages(prev => prev.find(m=>m._id===msg._id) ? prev : [...prev, msg]);
      setContacts(prev => prev.map(c =>
        c._id === (msg.senderId?._id||msg.senderId)
          ? { ...c, lastMsg:msg.message, lastTime:msg.createdAt, unread:(c.unread||0)+1 }
          : c
      ));
    });

    s.on('user_typing',  data => { if (data.senderId !== user?.id) setPartnerTyping(true);  });
    s.on('stop_typing',  data => { if (data.senderId !== user?.id) setPartnerTyping(false); });

    return () => s.disconnect();
  }, [user?.id]);

  // ── Load contacts ───────────────────────────────────────────
  useEffect(() => {
    setLoadingContacts(true);
    // Try messages/contacts first, fallback to admin users list
    API.get('/messages/contacts')
      .then(r => setContacts(r.data.contacts||[]))
      .catch(() =>
        API.get('/admin/users?limit=50')
          .then(r => {
            const list = (r.data.users||[])
              .filter(u => u._id !== user?.id && u.isEmailVerified && u.isActive)
              .map(u => ({ ...u, lastMsg:'', lastTime:null, unread:0 }));
            setContacts(list);
          })
          .catch(()=>{})
      )
      .finally(() => setLoadingContacts(false));
  }, [user?.id]);

  // ── Load messages when contact selected ─────────────────────
  useEffect(() => {
    if (!selected) return;
    setLoadingMsgs(true);
    setMessages([]);
    setPartnerTyping(false);

    const room = [user?.id, selected._id].sort().join('_');
    socket?.emit('join_room', room);

    API.get(`/messages/${selected._id}`)
      .then(r => {
        setMessages(r.data.messages||[]);
        setContacts(prev => prev.map(c => c._id===selected._id ? {...c, unread:0} : c));
      })
      .catch(() => setMessages([]))
      .finally(() => setLoadingMsgs(false));
  }, [selected?._id, socket, user?.id]); // eslint-disable-line

  // ── Auto scroll ─────────────────────────────────────────────
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages, partnerTyping]);

  // ── Send message ────────────────────────────────────────────
  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || !selected) return;
    setInput('');

    // Optimistic add
    const temp = {
      _id: `temp_${Date.now()}`,
      senderId: user?.id,
      receiverId: selected._id,
      message: text,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages(p => [...p, temp]);

    // Emit via socket
    const room = [user?.id, selected._id].sort().join('_');
    socket?.emit('send_message', { ...temp, room });

    // Persist to DB
    try {
      const r = await API.post('/messages', { receiverId:selected._id, message:text });
      setMessages(p => p.map(m => m._id===temp._id ? r.data.message : m));
      setContacts(p => p.map(c => c._id===selected._id
        ? { ...c, lastMsg:text, lastTime:new Date().toISOString() }
        : c
      ));
    } catch {
      toast.error('Message failed to send.');
      setMessages(p => p.filter(m => m._id!==temp._id));
    }
  }, [input, selected, socket, user?.id]);

  // ── Typing events ────────────────────────────────────────────
  const handleTyping = val => {
    setInput(val);
    if (!selected || !socket) return;
    const room = [user?.id, selected._id].sort().join('_');
    if (!isTypingRef.current) {
      socket.emit('typing', { room, senderId:user?.id });
      isTypingRef.current = true;
    }
    clearTimeout(typingRef.current);
    typingRef.current = setTimeout(() => {
      socket.emit('stop_typing', { room, senderId:user?.id });
      isTypingRef.current = false;
    }, 1500);
  };

  // ── Group messages by date ────────────────────────────────────
  const grouped = () => {
    const out = [];
    messages.forEach((msg, i) => {
      if (i === 0 || !isSameDay(messages[i-1].createdAt, msg.createdAt)) {
        out.push({ type:'date', key:`d_${i}`, date:msg.createdAt });
      }
      out.push({ type:'msg', key:msg._id||i, msg });
    });
    return out;
  };

  const filtered = contacts.filter(c =>
    (c.name||'').toLowerCase().includes(search.toLowerCase())
  );

  const selectContact = c => {
    setSelected(c);
    setShowContacts(false); // mobile: switch to chat view
    setTimeout(() => inputRef.current?.focus(), 200);
  };

  // ════════════════════════════════════════════════════════════
  return (
    <div style={{ display:'flex', height:'calc(100vh - 64px)', overflow:'hidden', background:'#f1f5f9' }}>

      {/* ── CONTACTS PANEL ──────────────────────────────── */}
      <div style={{
        width:300, minWidth:260, background:'#fff',
        borderRight:'1px solid #e2e8f0',
        display:'flex', flexDirection:'column',
        flexShrink:0,
        // Mobile: full width when shown
      }}>
        {/* Header */}
        <div style={{ padding:'16px 16px 12px', borderBottom:'1px solid #f1f5f9' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <h2 style={{ fontSize:18,fontWeight:800,color:'#1e293b',margin:0 }}>💬 Messages</h2>
            <span style={{ fontSize:12,color:'#94a3b8' }}>{contacts.length} contacts</span>
          </div>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',fontSize:14,color:'#94a3b8' }}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search contacts..."
              style={{ width:'100%',padding:'9px 12px 9px 32px',borderRadius:10,border:'1.5px solid #e2e8f0',fontSize:13,outline:'none',background:'#f8fafc',color:'#374151',boxSizing:'border-box' }}
              onFocus={e=>e.target.style.borderColor='#2563eb'}
              onBlur={e=>e.target.style.borderColor='#e2e8f0'}
            />
          </div>
        </div>

        {/* List */}
        <div style={{ flex:1,overflowY:'auto' }}>
          {loadingContacts ? (
            <div style={{ padding:32,textAlign:'center',color:'#94a3b8' }}>
              <div style={{ fontSize:32,marginBottom:8 }}>⏳</div>
              <p style={{ fontSize:13 }}>Loading contacts...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding:32,textAlign:'center',color:'#94a3b8' }}>
              <div style={{ fontSize:48,marginBottom:8 }}>👥</div>
              <p style={{ fontSize:13,fontWeight:600,color:'#64748b' }}>No contacts found</p>
              <p style={{ fontSize:12 }}>Try searching a different name.</p>
            </div>
          ) : filtered.map(c => (
            <ContactItem
              key={c._id}
              contact={{ ...c, online:onlineUsers.has(c._id) }}
              active={selected?._id === c._id}
              unread={c.unread||0}
              onClick={() => selectContact(c)}
            />
          ))}
        </div>
      </div>

      {/* ── CHAT PANEL ──────────────────────────────────── */}
      <div style={{ flex:1,display:'flex',flexDirection:'column',minWidth:0,background:'#f8fafc' }}>

        {!selected ? (
          /* Empty state */
          <div style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'#94a3b8',padding:32,textAlign:'center' }}>
            <div style={{ fontSize:72,marginBottom:20 }}>💬</div>
            <h3 style={{ color:'#1e293b',margin:'0 0 10px',fontSize:22,fontWeight:800 }}>Start a Conversation</h3>
            <p style={{ fontSize:14,lineHeight:1.7,maxWidth:300,color:'#64748b' }}>
              Select a contact from the left panel to start messaging. Connect with alumni, teachers and students!
            </p>
            <div style={{ marginTop:24,display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center' }}>
              {['Chat with Alumni 🎓','Ask a Teacher 👨‍🏫','Connect with Students 👨‍🎓'].map(t=>(
                <span key={t} style={{ background:'#fff',border:'1.5px solid #e2e8f0',borderRadius:999,padding:'8px 16px',fontSize:13,fontWeight:600,color:'#374151' }}>{t}</span>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div style={{ padding:'12px 20px',background:'#fff',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',gap:14,boxShadow:'0 1px 4px rgba(0,0,0,0.05)',flexShrink:0 }}>
              <div style={{ position:'relative' }}>
                <Avatar name={selected.name} size={44} url={selected.avatar} />
                {onlineUsers.has(selected._id) && <span style={{ position:'absolute',bottom:1,right:1,width:10,height:10,background:'#22c55e',borderRadius:'50%',border:'2px solid #fff' }} />}
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <h3 style={{ fontSize:15,fontWeight:700,color:'#1e293b',margin:'0 0 2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{selected.name}</h3>
                <p style={{ fontSize:12,margin:0,color:partnerTyping?'#2563eb':onlineUsers.has(selected._id)?'#22c55e':'#94a3b8',fontWeight:500 }}>
                  {partnerTyping ? '✍️ typing...' : onlineUsers.has(selected._id) ? '● Online now' : '○ Offline'}
                </p>
              </div>
              <span style={{ background:`${ROLE_COLORS[selected.role]||'#64748b'}18`,color:ROLE_COLORS[selected.role]||'#64748b',border:`1px solid ${ROLE_COLORS[selected.role]||'#64748b'}30`,borderRadius:999,padding:'3px 12px',fontSize:12,fontWeight:700,textTransform:'capitalize',flexShrink:0 }}>
                {selected.role}
              </span>
            </div>

            {/* Messages */}
            <div style={{ flex:1,overflowY:'auto',padding:'20px 20px 8px' }}>
              {loadingMsgs ? (
                <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',color:'#94a3b8',gap:12 }}>
                  <div style={{ fontSize:36 }}>⏳</div>
                  <p style={{ fontSize:14 }}>Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',color:'#94a3b8',gap:10 }}>
                  <Avatar name={selected.name} size={64} url={selected.avatar} />
                  <h4 style={{ color:'#1e293b',margin:'8px 0 4px',fontSize:16,fontWeight:700 }}>{selected.name}</h4>
                  <span style={{ background:`${ROLE_COLORS[selected.role]||'#64748b'}15`,color:ROLE_COLORS[selected.role]||'#64748b',borderRadius:999,padding:'3px 12px',fontSize:12,fontWeight:700,textTransform:'capitalize' }}>{selected.role}</span>
                  <p style={{ fontSize:13,color:'#94a3b8',marginTop:8 }}>No messages yet. Say hello! 👋</p>
                </div>
              ) : (
                grouped().map(item =>
                  item.type === 'date'
                    ? <DateDivider key={item.key} date={item.date} />
                    : <Bubble
                        key={item.key}
                        msg={item.msg}
                        isMe={item.msg.senderId === user?.id || item.msg.senderId?._id === user?.id}
                        name={selected.name}
                        avatar={selected.avatar}
                      />
                )
              )}
              {partnerTyping && <TypingDots name={selected.name} avatar={selected.avatar} />}
              <div ref={endRef} />
            </div>

            {/* Input bar */}
            <div style={{ padding:'12px 16px',background:'#fff',borderTop:'1px solid #e2e8f0',display:'flex',alignItems:'flex-end',gap:8,flexShrink:0 }}>

              {/* Emoji buttons */}
              <div style={{ display:'flex',gap:4,flexShrink:0 }}>
                {['😊','👍','🙏','🎉'].map(e=>(
                  <button key={e} onClick={()=>setInput(i=>i+e)}
                    style={{ background:'#f8fafc',border:'1.5px solid #e2e8f0',borderRadius:8,width:34,height:34,fontSize:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s' }}
                    onMouseEnter={e2=>{e2.currentTarget.style.background='#eff6ff';e2.currentTarget.style.borderColor='#2563eb';}}
                    onMouseLeave={e2=>{e2.currentTarget.style.background='#f8fafc';e2.currentTarget.style.borderColor='#e2e8f0';}}>
                    {e}
                  </button>
                ))}
              </div>

              {/* Text area */}
              <div style={{ flex:1,background:'#f8fafc',border:'1.5px solid #e2e8f0',borderRadius:14,padding:'8px 14px',display:'flex',alignItems:'flex-end',transition:'border-color 0.15s' }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e=>{
                    handleTyping(e.target.value);
                    e.target.style.height='auto';
                    e.target.style.height=Math.min(e.target.scrollHeight,120)+'px';
                  }}
                  onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();} }}
                  placeholder={`Message ${selected.name}... (Enter to send, Shift+Enter for new line)`}
                  rows={1}
                  style={{ flex:1,background:'none',border:'none',outline:'none',resize:'none',fontSize:14,color:'#1e293b',lineHeight:1.5,maxHeight:120,fontFamily:'inherit',padding:0 }}
                  onFocus={e=>e.target.parentElement.style.borderColor='#2563eb'}
                  onBlur={e=>e.target.parentElement.style.borderColor='#e2e8f0'}
                />
              </div>

              {/* Send button */}
              <button onClick={send} disabled={!input.trim()} style={{
                width:42,height:42,borderRadius:12,border:'none',
                cursor:input.trim()?'pointer':'not-allowed',
                background:input.trim()?'linear-gradient(135deg,#2563eb,#1d4ed8)':'#e2e8f0',
                color:input.trim()?'#fff':'#94a3b8',
                fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',
                flexShrink:0,transition:'all 0.2s',
                boxShadow:input.trim()?'0 4px 12px rgba(37,99,235,0.4)':'none',
              }}>
                ➤
              </button>
            </div>
          </>
        )}
      </div>

      {/* Bounce animation for typing dots */}
      <style>{`
        @keyframes dot-bounce {
          0%,60%,100%{ transform:translateY(0); }
          30%{ transform:translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
