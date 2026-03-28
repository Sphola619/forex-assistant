import React, { useEffect, useMemo, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import './App.css'
import AssetOverviewPage from './pages/AssetOverviewPage'
import AssetDetailPage from './pages/AssetDetailPage'
import { assets } from './data/assets'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
const REFRESH_INTERVAL_MS = 15 * 60 * 1000

function App() {
  const [quotesBySymbol, setQuotesBySymbol] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const apiSymbols = useMemo(() => assets.map((asset) => asset.apiSymbol).join(','), [])

  useEffect(() => {
    let isMounted = true

    const fetchQuotes = async () => {
      try {
        if (isMounted) {
          setError('')
        }

        const response = await fetch(
          `${API_BASE_URL}/api/quotes?symbols=${encodeURIComponent(apiSymbols)}`
        )

        if (!response.ok) {
          throw new Error('Unable to fetch live market data.')
        }

        const payload = await response.json()

        if (isMounted) {
          setQuotesBySymbol((currentQuotes) => ({
            ...currentQuotes,
            ...(payload.quotes ?? {}),
          }))

          if (payload.errors && Object.keys(payload.errors).length > 0) {
            setError('Some symbols could not be loaded. Check the backend response for details.')
          } else {
            setError('')
          }
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
    const intervalId = window.setInterval(fetchQuotes, REFRESH_INTERVAL_MS)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [apiSymbols])

  return (
    <Routes>
      <Route
        path="/"
        element={
          <AssetOverviewPage quotesBySymbol={quotesBySymbol} isLoading={isLoading} error={error} />
        }
      />
      <Route path="/asset/:slug" element={<AssetDetailPage quotesBySymbol={quotesBySymbol} />} />
    </Routes>
  )
}

export default App
