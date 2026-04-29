import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill all fields.'); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}! 👋`);
      navigate('/dashboard');
    } catch (err) {
      if (err.data?.needsVerification) {
        toast.error('Please verify your email first!');
        navigate('/verify-email', { state: { email: form.email, type: 'EMAIL_VERIFY' } });
      } else {
        toast.error(err.message || 'Login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    width: '100%', padding: '12px 16px', borderRadius: 12,
    border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none',
    background: '#f8fafc', color: '#1e293b', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(59,130,246,0.4)' }}>🎓</div>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 900, margin: 0 }}>Welcome Back!</h1>
          <p style={{ color: '#93c5fd', marginTop: 8, fontSize: 14 }}>Sign in to Alumni Portal</p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email Address</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="your@college.edu" style={inp}
                onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.background = '#fff'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>Forgot password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Your password" style={{ ...inp, paddingRight: 44 }}
                  onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.background = '#fff'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', marginTop: 24,
              background: loading ? '#93c5fd' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#fff', border: 'none', borderRadius: 12, fontSize: 15,
              fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(37,99,235,0.4)',
            }}>
              {loading ? '⏳ Signing in...' : '🔐 Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#64748b' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
