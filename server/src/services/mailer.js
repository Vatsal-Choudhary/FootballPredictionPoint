import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a reusable SMTP transporter from environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: false, // true for 465, false for other ports (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends an email verification link to a newly registered user.
 * @param {string} email - Recipient email address
 * @param {string} username - The user's chosen display name
 * @param {string} token - The random verification token stored in the DB
 */
export async function sendVerificationEmail(email, username, token) {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: '⚽ Verify your World Cup Predictor account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a365d;">Welcome to World Cup Predictor, ${username}! 🏆</h2>
        <p>Thanks for signing up. Please verify your email address to unlock all features.</p>
        <a href="${verifyUrl}"
           style="display: inline-block; padding: 12px 24px; background-color: #2563eb;
                  color: #ffffff; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Verify Email
        </a>
        <p style="color: #6b7280; font-size: 14px;">
          Or copy and paste this URL into your browser:<br/>
          <a href="${verifyUrl}">${verifyUrl}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">
          If you didn't create this account, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Mailer] Verification email sent to ${email}`);
  } catch (err) {
    console.error(`[Mailer] Failed to send verification email to ${email}:`, err.message);
    // Don't throw — email failure shouldn't block registration
  }
}

/**
 * Sends a group invitation email with the invite code and a direct join link.
 * @param {string} email - Recipient email address
 * @param {string} groupName - Name of the prediction group
 * @param {string} inviteCode - The 8-char alphanumeric invite code
 * @param {string} inviterName - Username of the person sending the invite
 */
export async function sendGroupInvite(email, groupName, inviteCode, inviterName) {
  const joinUrl = `${process.env.CLIENT_URL}/groups/join?code=${inviteCode}`;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: `⚽ ${inviterName} invited you to "${groupName}" on World Cup Predictor`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a365d;">You've been invited! 🎉</h2>
        <p><strong>${inviterName}</strong> wants you to join their prediction group
           <strong>"${groupName}"</strong> on World Cup Predictor.</p>
        <a href="${joinUrl}"
           style="display: inline-block; padding: 12px 24px; background-color: #16a34a;
                  color: #ffffff; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Join Group
        </a>
        <p style="color: #6b7280; font-size: 14px;">
          Or use this invite code in the app: <strong>${inviteCode}</strong>
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">
          If you don't have an account yet, sign up first and then use the invite code above.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Mailer] Group invite sent to ${email} for group "${groupName}"`);
  } catch (err) {
    console.error(`[Mailer] Failed to send group invite to ${email}:`, err.message);
    throw new Error('Failed to send invitation email.');
  }
}
