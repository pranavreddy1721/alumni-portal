import { useState, useEffect } from 'react';
import API from '../../services/api';
import ProfileCard from '../../components/ProfileCard';
import toast from 'react-hot-toast';

export default function AlumniSearch() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', skills: '', company: '', batch: '', mentorship: false });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAlumni = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 12 });
      if (filters.name) params.set('name', filters.name);
      if (filters.skills) params.set('skills', filters.skills);
      if (filters.company) params.set('company', filters.company);
      if (filters.batch) params.set('batch', filters.batch);
      if (filters.mentorship) params.set('mentorship', 'true');

      const res = await API.get(`/profiles/alumni/search?${params}`);
      setProfiles(res.data.profiles || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      toast.error('Failed to load alumni.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlumni(1); }, []);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchAlumni(1); };

  const inp = { padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#f8fafc', color: '#1e293b' };

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: 0 }}>👥 Find Alumni</h1>
        <p style={{ color: '#64748b', marginTop: 6, fontSize: 14 }}>{profiles.length} alumni found in network</p>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 12 }}>
          <input value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} placeholder="🔍 Search by name..." style={inp} />
          <input value={filters.skills} onChange={(e) => setFilters({ ...filters, skills: e.target.value })} placeholder="🛠 Skills (comma separated)" style={inp} />
          <input value={filters.company} onChange={(e) => setFilters({ ...filters, company: e.target.value })} placeholder="🏢 Company" style={inp} />
          <input value={filters.batch} onChange={(e) => setFilters({ ...filters, batch: e.target.value })} placeholder="🎓 Batch Year (e.g. 2020)" style={inp} maxLength={4} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#374151', fontWeight: 500 }}>
            <input type="checkbox" checked={filters.mentorship} onChange={(e) => setFilters({ ...filters, mentorship: e.target.checked })} style={{ width: 16, height: 16 }} />
            Show mentors only
          </label>
          <button type="submit" style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            Search
          </button>
          <button type="button" onClick={() => { setFilters({ name: '', skills: '', company: '', batch: '', mentorship: false }); fetchAlumni(1); }}
            style={{ padding: '10px 16px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            Clear
          </button>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
          <p>Loading alumni...</p>
        </div>
      ) : profiles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <h3 style={{ color: '#1e293b', margin: '0 0 8px' }}>No alumni found</h3>
          <p style={{ fontSize: 14 }}>Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {profiles.map((profile) => (
              <ProfileCard
                key={profile._id}
                profile={profile}
                onConnect={() => toast.success(`Connection request sent to ${profile.userId?.name}!`)}
                onView={() => {}}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => { setPage(p); fetchAlumni(p); }}
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
