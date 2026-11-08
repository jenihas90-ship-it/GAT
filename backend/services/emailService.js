const nodemailer = require('nodemailer');

const createTransporter = () => {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass
    }
  });
};

/**
 * Sends approval notification email asynchronously
 * @param {Object} candidate - Candidate object { fullName, email, originCountry }
 */
const sendApprovalEmail = async (candidate) => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.warn(`⚠️ [Mock Email] Approval email would be sent to: ${candidate.email} (${candidate.fullName}). Configure GMAIL_USER & GMAIL_APP_PASSWORD to enable live delivery.`);
      return { success: true, simulated: true };
    }

    const mailOptions = {
      from: `"Galo Recruitment Agency" <${process.env.GMAIL_USER}>`,
      to: candidate.email,
      subject: 'Application Approved - Next Steps for Dubai Placement',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #1e3a8a;">Congratulations, ${candidate.fullName}!</h2>
          <p>We are pleased to inform you that your recruitment application with <strong>Galo Travel Agency</strong> has been <strong>Approved</strong> for placement opportunities in Dubai.</p>
          <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 12px; margin: 16px 0;">
            <p style="margin: 0; color: #166534; font-weight: bold;">Status: Approved &middot; Visa Processing Initiated</p>
          </div>
          <h3>Next Steps:</h3>
          <ol style="line-height: 1.6;">
            <li>Our liaison officer will contact you within 24-48 hours.</li>
            <li>Please prepare your original passport, authenticated medical records, and police clearance certificate.</li>
            <li>Visa processing details will be delivered to your registered email address.</li>
          </ol>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="font-size: 12px; color: #6b7280;">Galo Travel Agency &middot; Cross-Border International Recruitment Portal</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email successfully delivered to ${candidate.email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send approval email to ${candidate.email}:`, error.message);
    // Don't throw to avoid crashing the approve route, as email is triggered asynchronously
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendApprovalEmail
};
