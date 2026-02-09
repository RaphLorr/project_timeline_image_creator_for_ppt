import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAISuggestion } from '../../hooks/useAISuggestion'

vi.mock('../../services/aiService', () => ({
  fetchAISuggestion: vi.fn(),
}))

import { fetchAISuggestion } from '../../services/aiService'

describe('useAISuggestion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns suggestion on success', async () => {
    vi.mocked(fetchAISuggestion).mockResolvedValue({
      category: 'Development',
      color: '#3B82F6',
    })

    const { result } = renderHook(() => useAISuggestion())

    await act(async () => {
      result.current.requestSuggestion('Write code', ['#3B82F6'])
    })

    expect(result.current.suggestion?.category).toBe('Development')
    expect(result.current.suggestion?.color).toBe('#3B82F6')
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('returns null on timeout (abort)', async () => {
    vi.mocked(fetchAISuggestion).mockRejectedValue(
      Object.assign(new Error('aborted'), { name: 'AbortError' })
    )

    const { result } = renderHook(() => useAISuggestion())

    await act(async () => {
      result.current.requestSuggestion('Slow task', ['#ccc'])
    })

    expect(result.current.suggestion).toBeNull()
    expect(result.current.error).toBe('AI suggestion timed out')
  })

  it('caches repeated task names', async () => {
    vi.mocked(fetchAISuggestion).mockResolvedValue({
      category: 'Testing',
      color: '#10B981',
    })

    const { result } = renderHook(() => useAISuggestion())

    await act(async () => {
      result.current.requestSuggestion('Write tests', ['#10B981'])
    })

    // Second request for same name should use cache
    await act(async () => {
      result.current.requestSuggestion('Write tests', ['#10B981'])
    })

    expect(fetchAISuggestion).toHaveBeenCalledTimes(1)
    expect(result.current.suggestion?.category).toBe('Testing')
  })

  it('does not call API for empty task names', async () => {
    const { result } = renderHook(() => useAISuggestion())

    await act(async () => {
      result.current.requestSuggestion('', ['#ccc'])
    })

    expect(fetchAISuggestion).not.toHaveBeenCalled()
  })
})
