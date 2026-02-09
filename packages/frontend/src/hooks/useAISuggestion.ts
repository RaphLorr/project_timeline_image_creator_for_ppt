import { useState, useEffect, useRef, useCallback } from 'react'
import { fetchAISuggestion, type AISuggestion } from '../services/aiService'

const AI_TIMEOUT_MS = 3000

interface UseAISuggestionResult {
  readonly suggestion: AISuggestion | null
  readonly loading: boolean
  readonly error: string | null
  readonly requestSuggestion: (taskName: string, palette: readonly string[]) => void
}

export function useAISuggestion(): UseAISuggestionResult {
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cacheRef = useRef<Map<string, AISuggestion>>(new Map())
  const abortRef = useRef<AbortController | null>(null)

  const requestSuggestion = useCallback((taskName: string, palette: readonly string[]) => {
    const trimmed = taskName.trim()
    if (!trimmed) return

    // Check cache
    const cached = cacheRef.current.get(trimmed)
    if (cached) {
      setSuggestion(cached)
      setLoading(false)
      setError(null)
      return
    }

    // Abort previous request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    // Set timeout
    const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)

    setLoading(true)
    setError(null)
    setSuggestion(null)

    fetchAISuggestion(trimmed, palette, controller.signal)
      .then((result) => {
        clearTimeout(timeoutId)
        cacheRef.current.set(trimmed, result)
        setSuggestion(result)
        setError(null)
      })
      .catch((err) => {
        clearTimeout(timeoutId)
        if (err instanceof Error && err.name === 'AbortError') {
          setError('AI suggestion timed out')
        } else {
          setError(err instanceof Error ? err.message : 'AI suggestion failed')
        }
        setSuggestion(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  return { suggestion, loading, error, requestSuggestion }
}
