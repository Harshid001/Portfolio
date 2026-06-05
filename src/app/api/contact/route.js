import { sendContactEmail } from '../../../lib/contactEmail.js';

export const runtime = 'nodejs';

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { success: false, error: 'Invalid request body.' },
      { status: 400 }
    );
  }

  const result = await sendContactEmail(payload);

  if (!result.success) {
    return Response.json(
      { success: false, error: result.error },
      { status: result.status }
    );
  }

  return Response.json(
    { success: true, message: result.message },
    { status: 200 }
  );
}

export async function GET() {
  return Response.json(
    { success: false, error: 'Method not allowed.' },
    { status: 405, headers: { Allow: 'POST' } }
  );
}
