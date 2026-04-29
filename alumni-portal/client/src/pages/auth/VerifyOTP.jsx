import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const { email, type = 'EMAIL_VERIFY' } = location.state || {};

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const refs = useRef([]);

  useEffect(() => { if (!email) navigate('/register'); }, [email, navigate]);

  useEffect(() => {
    if (canResend) return;
    const t = setInterval(() => {
      setCountdown((c) => { if (c <= 1) { clearInterval(t); setCanResend(true); return 0; } return c - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [canResend]);

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) { refs.current[i - 1]?.focus(); }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    pasted.split('').forEach((c, i) => { next[i] = c; });
    setOtp(next);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Enter the complete 6-digit OTP.'); return; }
    setLoading(true);
    try {
      if (type === 'EMAIL_VERIFY') {
        const res = await authService.verifyEmail({ email, otp: code });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        toast.success('Email verified! Welcome aboard 🎉');
        navigate('/dashboard');
      } else {
        const res = await authService.verifyResetOTP({ email, otp: code });
        toast.success('OTP verified! Set your new password.');
        navigate('/reset-password', { state: { resetToken: res.data.resetToken } });
      }
    } catch (err) {
      toast.error(err.message || 'Invalid OTP.');
      setOtp(['', '', '', '', '', '']);
      refs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setResendLoading(true);
    try {
      await authService.resendOTP({ email, type });
      toast.success('New OTP sent!');
      setOtp(['', '', '', '', '', '']);
      setCanResend(false);
      setCountdown(60);
      refs.current[0]?.focus();
    } catch (err) {
      toast.error(err.message || 'Failed to resend.');
    } finally {
      setResendLoading(false);
    }
  };

  const boxStyle = (val) => ({
    width: 48, height: 56, textAlign: 'center', fontSize: 24, fontWeight: 800,
    borderRadius: 12, border: `2px solid ${val ? '#2563eb' : '#e2e8f0'}`,
    background: val ? '#eff6ff' : '#f8fafc', color: '#1e293b', outline: 'none',
    transition: 'all 0.15s',
  });

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>✉️</div>
          <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 900, margin: 0 }}>
            {type === 'EMAIL_VERIFY' ? 'Verify Your Email' : 'Enter OTP'}
          </h1>
          <p style={{ color: '#93c5fd', marginTop: 8, fontSize: 14 }}>We sent a 6-digit code to</p>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{email}</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: 14, marginBottom: 24 }}>
            Enter the 6-digit code from your email
          </p>

          {/* OTP Boxes */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 28 }} onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (refs.current[i] = el)}
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                style={boxStyle(digit)}
                onFocus={(e) => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.15)'; }}
                onBlur={(e) => { if (!digit) { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; } }}
              />
            ))}
          </div>

          <button onClick={handleVerify} disabled={loading || otp.join('').length !== 6} style={{
            width: '100%', padding: '14px',
            background: otp.join('').length === 6 ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : '#e2e8f0',
            color: otp.join('').length === 6 ? '#fff' : '#94a3b8',
            border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700,
            cursor: otp.join('').length === 6 ? 'pointer' : 'not-allowed',
            boxShadow: otp.join('').length === 6 ? '0 4px 16px rgba(37,99,235,0.4)' : 'none',
            transition: 'all 0.2s',
          }}>
            {loading ? '⏳ Verifying...' : '✅ Verify OTP'}
          </button>

          {/* Resend */}
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <p style={{ color: '#64748b', fontSize: 13 }}>Didn't receive the code?</p>
            {canResend ? (
              <button onClick={handleResend} disabled={resendLoading} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', fontSize: 14, marginTop: 4 }}>
                {resendLoading ? 'Sending...' : '🔄 Resend OTP'}
              </button>
            ) : (
              <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
                Resend in <span style={{ color: '#2563eb', fontWeight: 700 }}>{countdown}s</span>
              </p>
            )}
          </div>

          {/* Warning */}
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', marginTop: 20, textAlign: 'center' }}>
            <p style={{ color: '#92400e', fontSize: 12 }}>⚠️ OTP expires in <strong>10 minutes</strong>. Check spam if not received.</p>
          </div>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link to={type === 'EMAIL_VERIFY' ? '/register' : '/forgot-password'} style={{ color: '#94a3b8', fontSize: 13, textDecoration: 'none' }}>
              ← Go back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
