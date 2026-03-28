import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import {
  assets,
  formatChangePercent,
  formatPrice,
  getChangeTone,
  getPriceSizeClass,
} from '../data/assets'

function AssetOverviewPage({ quotesBySymbol, isLoading, error }) {
  return (
    <main className="app-shell">
      <h1>Market Analysis Assistant</h1>

      <section className="asset-grid">
        {assets.map((asset) => {
          // Quotes arrive keyed by backend symbol, so we look them up that way
          // and then render the prettier display symbol on the card.
          const quote = quotesBySymbol[asset.apiSymbol]
          const changeTone = getChangeTone(quote?.changePercent)
          const priceSizeClass = getPriceSizeClass(quote?.price, asset.symbol)

          return (
            // Each card is a link so selecting a market routes to the detail
            // page instead of just toggling local state.
            <Link key={asset.symbol} to={`/asset/${asset.slug}`} className="asset-card">
              <div className="asset-card__top">
                <div>
                  <p className="asset-card__symbol">{asset.symbol}</p>
                  <p className="asset-card__name">{asset.name}</p>
                </div>

                <div className="asset-card__price-block">
                  <span className={`asset-card__price ${priceSizeClass}`.trim()}>
                    {formatPrice(quote?.price, asset.symbol)}
                  </span>
                  <span className={`asset-card__change asset-card__change--${changeTone}`}>
                    {formatChangePercent(quote?.changePercent)}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </section>

      <div className="status-row">
        {isLoading && (
          <div className="status-message status-message--loading">
            <Loader2 className="status-spinner" size={18} aria-hidden="true" />
            <p>Loading live market prices...</p>
          </div>
        )}
        {!isLoading && error && <p className="status-message status-message--error">{error}</p>}
        <p className="status-message">Results for XAU/USD and XAG/USD use end-of-day fallback.</p>
      </div>
    </main>
  )
}

export default AssetOverviewPage
