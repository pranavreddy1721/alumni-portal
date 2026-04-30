const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Alumni Portal 🎓" <${process.env.BREVO_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent → ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    throw new Error('Email could not be sent: ' + error.message);
  }
};

module.exports = sendEmail;
