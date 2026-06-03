const { Redis } = require('@upstash/redis');

const redis = Redis.fromEnv();

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') return res.status(405).end();

  const validPassword = process.env.KNOCK_PASSWORD;
  if (req.headers['x-knock-password'] !== validPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Fetch all codes (up to 200)
  const codes = await redis.lrange('all_links', 0, 199);
  if (!codes || !codes.length) return res.status(200).json({ links: [] });

  // Fetch all link records and click counts in parallel
  const [records, clicks] = await Promise.all([
    Promise.all(codes.map(c => redis.get(`link:${c}`))),
    Promise.all(codes.map(c => redis.get(`clicks:${c}`)))
  ]);

  const links = codes.map((code, i) => {
    const rec = records[i];
    if (!rec) return null;
    return {
      code,
      shortUrl: `https://go.knocktalent.co.za/${code}`,
      dest:      rec.dest,
      source:    rec.source,
      medium:    rec.medium,
      createdAt: rec.createdAt,
      clicks:    parseInt(clicks[i] || 0, 10)
    };
  }).filter(Boolean);

  return res.status(200).json({ links });
};
