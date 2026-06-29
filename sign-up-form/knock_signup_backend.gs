/**
 * ============================================================
 * KNOCK SIGNUP BACKEND · Google Apps Script
 * ============================================================
 *
 * Endpoints used by knock_signup.html (tiktok/index.html):
 *
 *   GET  ?action=full     &password=...  → { submissions:[...], events:[...] }
 *   GET  ?action=list     &password=...  → { submissions:[...] }
 *   GET  ?action=events   &password=...  → { events:[...] }
 *   GET  ?action=starterpacks            → { packs:[...] }   (public — no PII)
 *   POST { type:'state_update', password:'...', ref, phone, state }
 *   POST { type:'opp_event', data:{ oppId, event, audience, ch, session } }
 *        event ∈ 'like' | 'unlike' | 'bundle_add' | 'bundle_remove' | 'download'
 *        (public — no PII; this is how likes/bundle-adds/downloads get
 *        recorded server-side now, see CHANGES IN THIS VERSION below)
 *
 * Endpoints used by the ops link-builder tools (channels-builder.html,
 * link-builder.html):
 *
 *   GET  ?action=opportunities&password=...     → { opportunities:[...] }
 *   POST { type: 'starterpack_save', password: '...', data: {...} }
 *
 *   POST { type: 'submission', data: {...} }                (public — the signup form itself)
 *   POST { type: 'events_batch', data: [{e,t,p,s},...] }     (public — page-view/click tracking)
 *
 * Endpoints used by the new analytics dashboard (analytics.html):
 *
 *   GET  ?action=starterpacks_admin&password=...  → { packs:[...] }  (with stats + champion/link info)
 *   GET  ?action=opp_stats&password=...           → { stats:[...] }  (per-opportunity likes/bundle/download/click rollup)
 *
 * Endpoints used for the champion mini-CRM:
 *
 *   GET  ?action=champions&password=...           → { champions:[...] }
 *   POST { type:'champion_save', password:'...', data:{ name, contact, platform, notes, linkCode } }
 *        Upserts by name+contact; if a row already exists for that
 *        person, the new linkCode is appended to their linkCodes list
 *        instead of creating a duplicate row.
 *
 * ============================================================
 * ACCESS CONTROL — a single shared password, everywhere
 * ============================================================
 * Every endpoint that reads or writes real data (list/events/full/
 * state_update/opportunities/starterpack_save/champions/champion_save/
 * starterpacks_admin/opp_stats) checks the SAME shared password,
 * KNOCK_OPS_PASSWORD, set in Script Properties. There's no Google login
 * involved anywhere in this script. opp_event is intentionally public/
 * unauthenticated — it's fired by anonymous flyer visitors clicking
 * like/save/download, the same trust model as events_batch already
 * uses for page-view tracking. There's no PII in an opp_event payload
 * (just an opportunity id + event name + audience/ch labels + a random
 * client-side session id), so leaving it open is consistent with how
 * the rest of the anonymous-visitor telemetry already works in this
 * script.
 *
 * WHY (unchanged from previous version): this script used to gate
 * list/events/full/state_update with Session.getActiveUser() + an
 * ADMIN_EMAILS allowlist. In practice it wasn't usable: Apps Script
 * enforces that check by 302-redirecting every request through
 * accounts.google.com BEFORE running any of this code, which breaks
 * fetch() calls from a different origin (CORS error, not auth error).
 * One shared password, one deployment set to "Anyone", is the model
 * that actually works for both the flyer's own admin views and the
 * separate-origin link-builder/analytics tools calling this script via
 * fetch().
 *
 * Also go to the Signups Google Sheet itself → Share → make sure "Anyone
 * with the link" is OFF. Only people you've explicitly added as
 * editors/viewers should be able to open the raw Sheet directly — the
 * password only protects the Apps Script endpoint, not the Sheet's own
 * share link.
 *
 * ============================================================
 * DEPLOYMENT — read this carefully, it's the part that's easy to get wrong
 * ============================================================
 *  1. Create a Google Sheet, name it "Knock signups" (or reuse the
 *     existing one — this version adds new tabs to whatever Sheet
 *     SHEET_ID in Script Properties already points at, it doesn't
 *     touch Signups/Events/StarterPacks structure).
 *  2. Open Extensions → Apps Script. Paste this entire file, replacing
 *     everything that was there.
 *  3. KNOCK_OPS_PASSWORD should already be set in Script Properties
 *     from before — nothing new needed here.
 *  4. Deploy → Manage deployments → pencil icon → New version. (You do
 *     NOT need a brand new deployment or a new URL — this is additive
 *     to the existing script, same /exec URL keeps working.)
 *     Who has access stays "Anyone" — unchanged.
 *  5. No changes needed to knock_signup.html's/channels-builder.html's
 *     window.KNOCK_APPS_SCRIPT_URL — same URL as before.
 *
 * ============================================================
 * CHANGES IN THIS VERSION
 * ============================================================
 *  - New "OppEvents" tab + opp_event endpoint: records like/unlike/
 *    bundle_add/bundle_remove/download events per opportunity, keyed by
 *    oppId (see oppId_() below — a stable id derived from title+url,
 *    since the Opportunities List Sheet has no real ID column the
 *    client can read). This is the real, persistent, server-side
 *    replacement for what used to be PostHog-only / localStorage-only
 *    signals (toggleLike, toggleSaveRow, generatePDF in tiktok/index.html
 *    — those call sites need a small client-side change to also POST
 *    opp_event now; that's a separate change to tiktok/index.html, not
 *    part of this script).
 *  - New "Champions" tab + champions/champion_save endpoints: a minimal
 *    CRM for people who share channel links on Knock's behalf. Upserts
 *    by (name, contact) so creating a champion on the fly while minting
 *    a link doesn't duplicate them if they're already known.
 *  - New starterpacks_admin action: same data as the public
 *    `starterpacks` action, but password-gated and additionally
 *    returns updated_at/updated_by per pack (the public action omits
 *    these — no reason to hide them from ops, they just weren't needed
 *    by the flyer).
 *  - New opp_stats action: rolls up OppEvents by oppId into
 *    { oppId, likes, downloads } counts, for the analytics dashboard.
 *    'likes' is the net bundle_add/bundle_remove count — the flyer's
 *    heart icon IS the bundle toggle, there's no separate like action,
 *    see rollUpOppStats_'s comment for the full reasoning. Click counts
 *    are NOT included here — those live in
 *    Redis (go/api), not this Sheet; the dashboard fetches them
 *    separately from go/api/links.js and joins client-side by oppId/code.
 * ============================================================
 */
