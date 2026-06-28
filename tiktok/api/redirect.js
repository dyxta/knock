const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url:   process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const KEY_PREFIX = 'flink';

module.exports = async function handler(req, res) {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing code');

  const data = await redis.get(`${KEY_PREFIX}:${code}`);
  if (!data) return res.status(404).send('Link not found');

  await redis.incr(`flinks_clicks:${code}`);
  res.setHeader('Cache-Control', 'no-store');

  // dest is used exactly as stored — no params appended. This link type is
  // for arbitrary destinations (Instagram posts, the flyer, anything); the
  // tracking signal is the custom code itself (e.g. "digital-flyer-uct-is
  // -hons"), not query params tacked onto whatever it points to.
  return res.redirect(302, data.dest);
};
