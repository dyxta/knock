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

  // CHANNELS link — redirects exactly to data.dest, no params appended.
  // dest is whatever ops typed in channels-builder.html: the flyer (often
  // with its own ?audience=&ch= already baked in, by ops's own choice, so
  // the flyer applies the matching starter pack), an Instagram post,
  // anywhere. The code itself (not query params on the destination) is
  // what carries the tracking signal — that's what clicks:<code> counts.
  //
  // Old records saved before this used a destBase+?audience/ch scheme
  // (pre-dating an explicit dest field) — handled for backwards
  // compatibility so links minted before this change don't break.
  if (data.type === 'channel') {
    if (data.dest) return res.redirect(302, data.dest);
    const base = (data.destBase || 'https://knocktalent.co.za').replace(/\/+$/, '');
    const sep = base.includes('?') ? '&' : '?';
    const legacyUrl = base + sep + 'audience=' + encodeURIComponent(data.audience || '') + '&ch=' + encodeURIComponent(data.ch || '');
    return res.redirect(302, legacyUrl);
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
