const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url:   process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Same Upstash KV store the go/ project uses (same KV_REST_API_URL/TOKEN env
// vars, set on this Vercel project too) — but a different key prefix
// (flink: / flinks_all, "flyer link") so these don't collide with the
// existing go.knocktalent.co.za records under link:/all_links. Two link
// systems sharing one store, namespaced apart.
const KEY_PREFIX = 'flink';
const INDEX_KEY = 'all_flinks';

function slugify(str) {
  return String(str).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code, dest, label, password } = req.body || {};

  const validPassword = process.env.KNOCK_PASSWORD;
  if (!validPassword) return res.status(500).json({ error: 'KNOCK_PASSWORD not set' });
  if (password !== validPassword) return res.status(401).json({ error: 'Unauthorized' });

  if (!code || !code.trim()) return res.status(400).json({ error: 'code is required' });
  if (!dest || !dest.trim()) return res.status(400).json({ error: 'dest is required' });

  const cleanCode = slugify(code);
  if (!cleanCode) return res.status(400).json({ error: 'code must contain letters or numbers' });

  let cleanDest = dest.trim();
  // Accept bare domains (e.g. "instagram.com/p/x") by defaulting to https://
  // if no scheme was typed — redirects need an absolute URL.
  if (!/^https?:\/\//i.test(cleanDest)) cleanDest = 'https://' + cleanDest;

  const existing = await redis.get(`${KEY_PREFIX}:${cleanCode}`);
  const record = {
    type: 'flyer-link',
    dest: cleanDest,
    label: (label || '').trim(),
    createdAt: (existing && existing.createdAt) || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await redis.set(`${KEY_PREFIX}:${cleanCode}`, record);
  if (!existing) await redis.lpush(INDEX_KEY, cleanCode);

  return res.status(200).json({
    shortUrl: `https://knocktalent.co.za/${cleanCode}`,
    code: cleanCode,
    dest: cleanDest,
  });
};
