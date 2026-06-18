# Destination English ✈ — Airport Project Day web app

An interactive, iPad-first website for the Class 8 English project day at **Munich Airport**.
Students work in groups across several iPads; everything **syncs live** between a group's devices,
and a clean **PDF** can be saved at the end.

## What's inside

| Page | What it does |
|------|--------------|
| `index.html` | Landing / info page: idea, learning goals, schedule, rules, create/join a group |
| `missions.html` | The 8-mission Scavenger Hunt with points, progress bar and a 40-min timer |
| `interviews.html` | 6 traveller-interview cards + a question bank |
| `map.html` | Interactive world map: tap to drop a pin for every country, plus interview/manual entries |
| `report.html` | Full team report → **Save as PDF** |

Content lives in `assets/data.js` — edit the texts there to adapt the day.

## How students use it
1. One student opens the site and taps **Create or join a group** → **New** → gets a code like `MUC-7Q2X`.
2. Team-mates open the site on their own iPads → **Join** → enter the same code.
3. Everyone now shares the same answers **in real time**. Fill in missions, interviews and the map.
4. On `report.html`, tap **Save as PDF**.

> Works without any login. Anyone with the group code can see that group's answers — fine for a
> classroom, but don't put private data in there.

---

## ⚙️ One-time setup (teacher) — enables live sync

The app needs a free **Supabase** backend for cross-device sync. ~10 minutes:

1. **Create a project** at <https://supabase.com> (free tier is enough).
2. **Create the database table:** open **SQL Editor → New query**, paste the contents of
   [`supabase-setup.sql`](supabase-setup.sql) and click **Run**.
3. **Get your keys:** **Project Settings → API**. Copy the **Project URL** and the **`anon` `public`** key.
4. **Paste them** into [`assets/config.js`](assets/config.js):
   ```js
   SUPABASE_URL: "https://YOURPROJECT.supabase.co",
   SUPABASE_ANON_KEY: "eyJhbGciOi...your anon key...",
   ```
   (Use the **anon** key, *not* the `service_role` key.)

### Put it online so the iPads can open it
Host the folder on any static host and share the URL with the class:
- **Easiest:** drag the whole folder onto <https://app.netlify.com/drop> → you get a URL instantly.
- Or **GitHub Pages**, **Vercel**, or your school's web space.

That's it — open the URL on two devices to test the live sync.

---

## Local preview without setup
You can open `index.html` directly in a browser to see and try everything. Without Supabase
configured it runs in **local preview mode**: answers are saved on that one device only and a small
banner reminds you. Fill in `assets/config.js` to switch on real team sync.

## Tech notes
- Plain HTML/CSS/JS — no build step. Supabase JS client loads from a CDN.
- Data model: one `entries` table, one row per `(group_id, field_key)`. Edits to different fields
  never collide; same field = last write wins.
- All inputs carry a `data-key`; `assets/app.js` binds them to the store, caches to `localStorage`
  (offline buffer) and upserts to Supabase, and applies live remote changes back to the UI.
