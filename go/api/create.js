const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url:   process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function buildCode(org, source, wave) {
  const o = slugify(org).split('-')[0].slice(0, 10);
  const u = slugify(source).split('-')[0].slice(0, 10);
  const w = (wave.match(/wave\d+/) || [slugify(wave).slice(0, 8)])[0];
  return `${o}-${u}-${w}`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type, dest, org, source, medium, wave, audience, ch, code: customCode, password, _auth_check } = req.body;

  const validPassword = process.env.KNOCK_PASSWORD;
  if (!validPassword) return res.status(500).json({ error: 'KNOCK_PASSWORD not set' });
  if (password !== validPassword) return res.status(401).json({ error: 'Unauthorized' });
  if (_auth_check) return res.status(200).json({ ok: true });

  /* ── CHANNELS LINK ──
     A separate link type from the original campaigns flow above. Each
     channel link is a custom short code (ops types it — e.g.
     "digital-flyer-uct-is-hons" — so it can look intentional/personalised
     to whoever it's handed to) pointing at any destination URL, used
     exactly as given — no params appended. Channel champions get a link
     that looks made for them; clicks are tracked per-code the same way as
     the rest of this file. audience/ch are stored alongside purely as
     labels so the channels-builder UI can look up which starter pack
     belongs to this link — they have no effect on the redirect itself.

     code is required and must be unique per audience+ch combo in practice,
     but nothing here enforces that — ops chooses the code, and re-saving
     the same code repoints that link (keeps the same short URL, just
     updates where it goes and which audience/ch label it's tagged with). */
  if (type === 'channel') {
    if (!customCode || !customCode.trim()) {
      return res.status(400).json({ error: 'code is required for a channel link' });
    }
    if (!dest || !dest.trim()) {
      return res.status(400).json({ error: 'dest is required for a channel link' });
    }
    const code = slugify(customCode);
    if (!code) return res.status(400).json({ error: 'code must contain letters or numbers' });
    let cleanDest = dest.trim();
    if (!/^https?:\/\//i.test(cleanDest)) cleanDest = 'https://' + cleanDest;
    const existing = await redis.get(`link:${code}`);
    const record = {
      type: 'channel',
      audience: audience || (existing && existing.audience) || '',
      ch: ch || (existing && existing.ch) || '',
      dest: cleanDest,
      createdAt: (existing && existing.createdAt) || new Date().toISOString(),
    };
    await redis.set(`link:${code}`, record);
    if (!existing) await redis.lpush('all_links', code);
    return res.status(200).json({ shortUrl: `https://go.knocktalent.co.za/${code}`, code, dest: cleanDest });
  }

  if (!dest || !org || !source || !medium || !wave) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const base = buildCode(org, source, wave);
  let code = base;
  let attempt = 0;
  while (await redis.get(`link:${code}`) !== null) {
    attempt++;
    code = `${base}-${attempt}`;
    if (attempt > 20) { code = `${base}-${Date.now().toString(36)}`; break; }
  }

  const record = { dest, org, source, medium, wave, createdAt: new Date().toISOString() };
  await redis.set(`link:${code}`, record);
  await redis.lpush('all_links', code);

  return res.status(200).json({ shortUrl: `https://go.knocktalent.co.za/${code}`, code });
};
