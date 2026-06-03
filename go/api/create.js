const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url:   process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function buildCode(source, medium) {
  const src = slugify(source).split('-')[0].slice(0, 8);
  const med = slugify(medium).slice(0, 8);
  return `${src}-${med}`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { dest, source, medium, password, _auth_check } = req.body;

  const validPassword = process.env.KNOCK_PASSWORD;
  if (!validPassword) return res.status(500).json({ error: 'KNOCK_PASSWORD not set' });
  if (password !== validPassword) return res.status(401).json({ error: 'Unauthorized' });
  if (_auth_check) return res.status(200).json({ ok: true });

  if (!dest || !source || !medium) {
    return res.status(400).json({ error: 'dest, source and medium are required' });
  }

  // Find a unique code
  const base = buildCode(source, medium);
  let code = base;
  let attempt = 0;
  while (await redis.get(`link:${code}`) !== null) {
    attempt++;
    code = `${base}-${attempt}`;
    if (attempt > 20) { code = `${base}-${Date.now().toString(36)}`; break; }
  }

  const record = { dest, source, medium, createdAt: new Date().toISOString() };
  await redis.set(`link:${code}`, record);
  await redis.lpush('all_links', code);

  return res.status(200).json({ shortUrl: `https://go.knocktalent.co.za/${code}`, code });
};
