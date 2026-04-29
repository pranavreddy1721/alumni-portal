import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import toast from 'react-hot-toast';

const CAT_COLORS = { workshop: ['#eff6ff','#2563eb'], seminar: ['#f5f3ff','#7c3aed'], 'alumni-meet': ['#f0fdf4','#059669'], webinar: ['#fff7ed','#d97706'], hackathon: ['#fff1f2','#e11d48'], other: ['#f8fafc','#64748b'] };

function EventCard({ event, onRegister }) {
  const pct = event.maxAttendees ? Math.min((event.registrations?.length / event.maxAttendees) * 100, 100) : 0;
  const isFull = event.maxAttendees && event.registrations?.length >= event.maxAttendees;

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s' }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'none'; }}>
      {/* Color accent bar */}
      <div style={{ height: 4, background: CAT_COLORS[event.category]?.[1] || '#64748b' }} />
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <span style={{ background: CAT_COLORS[event.category]?.[0] || '#f8fafc', color: CAT_COLORS[event.category]?.[1] || '#64748b', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999, textTransform: 'capitalize' }}>
            {event.category}
          </span>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(event.date).getFullYear()}</div>
          </div>
        </div>

        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: '#1e293b', lineHeight: 1.3 }}>{event.title}</h3>
        <p style={{ margin: '0 0 12px', color: '#64748b', fontSize: 13, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{event.description}</p>

        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>
          📍 {event.isOnline ? 'Online Event' : event.venue}
          {event.time && ` · ⏰ ${event.time}`}
        </div>

        {/* Attendee bar */}
        {event.maxAttendees && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>
              <span>{event.registrations?.length || 0} registered</span>
              <span>{event.maxAttendees} max</span>
            </div>
            <div style={{ height: 5, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: isFull ? '#ef4444' : '#2563eb', borderRadius: 999 }} />
            </div>
          </div>
        )}

        <button onClick={() => onRegister(event)} disabled={isFull}
          style={{ width: '100%', padding: '11px', background: isFull ? '#f1f5f9' : '#2563eb', color: isFull ? '#94a3b8' : '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: isFull ? 'not-allowed' : 'pointer' }}>
          {isFull ? '❌ Fully Booked' : '✅ Register Now'}
        </button>
      </div>
    </div>
  );
}

function CreateEventModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ title: '', description: '', date: '', time: '', venue: '', isOnline: false, meetLink: '', category: 'workshop', maxAttendees: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.date) { toast.error('Title, description and date required.'); return; }
    setLoading(true);
    try {
      await API.post('/events', form);
      toast.success('Event created! 🎉');
      onSuccess();
      onClose();
    } catch (err) { toast.error(err.message || 'Failed to create event.'); }
    finally { setLoading(false); }
  };

  const inp = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', background: '#f8fafc', color: '#1e293b', boxSizing: 'border-box' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 28, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1e293b' }}>📅 Create Event</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Event Title *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. React Workshop 2025" style={inp} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Date *</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Time</label>
              <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inp}>
                {['workshop','seminar','alumni-meet','webinar','hackathon','other'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Max Attendees</label>
              <input type="number" value={form.maxAttendees} onChange={(e) => setForm({ ...form, maxAttendees: e.target.value })} placeholder="e.g. 100" style={inp} />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
              <input type="checkbox" checked={form.isOnline} onChange={(e) => setForm({ ...form, isOnline: e.target.checked })} style={{ width: 16, height: 16 }} />
              This is an online event
            </label>
            {form.isOnline ? (
              <input value={form.meetLink} onChange={(e) => setForm({ ...form, meetLink: e.target.value })} placeholder="Meet/Zoom link" style={inp} />
            ) : (
              <input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="Venue / Location" style={inp} />
            )}
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Description *</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the event..." rows={4} style={{ ...inp, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', background: '#f8fafc', color: '#64748b', border: '1.5px solid #e2e8f0', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
              {loading ? '⏳ Creating...' : '🚀 Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EventList() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const fetchEvents = async (cat = filter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ upcoming: 'true' });
      if (cat !== 'all') params.set('category', cat);
      const res = await API.get(`/events?${params}`);
      setEvents(res.data.events || []);
    } catch { toast.error('Failed to load events.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const handleRegister = async (event) => {
    try {
      await API.post(`/events/${event._id}/register`);
      toast.success(`Registered for ${event.title}! 🎉`);
      fetchEvents();
    } catch (err) { toast.error(err.message || 'Registration failed.'); }
  };

  const canCreate = ['admin', 'superadmin', 'teacher', 'alumni'].includes(user?.role);
  const cats = ['all', 'workshop', 'seminar', 'alumni-meet', 'webinar', 'hackathon'];

  return (
    <div style={{ padding: 24 }}>
      {showModal && <CreateEventModal onClose={() => setShowModal(false)} onSuccess={fetchEvents} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: 0 }}>📅 Events</h1>
          <p style={{ color: '#64748b', marginTop: 6, fontSize: 14 }}>{events.length} upcoming events</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowModal(true)} style={{ padding: '11px 22px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
            + Create Event
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {cats.map((c) => (
          <button key={c} onClick={() => { setFilter(c); fetchEvents(c); }}
            style={{ padding: '8px 18px', borderRadius: 999, border: '1.5px solid', borderColor: filter === c ? '#2563eb' : '#e2e8f0', background: filter === c ? '#2563eb' : '#fff', color: filter === c ? '#fff' : '#64748b', fontWeight: filter === c ? 700 : 500, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize' }}>
            {c}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div><p>Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
          <h3 style={{ color: '#1e293b', margin: '0 0 8px' }}>No events found</h3>
          <p style={{ fontSize: 14 }}>{canCreate ? 'Create the first event!' : 'Check back soon.'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {events.map((event) => <EventCard key={event._id} event={event} onRegister={handleRegister} />)}
        </div>
      )}
    </div>
  );
}
