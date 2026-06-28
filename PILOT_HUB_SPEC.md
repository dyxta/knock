# Pilot Hub — Design Spec

A single ops-facing landing page that ties together every existing pilot tool, plus two new pieces (targets tracker, timeline). Lives at a new URL, password-gated with the same `KNOCK_OPS_PASSWORD` used everywhere else.

## Proposed location

`go/pilot-hub.html` → reachable at `https://go.knocktalent.co.za/pilot-hub.html`

(Same project as `go/analytics.html`, so it shares styling and the "ops tool" family. Could alternatively live under `tiktok/` or its own folder — flagging this as the one open decision left; default to `go/` unless you say otherwise.)

## Sections, top to bottom

### 1. Header
"Knock Pilot — Ops Hub." One-line description. Password gate identical in style to `analytics.html`/`channels-builder.html` (same `KNOCK_OPS_PASSWORD`).

### 2. Pilot timeline (your #5)
A simple horizontal/vertical CSS timeline — no Mermaid, no diagram tooling. Phases as labeled steps with dates, a marker showing "today" / current phase. Content (phase names + dates) will be **placeholder** until you give me the real pilot schedule — e.g. "Channel setup," "Soft launch," "Push week," "Wrap-up & review." Editable directly in the HTML (plain array of `{label, date, done}` objects) so updating it later doesn't need touching layout code.

### 3. Targets tracker (your #3)
Card grid, each card = one target metric with a progress bar:
- Current value (auto-pulled live, see Data Sources below)
- Target value (**placeholder** numbers/dates until you provide real ones — editable as a simple config object at the top of the file)
- % to goal, color-coded (on track / behind)

Candidate metrics (auto-pullable today): total signups, total starter packs created, total channel link clicks, total opportunity downloads. Anything target-specific you want beyond what's already tracked (e.g. "10 active champions") needs either a number you tell me to hardcode as the target, or — if it's also a thing we should *count* automatically — an extension to the Apps Script, same pattern as everything else built this pilot.

### 4. Channel builder card (your #1)
- Big CTA button → `channels-builder.html`
- A short "how this works" explainer inline (3-4 lines: pick audience+channel, pick 6 opportunities, save, get a link) — not a separate guide page, just enough context so someone new doesn't need to ask. If you want a longer how-to guide, that's a separate doc/page I can build, but the spec as you described it doesn't require one beyond this card.
- Secondary link → `go/analytics.html` (the opportunities/starter-pack/champion analytics), explicitly labeled e.g. "see opportunity & link performance"

### 5. Sign-up form snapshot (your #2)
Lightweight summary card — NOT a duplicate of the existing `?stats=1` dashboard, which already has the full funnel/pipeline/trend breakdown. This card pulls the same `action=full` data and shows just the headline numbers (total signups, signups today/this week, top-of-funnel conversion %), with a "view full analytics →" link to `<flyer-domain>/?stats=1`.

I need the flyer's live domain to link to this correctly — is it `knocktalent.co.za` or `go.knocktalent.co.za` or something else? (Flagging as the second open question.)

### 6. WhatsApp approvals card (your #4)
CTA button → `<flyer-domain>/?ops=1` (confirmed: this is a query param on the flyer itself, not a separate page). Same domain question as above applies here.

## Data sources / joins

All auto-pulled, same join model as `analytics.html`:
- Apps Script `action=full` → signups + events (for the snapshot card + funnel-derived metrics)
- Apps Script `action=starterpacks_admin` → pack count
- Apps Script `action=opp_stats` → download totals
- `go/api/links.js` → total clicks across all link types

Two passwords needed, same as `analytics.html`: ops password (Apps Script) + go password (`go/api/links.js`). Entered once at the gate, kept in memory only.

## Open questions before I build

1. **Location** — `go/pilot-hub.html` (my default) or somewhere else?
2. **Flyer's live domain** — what's the actual URL so the "?ops=1" and "?stats=1" links work? (e.g. `knocktalent.co.za`, or a Vercel preview URL, or something else.)
3. **Real targets** — you said placeholders are fine for now; just confirming I should make these obviously editable (e.g. a `TARGETS = {...}` object at the top of the file with a comment) rather than buried in markup, so you can update them yourself without pinging me.
4. **Timeline phases** — also placeholder; same approach, an editable array at the top of the file.

If this all looks right, I'll build it as one self-contained HTML file (matching the existing `analytics.html`/`channels-builder.html` visual style), wire the live data pulls, verify syntax, sync/commit, and hand you the URL.
