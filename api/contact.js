import { sendContactEmail } from '../src/lib/contactEmail.js';

const readJsonBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
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
  } catch {
    return res.status(400).json({
      success: false,
      error: 'Invalid request body.',
    });
  }

  const result = await sendContactEmail(payload);

  if (!result.success) {
    return res.status(result.status).json({
      success: false,
      error: result.error,
    });
  }

  return res.status(200).json({
    success: true,
    message: result.message,
  });
}