const SHEET_NAME_SIGNUPS = 'Signups';
const SHEET_NAME_EVENTS  = 'Events';
const SHEET_NAME_STARTERPACKS = 'StarterPacks';
const SHEET_NAME_OPPEVENTS = 'OppEvents';
const SHEET_NAME_CHAMPIONS = 'Champions';
// The "Opportunities List" Sheet is a separate spreadsheet (not a tab in
// this one) that ops maintains by hand. The link-builder tool reads from
// it via this script (rather than talking to the Sheets API directly from
// the browser) so the script's own Google identity (not the caller's)
// is what needs viewer access to it — see readOpenOpportunities_() below.
const OPPORTUNITIES_SHEET_ID = '1cjbG-dYy7rcBPuF9wbTXKTZfqP45NYr33zoF4bMbQUg';
const OPPORTUNITIES_TAB_NAME = ''; // '' = first/active sheet in that spreadsheet
const SIGNUPS_HEADERS = [
'ref',
'submitted_at',
'time_to_complete_s',
'group',
'state',
'university',
'field',
'degree',
'year',
'gpa',
'lookingFor',
'phone',
'email',
'consent',
'audience',
'ch'
];
const EVENTS_HEADERS = [
'timestamp',
'event',
'props',
'session'
];
// One row per audience+channel combo. `opportunities` is a JSON string
// (array of {title, company, location, degrees, deadline, url}) — written
// by the link-builder tool from rows it pulled out of the Opportunities
// List Sheet, so this tab is self-contained and the flyer never needs
// direct access to that other Sheet.
const STARTERPACKS_HEADERS = [
'audience',
'channel',
'label',
'opportunities',
'updated_at',
'updated_by'
];
// One row per opportunity-level signal. oppId is stable across packs/
// audiences (see oppId_()) so the same opportunity appearing in three
// different starter packs still rolls up into one set of counts.
const OPPEVENTS_HEADERS = [
'timestamp',
'oppId',
'event',       // like | unlike | bundle_add | bundle_remove | download
'audience',
'ch',
'session'
];
// One row per champion (person who shares Knock links on our behalf).
// linkCodes is a JSON array string of every go.knocktalent.co.za code
// they've been handed, so one person can be tied to multiple links
// over time without duplicating their row.
const CHAMPIONS_HEADERS = [
'name',
'contact',     // phone/email/handle — whatever ops has for them
'platform',    // e.g. "Instagram", "WhatsApp", "in person"
'notes',
'linkCodes',
'created_at',
'updated_at'
];
function getSpreadsheet_() {
const id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
if (id) return SpreadsheetApp.openById(id);
return SpreadsheetApp.getActiveSpreadsheet();
}
function getTab_(name, headers) {
const ss = getSpreadsheet_();
if (!ss) {
throw new Error('No Spreadsheet bound. Set SHEET_ID in Script Properties or run this script from inside a Sheet.');
  }
let sheet = ss.getSheetByName(name);
if (!sheet) {
sheet = ss.insertSheet(name);
  }
const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
const hasHeaders = headers.every((h, i) => firstRow[i] === h);
if (!hasHeaders) {
sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
sheet.setFrozenRows(1);
sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#F0EBFF')
      .setFontColor('#5E17EB');
  }
return sheet;
}
function getSignupsSheet_() { return getTab_(SHEET_NAME_SIGNUPS, SIGNUPS_HEADERS); }
function getEventsSheet_()  { return getTab_(SHEET_NAME_EVENTS,  EVENTS_HEADERS);  }
function getStarterPacksSheet_() { return getTab_(SHEET_NAME_STARTERPACKS, STARTERPACKS_HEADERS); }
function getOppEventsSheet_() { return getTab_(SHEET_NAME_OPPEVENTS, OPPEVENTS_HEADERS); }
function getChampionsSheet_() { return getTab_(SHEET_NAME_CHAMPIONS, CHAMPIONS_HEADERS); }
/**
 * Returns true only if `password` matches KNOCK_OPS_PASSWORD in Script
 * Properties. Fails CLOSED: if the property isn't set at all, this
 * always returns false rather than accidentally opening access. Used
 * by every endpoint that touches real data — list/events/full/
 * state_update/opportunities/starterpack_save/champions/champion_save/
 * starterpacks_admin/opp_stats.
 */
