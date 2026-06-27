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

// channels links are keyed by audience+ch only (no dest/org/wave) — code is
// just "<audience>-<ch>", e.g. "stem-students-ig". Stable and re-creatable:
// re-running create for the same audience+ch reuses the same code instead of
// growing a new one each time, so the short link ops hand out never changes
// once a starter pack has been attached to it.
function buildChannelCode(audience, ch) {
  const a = slugify(audience);
  const c = slugify(ch);
  return `${a}-${c}`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type, dest, org, source, medium, wave, audience, ch, password, _auth_check } = req.body;

  const validPassword = process.env.KNOCK_PASSWORD;
  if (!validPassword) return res.status(500).json({ error: 'KNOCK_PASSWORD not set' });
  if (password !== validPassword) return res.status(401).json({ error: 'Unauthorized' });
  if (_auth_check) return res.status(200).json({ ok: true });

  /* ── CHANNELS LINK ──
     A separate link type from the original campaigns flow above. Points at
     the digital flyer (not an arbitrary dest URL via campaigns.knocktalent
     .co.za) with ?audience=&ch= — the flyer reads those params directly and
     swaps in the matching starter pack itself (see applyStarterPack() in
     tiktok/index.html). No PII anywhere in this record — just two labels —
     so the click counter below stays fully anonymous. */
  if (type === 'channel') {
    if (!audience || !ch) {
      return res.status(400).json({ error: 'audience and ch are required for a channel link' });
    }
    const code = buildChannelCode(audience, ch);
    const record = { type: 'channel', audience, ch, createdAt: new Date().toISOString() };
    await redis.set(`link:${code}`, record);
    await redis.lpush('all_links', code);
    return res.status(200).json({ shortUrl: `https://go.knocktalent.co.za/${code}`, code });
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
