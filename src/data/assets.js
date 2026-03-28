// This file keeps all asset metadata and formatting helpers in one place so the
// overview page and detail page stay consistent.
export const assets = [
  {
    slug: 'usdzar',
    symbol: 'USDZAR',
    apiSymbol: 'USDZAR.FOREX',
    name: 'US Dollar / South African Rand',
    category: 'Forex',
    tradingViewSymbol: 'FX:USDZAR',
  },
  {
    slug: 'eurzar',
    symbol: 'EURZAR',
    apiSymbol: 'EURZAR.FOREX',
    name: 'Euro / South African Rand',
    category: 'Forex',
    tradingViewSymbol: 'OANDA:EURZAR',
  },
  {
    slug: 'gbpzar',
    symbol: 'GBPZAR',
    apiSymbol: 'GBPZAR.FOREX',
    name: 'British Pound / South African Rand',
    category: 'Forex',
    tradingViewSymbol: 'OANDA:GBPZAR',
  },
  {
    slug: 'usdchf',
    symbol: 'USDCHF',
    apiSymbol: 'USDCHF.FOREX',
    name: 'US Dollar / Swiss Franc',
    category: 'Forex',
    tradingViewSymbol: 'FX:USDCHF',
  },
  {
    slug: 'eur-usd',
    symbol: 'EUR/USD',
    apiSymbol: 'EURUSD.FOREX',
    name: 'Euro / US Dollar',
    category: 'Forex',
    tradingViewSymbol: 'FX:EURUSD',
  },
  {
    slug: 'gbp-usd',
    symbol: 'GBP/USD',
    apiSymbol: 'GBPUSD.FOREX',
    name: 'British Pound / US Dollar',
    category: 'Forex',
    tradingViewSymbol: 'FX:GBPUSD',
  },
  {
    slug: 'usd-jpy',
    symbol: 'USD/JPY',
    apiSymbol: 'USDJPY.FOREX',
    name: 'US Dollar / Japanese Yen',
    category: 'Forex',
    tradingViewSymbol: 'FX:USDJPY',
  },
  {
    slug: 'xau-usd',
    symbol: 'XAU/USD',
    apiSymbol: 'XAUUSD.FOREX',
    name: 'Gold / US Dollar',
    category: 'Precious Metal',
    tradingViewSymbol: 'OANDA:XAUUSD',
  },
  {
    slug: 'xag-usd',
    symbol: 'XAG/USD',
    apiSymbol: 'XAGUSD.FOREX',
    name: 'Silver / US Dollar',
    category: 'Precious Metal',
    tradingViewSymbol: 'OANDA:XAGUSD',
  },
]

export function getPricePrecision(symbol) {
  // A few markets read better with custom decimal precision in the UI.
  if (symbol === 'XAU/USD') return 2
  if (symbol === 'XAG/USD') return 3
  if (symbol === 'EUR/USD') return 4
  return 4
}

export function formatPrice(value, symbol) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '--'
  }

  const precision = getPricePrecision(symbol)

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value)
}

export function formatChangePercent(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '--%'
  }

  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function getChangeTone(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'neutral'
  }

  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return 'neutral'
}

export function getPriceSizeClass(value, symbol) {
  // Long formatted prices need a smaller font size to avoid crowding the card.
  const formattedPrice = formatPrice(value, symbol)

  if (formattedPrice.length >= 9) return 'asset-card__price--compact'
  if (formattedPrice.length >= 7) return 'asset-card__price--tight'
  return ''
}
