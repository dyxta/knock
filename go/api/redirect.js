const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  const { code } = req.query;

  if (!code) return res.status(400).send('Missing code');

  const data = await kv.get(code);

  if (!data) {
    return res.status(404).send('Link not found');
  }

  const { dest, source, medium } = data;
  const fullUrl =
    'https://campaigns.knocktalent.co.za/?dest=' +
    encodeURIComponent(dest) +
    '&utm_source=' + encodeURIComponent(source) +
    '&utm_medium=' + encodeURIComponent(medium);

  res.setHeader('Cache-Control', 'no-store');
  return res.redirect(302, fullUrl);
};
