import 'dotenv/config'
import express, { type Express } from 'express'
import cors from 'cors'
import { aiRouter } from './routes/ai.js'

const app: Express = express()
const PORT = process.env.PORT ?? 3001

app.use(cors())
app.use(express.json())

app.use('/api/ai', aiRouter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})

export { app }