function isOpsPasswordValid_(password) {
const expected = PropertiesService.getScriptProperties().getProperty('KNOCK_OPS_PASSWORD');
return !!expected && password === expected;
}
function jsonOut_(obj) {
return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
/**
 * Stable id for an opportunity, derived from title+url (lowercased,
 * trimmed, joined, hashed to a short hex string). The Opportunities
 * List Sheet has no real ID column the client reads, and channels-
 * builder.html already matches existing pack rows back to opportunities
 * by the same (title, url) pair — see its applyStarterPack matching
 * logic — so this just formalizes that same pairing into a single
 * stable key usable for event tracking and link recycling, without
 * requiring any change to the Opportunities List Sheet itself.
 */
function oppId_(title, url) {
const raw = String(title || '').trim().toLowerCase() + '|' + String(url || '').trim().toLowerCase();
const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, raw, Utilities.Charset.UTF_8);
return digest.map(function (b) {
const v = (b < 0 ? b + 256 : b).toString(16);
return v.length === 1 ? '0' + v : v;
  }).join('').slice(0, 12);
}
/**
 * Reads the external "Opportunities List" Sheet (a separate spreadsheet
 * ops maintains directly) and returns only rows where Status === "Open".
 * Each row gets an `oppId` field attached (see oppId_()) so callers can
 * track/aggregate signals per opportunity without needing a real ID
 * column in the source Sheet.
 * Requires this script's Google identity to have at least viewer access
 * to that Sheet — share it with the script owner/ops account if this
 * starts returning an empty list unexpectedly.
 */
