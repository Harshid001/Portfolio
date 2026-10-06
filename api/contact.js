import { sendContactEmail } from '../src/lib/contactEmail.js';

const MAX_BODY_BYTES = 25 * 1024; // 25KB limit

const readJsonBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    if (Buffer.byteLength(req.body, 'utf8') > MAX_BODY_BYTES) {
      throw new Error('PAYLOAD_TOO_LARGE');
    }
    return JSON.parse(req.body);
  }

  const chunks = [];
  let totalBytes = 0;
  for await (const chunk of req) {
    totalBytes += chunk.length;
    if (totalBytes > MAX_BODY_BYTES) {
      throw new Error('PAYLOAD_TOO_LARGE');
    }
    chunks.push(chunk);
  }
  if (chunks.length === 0) return {};

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      success: false,
      error: 'Method not allowed.',
    });
  }

  let payload;

  try {
    payload = await readJsonBody(req);
  } catch (err) {
    if (err?.message === 'PAYLOAD_TOO_LARGE') {
      return res.status(413).json({
        success: false,
        error: 'Payload too large.',
      });
    }
    return res.status(400).json({
      success: false,
      error: 'Invalid request body.',
    });
  }

  const result = await sendContactEmail(payload);

  if (!result.success) {
    return res.status(result.status || 500).json({
      success: false,
      error: result.error,
    });
  }

  return res.status(200).json({
    success: true,
    message: result.message,
  });
}

