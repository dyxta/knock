function readBody(req) {
  // Vercel's Node runtime usually auto-parses JSON bodies into req.body,
  // but if it ever arrives as a raw string/Buffer (e.g. missing
  // content-type header from some client), parse it manually so a
  // malformed-looking request doesn't 500 before we even check the
  // password.
  return new Promise(function (resolve) {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    if (typeof req.body === 'string') {
      try { return resolve(JSON.parse(req.body)); } catch (e) { return resolve({}); }
    }
    var chunks = [];
    req.on('data', function (c) { chunks.push(c); });
    req.on('end', function () {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); }
      catch (e) { resolve({}); }
    });
    req.on('error', function () { resolve({}); });
  });
}

module.exports = async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = await readBody(req);
    const password = body && body.password;
    const valid = process.env.KNOCK_OPS_PASSWORD;
    if (!valid) return res.status(500).json({ error: 'KNOCK_OPS_PASSWORD not set' });
    if (!password || password !== valid) return res.status(401).json({ error: 'Unauthorized' });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'auth handler error: ' + (err && err.message) });
  }
};