function readOpenOpportunities_() {
const ss = SpreadsheetApp.openById(OPPORTUNITIES_SHEET_ID);
const sheet = OPPORTUNITIES_TAB_NAME ? ss.getSheetByName(OPPORTUNITIES_TAB_NAME) : ss.getSheets()[0];
const rows = readAllRows_(sheet);
return rows
    .filter(r => String(r['Status'] || '').trim().toLowerCase() === 'open')
    .map(r => {
r.oppId = oppId_(r['Name of Opportunity'], r['Link']);
return r;
    });
}
/**
 * Shared upsert logic for starterpack_save. Caller must already have
 * checked isOpsPasswordValid_() before calling this — it does not check
 * auth itself.
 */
function upsertStarterPack_(data) {
const s = data || {};
const audience = String(s.audience || '').trim();
const channel = String(s.channel || '').trim();
if (!audience || !channel) {
return { ok: false, error: 'missing audience or channel' };
  }
const sheet = getStarterPacksSheet_();
const rows = sheet.getDataRange().getValues();
const headers = rows[0];
const audCol = headers.indexOf('audience');
const chCol = headers.indexOf('channel');
const row = STARTERPACKS_HEADERS.map(h => {
if (h === 'audience') return audience;
if (h === 'channel') return channel;
if (h === 'label') return s.label || '';
if (h === 'opportunities') return JSON.stringify(s.opportunities || []);
if (h === 'updated_at') return new Date();
if (h === 'updated_by') return 'ops';
return '';
  });
for (let i = 1; i < rows.length; i++) {
if (rows[i][audCol] === audience && rows[i][chCol] === channel) {
sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
return { ok: true, updated: audience + '/' + channel, mode: 'updated' };
    }
  }
sheet.getRange(sheet.getLastRow() + 1, 1, 1, row.length).setValues([row]);
return { ok: true, updated: audience + '/' + channel, mode: 'created' };
}
/**
 * Appends one opp_event row. No auth check — see ACCESS CONTROL above
 * for why this endpoint is intentionally public.
 */
function recordOppEvent_(data) {
const s = data || {};
const oppId = String(s.oppId || '').trim();
const event = String(s.event || '').trim();
const allowed = ['like', 'unlike', 'bundle_add', 'bundle_remove', 'download'];
if (!oppId || allowed.indexOf(event) === -1) {
return { ok: false, error: 'missing/invalid oppId or event (must be one of: ' + allowed.join(', ') + ')' };
  }
const sheet = getOppEventsSheet_();
const row = [
new Date(),
oppId,
event,
s.audience || '',
s.ch || '',
s.session || ''
  ];
sheet.getRange(sheet.getLastRow() + 1, 1, 1, row.length).setValues([row]);
return { ok: true };
}
/**
 * Rolls up OppEvents into per-oppId counts.
 *
 * NOTE on 'likes': the flyer UI (tiktok/index.html) has no separate "like"
 * action distinct from saving an opportunity to your bundle — the heart
 * icon IS the bundle add/remove toggle, so 'like'/'unlike' events are never
 * actually sent by any current client. 'likes' below is therefore just an
 * alias for the net bundle_add/bundle_remove count (floored at 0, so
 * toggling on/off repeatedly doesn't inflate the number forever) — this
 * keeps a single honest "how many people currently have this saved" metric
 * instead of a second field that would always read 0. If a client ever
 * starts sending real like/unlike events (independent of bundle state),
 * add them back as their own counter rather than merging into this one.
 *
 * downloads is a pure lifetime count (no corresponding "undo" event —
 * once a PDF is generated, it happened).
 */
