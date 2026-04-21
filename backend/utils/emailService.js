const nodemailer = require('nodemailer');

// ─── Create Transporter ───────────────────────────────────────────────────────
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// ─── Send Approval Email ──────────────────────────────────────────────────────
const sendApprovalEmail = async ({ studentName, studentEmail, courseName }) => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_gmail@gmail.com') {
    console.log(`📧 [EMAIL MOCK] Approval email would be sent to: ${studentEmail}`);
    return { success: true, mocked: true };
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: `"ST.JOSEPH Engineering College" <${process.env.EMAIL_USER}>`,
    to: studentEmail,
    subject: '🎉 Admission Approved – ST.JOSEPH Engineering College',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #1e3a5f, #2563eb); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .header p { margin: 8px 0 0; opacity: 0.85; }
            .body { padding: 30px; color: #333; }
            .highlight-box { background: #eef4ff; border-left: 4px solid #2563eb; padding: 15px 20px; border-radius: 5px; margin: 20px 0; }
            .steps { counter-reset: step; }
            .step { display: flex; align-items: flex-start; margin: 12px 0; }
            .step-num { background: #2563eb; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; margin-right: 12px; font-size: 14px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #eee; }
            .badge { display: inline-block; background: #22c55e; color: white; padding: 6px 18px; border-radius: 20px; font-weight: bold; font-size: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 ST.JOSEPH Engineering College</h1>
              <p>Admission Portal — Official Notification</p>
            </div>
            <div class="body">
              <p style="font-size:18px; font-weight:bold;">Dear ${studentName},</p>
              <p>We are thrilled to inform you that your application for admission to <strong>ST.JOSEPH Engineering College</strong> has been:</p>
              <div style="text-align:center; margin: 20px 0;">
                <span class="badge">✅ APPROVED</span>
              </div>
              <div class="highlight-box">
                <strong>📚 Course Admitted:</strong> ${courseName}<br>
                <strong>🏛️ Institution:</strong> ST.JOSEPH Engineering College<br>
                <strong>🗓️ Academic Year:</strong> 2026–2027
              </div>
              <p>Congratulations! Your merit rank and eligibility have been verified. You have successfully secured a seat.</p>
              <p><strong>Next Steps — Please complete within 7 days:</strong></p>
              <div class="steps">
                <div class="step"><div class="step-num">1</div><div>Pay the <strong>Admission Fee</strong> at the Finance Office or via the online payment portal.</div></div>
                <div class="step"><div class="step-num">2</div><div>Submit <strong>Original Documents</strong>: 10th & 12th mark sheets, transfer certificate, community certificate, Aadhar card, and 4 passport photos.</div></div>
                <div class="step"><div class="step-num">3</div><div>Attend the <strong>Orientation Program</strong> on the date communicated by the admissions office.</div></div>
                <div class="step"><div class="step-num">4</div><div>Report to the <strong>Hostel Office</strong> (if applicable) for accommodation arrangements.</div></div>
              </div>
              <p style="margin-top:25px;">For any queries, contact the Admissions Office at <strong>admissions@stjoseph.edu.in</strong> or call <strong>+91-44-XXXX-XXXX</strong>.</p>
              <p>We look forward to welcoming you to the ST.JOSEPH family! 🎉</p>
            </div>
            <div class="footer">
              <p>ST.JOSEPH Engineering College | Admissions Team | 2026</p>
              <p>This is an automated email. Please do not reply directly.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Approval email sent to ${studentEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email send failed to ${studentEmail}:`, error.message);
    return { success: false, error: error.message };
  }
};

// ─── Send Rejection Email ─────────────────────────────────────────────────────
const sendRejectionEmail = async ({ studentName, studentEmail, courseName, reason }) => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_gmail@gmail.com') {
    console.log(`📧 [EMAIL MOCK] Rejection email would be sent to: ${studentEmail}`);
    return { success: true, mocked: true };
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: `"ST.JOSEPH Engineering College" <${process.env.EMAIL_USER}>`,
    to: studentEmail,
    subject: 'Admission Status Update – ST.JOSEPH Engineering College',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #1e3a5f, #2563eb); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .body { padding: 30px; color: #333; }
            .highlight-box { background: #fff7ed; border-left: 4px solid #f97316; padding: 15px 20px; border-radius: 5px; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #eee; }
            .suggestion-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 15px 20px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 ST.JOSEPH Engineering College</h1>
              <p>Admission Portal — Status Update</p>
            </div>
            <div class="body">
              <p style="font-size:18px; font-weight:bold;">Dear ${studentName},</p>
              <p>Thank you for your interest in <strong>ST.JOSEPH Engineering College</strong> and for applying to our undergraduate programs.</p>
              <p>After careful review of your application for:</p>
              <div class="highlight-box">
                <strong>📚 Course Applied:</strong> ${courseName}<br>
                ${reason ? `<strong>📝 Reason:</strong> ${reason}` : ''}
              </div>
              <p>We regret to inform you that we are <strong>unable to offer you admission</strong> at this time. The selection process was highly competitive, and decisions were based on merit scores (PCM percentage) and seat availability.</p>
              <div class="suggestion-box">
                <p style="margin:0 0 10px; font-weight:bold;">💡 What you can do next:</p>
                <ul style="margin:0; padding-left:20px;">
                  <li>Explore <strong>other available courses</strong> on our portal — seats may still be open.</li>
                  <li>Check eligibility for <strong>lateral entry programs</strong>.</li>
                  <li>Inquire about the <strong>waitlist</strong> at the admissions office.</li>
                  <li>Consider reapplying in the <strong>next academic year</strong>.</li>
                </ul>
              </div>
              <p>We encourage you not to be discouraged. This is just one step in your journey, and many excellent opportunities await you.</p>
              <p>For queries, contact: <strong>admissions@stjoseph.edu.in</strong></p>
              <p>We wish you the very best in your future endeavors.</p>
              <p>Warm regards,<br><strong>Admissions Team</strong><br>ST.JOSEPH Engineering College</p>
            </div>
            <div class="footer">
              <p>ST.JOSEPH Engineering College | Admissions Team | 2026</p>
              <p>This is an automated email. Please do not reply directly.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Rejection email sent to ${studentEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email send failed to ${studentEmail}:`, error.message);
    return { success: false, error: error.message };
  }
};

// ─── Verify SMTP connection ───────────────────────────────────────────────────
const verifyEmailConnection = async () => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_gmail@gmail.com') {
    console.log('📧 Email service: Running in MOCK mode (no real emails sent)');
    return;
  }

  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email service connected successfully');
  } catch (error) {
    console.warn(`⚠️  Email service connection failed: ${error.message}`);
    console.warn('   Emails will not be sent. Check EMAIL_USER and EMAIL_PASS in .env');
  }
};

module.exports = { sendApprovalEmail, sendRejectionEmail, verifyEmailConnection };
