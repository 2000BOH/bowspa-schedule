import { createClient } from '@libsql/client';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ status: 'method_not_allowed' });
  }

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) {
    return res.status(503).json({ status: 'not_configured' });
  }

  try {
    const client = createClient({ url, authToken });
    // Only confirm that the expected table is readable. Never return schedule data.
    await client.execute('SELECT COUNT(*) AS total FROM schedules');
    return res.status(200).json({
      status: 'connected',
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Turso connection check failed:', error);
    return res.status(503).json({ status: 'unavailable' });
  }
}