function rollUpOppStats_() {
const rows = readAllRows_(getOppEventsSheet_());
const byId = {};
rows.forEach(r => {
const id = r.oppId;
if (!id) return;
if (!byId[id]) byId[id] = { oppId: id, likes: 0, downloads: 0 };
if (r.event === 'like' || r.event === 'bundle_add') byId[id].likes++;
else if (r.event === 'unlike' || r.event === 'bundle_remove') byId[id].likes--;
else if (r.event === 'download') byId[id].downloads++;
  });
return Object.keys(byId).map(id => {
const v = byId[id];
v.likes = Math.max(0, v.likes);
return v;
  });
}
/**
 * Site-wide totals for the flyer's public like/share counters. See the
 * action === 'global_stats' comment in doGet for what each field means
 * and why no new Sheet tab/event was needed to support this.
 */
function rollUpGlobalStats_() {
const likes = rollUpOppStats_().reduce((sum, v) => sum + v.likes, 0);
const events = readAllRows_(getEventsSheet_());
const shares = events.filter(r => r.event === 'share_clicked' || r.event === 'share_copied').length;
return { likes: likes, shares: shares };
}
/**
 * Upserts a champion by (name, contact) — case-insensitive, trimmed
 * match on both fields together. If found, merges in any new linkCode
 * (no duplicates) and updates notes/platform if newly provided rather
 * than overwriting with blanks. If not found, creates a new row.
 */
function upsertChampion_(data) {
const s = data || {};
const name = String(s.name || '').trim();
const contact = String(s.contact || '').trim();
if (!name || !contact) {
return { ok: false, error: 'missing name or contact' };
  }
const sheet = getChampionsSheet_();
const rows = sheet.getDataRange().getValues();
const headers = rows[0];
const nameCol = headers.indexOf('name');
const contactCol = headers.indexOf('contact');
const platformCol = headers.indexOf('platform');
const notesCol = headers.indexOf('notes');
const linkCodesCol = headers.indexOf('linkCodes');
const updatedAtCol = headers.indexOf('updated_at');
const newCode = s.linkCode ? String(s.linkCode).trim() : '';
for (let i = 1; i < rows.length; i++) {
const rowName = String(rows[i][nameCol] || '').trim().toLowerCase();
const rowContact = String(rows[i][contactCol] || '').trim().toLowerCase();
if (rowName === name.toLowerCase() && rowContact === contact.toLowerCase()) {
let codes = [];
try { codes = JSON.parse(rows[i][linkCodesCol] || '[]'); } catch (err) { codes = []; }
if (newCode && codes.indexOf(newCode) === -1) codes.push(newCode);
if (s.platform) sheet.getRange(i + 1, platformCol + 1).setValue(s.platform);
if (s.notes) sheet.getRange(i + 1, notesCol + 1).setValue(s.notes);
sheet.getRange(i + 1, linkCodesCol + 1).setValue(JSON.stringify(codes));
sheet.getRange(i + 1, updatedAtCol + 1).setValue(new Date());
return { ok: true, mode: 'updated', name: name, linkCodes: codes };
      }
    }
const codes = newCode ? [newCode] : [];
const row = CHAMPIONS_HEADERS.map(h => {
if (h === 'name') return name;
if (h === 'contact') return contact;
if (h === 'platform') return s.platform || '';
if (h === 'notes') return s.notes || '';
if (h === 'linkCodes') return JSON.stringify(codes);
if (h === 'created_at') return new Date();
if (h === 'updated_at') return new Date();
return '';
  });
sheet.getRange(sheet.getLastRow() + 1, 1, 1, row.length).setValues([row]);
return { ok: true, mode: 'created', name: name, linkCodes: codes };
}
function readAllRows_(sheet) {
const values = sheet.getDataRange().getValues();
if (values.length < 2) return [];
const headers = values[0];
return values.slice(1).map(row => {
const obj = {};
headers.forEach((h, i) => obj[h] = row[i]);
return obj;
  });
}
/* ============================================================
   GET — list / events / full / starterpacks / opportunities /
         starterpacks_admin / opp_stats / champions
   ============================================================ */
