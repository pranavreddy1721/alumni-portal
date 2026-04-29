import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

// Step 1: Enter email
function StepEmail({ onNext }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) { toast.error('Enter a valid email.'); return; }
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      toast.success('OTP sent! Check your email.');
      onNext(email);
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP.');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20, textAlign: 'center' }}>
        Enter your registered email and we'll send you an OTP.
      </p>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Registered Email</label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@college.edu"
        style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', background: '#f8fafc', color: '#1e293b', boxSizing: 'border-box', marginBottom: 20 }}
        onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.background = '#fff'; }}
        onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
      />
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
        <p style={{ color: '#1e40af', fontSize: 12, lineHeight: 1.6 }}>
          💡 <strong>Steps:</strong> Enter email → Receive OTP → Verify OTP → Set new password
        </p>
      </div>
      <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: loading ? '#93c5fd' : 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px rgba(249,115,22,0.4)' }}>
        {loading ? '⏳ Sending OTP...' : '📧 Send Reset OTP'}
      </button>
    </form>
  );
}

// Step 2: Enter OTP (reuses same pattern as VerifyOTP)
function StepOTP({ email, onNext }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const refArr = [];

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 5) refArr[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refArr[i - 1]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Enter the complete 6-digit OTP.'); return; }
    setLoading(true);
    try {
      const res = await authService.verifyResetOTP({ email, otp: code });
      toast.success('OTP verified!');
      onNext(res.data.resetToken);
    } catch (err) {
      toast.error(err.message || 'Invalid OTP.');
      setOtp(['', '', '', '', '', '']);
    } finally { setLoading(false); }
  };

  return (
    <div>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 4, textAlign: 'center' }}>OTP sent to</p>
      <p style={{ color: '#1e293b', fontWeight: 700, textAlign: 'center', marginBottom: 24 }}>{email}</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
        {otp.map((digit, i) => (
          <input key={i} ref={(el) => (refArr[i] = el)} maxLength={1} value={digit}
            onChange={(e) => handleChange(i, e.target.value)} onKeyDown={(e) => handleKeyDown(i, e)}
            style={{ width: 48, height: 56, textAlign: 'center', fontSize: 24, fontWeight: 800, borderRadius: 12, border: `2px solid ${digit ? '#f97316' : '#e2e8f0'}`, background: digit ? '#fff7ed' : '#f8fafc', outline: 'none' }}
          />
        ))}
      </div>
      <button onClick={handleVerify} disabled={loading || otp.join('').length !== 6} style={{ width: '100%', padding: '14px', background: otp.join('').length === 6 ? 'linear-gradient(135deg, #f97316, #ea580c)' : '#e2e8f0', color: otp.join('').length === 6 ? '#fff' : '#94a3b8', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: otp.join('').length === 6 ? 'pointer' : 'not-allowed' }}>
        {loading ? '⏳ Verifying...' : '✅ Verify OTP'}
      </button>
    </div>
  );
}

// Step 3: Set new password
function StepNewPassword({ resetToken }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Minimum 8 characters.'); return; }
    if (!/(?=.*[A-Z])/.test(form.password)) { toast.error('Must have 1 uppercase letter.'); return; }
    if (!/(?=.*[0-9])/.test(form.password)) { toast.error('Must have 1 number.'); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await authService.resetPassword({ resetToken, newPassword: form.password });
      toast.success('Password reset! Please login. 🎉');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Reset failed.');
    } finally { setLoading(false); }
  };

  const inp = { width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', background: '#f8fafc', color: '#1e293b', boxSizing: 'border-box', marginBottom: 16 };

  return (
    <form onSubmit={handleSubmit}>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20, textAlign: 'center' }}>Set your new password</p>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>New Password</label>
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <input type={show ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Min 8 chars, 1 uppercase, 1 number" style={{ ...inp, marginBottom: 0, paddingRight: 44 }} />
        <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>{show ? '🙈' : '👁️'}</button>
      </div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Confirm Password</label>
      <input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })}
        placeholder="Repeat your password" style={inp} />
      <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: loading ? '#93c5fd' : 'linear-gradient(135deg, #059669, #047857)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px rgba(5,150,105,0.4)' }}>
        {loading ? '⏳ Resetting...' : '🔐 Reset Password'}
      </button>
    </form>
  );
}

export default function ForgotPassword() {
  const location = useLocation();
  const [step, setStep] = useState(location.state?.step || 1);
  const [email, setEmail] = useState(location.state?.email || '');
  const [resetToken, setResetToken] = useState('');

  const steps = ['Enter Email', 'Verify OTP', 'New Password'];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🔐</div>
          <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 900, margin: 0 }}>Forgot Password?</h1>
          <p style={{ color: '#93c5fd', marginTop: 8, fontSize: 14 }}>No worries! We'll help you reset it.</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: i + 1 <= step ? '#2563eb' : '#e2e8f0', color: i + 1 <= step ? '#fff' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
                    {i + 1 < step ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: 10, color: i + 1 <= step ? '#2563eb' : '#94a3b8', marginTop: 4, fontWeight: i + 1 === step ? 700 : 400 }}>{s}</span>
                </div>
                {i < 2 && <div style={{ height: 2, flex: 1, background: i + 1 < step ? '#2563eb' : '#e2e8f0', margin: '0 4px', marginBottom: 16 }} />}
              </div>
            ))}
          </div>

          {step === 1 && <StepEmail onNext={(e) => { setEmail(e); setStep(2); }} />}
          {step === 2 && <StepOTP email={email} onNext={(token) => { setResetToken(token); setStep(3); }} />}
          {step === 3 && <StepNewPassword resetToken={resetToken} />}

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
            <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none' }}>← Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
