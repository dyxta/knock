const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url:   process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

module.exports = async function handler(req, res) {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing code');

  res.setHeader('Cache-Control', 'no-store');

  // SHARE link — one single, fixed code ("share") used by every share
  // action across the flyer (see doShare() in tiktok/index.html), instead
  // of each visitor sharing their own raw window.location.href. Handled
  // before the redis.get() below and with no stored link:share record
  // needed at all, since there's nothing per-link to configure — every
  // share just bounces straight back to wherever it was shared from.
  // clicks:share still gets incremented exactly like every other code in
  // this file, so it's a real aggregate "times a shared link was opened"
  // counter, with no creation step required in go/api/create.js.
  //
  // dest carries the full flyer URL (path + audience/ch + any other query
  // params) the sharer was actually on, captured client-side at share-time
  // — there's no single fixed flyer domain/path to hardcode here, since
  // the flyer can be deployed at different paths per project and every
  // channel link already points at its own dest. If dest is somehow
  // missing (e.g. someone hits /share directly with no params), fall back
  // to the production marketing site rather than erroring.
  if (code === 'share') {
    await redis.incr('clicks:share');
    const dest = req.query.dest;
    const url = dest ? decodeURIComponent(dest) : 'https://knocktalent.co.za';
    return res.redirect(302, url);
  }

  const data = await redis.get(`link:${code}`);
  if (!data) return res.status(404).send('Link not found');

  await redis.incr(`clicks:${code}`);

  // CHANNELS link — redirects to data.dest, with this link's own
  // audience/ch (captured once at creation time in go/api/create.js)
  // always appended as query params. Previously this only redirected to
  // data.dest verbatim, which meant audience/ch reached the flyer only if
  // ops happened to type them into the destination field by hand — in
  // practice they almost never did, so the flyer's "hi, {audience}"
  // greeting and its dynamic starter-pack matching silently never fired.
  // Appending them here instead means every channel link personalises
  // correctly regardless of what ops put in the destination field, and
  // there's nothing for ops to remember to do.
  if (data.type === 'channel') {
    if (data.dest) {
      const sep = data.dest.includes('?') ? '&' : '?';
      const url = data.dest + sep + 'audience=' + encodeURIComponent(data.audience || '') + '&ch=' + encodeURIComponent(data.ch || '');
      return res.redirect(302, url);
    }
    const base = (data.destBase || 'https://knocktalent.co.za').replace(/\/+$/, '');
    const sep = base.includes('?') ? '&' : '?';
    const legacyUrl = base + sep + 'audience=' + encodeURIComponent(data.audience || '') + '&ch=' + encodeURIComponent(data.ch || '');
    return res.redirect(302, legacyUrl);
  }

  // OPPORTUNITY link — one recycled code per opportunity (see
  // go/api/create.js's 'opportunity' branch). Redirects exactly to
  // data.dest, same as a channel link. clicks:<code> above counts every
  // click on this opportunity's single link regardless of which starter
  // pack/audience/channel it was surfaced through — that's the whole
  // point of recycling instead of minting a new code per pack.
  if (data.type === 'opportunity') {
    return res.redirect(302, data.dest);
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