function doGet(e) {
const action = (e && e.parameter && e.parameter.action) || 'list';
try {
// list/events/full all return PII (phone, email, university, GPA, etc.) —
// require the shared ops password for every one of them.
if (action === 'list' || action === 'events' || action === 'full') {
if (!isOpsPasswordValid_(e.parameter.password)) {
return jsonOut_({ error: 'unauthorized: incorrect or missing password', needsLogin: false });
      }
    }
if (action === 'list') {
return jsonOut_({ submissions: readAllRows_(getSignupsSheet_()) });
    }
if (action === 'events') {
return jsonOut_({ events: readAllRows_(getEventsSheet_()) });
    }
if (action === 'full') {
return jsonOut_({
submissions: readAllRows_(getSignupsSheet_()),
events: readAllRows_(getEventsSheet_())
      });
    }
// Public — no PII in this tab, and the flyer (anonymous visitors) needs
// to read it directly on every page load to pick the right starter pack.
if (action === 'starterpacks') {
const rows = readAllRows_(getStarterPacksSheet_());
const packs = rows.map(r => {
let opportunities = [];
try { opportunities = JSON.parse(r.opportunities || '[]'); } catch (err) { opportunities = []; }
return {
audience: r.audience,
channel: r.channel,
label: r.label,
opportunities: opportunities
        };
      });
return jsonOut_({ packs: packs });
    }
// Ops-only version of the same tab, with updated_at/updated_by included
// — for the analytics dashboard, which wants to show "last touched".
if (action === 'starterpacks_admin') {
if (!isOpsPasswordValid_(e.parameter.password)) {
return jsonOut_({ error: 'unauthorized: incorrect or missing password' });
      }
const rows = readAllRows_(getStarterPacksSheet_());
const packs = rows.map(r => {
let opportunities = [];
try { opportunities = JSON.parse(r.opportunities || '[]'); } catch (err) { opportunities = []; }
return {
audience: r.audience,
channel: r.channel,
label: r.label,
opportunities: opportunities,
updated_at: r.updated_at,
updated_by: r.updated_by
        };
      });
return jsonOut_({ packs: packs });
    }
// Per-opportunity likes/bundle-adds/downloads rollup, for the analytics
// dashboard. Click counts are NOT here — those live in go/api's Redis,
// joined client-side by oppId/code.
if (action === 'opp_stats') {
if (!isOpsPasswordValid_(e.parameter.password)) {
return jsonOut_({ error: 'unauthorized: incorrect or missing password' });
      }
return jsonOut_({ stats: rollUpOppStats_() });
    }
// Public — no PII. Aggregate, site-wide like/share totals for the
// flyer's heart/share button counters (tiktok/index.html's
// fetchGlobalStats(), gated behind window.KNOCK_STATS_URL). Built purely
// from data already being collected by other endpoints, so no new Sheet
// tab or client-side event was needed:
//  - likes  = sum of rollUpOppStats_()'s per-opportunity net likes
//             (bundle_add minus bundle_remove, floored at 0 per opp by
//             rollUpOppStats_ already) — i.e. "how many opportunities are
//             currently saved across everyone, total".
//  - shares = count of Events rows where event is 'share_clicked' or
//             'share_copied' (doShare()/copyLink() already send these on
//             every share action, completely independent of this change).
if (action === 'global_stats') {
return jsonOut_(rollUpGlobalStats_());
    }
// Champion mini-CRM list, for the analytics dashboard / channels-builder.
if (action === 'champions') {
if (!isOpsPasswordValid_(e.parameter.password)) {
return jsonOut_({ error: 'unauthorized: incorrect or missing password' });
      }
const rows = readAllRows_(getChampionsSheet_());
const champions = rows.map(r => {
let linkCodes = [];
try { linkCodes = JSON.parse(r.linkCodes || '[]'); } catch (err) { linkCodes = []; }
return {
name: r.name,
contact: r.contact,
platform: r.platform,
notes: r.notes,
linkCodes: linkCodes,
created_at: r.created_at,
updated_at: r.updated_at
        };
      });
return jsonOut_({ champions: champions });
    }
// Link-builder tool — reads the separate Opportunities List Sheet.
// Each row comes back with an oppId attached (see readOpenOpportunities_).
if (action === 'opportunities') {
if (!isOpsPasswordValid_(e.parameter.password)) {
return jsonOut_({ error: 'unauthorized: incorrect or missing password' });
      }
try {
return jsonOut_({ opportunities: readOpenOpportunities_() });
      } catch (err) {
return jsonOut_({ error: 'failed to read Opportunities List Sheet: ' + String(err) });
      }
    }
return jsonOut_({ error: 'unknown action: ' + action });
  } catch (err) {
return jsonOut_({ error: String(err) });
  }
}
/* ============================================================
   POST — submission / state_update / events_batch / starterpack_save /
          opp_event / champion_save
   ============================================================ */
