# ✈ AeroLuxe AI — Autonomous Flight Search & Deals Agent

A production-shaped, full-stack **flight search agent** with an ultra-sleek, dark-mode,
luxury interface. Give it a departure country/city, a destination, dates, a cabin class
and a passenger count — it fans out across six budget booking engines, extracts the
mandated five data points per itinerary, and returns the **top 5 cheapest** and
**top 5 best-value** fares.

```
React 18 + Vite + Tailwind CSS  ·  Express (ESM) + SSE  ·  JSON document store
```

---

## Quick start

```bash
unzip aeroluxe-ai-app.zip
cd aeroluxe-ai
npm install
npm start
```

Then open **http://localhost:5173**.

`npm start` runs two processes concurrently (via `concurrently`):

| Process | Port | What it does |
|---|---|---|
| `npm run dev:api` | `8787` | The AeroLuxe agent server — search pipeline, SSE telemetry, persistence |
| `npm run dev:web` | `5173` | Vite dev server for the React app, proxying `/api` → `8787` |

**No API keys are required.** With an empty `.env` the app runs fully in *mock mode* and
every feature is demonstrable. Copy `.env.example` to `.env` if you want to configure
anything.

### Production build

```bash
npm run build     # emits dist/
npm run prod      # Express serves dist/ + the API on :8787
```

Then open **http://localhost:8787**.

---

## What the agent actually does

When you submit a search, `POST/GET /api/search/stream` opens a Server-Sent Events
channel and the orchestrator (`server/agents/orchestrator.js`) runs a linear,
fully-observable pipeline:

```
1. resolve    country/city free text -> IATA airports  (e.g. "Pakistan" -> KHI)
2. fanout     query all 6 engines, concurrency 3, emitting status frames as each reports
3. dedupe     collapse the same physical itinerary surfaced by multiple engines
4. score      composite value index per fare
5. rank       top 5 CHEAPEST  +  top 5 BEST VALUE
6. calendar   build a 21-day fare calendar for the price graph
```

Every step streams a telemetry frame to the **Live Agent Status Terminal**, so the
terminal is a real feed — not a scripted animation.

### The five extracted data points

| # | Field | Where it appears |
|---|---|---|
| 1 | Airline Name + flight code | Deal card, Deal Matrix |
| 2 | Departure Date & Time — **kab janna ha** | Deal card, Deal Matrix |
| 3 | Return Date & Time — **kab annan ha** | Deal card, Deal Matrix |
| 4 | Final Price (with currency switcher) | Deal card, Deal Matrix, Price Graph |
| 5 | Direct Booking Website URL & Link | "Book on …" button + copyable URL in the Matrix |

### The value index

`server/agents/ranker.js` scores each fare 0–100:

```
valueIndex = 0.50 × priceScore        (relative to the cheapest fare, with an
                                       absolute affordability guard so a $9,000
                                       fare is never "good value")
           + 0.20 × timeScore         (total journey duration vs the pool)
           + 0.15 × convenienceScore  (number of layovers)
           + 0.10 × qualityScore      (carrier rating)
           + 0.05 × trustScore        (booking-engine reliability prior)
```

That is why the **Best Value** board can rank a slightly pricier nonstop above a
dirt-cheap three-stop itinerary — which is what a human travel agent would do.

---

## Booking engines queried

Skyscanner · Google Flights · Kayak · Kiwi.com · Momondo · CheapOair

Each contributes a `source_website_name` and a **realistic deep-link**
`direct_booking_url`, e.g.

```
https://www.kayak.com/flights/LHR-DXB/2025-12-10/2025-12-17?sort=price_a
https://www.skyscanner.net/transport/flights/lhr/dxb/251210/251217/
https://www.kiwi.com/en/search/results/LHR/DXB/2025-12-10/2025-12-17
```

---

## Mock mode vs. live scraping — read this

