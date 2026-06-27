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

  // CHANNELS link — goes straight to the digital flyer with ?audience=&ch=,
  // not through campaigns.knocktalent.co.za/?dest= (that domain/param is the
  // older campaigns mechanic for arbitrary external destinations; the flyer
  // is an owned page that reads its own query params directly).
  if (data.type === 'channel') {
    const { audience, ch } = data;
    const flyerUrl =
      'https://knocktalent.co.za/?audience=' + encodeURIComponent(audience) +
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
