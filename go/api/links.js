const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url:   process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') return res.status(405).end();

  const validPassword = process.env.KNOCK_PASSWORD;
  if (req.headers['x-knock-password'] !== validPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const codes = await redis.lrange('all_links', 0, 199);
  if (!codes || !codes.length) return res.status(200).json({ links: [] });

  const [records, clicks] = await Promise.all([
    Promise.all(codes.map(c => redis.get(`link:${c}`))),
    Promise.all(codes.map(c => redis.get(`clicks:${c}`)))
  ]);

  const links = codes.map((code, i) => {
    const rec = records[i];
    if (!rec) return null;
    return {
      code,
      shortUrl:  `https://go.knocktalent.co.za/${code}`,
      type:      rec.type || 'campaign',
      dest:      rec.dest,
      org:       rec.org,
      source:    rec.source,
      medium:    rec.medium,
      wave:      rec.wave,
      audience:  rec.audience,
      ch:        rec.ch,
      destBase:  rec.destBase,
      oppId:     rec.oppId,
      title:     rec.title,
      createdAt: rec.createdAt,
      clicks:    parseInt(clicks[i] || 0, 10)
    };
  }).filter(Boolean);

  return res.status(200).json({ links });
};
