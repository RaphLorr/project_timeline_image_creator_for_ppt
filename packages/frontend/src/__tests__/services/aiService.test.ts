import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchAISuggestion } from '../../services/aiService'

describe('fetchAISuggestion', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    globalThis.fetch = mockFetch
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sends correct payload', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ category: 'Development', color: '#3B82F6' }),
    })

    await fetchAISuggestion('Write unit tests', ['#3B82F6', '#10B981'])

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/ai/categorize',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskName: 'Write unit tests', palette: ['#3B82F6', '#10B981'] }),
      })
    )
  })

  it('returns category and color on 200', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ category: 'Testing', color: '#10B981' }),
    })

    const result = await fetchAISuggestion('Write tests', ['#10B981'])

    expect(result.category).toBe('Testing')
    expect(result.color).toBe('#10B981')
  })

  it('throws on 500 response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    })

    await expect(fetchAISuggestion('Test', ['#ccc'])).rejects.toThrow('AI service error: 500')
  })

  it('throws on invalid response shape', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ invalid: true }),
    })

    await expect(fetchAISuggestion('Test', ['#ccc'])).rejects.toThrow('Invalid AI response format')
  })

  it('passes abort signal', async () => {
    const controller = new AbortController()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ category: 'Test', color: '#ccc' }),
    })

    await fetchAISuggestion('Test', ['#ccc'], controller.signal)

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/ai/categorize',
      expect.objectContaining({ signal: controller.signal })
    )
  })
})
