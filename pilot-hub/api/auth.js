module.exports = function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { password } = req.body;
  const valid = process.env.KNOCK_OPS_PASSWORD;
  if (!valid) return res.status(500).json({ error: 'KNOCK_OPS_PASSWORD not set' });
  if (password !== valid) return res.status(401).json({ error: 'Unauthorized' });
  return res.status(200).json({ ok: true });
};
