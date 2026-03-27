import React, { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

// `symbol` is what we show in the UI, while `apiSymbol` is the code the backend
// sends to EODHD for live prices.
const assets = [
  { symbol: 'USDZAR', apiSymbol: 'USDZAR.FOREX', name: 'US Dollar / South African Rand' },
  { symbol: 'EURZAR', apiSymbol: 'EURZAR.FOREX', name: 'Euro / South African Rand' },
  { symbol: 'USDCHF', apiSymbol: 'USDCHF.FOREX', name: 'US Dollar / Swiss Franc' },
  { symbol: 'EUR/USD', apiSymbol: 'EURUSD.FOREX', name: 'Euro / US Dollar' },
  { symbol: 'GBP/USD', apiSymbol: 'GBPUSD.FOREX', name: 'British Pound / US Dollar' },
  { symbol: 'USD/JPY', apiSymbol: 'USDJPY.FOREX', name: 'US Dollar / Japanese Yen' },
  { symbol: 'XAU/USD', apiSymbol: 'XAUUSD.FOREX', name: 'Gold / US Dollar' },
  { symbol: 'XAG/USD', apiSymbol: 'XAGUSD.FOREX', name: 'Silver / US Dollar' },
]

function formatPrice(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '--'
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 5,
  }).format(value)
}

function formatChangePercent(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '--%'
  }

  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

function getChangeTone(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'neutral'
  }

  if (value > 0) {
    return 'positive'
  }

  if (value < 0) {
    return 'negative'
  }

  return 'neutral'
}

function App() {
  const [selectedPair, setSelectedPair] = useState(null)
  const [quotesBySymbol, setQuotesBySymbol] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Build one comma-separated list once so the frontend can request all quotes
  // from the backend in a single call.
  const apiSymbols = useMemo(() => assets.map((asset) => asset.apiSymbol).join(','), [])

  useEffect(() => {
    let isMounted = true

    const fetchQuotes = async () => {
      try {
        if (isMounted) {
          setError('')
        }

        // The frontend talks only to our backend. The backend then calls EODHD
        // so the API key stays out of the browser.
        const response = await fetch(
          `${API_BASE_URL}/api/quotes?symbols=${encodeURIComponent(apiSymbols)}`
        )

        if (!response.ok) {
          throw new Error('Unable to fetch live market data.')
        }

        const payload = await response.json()

        if (isMounted) {
          setQuotesBySymbol(payload.quotes ?? {})
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError.message || 'Unable to fetch live market data.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchQuotes()
    const intervalId = window.setInterval(fetchQuotes, 60000)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [apiSymbols])

  return (
    <main className="app-shell">
      <h1>Forex Assistance</h1>

      <section className="asset-grid">
        {assets.map((asset) => {
          // Each quote is stored by its API symbol so we can match the incoming
          // backend data to the correct card.
          const quote = quotesBySymbol[asset.apiSymbol]
          const changeTone = getChangeTone(quote?.changePercent)

          return (
            <button
              key={asset.symbol}
              type="button"
              className={`asset-card${selectedPair === asset.symbol ? ' asset-card--active' : ''}`}
              onClick={() => setSelectedPair(asset.symbol)}
            >
              <div className="asset-card__top">
                <div>
                  <p className="asset-card__symbol">{asset.symbol}</p>
                  <p className="asset-card__name">{asset.name}</p>
                </div>

                <div className="asset-card__price-block">
                  <span className="asset-card__price">{formatPrice(quote?.price)}</span>
                  <span className={`asset-card__change asset-card__change--${changeTone}`}>
                    {formatChangePercent(quote?.changePercent)}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </section>

      <div className="status-row">
        {isLoading && <p className="status-message">Loading live market prices...</p>}
        {!isLoading && error && <p className="status-message status-message--error">{error}</p>}
      </div>

      {selectedPair && <h2 className="selected-pair">Selected: {selectedPair}</h2>}
    </main>
  )
}

export default App
