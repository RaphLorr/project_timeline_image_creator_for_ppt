interface QwenCategorizeResult {
  readonly category: string
  readonly color: string
}

interface QwenCategorizeRequest {
  readonly taskName: string
  readonly palette: readonly string[]
}

const DASHSCOPE_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
const QWEN_MODEL = 'qwen-plus'
const TIMEOUT_MS = 10000

function buildPrompt(taskName: string, palette: readonly string[]): string {
  return `You are a project management assistant. Given a task name, categorize it and suggest a color.

Task: "${taskName}"
Available colors: ${palette.join(', ')}

Respond ONLY with JSON: {"category": "<category>", "color": "<hex color from the list>"}

Categories to use: Development, Design, Testing, Planning, Documentation, DevOps, Research, Management, Marketing, Other

Pick the most appropriate category and a color from the available list that best represents it.`
}

export async function categorizeTask(
  request: QwenCategorizeRequest
): Promise<QwenCategorizeResult> {
  const apiKey = process.env.DASHSCOPE_API_KEY
  if (!apiKey) {
    throw new Error('DASHSCOPE_API_KEY not configured')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(DASHSCOPE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: QWEN_MODEL,
        messages: [
          { role: 'user', content: buildPrompt(request.taskName, request.palette) },
        ],
        temperature: 0.3,
        max_tokens: 100,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`DashScope API error: ${response.status}`)
    }

    const data: unknown = await response.json()

    // Parse Qwen response format
    const choices = (data as Record<string, unknown>)?.choices as Array<Record<string, unknown>> | undefined
    const messageContent = (choices?.[0]?.message as Record<string, unknown>)?.content

    if (typeof messageContent !== 'string') {
      throw new Error('Unexpected Qwen response format')
    }

    // Extract JSON from response (may contain markdown code blocks)
    const jsonMatch = messageContent.match(/\{[^}]+\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in Qwen response')
    }

    const parsed: unknown = JSON.parse(jsonMatch[0])
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('category' in parsed) ||
      !('color' in parsed)
    ) {
      throw new Error('Invalid JSON structure from Qwen')
    }

    return parsed as QwenCategorizeResult
  } catch (err) {
    clearTimeout(timeoutId)
    throw err
  }
}
