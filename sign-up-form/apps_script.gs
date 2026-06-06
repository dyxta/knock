/**
 * ============================================================
 * KNOCK SIGNUP BACKEND · Google Apps Script
 * ============================================================
 *
 * Endpoints used by knock_signup.html:
 *
 *   GET  ?action=full     → { submissions:[...], events:[...] }
 *   GET  ?action=list     → { submissions:[...] }              (legacy)
 *   GET  ?action=events   → { events:[...] }
 *
 *   POST { type: 'auth', password: '...' }
 *         → { ok: true,  token: 'uuid' } | { ok: false, error: '...' }
 *   POST { type: 'submission', data: {...} }
 *   POST { type: 'state_update', ref, state }
 *   POST { type: 'events_batch', data: [{e,t,p,s},...] }
 *
 * ============================================================
 * SECRETS (Script Properties — NOT in any committed file)
 * ============================================================
 * In the Apps Script editor:
 *   Project Settings → Script Properties → Add property
 *
 *   STATS_PASSWORD  =  <strong password for /stats access>
 *
 * If you also want to bind to a specific Sheet, set:
 *   SHEET_ID        =  <your Google Sheet ID>
 *
 * The script will fall back to the SpreadsheetApp.getActiveSpreadsheet()
 * (i.e., the Sheet this script lives inside) if SHEET_ID is unset.
 *
 * ============================================================
 * DEPLOYMENT
 * ============================================================
 *  1. Create a Google Sheet, name it "Knock signups".
 *  2. Open Extensions → Apps Script. Paste this entire file.
 *  3. Project Settings → Script Properties → add STATS_PASSWORD.
 *  4. Deploy → New deployment → Web app:
 *       Execute as: Me
 *       Who has access: Anyone
 *  5. Copy the /exec URL into knock_signup.html
 *       (window.KNOCK_APPS_SCRIPT_URL = '...').
 *  6. After any edit to this script, redeploy:
 *       Deploy → Manage deployments → pencil → New version.
 * ============================================================
 */

const SHEET_NAME_SIGNUPS = 'Signups';
const SHEET_NAME_EVENTS  = 'Events';

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
  'consent'
];

const EVENTS_HEADERS = [
  'timestamp',
  'event',
  'props',
  'session'
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

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
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
   GET — list / events / full
   ============================================================ */
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'list';
  try {
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
    return jsonOut_({ error: 'unknown action: ' + action });
  } catch (err) {
    return jsonOut_({ error: String(err) });
  }
}

/* ============================================================
   POST — auth / submission / state_update / events_batch
   ============================================================ */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');

    /* ---- AUTH ---- */
    if (body.type === 'auth') {
      const stored = PropertiesService.getScriptProperties().getProperty('STATS_PASSWORD');
      if (!stored) {
        return jsonOut_({ ok: false, error: 'No STATS_PASSWORD set in Script Properties.' });
      }
      if (String(body.password || '') === String(stored)) {
        return jsonOut_({ ok: true, token: Utilities.getUuid() });
      }
      // Tiny delay to slow naive brute force
      Utilities.sleep(400);
      return jsonOut_({ ok: false, error: 'wrong' });
    }

    /* ---- SUBMISSION ---- */
    if (body.type === 'submission') {
      const sheet = getSignupsSheet_();
      const s = body.data || {};
      const row = SIGNUPS_HEADERS.map(h => {
        if (h === 'consent') return s.consent ? 'YES' : 'NO';
        if (h === 'state') return s.state || 'requested';
        return s[h] !== undefined && s[h] !== null ? s[h] : '';
      });
      sheet.appendRow(row);
      return jsonOut_({ ok: true, ref: s.ref });
    }

    /* ---- STATE UPDATE ---- */
    if (body.type === 'state_update') {
      const sheet = getSignupsSheet_();
      const ref = body.ref;
      const newState = body.state;
      if (!ref || !newState) {
        return jsonOut_({ ok: false, error: 'missing ref or state' });
      }
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const refCol = headers.indexOf('ref');
      const stateCol = headers.indexOf('state');
      if (refCol === -1 || stateCol === -1) {
        return jsonOut_({ ok: false, error: 'ref or state column missing in sheet' });
      }
      for (let i = 1; i < data.length; i++) {
        if (data[i][refCol] === ref) {
          sheet.getRange(i + 1, stateCol + 1).setValue(newState);
          return jsonOut_({ ok: true, updated: ref, state: newState });
        }
      }
      return jsonOut_({ ok: false, error: 'ref not found: ' + ref });
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
 * Manual test runner — run from the Apps Script editor to verify both
 * tabs exist and headers are correct. Safe to run anytime.
 */
function _smokeTest() {
  const s = getSignupsSheet_();
  const e = getEventsSheet_();
  Logger.log('Signups: ' + s.getLastRow() + ' rows');
  Logger.log('Events: ' + e.getLastRow() + ' rows');
}