The default **MockProvider** (`server/agents/mockEngine.js`) is a *deterministic fare
engine*, not random noise. It is seeded by a hash of `route|dates|cabin|engine|salt`, so
the same query always yields the same results. Prices are modelled from real
great-circle distance, cabin multipliers, carrier tier, booking horizon (fares booked
under 7 days out are ~55% higher) and weekend premiums. Its output conforms exactly to
the documented `FlightDeal` contract.

**Live mode** is opt-in and honest about its limits:

```bash
# .env
USE_LIVE_SEARCH=true
FIRECRAWL_API_KEY=fc-...
```

`server/agents/liveScraper.js` then fetches each engine's results page through Firecrawl
and runs a heuristic row parser. **Skyscanner, Kayak, Google Flights and Momondo are
heavily bot-protected and render fares client-side**, so a heuristic scraper succeeds
only a fraction of the time. Consequently:

- any live failure **degrades to the mock engine for that provider only** — the run
  never dies,
- every deal carries `is_mock`, `provenance` and `extraction_confidence`,
- the UI shows an amber warning strip on low-confidence live rows so nobody books off
  an inferred price.

For a real production deployment, replace `parseRows()` with a licensed inventory API
(**Amadeus Self-Service**, **Duffel**, **Kiwi Tequila**). `liveSearchProvider()` is the
seam — its signature and return shape already match.

---

## Project structure

```
aeroluxe-ai/
├── index.html                     Vite entry, font preload, favicon
├── package.json                   scripts + deps
├── vite.config.js                 dev proxy /api -> :8787
├── tailwind.config.js             luxury design tokens (obsidian, charcoal, gold, emerald)
├── postcss.config.js
├── .env.example
│
├── server/
│   ├── index.js                   Express app: API + static dist/ in production
│   ├── db.js                      persistent JSON store (atomic writes, debounced)
│   ├── data/
│   │   ├── reference.js           51 airports, 45 airlines, 6 booking engines, alias resolver
│   │   └── store.json             ← created on first run (gitignored)
│   ├── agents/
│   │   ├── orchestrator.js        the 6-stage pipeline + SSE telemetry
│   │   ├── mockEngine.js          deterministic fare engine + 21-day price calendar
│   │   ├── liveScraper.js         Firecrawl extraction + heuristic parser + fallback
│   │   └── ranker.js              value scoring, de-duplication, ranking, stats
│   ├── routes/
│   │   ├── search.js              GET/POST /api/search, GET /api/search/stream (SSE)
│   │   ├── saved.js               saved searches, favourites, history
│   │   └── alerts.js              price alerts + live re-check + sweep job
│   └── utils/
│       ├── currency.js            15 currencies, conversion + formatting
│       └── helpers.js             seeded PRNG, hashing, date helpers
│
└── src/
    ├── main.jsx
    ├── App.jsx                    state container, wiring, keyboard shortcuts
    ├── index.css                  Tailwind layers + glass/gold component classes
    ├── lib/
    │   ├── api.js                 typed fetch client for every endpoint
    │   ├── constants.js           currencies, cabins, quick routes, phase labels
    │   └── format.js              money / datetime / relative-time formatting
    ├── hooks/
    │   └── useSearchStream.js     EventSource driver + offline degradation
    ├── data/
    │   ├── airlines.js            logo CDN + brand accent colours
    │   └── fallbackDeals.js       client-side offline dataset
    └── components/
        ├── TopNav.jsx             fixed glass nav, currency switcher, drawer triggers
        ├── HeroSearchPanel.jsx    floating glassy search bar
        ├── AgentStatusTerminal.jsx live SSE telemetry drawer
        ├── StatsStrip.jsx         post-run executive summary
        ├── FilterBar.jsx          price / stops / airline / engine filters + sort
        ├── ResultsDashboard.jsx   board tabs + card grid
        ├── FlightDealCard.jsx     the primary result unit
        ├── DealMatrix.jsx         the 5-point structured extraction table
        ├── PriceGraph.jsx         hand-rolled SVG interactive price graph
        ├── SavedDrawer.jsx        saved searches + pinned deals
        ├── AlertsDrawer.jsx       price alerts with sparkline history
        ├── CompareTray.jsx        sticky comparison tray (in ResultsDashboard.jsx)
        ├── SkeletonCard.jsx
        └── Footer.jsx
```

