import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { categorizeTask } from '../../services/qwen.js'

describe('categorizeTask', () => {
  const originalEnv = process.env
  const mockFetch = vi.fn()

  beforeEach(() => {
    process.env = { ...originalEnv, DASHSCOPE_API_KEY: 'test-key' }
    globalThis.fetch = mockFetch
    vi.clearAllMocks()
  })

  afterEach(() => {
    process.env = originalEnv
    vi.restoreAllMocks()
  })

  it('builds correct API request', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: { content: '{"category": "Development", "color": "#3B82F6"}' },
        }],
      }),
    })

    await categorizeTask({ taskName: 'Write code', palette: ['#3B82F6'] })

    expect(mockFetch).toHaveBeenCalledWith(
      'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-key',
        }),
      })
    )

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.model).toBe('qwen-plus')
    expect(body.messages[0].content).toContain('Write code')
  })

  it('parses Qwen response format', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: { content: '{"category": "Testing", "color": "#10B981"}' },
        }],
      }),
    })

    const result = await categorizeTask({ taskName: 'Write tests', palette: ['#10B981'] })

    expect(result.category).toBe('Testing')
    expect(result.color).toBe('#10B981')
  })

  it('handles JSON in markdown code blocks', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: { content: '```json\n{"category": "DevOps", "color": "#F59E0B"}\n```' },
        }],
      }),
    })

    const result = await categorizeTask({ taskName: 'Deploy app', palette: ['#F59E0B'] })

    expect(result.category).toBe('DevOps')
  })

  it('throws on non-JSON response', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: { content: 'I cannot categorize this task' },
        }],
      }),
    })

    await expect(
      categorizeTask({ taskName: 'Test', palette: ['#ccc'] })
    ).rejects.toThrow('No JSON found')
  })

  it('throws when API key is missing', async () => {
    delete process.env.DASHSCOPE_API_KEY

    await expect(
      categorizeTask({ taskName: 'Test', palette: ['#ccc'] })
    ).rejects.toThrow('DASHSCOPE_API_KEY not configured')
  })

  it('throws on API error status', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 429,
    })

    await expect(
      categorizeTask({ taskName: 'Test', palette: ['#ccc'] })
    ).rejects.toThrow('DashScope API error: 429')
  })
})
