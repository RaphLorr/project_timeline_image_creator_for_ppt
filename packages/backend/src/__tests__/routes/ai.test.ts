import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the qwen service
vi.mock('../../services/qwen.js', () => ({
  categorizeTask: vi.fn(),
}))

import { categorizeTask } from '../../services/qwen.js'

// Import after mock
import express from 'express'
import { aiRouter } from '../../routes/ai.js'

function createApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/ai', aiRouter)
  return app
}

async function makeRequest(app: express.Express, body: unknown) {
  // Use a simple http approach via supertest-like pattern
  return new Promise<{ status: number; body: unknown }>((resolve) => {
    const server = app.listen(0, () => {
      const addr = server.address()
      const port = typeof addr === 'object' && addr ? addr.port : 0

      fetch(`http://localhost:${port}/api/ai/categorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
        .then(async (res) => {
          const data = await res.json()
          resolve({ status: res.status, body: data })
        })
        .finally(() => {
          server.close()
        })
    })
  })
}

describe('POST /api/ai/categorize', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 200 with valid response', async () => {
    vi.mocked(categorizeTask).mockResolvedValue({
      category: 'Development',
      color: '#3B82F6',
    })

    const app = createApp()
    const res = await makeRequest(app, { taskName: 'Write code', palette: ['#3B82F6'] })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ category: 'Development', color: '#3B82F6' })
  })

  it('returns 400 on missing taskName', async () => {
    const app = createApp()
    const res = await makeRequest(app, { palette: ['#ccc'] })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'taskName is required' })
  })

  it('returns fallback when DASHSCOPE_API_KEY not configured', async () => {
    vi.mocked(categorizeTask).mockRejectedValue(
      new Error('DASHSCOPE_API_KEY not configured')
    )

    const app = createApp()
    const res = await makeRequest(app, { taskName: 'Test task', palette: ['#FF0000'] })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      category: 'Uncategorized',
      color: '#FF0000',
    })
  })

  it('returns 504 on Qwen timeout', async () => {
    vi.mocked(categorizeTask).mockRejectedValue(new Error('abort'))

    const app = createApp()
    const res = await makeRequest(app, { taskName: 'Test task' })

    expect(res.status).toBe(504)
  })

  it('does not leak API key in response', async () => {
    vi.mocked(categorizeTask).mockResolvedValue({
      category: 'Testing',
      color: '#10B981',
    })

    const app = createApp()
    const res = await makeRequest(app, { taskName: 'Test', palette: ['#10B981'] })

    const responseText = JSON.stringify(res.body)
    expect(responseText).not.toContain('DASHSCOPE')
    expect(responseText).not.toContain('api_key')
  })
})
