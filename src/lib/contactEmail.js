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

export const sanitizeContactPayload = (payload = {}) => {
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
  console.log('[Backend] Contact API hit. Payload received:', { name: payload.name, email: payload.email });
  const contact = sanitizeContactPayload(payload);
  const validationError = validateContactPayload(contact);

  if (validationError) {
    console.error('[Backend] Validation failed:', validationError);
    return { success: false, status: 400, error: validationError };
  }

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass || emailPass === 'YOUR_GMAIL_APP_PASSWORD') {
    console.error('[Backend] Email service not configured properly. EMAIL_PASS is missing or using placeholder.');
    return {
      success: false,
      status: 500,
      error: 'Server Configuration Error: Missing or invalid Gmail App Password. Please check .env.local.',
    };
  }

  console.log('[Backend] Email credentials found. Attempting to connect to Gmail SMTP...');

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

    console.log('[Backend] Transporter created. Sending email...');

    await transporter.sendMail({
      from: `"Portfolio Contact" <${emailUser}>`,
      to: CONTACT_RECIPIENT,
      replyTo: contact.email,
      subject: `New Portfolio Contact Form Submission from ${contact.name}`,
      text: `Name: ${contact.name}\nEmail: ${contact.email}\n\nMessage:\n${contact.message}`,
    });

    console.log('[Backend] Email sent successfully to:', CONTACT_RECIPIENT);
    return {
      success: true,
      status: 200,
      message: 'Message sent successfully!',
    };
  } catch (error) {
    console.error('[Backend] Nodemailer failed to send email:', error);
    return {
      success: false,
      status: 500,
      error: `Failed to send message via SMTP: ${error.message || 'Unknown error'}`,
    };
  }
};
