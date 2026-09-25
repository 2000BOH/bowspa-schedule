import { createClient } from '@libsql/client';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) {
    return res.status(503).json({ error: 'DB not configured' });
  }

  try {
    const client = createClient({ url, authToken });
    const { week } = req.query;

    let result;
    if (week) {
      result = await client.execute({ sql: 'SELECT * FROM schedules WHERE week = ?', args: [week] });
    } else {
      result = await client.execute('SELECT DISTINCT week FROM schedules ORDER BY week DESC');
      const weeks = result.rows.map(r => r.week);
      const latestWeek = weeks[0];
      if (!latestWeek) return res.status(200).json({ weeks: [], schedules: [] });
      result = await client.execute({ sql: 'SELECT * FROM schedules WHERE week = ?', args: [latestWeek] });
      return res.status(200).json({ weeks, schedules: result.rows });
    }

    const allWeeks = await client.execute('SELECT DISTINCT week FROM schedules ORDER BY week DESC');
    return res.status(200).json({ weeks: allWeeks.rows.map(r => r.week), schedules: result.rows });
  } catch (error) {
    console.error('Schedule fetch failed:', error);
    return res.status(500).json({ error: 'Failed to fetch schedules' });
  }
}
