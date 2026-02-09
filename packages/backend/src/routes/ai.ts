import { Router, type IRouter } from 'express'
import { categorizeTask } from '../services/qwen.js'

export const aiRouter: IRouter = Router()

aiRouter.post('/categorize', async (req, res) => {
  const { taskName, palette } = req.body

  if (!taskName || typeof taskName !== 'string') {
    res.status(400).json({ error: 'taskName is required' })
    return
  }

  const colors = Array.isArray(palette) ? palette : ['#6B7280']

  try {
    const result = await categorizeTask({ taskName, palette: colors })
    res.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'

    if (message.includes('DASHSCOPE_API_KEY')) {
      // Fallback when API key not configured
      res.json({
        category: 'Uncategorized',
        color: colors[0] ?? '#6B7280',
      })
      return
    }

    if (message.includes('abort') || message.includes('timeout')) {
      res.status(504).json({ error: 'AI service timeout' })
      return
    }

    res.status(500).json({ error: 'AI service error' })
  }
})