function doPost(e) {
try {
const body = JSON.parse(e.postData.contents || '{}');
/* ---- SUBMISSION ---- */
if (body.type === 'submission') {
const sheet = getSignupsSheet_();
const s = body.data || {};
const row = SIGNUPS_HEADERS.map(h => {
if (h === 'consent') return s.consent ? 'YES' : 'NO';
if (h === 'state') return s.state || 'requested';
return s[h] !== undefined && s[h] !== null ? s[h] : '';
      });
const newRowIndex = sheet.getLastRow() + 1;
sheet.getRange(newRowIndex, 1, 1, row.length).setValues([row]);
// Force the phone column to plain-text format BEFORE/AFTER setting its value
// so Sheets never auto-coerces it to a number (which drops the leading + and
// any leading 0, or flips it into scientific notation for long digit strings).
const phoneCol = SIGNUPS_HEADERS.indexOf('phone') + 1;
if (phoneCol > 0) {
const phoneCell = sheet.getRange(newRowIndex, phoneCol);
phoneCell.setNumberFormat('@STRING@');
phoneCell.setValue(String(s.phone || ''));
    }
return jsonOut_({ ok: true, ref: s.ref });
    }
/* ---- STATE UPDATE ----
     * Matches by `ref` first (exact). If `ref` is missing/blank or not found
     * in the sheet (older rows were written before `ref` existed on the
     * client), falls back to matching by `phone` instead, so the ops
     * approval UI works for every row, old or new. On a phone-match hit,
     * if the row's `ref` cell is blank and the client sent a ref, we
     * backfill it so future updates for that row can use the fast path.
     */
if (body.type === 'state_update') {
if (!isOpsPasswordValid_(body.password)) {
return jsonOut_({ ok: false, error: 'unauthorized: incorrect or missing password' });
      }
const sheet = getSignupsSheet_();
const ref = body.ref;
const phone = body.phone;
const newState = body.state;
if (!newState || (!ref && !phone)) {
return jsonOut_({ ok: false, error: 'missing ref/phone or state' });
      }
const data = sheet.getDataRange().getValues();
const headers = data[0];
const refCol = headers.indexOf('ref');
const stateCol = headers.indexOf('state');
const phoneCol = headers.indexOf('phone');
if (refCol === -1 || stateCol === -1) {
return jsonOut_({ ok: false, error: 'ref or state column missing in sheet' });
      }
if (ref) {
for (let i = 1; i < data.length; i++) {
if (data[i][refCol] === ref) {
sheet.getRange(i + 1, stateCol + 1).setValue(newState);
return jsonOut_({ ok: true, updated: ref, state: newState, matchedBy: 'ref' });
          }
        }
      }
if (phone && phoneCol !== -1) {
const norm = String(phone).replace(/\D/g, '');
for (let i = 1; i < data.length; i++) {
const rowPhone = String(data[i][phoneCol] || '').replace(/\D/g, '');
if (rowPhone && norm && rowPhone === norm) {
sheet.getRange(i + 1, stateCol + 1).setValue(newState);
if (ref && refCol !== -1 && !data[i][refCol]) {
sheet.getRange(i + 1, refCol + 1).setValue(ref);
              }
return jsonOut_({ ok: true, updated: phone, state: newState, matchedBy: 'phone' });
            }
          }
        }
return jsonOut_({ ok: false, error: 'no matching row for ref/phone: ' + (ref || phone) });
    }
/* ---- STARTER PACK SAVE ----
     * Upserts by (audience, channel) — a link-builder run for the same
     * audience+channel pair overwrites the previous pack instead of
     * duplicating rows.
     */
if (body.type === 'starterpack_save') {
if (!isOpsPasswordValid_(body.password)) {
return jsonOut_({ ok: false, error: 'unauthorized: incorrect or missing password' });
      }
return jsonOut_(upsertStarterPack_(body.data || {}));
    }
/* ---- OPPORTUNITY EVENT ----
     * Public/unauthenticated — see ACCESS CONTROL above. Fired by the
     * flyer (tiktok/index.html) on like/unlike/bundle_add/bundle_remove/
     * download, keyed by oppId (see oppId_()).
     */
if (body.type === 'opp_event') {
return jsonOut_(recordOppEvent_(body.data || {}));
    }
/* ---- CHAMPION SAVE ----
     * Upserts by (name, contact) — see upsertChampion_(). Used both by
     * channels-builder.html's inline "create champion on the fly" flow
     * and could be called standalone from a future dedicated CRM page.
     */
if (body.type === 'champion_save') {
if (!isOpsPasswordValid_(body.password)) {
return jsonOut_({ ok: false, error: 'unauthorized: incorrect or missing password' });
      }
return jsonOut_(upsertChampion_(body.data || {}));
    }
/* ---- EVENTS BATCH ---- */
if (body.type === 'events_batch') {
const events = Array.isArray(body.data) ? body.data : [];
if (!events.length) return jsonOut_({ ok: true, count: 0 });
const sheet = getEventsSheet_();
const rows = events.map(ev => [
new Date(ev.t || Date.now()),
ev.e || '',
JSON.stringify(ev.p || {}),
ev.s || ''
      ]);
sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, EVENTS_HEADERS.length)
           .setValues(rows);
return jsonOut_({ ok: true, count: rows.length });
    }
return jsonOut_({ ok: false, error: 'unknown type: ' + body.type });
  } catch (err) {
return jsonOut_({ ok: false, error: String(err) });
  }
}
/**
 * Manual test runner — run from the Apps Script editor to verify all
 * tabs exist and headers are correct. Safe to run anytime.
 */
function _smokeTest() {
const s = getSignupsSheet_();
const e = getEventsSheet_();
const p = getStarterPacksSheet_();
const o = getOppEventsSheet_();
const c = getChampionsSheet_();
Logger.log('Signups: ' + s.getLastRow() + ' rows');
Logger.log('Events: ' + e.getLastRow() + ' rows');
Logger.log('StarterPacks: ' + p.getLastRow() + ' rows');
Logger.log('OppEvents: ' + o.getLastRow() + ' rows');
Logger.log('Champions: ' + c.getLastRow() + ' rows');
}
