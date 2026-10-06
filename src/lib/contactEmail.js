import nodemailer from 'nodemailer';

const CONTACT_RECIPIENT = 'harshidsoni01@gmail.com';
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 5000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const HEADER_CHARS = /[\r\n]+/g;

const normalizeText = (value) => (
  Array.from(String(value ?? ''))
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 127);
    })
    .join('')
    .trim()
);
const limitLength = (value, maxLength) => value.slice(0, maxLength);

const escapeHtml = (str) =>
  String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export const sanitizeContactPayload = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { name: '', email: '', message: '' };
  }

  const name = normalizeText(payload.name)
    .replace(HEADER_CHARS, ' ')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ');

  const email = normalizeText(payload.email)
    .replace(HEADER_CHARS, '')
    .toLowerCase();

  const message = normalizeText(payload.message)
    .replace(/[<>]/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n');

  return {
    name: limitLength(name, MAX_NAME_LENGTH),
    email: limitLength(email, MAX_EMAIL_LENGTH),
    message: limitLength(message, MAX_MESSAGE_LENGTH),
  };
};

export const validateContactPayload = ({ name, email, message }) => {
  if (!name || !email || !message) return 'Name, email, and message are required.';
  if (name.length < 2) return 'Please enter a valid name.';
  if (!EMAIL_PATTERN.test(email)) return 'Please enter a valid email address.';
  if (message.length < 10) return 'Please enter a message with at least 10 characters.';
  return '';
};

export const sendContactEmail = async (payload) => {
  const contact = sanitizeContactPayload(payload);
  const validationError = validateContactPayload(contact);

  if (validationError) {
    return { success: false, status: 400, error: validationError };
  }

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass || emailPass === 'YOUR_GMAIL_APP_PASSWORD') {
    console.error('[Backend] Email service not configured properly. EMAIL_PASS is missing or using placeholder.');
    return {
      success: false,
      status: 503,
      error: 'Message service is temporarily unavailable. Please email directly to harshidsoni01@gmail.com.',
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    await transporter.sendMail({
      from: `"Portfolio Contact" <${emailUser}>`,
      to: CONTACT_RECIPIENT,
      replyTo: contact.email,
      subject: `New Portfolio Contact Submission from ${contact.name}`,
      text: `Name: ${contact.name}\nEmail: ${contact.email}\n\nMessage:\n${contact.message}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 2px solid #0d0d0d; background-color: #f5f2ed; color: #0d0d0d;">
          <h2 style="margin-top: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #0d0d0d; padding-bottom: 12px; color: #0d0d0d;">
            New Portfolio Contact Message
          </h2>
          <table style="width: 100%; margin: 16px 0; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 80px; color: #666; font-size: 14px;">From:</td>
              <td style="padding: 8px 0; font-size: 15px; font-weight: 600; color: #0d0d0d;">${escapeHtml(contact.name)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 80px; color: #666; font-size: 14px;">Email:</td>
              <td style="padding: 8px 0; font-size: 15px;"><a href="mailto:${encodeURIComponent(contact.email)}" style="color: #ff3333; text-decoration: none; font-weight: 600;">${escapeHtml(contact.email)}</a></td>
            </tr>
          </table>
          <div style="margin-top: 16px; padding: 16px; background-color: #ffffff; border: 1px solid #d4d0c8; white-space: pre-wrap; font-size: 15px; line-height: 1.6; color: #1a1a1a;">
${escapeHtml(contact.message)}
          </div>
          <p style="margin-top: 24px; font-size: 11px; color: #888; font-family: monospace; letter-spacing: 0.05em;">
            Harshid Soni Portfolio — Direct Inquiry
          </p>
        </div>
      `,
    });

    return {
      success: true,
      status: 200,
      message: 'Message sent successfully!',
    };
  } catch (error) {
    console.error('[Backend] Nodemailer failed to send email:', error?.message || error);
    return {
      success: false,
      status: 500,
      error: 'Unable to send message at this time. Please email directly to harshidsoni01@gmail.com.',
    };
  }
};
