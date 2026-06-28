/* Proxies go.knocktalent.co.za/api/links so the pilot-hub UI never needs
   the user to type a second password. The go-links password lives here
   as its own server-side env var (KNOCK_GO_PASSWORD) — set it in Vercel
   under the pilot-hub project, Settings → Environment Variables, to the
   same value the `go` project's KNOCK_GO_PASSWORD/links gate expects.
   The browser only ever sends the single KNOCK_OPS_PASSWORD to /api/auth;
   this route is called afterward with no client-supplied secret. */

module.exports = async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const goPassword = process.env.KNOCK_GO_PASSWORD;
  if (!goPassword) {
    return res.status(500).json({ error: 'KNOCK_GO_PASSWORD not set on pilot-hub project' });
  }

  try {
    const upstream = await fetch('https://go.knocktalent.co.za/api/links', {
      headers: { 'x-knock-password': goPassword }
    });
    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', 'application/json');
    return res.send(text);
  } catch (err) {
    return res.status(502).json({ error: 'failed to reach go/api/links: ' + (err && err.message) });
  }
};
