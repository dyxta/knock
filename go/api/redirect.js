const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url:   process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

module.exports = async function handler(req, res) {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing code');

  const data = await redis.get(`link:${code}`);
  if (!data) return res.status(404).send('Link not found');

  await redis.incr(`clicks:${code}`);

  res.setHeader('Cache-Control', 'no-store');

  // CHANNELS link — goes straight to a flyer with ?audience=&ch= appended,
  // not through campaigns.knocktalent.co.za/?dest= (that domain/param is the
  // older campaigns mechanic for arbitrary external destinations; the flyer
  // is an owned page that reads its own query params directly).
  //
  // destBase is the configurable part: set at creation time (see create.js),
  // defaults to https://knocktalent.co.za for any link saved before this was
  // added. Falling back here too means old records in Redis that predate
  // destBase keep working with zero migration needed.
  if (data.type === 'channel') {
    const { audience, ch, destBase } = data;
    const base = (destBase || 'https://knocktalent.co.za').replace(/\/+$/, '');
    const sep = base.includes('?') ? '&' : '?';
    const flyerUrl =
      base + sep + 'audience=' + encodeURIComponent(audience) +
      '&ch=' + encodeURIComponent(ch);
    return res.redirect(302, flyerUrl);
  }

  const { dest, org, source, medium, wave } = data;
  const fullUrl =
    'https://campaigns.knocktalent.co.za/?dest=' + encodeURIComponent(dest) +
    '&utm_source='   + encodeURIComponent(source) +
    '&utm_medium='   + encodeURIComponent(medium) +
    '&utm_campaign=' + encodeURIComponent(org) +
    '&utm_content='  + encodeURIComponent(wave);

  return res.redirect(302, fullUrl);
};
