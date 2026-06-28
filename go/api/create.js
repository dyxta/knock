const { Redis } = require('@upstash/redis');
const crypto = require('crypto');

const redis = new Redis({
  url:   process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Must match oppId_() in sign-up-form/knock_signup_backend.gs exactly —
// same input shape (lowercased title + url joined by '|'), same MD5,
// same 12-hex-char slice — so an opportunity's id is identical whether
// it's computed here (for the recycled link code) or in Apps Script
// (for the like/bundle/download event rollup). If these two ever
// disagree, opportunity-level stats silently stop joining across the
// two systems, so don't change one without the other.
function oppId(title, url) {
  const raw = String(title || '').trim().toLowerCase() + '|' + String(url || '').trim().toLowerCase();
  return crypto.createHash('md5').update(raw, 'utf8').digest('hex').slice(0, 12);
}

function buildCode(org, source, wave) {
  const o = slugify(org).split('-')[0].slice(0, 10);
  const u = slugify(source).split('-')[0].slice(0, 10);
  const w = (wave.match(/wave\d+/) || [slugify(wave).slice(0, 8)])[0];
  return `${o}-${u}-${w}`;
}

// Callers (channels-builder.html in particular) deliberately POST with
// Content-Type: text/plain;charset=utf-8 to avoid a CORS preflight, even
// though the body is JSON. Vercel's automatic body parser only JSON-parses
// req.body when the content-type is application/json — for text/plain it
// leaves req.body as a raw string. Destructuring fields off a string
// silently yields undefined for all of them (including password), which
// always failed the password check below and returned 401 regardless of
// what was actually sent. Parse defensively here, mirroring the readBody()
// helper already used in pilot-hub/api/auth.js, so content-type can't
// break auth again.
async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (e) { return {}; }
  }
  return new Promise(function (resolve) {
    const chunks = [];
    req.on('data', function (c) { chunks.push(c); });
    req.on('end', function () {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); }
      catch (e) { resolve({}); }
    });
    req.on('error', function () { resolve({}); });
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = await readBody(req);
  const { type, dest, org, source, medium, wave, audience, ch, code: customCode, title, password, _auth_check } = body;

  const validPassword = process.env.KNOCK_PASSWORD;
  if (!validPassword) return res.status(500).json({ error: 'KNOCK_PASSWORD not set' });
  if (password !== validPassword) return res.status(401).json({ error: 'Unauthorized' });
  if (_auth_check) return res.status(200).json({ ok: true });

  /* ── OPPORTUNITY LINK ──
     One persistent short link per opportunity, auto-minted the first
     time that opportunity is used in any starter pack and reused
     ("recycled") every time after — never a new code per pack/audience.
     The code is opp-<oppId>, where oppId is computed from (title, dest)
     by the same oppId() function Apps Script uses (see comment above),
     so this endpoint and the OppEvents like/bundle/download rollup in
     knock_signup_backend.gs always agree on which opportunity a given
     id refers to, even though they're two different systems (Redis vs.
     Sheets) with no other shared key.

     Call this once per opportunity when a starter pack is saved (the
     caller — channels-builder.html — does this automatically, ops never
     has to think about it). dest should be the opportunity's own
     application/listing URL, used exactly as given like channel links.
     audience/ch are NOT stored here — an opportunity link is shared
     across every pack/audience/channel it appears in by design, so it
     has no single "owning" audience the way a channel link does;
     per-audience attribution for clicks would need UTM-style params on
     top of this, which is a different, separate concern from this
     endpoint. */
  if (type === 'opportunity') {
    if (!dest || !dest.trim()) {
      return res.status(400).json({ error: 'dest is required for an opportunity link' });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'title is required for an opportunity link (used to compute its stable id)' });
    }
    const id = oppId(title, dest);
    const code = `opp-${id}`;
    let cleanDest = dest.trim();
    if (!/^https?:\/\//i.test(cleanDest)) cleanDest = 'https://' + cleanDest;
    const existing = await redis.get(`link:${code}`);
    const record = {
      type: 'opportunity',
      oppId: id,
      title: title.trim(),
      dest: cleanDest,
      createdAt: (existing && existing.createdAt) || new Date().toISOString(),
    };
    await redis.set(`link:${code}`, record);
    if (!existing) await redis.lpush('all_links', code);
    return res.status(200).json({ shortUrl: `https://go.knocktalent.co.za/${code}`, code, oppId: id, dest: cleanDest, recycled: !!existing });
  }

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
