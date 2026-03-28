import { useEffect, useRef } from 'react'

function TradingViewWidget({ symbol }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) {
      return undefined
    }

    containerRef.current.innerHTML = ''

    const widget = document.createElement('div')
    widget.className = 'tradingview-widget-container__widget'

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbol,
      width: '100%',
      height: 420,
      locale: 'en',
      colorTheme: 'light',
      autosize: true,
      interval: '60',
      timezone: 'Africa/Johannesburg',
      theme: 'light',
      style: '1',
      withdateranges: true,
      hide_side_toolbar: false,
      allow_symbol_change: false,
      save_image: false,
      studies: [],
      support_host: 'https://www.tradingview.com',
    })

    containerRef.current.appendChild(widget)
    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [symbol])

  return <div ref={containerRef} className="tradingview-widget-container" />
}

export default TradingViewWidget
