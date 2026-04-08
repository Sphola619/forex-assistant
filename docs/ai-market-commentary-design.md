# AI Market Commentary Design

## Goal

Add a per-asset AI commentary feature that produces:

- technical analysis commentary based on current market data and computed indicators
- fundamental analysis commentary based on news, macro themes, and event risk
- a short daily market update for each forex pair or precious metal

The commentary should feel like a market note, not a chatbot answer.

## Model Choice

Use Gemini as the first implementation.

Recommended model:

- `gemini-2.5-flash` for the first production version

Reasons:

- lower-cost and fast enough for repeated daily summaries
- supports system instructions and structured JSON output
- easy REST integration from the current Python backend

Upgrade path:

- use `gemini-2.5-pro` only for premium or deeper multi-factor reports

Official references:

- https://ai.google.dev/gemini-api/docs/text-generation
- https://ai.google.dev/gemini-api/docs/structured-output

## Design Principles

Do not ask the model to do raw market math from scratch when the backend can do it deterministically.

Split responsibilities:

- backend:
  - fetch quotes
  - compute indicators
  - fetch supporting macro/news context
  - build a clean structured prompt input
- Gemini:
  - synthesize the data into commentary
  - explain bias, drivers, and risks clearly
- frontend:
  - render commentary cards and update timestamps

This makes the feature more accurate and more stable.

## Commentary Output Shape

The AI response should always be JSON with this shape:

```json
{
  "asset": "EUR/USD",
  "bias": "bullish",
  "confidence": 0.72,
  "technical_summary": "Price is holding above short-term support while momentum remains mildly positive.",
  "fundamental_summary": "Dollar softness and risk appetite are supporting the pair, but rate-cut expectations remain a swing factor.",
  "daily_commentary": "EUR/USD is trading with a modest bullish tone today as buyers continue to defend support.",
  "key_drivers": [
    "short-term momentum remains positive",
    "USD sentiment is softer",
    "no immediate breakdown below support"
  ],
  "risks": [
    "unexpected central-bank rhetoric",
    "risk-off flows into USD",
    "break below near-term support"
  ],
  "levels": {
    "support": ["1.1470", "1.1445"],
    "resistance": ["1.1540", "1.1580"]
  },
  "event_watch": [
    "US inflation data",
    "ECB commentary"
  ],
  "time_horizon": "next 24 hours",
  "disclaimer": "AI-generated market commentary, not financial advice."
}
```

## Backend Data Pipeline

### 1. Quote Layer

Reuse the existing `/api/quotes` data.

For each selected asset, collect:

- symbol
- last price
- change percent
- data source
- timestamp

### 2. Technical Layer

Add a backend helper that builds a technical snapshot per asset.

Minimum first version:

- current price
- daily change %
- 20-period moving average
- 50-period moving average
- RSI(14)
- recent support
- recent resistance
- daily range

Recommended endpoint:

- `GET /api/asset-snapshot/<symbol>`

Response example:

```json
{
  "symbol": "EURUSD.FOREX",
  "price": 1.151,
  "changePercent": -0.22,
  "technical": {
    "rsi14": 46.8,
    "ma20": 1.1531,
    "ma50": 1.1488,
    "support": [1.147, 1.1445],
    "resistance": [1.154, 1.158],
    "dailyRange": {
      "low": 1.1492,
      "high": 1.1544
    }
  }
}
```

Do this in Python rather than asking Gemini to infer indicators from a screenshot.

### 3. Fundamental Layer

Collect lightweight context that moves the instrument.

For forex pairs:

- central bank theme
- inflation / rates narrative
- current risk sentiment
- today's or upcoming economic events relevant to base/quote currencies
- major news headlines tied to those currencies

For metals:

- USD direction
- real yields / rate expectations
- inflation narrative
- geopolitical risk
- commodity sentiment headlines

Recommended backend endpoint:

- `GET /api/asset-context/<symbol>`

Response example:

```json
{
  "symbol": "XAUUSD.FOREX",
  "macroThemes": [
    "gold supported by softer USD",
    "markets watching real yields",
    "risk sentiment mixed"
  ],
  "headlines": [
    "Fed speakers signal caution on cuts",
    "Safe-haven demand rises on geopolitical uncertainty"
  ],
  "eventWatch": [
    "US CPI",
    "US Treasury yields"
  ]
}
```

## Gemini Endpoint

Add a dedicated backend route:

- `POST /api/ai/commentary`

Request:

```json
{
  "symbol": "EURUSD.FOREX"
}
```

The backend should:

1. fetch the asset quote
2. fetch/build the technical snapshot
3. fetch/build the fundamental context
4. construct one clean Gemini prompt
5. request structured JSON output
6. return the parsed JSON to the frontend

### Prompt Structure

System instruction:

- You are a disciplined market analyst.
- Use only the provided data.
- Do not invent headlines, events, or levels.
- Keep commentary concise and specific.
- Return valid JSON only.
- Do not give personalized financial advice.

User payload:

- asset metadata
- latest quote
- technical snapshot
- macro/news context

### Gemini Response Config

Recommended first config:

- model: `gemini-2.5-flash`
- low temperature, around `0.2`
- structured JSON response

## Caching Strategy

Do not generate a fresh AI answer on every page visit.

Suggested cache rules:

- quote cache: existing 15-minute pattern
- technical snapshot cache: 15 minutes
- macro/news context cache: 15 to 60 minutes depending on source
- AI commentary cache:
  - 15 minutes for forex
  - 30 minutes for metals

Recommended cache key:

- `commentary:<symbol>:<date>:<hour_block>`

This keeps costs predictable.

## Frontend UX

Add a new section on the asset detail page under the TradingView chart:

- `AI Market Commentary`

Subsections:

- Bias
- Daily Commentary
- Technical View
- Fundamental View
- Key Drivers
- Risks
- Event Watch

Suggested loading states:

- `Generating commentary...`
- `Commentary updated 12:45`

Suggested action button:

- `Refresh AI Commentary`

Do not auto-regenerate on every route change if cached commentary exists.

## Rollout Plan

### Phase 1

- Add Gemini key to env
- Add `/api/ai/commentary`
- Use current quote data plus manual macro context
- Render one commentary block on the detail page

### Phase 2

- Add deterministic technical indicators
- Add proper support/resistance extraction
- Add economic-calendar context per asset

### Phase 3

- Add news summarization and ranking
- Add source attribution in the UI
- Add separate short-form and deep-dive commentary modes

## Recommended First Implementation

For the first working version, build only this:

- one backend endpoint: `POST /api/ai/commentary`
- one asset symbol in, one structured commentary out
- use current quote + simple technical data + lightweight macro bullet points
- render on the asset detail page below the TradingView chart

This gives you a solid MVP without over-engineering the first release.
