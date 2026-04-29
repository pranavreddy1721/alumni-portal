import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'student', emoji: '👨‍🎓', label: 'Student', desc: 'Find alumni & jobs' },
  { value: 'alumni', emoji: '🎓', label: 'Alumni', desc: 'Share & refer jobs' },
  { value: 'teacher', emoji: '👨‍🏫', label: 'Teacher', desc: 'Guide students' },
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.password || form.password.length < 8) e.password = 'Min 8 characters';
    else if (!/(?=.*[A-Z])/.test(form.password)) e.password = 'Must have 1 uppercase letter';
    else if (!/(?=.*[0-9])/.test(form.password)) e.password = 'Must have 1 number';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await authService.register({ name: form.name, email: form.email, password: form.password, role: form.role });
      toast.success('Account created! Check your email for OTP.');
      navigate('/verify-email', { state: { email: form.email, type: 'EMAIL_VERIFY' } });
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const inp = (name) => ({
    width: '100%', padding: '12px 16px', borderRadius: 12,
    border: `1.5px solid ${errors[name] ? '#f87171' : '#e2e8f0'}`,
    fontSize: 14, outline: 'none', background: errors[name] ? '#fef2f2' : '#f8fafc',
    color: '#1e293b', boxSizing: 'border-box',
  });

  const Field = ({ name, label, type = 'text', placeholder }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
      <input type={type} value={form[name]} placeholder={placeholder} style={inp(name)}
        onChange={(e) => { setForm({ ...form, [name]: e.target.value }); setErrors({ ...errors, [name]: '' }); }}
        onFocus={(e) => { if (!errors[name]) { e.target.style.borderColor = '#3b82f6'; e.target.style.background = '#fff'; } }}
        onBlur={(e) => { if (!errors[name]) { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; } }}
      />
      {errors[name] && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>⚠️ {errors[name]}</p>}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(59,130,246,0.4)' }}>🎓</div>
          <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 900, margin: 0 }}>Create Account</h1>
          <p style={{ color: '#93c5fd', marginTop: 8, fontSize: 14 }}>Join the Alumni Portal Network</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
          <form onSubmit={handleSubmit}>
            <Field name="name" label="Full Name" placeholder="e.g. Rahul Sharma" />
            <Field name="email" label="Email Address" type="email" placeholder="your@college.edu" />
            <Field name="password" label="Password" type="password" placeholder="Min 8 chars, 1 uppercase, 1 number" />
            <Field name="confirmPassword" label="Confirm Password" type="password" placeholder="Repeat your password" />

            {/* Role Selection */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>I am a...</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {ROLES.map((r) => (
                  <button key={r.value} type="button" onClick={() => setForm({ ...form, role: r.value })}
                    style={{
                      padding: '12px 8px', borderRadius: 12, border: `2px solid ${form.role === r.value ? '#2563eb' : '#e2e8f0'}`,
                      background: form.role === r.value ? '#eff6ff' : '#f8fafc',
                      cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                    }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{r.emoji}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: form.role === r.value ? '#2563eb' : '#374151' }}>{r.label}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px',
              background: loading ? '#93c5fd' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#fff', border: 'none', borderRadius: 12, fontSize: 15,
              fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(37,99,235,0.4)',
            }}>
              {loading ? '⏳ Creating Account...' : '🚀 Create Account & Get OTP'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
