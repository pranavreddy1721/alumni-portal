const https = require('https');

const sendEmail = async ({ to, subject, html }) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      sender: { 
        name: 'Alumni Portal',
        // Use verified sender email from Brevo
        email: process.env.BREVO_SENDER_EMAIL || 'a9c943001@smtp-brevo.com'
      },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html,
      replyTo: { email: process.env.BREVO_SENDER_EMAIL || 'a9c943001@smtp-brevo.com' }
    });

    const options = {
      hostname: 'api.brevo.com',
      port: 443,
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        console.log('Brevo response status:', res.statusCode);
        console.log('Brevo response body:', body);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Email sent via Brevo API →', to);
          resolve({ success: true });
        } else {
          console.error('❌ Brevo API error:', res.statusCode, body);
          reject(new Error('Brevo API error: ' + res.statusCode + ' - ' + body));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
};

module.exports = sendEmail;
