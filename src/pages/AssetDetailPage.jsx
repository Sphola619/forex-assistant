import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import TradingViewWidget from '../components/TradingViewWidget'
import { assets, formatChangePercent, formatPrice, getChangeTone } from '../data/assets'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

function toTitleCase(value) {
  if (!value) {
    return ''
  }

  return value.charAt(0).toUpperCase() + value.slice(1)
}

function AssetDetailPage({ quotesBySymbol }) {
  const { slug } = useParams()
  // Match the URL slug back to the shared asset metadata entry.
  const asset = assets.find((item) => item.slug === slug)
  const [commentary, setCommentary] = useState(null)
  const [isCommentaryLoading, setIsCommentaryLoading] = useState(true)
  const [commentaryError, setCommentaryError] = useState('')

  if (!asset) {
    return (
      <main className="detail-shell">
        <div className="detail-panel">
          <p className="detail-eyebrow">Asset not found</p>
          <h1 className="detail-title">We could not find that market.</h1>
          <Link to="/" className="detail-back">
            Back to markets
          </Link>
        </div>
      </main>
    )
  }

  const quote = quotesBySymbol[asset.apiSymbol]
  const changeTone = getChangeTone(quote?.changePercent)

  useEffect(() => {
    let isMounted = true

    const fetchCommentary = async () => {
      try {
        if (isMounted) {
          setIsCommentaryLoading(true)
          setCommentaryError('')
        }

        // The backend builds the technical snapshot and macro context, then asks
        // Gemini to return structured commentary JSON for this asset.
        const response = await fetch(`${API_BASE_URL}/api/ai/commentary`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ symbol: asset.apiSymbol }),
        })

        const payload = await response.json()

        if (!response.ok) {
          const errorMessage = [payload.error, payload.details].filter(Boolean).join(' ')
          throw new Error(errorMessage || 'Unable to load AI commentary.')
        }

        if (isMounted) {
          setCommentary(payload)
        }
      } catch (error) {
        if (isMounted) {
          setCommentaryError(error.message || 'Unable to load AI commentary.')
        }
      } finally {
        if (isMounted) {
          setIsCommentaryLoading(false)
        }
      }
    }

    fetchCommentary()

    return () => {
      isMounted = false
    }
  }, [asset.apiSymbol])

  return (
    <main className="detail-shell">
      <div className="detail-panel">
        <Link to="/" className="detail-back">
          <span className="detail-back__arrow" aria-hidden="true">
            ←
          </span>
          <span>Back to markets</span>
        </Link>

        <div className="detail-header">
          <div>
            <p className="detail-eyebrow">{asset.category}</p>
            <h1 className="detail-title">{asset.symbol}</h1>
            <p className="detail-name">{asset.name}</p>
          </div>

          <div className="detail-price-block">
            <p className="detail-price">{formatPrice(quote?.price, asset.symbol)}</p>
            <span className={`asset-card__change asset-card__change--${changeTone}`}>
              {formatChangePercent(quote?.changePercent)}
            </span>
          </div>
        </div>

        <section className="detail-grid">
          {/* Quick facts give the page some immediately readable context before
              the user gets into the chart and AI commentary below. */}
          <article className="detail-card">
            <p className="detail-card__label">Instrument</p>
            <p className="detail-card__value">{asset.symbol}</p>
          </article>
          <article className="detail-card">
            <p className="detail-card__label">Market</p>
            <p className="detail-card__value">{asset.category}</p>
          </article>
          <article className="detail-card">
            <p className="detail-card__label">Last Price</p>
            <p className="detail-card__value">{formatPrice(quote?.price, asset.symbol)}</p>
          </article>
          <article className="detail-card">
            <p className="detail-card__label">Change</p>
            <p className={`detail-card__value detail-card__value--${changeTone}`}>
              {formatChangePercent(quote?.changePercent)}
            </p>
          </article>
        </section>

        <section className="widget-panel">
          <div className="widget-panel__copy">
            <p className="detail-eyebrow">Chart</p>
            <h2 className="widget-panel__title">TradingView Chart</h2>
            <p className="widget-panel__text">
              Track the selected market with an embedded TradingView widget for {asset.symbol}.
            </p>
          </div>

          <TradingViewWidget symbol={asset.tradingViewSymbol} />
        </section>

        <section className="ai-panel">
          <div className="widget-panel__copy">
            <p className="detail-eyebrow">AI Commentary</p>
            <h2 className="widget-panel__title">Daily Market Read</h2>
            <p className="widget-panel__text">
              A Gemini-generated summary combining the latest quote, technical structure, and
              macro context for {asset.symbol}.
            </p>
          </div>

          {isCommentaryLoading && (
            <div className="ai-panel__status ai-panel__status--loading">
              <Loader2 className="status-spinner" size={18} aria-hidden="true" />
              <p>Generating commentary for {asset.symbol}...</p>
            </div>
          )}

          {!isCommentaryLoading && commentaryError && (
            <p className="ai-panel__status ai-panel__status--error">{commentaryError}</p>
          )}

          {!isCommentaryLoading && commentary && (
            // Gemini returns structured fields so the UI can render each part of
            // the market note in a predictable layout.
            <div className="ai-panel__grid">
              <article className="ai-panel__card">
                <p className="detail-card__label">Market Bias</p>
                <p className="detail-card__value">{toTitleCase(commentary.bias)}</p>
              </article>
              <article className="ai-panel__card">
                <p className="detail-card__label">Confidence</p>
                <p className="detail-card__value">{Math.round((commentary.confidence || 0) * 100)}%</p>
              </article>
              <article className="ai-panel__card ai-panel__card--wide">
                <p className="detail-card__label">Daily Commentary</p>
                <p className="ai-panel__text">{commentary.daily_commentary}</p>
              </article>
              <article className="ai-panel__card ai-panel__card--wide">
                <p className="detail-card__label">Technical View</p>
                <p className="ai-panel__text">{commentary.technical_summary}</p>
              </article>
              <article className="ai-panel__card ai-panel__card--wide">
                <p className="detail-card__label">Fundamental View</p>
                <p className="ai-panel__text">{commentary.fundamental_summary}</p>
              </article>
              <article className="ai-panel__card">
                <p className="detail-card__label">Key Drivers</p>
                <ul className="ai-panel__list">
                  {(commentary.key_drivers || []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <article className="ai-panel__card">
                <p className="detail-card__label">Risks</p>
                <ul className="ai-panel__list">
                  {(commentary.risks || []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <article className="ai-panel__card">
                <p className="detail-card__label">Event Watch</p>
                <ul className="ai-panel__list">
                  {(commentary.event_watch || []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <article className="ai-panel__card">
                <p className="detail-card__label">Support</p>
                <p className="detail-card__value">
                  {(commentary.levels?.support || []).join(', ') || '--'}
                </p>
              </article>
              <article className="ai-panel__card">
                <p className="detail-card__label">Resistance</p>
                <p className="detail-card__value">
                  {(commentary.levels?.resistance || []).join(', ') || '--'}
                </p>
              </article>
              <article className="ai-panel__card ai-panel__card--wide">
                <p className="detail-card__label">Disclaimer</p>
                <p className="ai-panel__footnote">
                  {commentary.disclaimer}
                  {commentary.generatedAt ? ` Updated ${commentary.generatedAt}.` : ''}
                </p>
              </article>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default AssetDetailPage