---

## API reference

### `GET /api/health`
Agent status, mode, provider list, supported cabins and currencies.

### `GET|POST /api/search`
One-shot JSON search.

```bash
curl -X POST localhost:8787/api/search -H 'Content-Type: application/json' -d '{
  "origin": "London", "destination": "Dubai",
  "departDate": "2025-12-10", "returnDate": "2025-12-17",
  "cabin": "business", "passengers": 2, "currency": "EUR"
}'
```

### `GET /api/search/stream`
Server-Sent Events. Emits `status` frames while working and one `result` frame at the
end, then `close`.

```
event: status
data: {"type":"status","phase":"provider:done","message":"Kayak: 8 itineraries collected","provider":"Kayak","elapsed_ms":1180,"count":8}

event: result
data: {"query":{...},"deals":[...],"cheapest":[...],"best_value":[...],"price_calendar":[...],"stats":{...},"summary":{...}}
```

### Saved state

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/saved/searches` | list bookmarked queries |
| `POST` | `/api/saved/searches` | bookmark a query |
| `DELETE` | `/api/saved/searches/:id` | remove |
| `GET` | `/api/saved/favorites?currency=EUR` | pinned deals, converted |
| `POST` / `DELETE` | `/api/saved/favorites[/:dealId]` | pin / unpin a deal |
| `GET` | `/api/saved/history` | last 50 agent runs |

### Price alerts

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/alerts?currency=EUR` | list with progress |
| `POST` | `/api/alerts` | create (route + `target_price`) |
| `PATCH` / `DELETE` | `/api/alerts/:id` | pause / reset / delete |
| `POST` | `/api/alerts/:id/check` | **runs a real search** and compares the cheapest fare to the target |
| `POST` | `/api/alerts/sweep` | evaluate every active alert — the background job entry point |

A "triggered" badge therefore means the fare was *actually observed*, never guessed.

---

## Data model — `FlightDeal`

```jsonc
{
  "deal_id": "kayak-LHR-DXB-1765393200000-EK412-3",
  "airline_name": "Emirates",
  "airline_code": "EK",
  "flight_number": "EK412",
  "airline_logo_url": "https://www.gstatic.com/flights/airline_logos/70px/EK.png",
  "airline_tier": 1,
  "airline_rating": 4.7,
  "baggage_kg": 30,

  "departure_location": "London (LHR)",
  "departure_airport": "Heathrow",
  "arrival_location": "Dubai (DXB)",
  "arrival_airport": "Dubai Intl",

  "departure_datetime": "2025-12-10T19:00:00.000Z",  // kab janna ha
  "arrival_datetime":   "2025-12-11T05:20:00.000Z",
  "return_datetime":    "2025-12-17T15:40:00.000Z",  // kab annan ha

  "duration": "13h 11m",
  "duration_minutes": 791,
  "distance_km": 5502,
  "layovers": 1,
  "cabin_class": "business",
  "passengers": 2,

  "price": 1530,                 // always USD, per passenger, at rest
  "currency": "USD",
  "price_display": 1407.6,       // converted into the requested currency
  "display_currency": "EUR",

  "source_website_name": "Kayak",
  "source_website_id": "kayak",
  "direct_booking_url": "https://www.kayak.com/flights/LHR-DXB/2025-12-10/2025-12-17?sort=price_a",

  "deal_rank": 1,                // 1..5
  "leaderboard": "cheapest",     // or "best-value"
  "value_index": 87.4,
  "breakdown": { "price": 92, "time": 47, "convenience": 67, "quality": 85, "trust": 93 },

  "scraped_at": "2025-11-20T10:14:02.000Z",
  "is_mock": true,
  "provenance": "mock-engine",
  "extraction_confidence": null
}
```

