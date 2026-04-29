const otpEmailTemplate = (name, otp, type) => {
  const isVerify = type === 'EMAIL_VERIFY';
  const title = isVerify ? 'Verify Your Email' : 'Reset Your Password';
  const subtitle = isVerify
    ? 'One step away from joining the Alumni Network!'
    : 'We received a request to reset your password.';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:40px 32px;text-align:center;">
          <div style="font-size:40px;margin-bottom:12px;">🎓</div>
          <h1 style="color:#fff;margin:0;font-size:26px;font-weight:800;">Alumni Portal</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:15px;">${title}</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px 32px;">
          <p style="font-size:18px;font-weight:600;color:#1e293b;margin:0 0 8px;">Hello, ${name}! 👋</p>
          <p style="font-size:15px;color:#64748b;line-height:1.6;margin:0 0 28px;">${subtitle}</p>

          <!-- OTP Box -->
          <div style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border:2px solid #93c5fd;border-radius:16px;padding:28px;text-align:center;margin-bottom:28px;">
            <p style="font-size:12px;text-transform:uppercase;letter-spacing:3px;color:#3b82f6;font-weight:700;margin:0 0 14px;">Your One-Time Password</p>
            <p style="font-size:52px;font-weight:900;color:#1e40af;letter-spacing:14px;font-family:'Courier New',monospace;margin:0;">${otp}</p>
            <p style="font-size:13px;color:#64748b;margin:14px 0 0;">⏰ Expires in <strong>10 minutes</strong></p>
          </div>

          <!-- Warning -->
          <div style="background:#fef9c3;border-left:4px solid #fbbf24;border-radius:8px;padding:16px;margin-bottom:20px;">
            <p style="font-size:13px;color:#78350f;margin:0;line-height:1.6;">
              ⚠️ <strong>Security Notice:</strong> Never share this OTP with anyone.
              Alumni Portal staff will never ask for your OTP.
              If you didn't request this, please ignore this email.
            </p>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8fafc;padding:24px 32px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="font-size:12px;color:#94a3b8;margin:0;line-height:1.6;">
            This is an automated email from <strong style="color:#475569;">Alumni Portal System</strong><br/>
            Contact your college administrator if you need help.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

const welcomeEmailTemplate = (name, role) => `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:100%;">
        <tr><td style="background:linear-gradient(135deg,#059669,#10b981);padding:40px 32px;text-align:center;">
          <div style="font-size:48px;margin-bottom:12px;">🎉</div>
          <h1 style="color:#fff;margin:0;font-size:26px;">Welcome to Alumni Portal!</h1>
        </td></tr>
        <tr><td style="padding:40px 32px;">
          <p style="font-size:18px;font-weight:600;color:#1e293b;">Hello, ${name}!</p>
          <p style="font-size:15px;color:#64748b;line-height:1.6;">
            Your email has been verified and your <strong>${role}</strong> account is now active.
            ${role === 'alumni' ? 'Your account is pending admin approval. You will be notified once approved.' : 'You can now log in and start exploring!'}
          </p>
        </td></tr>
        <tr><td style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="font-size:12px;color:#94a3b8;margin:0;">Alumni Portal System</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const approvalEmailTemplate = (name) => `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:100%;">
        <tr><td style="background:linear-gradient(135deg,#7c3aed,#8b5cf6);padding:40px 32px;text-align:center;">
          <div style="font-size:48px;margin-bottom:12px;">✅</div>
          <h1 style="color:#fff;margin:0;font-size:26px;">Alumni Account Approved!</h1>
        </td></tr>
        <tr><td style="padding:40px 32px;">
          <p style="font-size:18px;font-weight:600;color:#1e293b;">Congratulations, ${name}!</p>
          <p style="font-size:15px;color:#64748b;line-height:1.6;">
            Your alumni account has been approved by the admin.
            You can now log in and start connecting with students, posting job referrals, and sharing your experience!
          </p>
        </td></tr>
        <tr><td style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="font-size:12px;color:#94a3b8;margin:0;">Alumni Portal System</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

module.exports = { otpEmailTemplate, welcomeEmailTemplate, approvalEmailTemplate };
