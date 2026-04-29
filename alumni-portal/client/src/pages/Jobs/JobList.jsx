import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import toast from 'react-hot-toast';

const TYPE_COLORS = { 'full-time': ['#eff6ff','#2563eb'], internship: ['#fffbeb','#d97706'], contract: ['#f5f3ff','#7c3aed'], remote: ['#f0fdf4','#059669'], 'part-time': ['#fff1f2','#e11d48'] };

function JobCard({ job, userRole, onApply }) {
  const [expanded, setExpanded] = useState(false);
  const [tc] = TYPE_COLORS[job.type] || ['#f8fafc','#64748b'];

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'box-shadow 0.2s' }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}>
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{job.title}</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>🏢 {job.company} {job.location ? `· 📍 ${job.location}` : ''}</p>
          </div>
          <span style={{ background: tc[0], color: tc[1], fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999, flexShrink: 0, textTransform: 'capitalize' }}>{job.type}</span>
        </div>

        {job.salary && <p style={{ margin: '0 0 10px', color: '#059669', fontWeight: 600, fontSize: 13 }}>💰 {job.salary}</p>}

        <p style={{ margin: '0 0 12px', color: '#475569', fontSize: 13, lineHeight: 1.6, display: expanded ? 'block' : '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {job.description}
        </p>

        {job.skills?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {job.skills.map((s) => (
              <span key={s} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontSize: 11, padding: '3px 10px', borderRadius: 6, fontWeight: 500 }}>{s}</span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>
            {job.postedBy?.name && `Posted by ${job.postedBy.name}`}
            {job.deadline && ` · Deadline: ${new Date(job.deadline).toLocaleDateString('en-IN')}`}
            {job.applicants?.length > 0 && ` · ${job.applicants.length} applicant(s)`}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setExpanded(!expanded)} style={{ padding: '7px 14px', background: '#f8fafc', color: '#64748b', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              {expanded ? 'Show Less' : 'Read More'}
            </button>
            {userRole === 'student' && (
              <button onClick={() => onApply(job)} style={{ padding: '7px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}>
                Apply Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PostJobModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ title: '', company: '', description: '', skills: '', location: '', type: 'full-time', salary: '', deadline: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.company || !form.description) { toast.error('Title, company and description required.'); return; }
    setLoading(true);
    try {
      await API.post('/jobs', { ...form, skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean) });
      toast.success('Job posted successfully! 🎉');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to post job.');
    } finally { setLoading(false); }
  };

  const inp = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', background: '#f8fafc', color: '#1e293b', boxSizing: 'border-box' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 28, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1e293b' }}>💼 Post a Job</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            {[{ key: 'title', label: 'Job Title *', placeholder: 'e.g. Frontend Developer' }, { key: 'company', label: 'Company *', placeholder: 'e.g. Google' }, { key: 'location', label: 'Location', placeholder: 'e.g. Bangalore / Remote' }, { key: 'salary', label: 'Salary / Stipend', placeholder: 'e.g. ₹8-12 LPA' }].map((f) => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{f.label}</label>
                <input value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} style={inp} />
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Job Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ ...inp }}>
              {['full-time', 'part-time', 'internship', 'contract', 'remote'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Skills Required (comma separated)</label>
            <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="e.g. React, Node.js, MongoDB" style={inp} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Application Deadline</label>
            <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} style={inp} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Job Description *</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the role, responsibilities, and requirements..." rows={4} style={{ ...inp, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', background: '#f8fafc', color: '#64748b', border: '1.5px solid #e2e8f0', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              {loading ? '⏳ Posting...' : '🚀 Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function JobList() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchJobs = async (p = 1, type = filter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 8 });
      if (type !== 'all') params.set('type', type);
      const res = await API.get(`/jobs?${params}`);
      setJobs(res.data.jobs || []);
      setTotalPages(res.data.pages || 1);
    } catch { toast.error('Failed to load jobs.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (t) => { setFilter(t); setPage(1); fetchJobs(1, t); };

  const handleApply = async (job) => {
    try {
      await API.post(`/jobs/${job._id}/apply`, {});
      toast.success(`Applied to ${job.title} at ${job.company}! ✅`);
    } catch (err) { toast.error(err.message || 'Application failed.'); }
  };

  const canPost = ['alumni', 'admin', 'superadmin'].includes(user?.role);
  const types = ['all', 'full-time', 'internship', 'contract', 'remote', 'part-time'];

  return (
    <div style={{ padding: 24 }}>
      {showModal && <PostJobModal onClose={() => setShowModal(false)} onSuccess={() => fetchJobs()} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: 0 }}>💼 Jobs & Referrals</h1>
          <p style={{ color: '#64748b', marginTop: 6, fontSize: 14 }}>{jobs.length} opportunities available</p>
        </div>
        {canPost && (
          <button onClick={() => setShowModal(true)} style={{ padding: '11px 22px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
            + Post a Job
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {types.map((t) => (
          <button key={t} onClick={() => handleFilterChange(t)}
            style={{ padding: '8px 18px', borderRadius: 999, border: '1.5px solid', borderColor: filter === t ? '#2563eb' : '#e2e8f0', background: filter === t ? '#2563eb' : '#fff', color: filter === t ? '#fff' : '#64748b', fontWeight: filter === t ? 700 : 500, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div><p>Loading jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💼</div>
          <h3 style={{ color: '#1e293b', margin: '0 0 8px' }}>No jobs found</h3>
          <p style={{ fontSize: 14 }}>{canPost ? 'Be the first to post a job!' : 'Check back later.'}</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {jobs.map((job) => <JobCard key={job._id} job={job} userRole={user?.role} onApply={handleApply} />)}
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => { setPage(p); fetchJobs(p); }}
                  style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid', borderColor: p === page ? '#2563eb' : '#e2e8f0', background: p === page ? '#2563eb' : '#fff', color: p === page ? '#fff' : '#374151', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
