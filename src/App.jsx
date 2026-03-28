import React, { useEffect, useMemo, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import './App.css'
import AssetOverviewPage from './pages/AssetOverviewPage'
import AssetDetailPage from './pages/AssetDetailPage'
import { assets } from './data/assets'
import { Moon, Sun } from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
const REFRESH_INTERVAL_MS = 15 * 60 * 1000
const THEME_STORAGE_KEY = 'forex-assistant-theme'

function getInitialTheme() {
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function App() {
  const [quotesBySymbol, setQuotesBySymbol] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [theme, setTheme] = useState(getInitialTheme)

  // Build one shared symbol list so the frontend can hydrate every card from a
  // single backend request instead of one request per asset.
  const apiSymbols = useMemo(() => assets.map((asset) => asset.apiSymbol).join(','), [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

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
          // Merge new results into existing state so partial backend failures do
          // not wipe out quotes we already fetched successfully.
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
    // Routing stays at the top level so both pages can share the same quote
    // state fetched above.
    <>
      <button
        type="button"
        className="theme-toggle"
        onClick={() => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <Routes>
        <Route
          path="/"
          element={
            <AssetOverviewPage
              quotesBySymbol={quotesBySymbol}
              isLoading={isLoading}
              error={error}
            />
          }
        />
        <Route path="/asset/:slug" element={<AssetDetailPage quotesBySymbol={quotesBySymbol} />} />
      </Routes>
    </>
  )
}

export default App
