# Forex Assistant Frontend

This is the React + Vite frontend for the **Forex Assistant** project.

The app is designed to help a user monitor selected forex pairs and precious metals, open a dedicated detail page for each market, view a TradingView chart, and read AI-generated market commentary based on technical and macro context.

## What The Project Does

The frontend works with the Python backend in `backend/app.py` to provide:

- live forex pricing for selected pairs
- end-of-day pricing fallback for precious metals
- price change percentages
- asset detail pages
- TradingView charts for each asset
- Gemini-powered daily market commentary
- light mode / dark mode toggle
- responsive layouts for desktop and mobile

## Markets Included

The current frontend includes:

- `USDZAR`
- `EURZAR`
- `GBPZAR`
- `USDCHF`
- `EUR/USD`
- `GBP/USD`
- `USD/JPY`
- `XAU/USD`
- `XAG/USD`

These assets are defined in:

- `src/data/assets.js`

## Frontend Structure

Main files:

- `src/main.jsx`
  - app entry point
  - sets up React Router

- `src/App.jsx`
  - top-level app shell
  - fetches quote data from the backend
  - manages loading state, errors, and theme selection

- `src/data/assets.js`
  - shared asset metadata
  - formatting helpers for prices and percentage change

- `src/pages/AssetOverviewPage.jsx`
  - renders the dashboard cards for all markets

- `src/pages/AssetDetailPage.jsx`
  - renders the selected market detail page
  - loads Gemini commentary for that asset

- `src/components/TradingViewWidget.jsx`
  - embeds the TradingView chart widget for the selected asset

- `src/App.css`
  - main UI styling
  - overview page, detail page, AI panel, widget panel, theme toggle

- `src/index.css`
  - global styles
  - CSS variables and theme colors

## How Data Flows

### 1. Overview Page

When the app loads:

- the frontend builds a comma-separated symbol list from `assets.js`
- it calls the backend route:

```text
GET /api/quotes?symbols=...
```

- the backend responds with normalized quote data
- the overview page renders cards using:
  - price
  - percentage change

### 2. Detail Page

When a user clicks a card:

- the app routes to:

```text
/asset/:slug
```

- the detail page looks up that asset from `assets.js`
- it shows:
  - market name
  - current price
  - change %
  - TradingView chart
  - AI commentary

### 3. AI Commentary

On the asset detail page, the frontend calls:

```text
POST /api/ai/commentary
```

with a symbol such as:

```json
{
  "symbol": "EURUSD.FOREX"
}
```

The backend then:

- fetches the market quote
- builds a lightweight technical snapshot
- builds a macro/fundamental context summary
- sends the structured input to Gemini
- returns structured commentary JSON

The frontend displays:

- market bias
- confidence
- daily commentary
- technical view
- fundamental view
- key drivers
- risks
- event watch
- support / resistance

## Theme Support

The app includes:

- light mode
- dark mode
- `lucide-react` icons for the theme toggle
- local storage persistence
- system-theme detection on first load

Theme handling is managed in:

- `src/App.jsx`
- `src/index.css`
- `src/App.css`

## Mobile Support

The frontend includes responsive styling for:

- smaller headings on mobile
- tighter card spacing
- adjusted theme toggle sizing
- stacked layouts on narrow screens
- mobile-friendly detail page sections

## Backend Dependency

This frontend depends on the Python backend being available, usually at:

```text
http://localhost:4000
```

The frontend reads that from:

- `client/.env`

Example:

```env
VITE_API_BASE_URL=http://localhost:4000
```

## Environment Setup

The frontend itself only needs:

```env
VITE_API_BASE_URL=http://localhost:4000
```

The backend requires:

- `EODHD_API_KEY`
- `GEMINI_API_KEY`

## Running The Frontend

From the `client` directory:

```powershell
npm install
npm run dev
```

For a production build:

```powershell
npm run build
```

## Running The Full Project

1. Start the backend from `backend`
2. Start the frontend from `client`

Example:

```powershell
cd backend
python app.py
```

Then in another terminal:

```powershell
cd client
npm run dev
```

## Notes About Market Data

- Forex pairs are primarily fetched from EODHD real-time quotes
- Precious metals currently use end-of-day data because that has been more reliable in this project
- Some change percentages are calculated from `open` vs `close` when `change_p` is unavailable or not useful

## Notes About AI Commentary

The current AI commentary is an MVP:

- Gemini writes the commentary
- the backend prepares the structured market inputs
- macro context is currently rule-based
- this can later be extended with live news and economic calendar data

Project design notes for the AI feature are documented in:

- `docs/ai-market-commentary-design.md`

## Purpose Of The App

This project is intended as a market information and analysis interface.

It combines:

- market data
- charting
- UI/UX design
- AI-assisted commentary

to create a more polished research-style dashboard for forex pairs and commodities.
