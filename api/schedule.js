// 근무스케줄 저장소 API (Vercel 서버리스 함수)
// Turso 접속 토큰은 여기(서버)에만 있고 브라우저로 내려가지 않습니다.
import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const PEOPLE = ['lee', 'hong', 'han', 'kim'];

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const week = String(req.query.week || '');
      if (!week) return res.status(400).json({ error: 'week 파라미터가 필요합니다' });

      const r = await db.execute({
        sql: 'select person, data from schedules where week = ?',
        args: [week],
      });
      const out = {};
      for (const row of r.rows) {
        try { out[row.person] = JSON.parse(row.data); } catch { /* 깨진 행은 건너뜀 */ }
      }
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json(out);
    }

    if (req.method === 'POST') {
      const { week, person, data } = req.body || {};
      if (!week || !person) return res.status(400).json({ error: 'week, person 이 필요합니다' });
      if (!PEOPLE.includes(person)) return res.status(400).json({ error: '알 수 없는 사람입니다' });

      const json = JSON.stringify(data ?? {});
      if (json.length > 200000) return res.status(413).json({ error: '데이터가 너무 큽니다' });

      await db.execute({
        sql: `insert into schedules (week, person, data, updated_at)
              values (?, ?, ?, datetime('now'))
              on conflict(week, person) do update
                set data = excluded.data, updated_at = excluded.updated_at`,
        args: [week, person, json],
      });
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: '허용되지 않는 방식입니다' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
}