---

## Persistent local state

`server/db.js` is a zero-dependency JSON document store at `server/data/store.json` with:

- **atomic writes** — `writeFileSync` to a `.tmp` file then `renameSync`, so a crash can
  never leave a half-written store;
- **debounced persistence** — bursts of writes cost one disk hit;
- **read cache** — the file is parsed once per process.

Collections: `savedSearches`, `priceAlerts`, `favorites`, `history`.

Swapping in SQLite or Postgres means reimplementing the six methods at the bottom of
`db.js`; nothing else in the codebase touches disk.

---

## Design system

| Token | Value | Use |
|---|---|---|
| `obsidian` | `#0B0C10` | page background |
| `charcoal` | `#1F2833` | cards, panels |
| `gold` | `#D4AF37` | primary accent, prices, CTAs |
| `emerald` | `#10B981` | value accent, return legs, nonstop |
| `gold-sheen` | 4-stop gradient | headline and price text |

Type: **Playfair Display** (display), **Inter** (UI), **JetBrains Mono** (telemetry).
Component classes live in `src/index.css`: `.glass`, `.glass-strong`, `.panel`,
`.field`, `.btn-gold`, `.btn-emerald`, `.btn-ghost`, `.chip`, `.hairline`.

The **Price Graph** is hand-rolled SVG — gradient area fill, glow-filtered cheapest
callout, weekend bands, pointer-tracked guide line and a floating tooltip. **Zero
charting dependencies.**

Airline logos come from Google Flights' public 70px logo CDN
(`https://www.gstatic.com/flights/airline_logos/70px/EK.png`) with a graceful
IATA-monogram fallback via `<img onError>`, so a dead CDN never breaks the layout.

---

## Keyboard shortcuts

| Key | Action |
|---|---|
| `/` | focus the departure field |
| `Esc` | close any open drawer |

---

## Verification performed

- `npm install` → 228 packages, clean.
- `vite build` → 1,598 modules transformed, `dist/` emitted, no warnings.
- `node server/index.js` → boots, `/api/health` responds.
- `POST /api/search` (business, 2 pax, EUR) → 44 unique fares, 29 airlines, top-5 boards
  populated, 21 calendar points, `price_display` correctly converted.
- `GET /api/search/stream` → 29 `status` frames + `result` + `close`, 68 KB of telemetry.
- Saved searches / favourites / alerts → created, read back, persisted to
  `server/data/store.json`, currency-converted on read.
- `POST /api/alerts/:id/check` → ran a real search, found a $319 fare against a $450
  target, flipped the alert to `triggered` and appended price history.
- Server-side render of `<App/>` and of every results component (cards, matrix, graph,
  filter bar, both drawers, comparison tray) → clean, with the required labels
  *Kab Janna Ha* / *Kab Annan Ha* present in the output.

---

## Known limitations

- **Fares in mock mode are synthetic and not bookable.** They are internally consistent
  and realistic in shape, but they are not inventory. Always confirm on the booking engine.
- Live scraping is best-effort by design — see the section above.
- Unrecognised place names resolve to a stable synthetic IATA code so the agent still
  runs; those routes produce unverified itinerary data.
- The FX table is static (15 currencies). Point `refreshRates()` at a live feed and every
  price in the app updates.
- Alerts are swept on demand (`POST /api/alerts/sweep`) or via `POST /api/alerts/:id/check`.
  Wiring the ticker in `server/index.js` to `setInterval(..., ALERTS_POLL_MINUTES * 60000)`
  turns this into a true background job.
- No authentication layer — this is a single-tenant demo. Add auth before exposing
  `/api/saved` and `/api/alerts` publicly.

---

## License

MIT.
