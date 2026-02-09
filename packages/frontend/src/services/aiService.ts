export interface AISuggestion {
  readonly category: string
  readonly color: string
}

export async function fetchAISuggestion(
  taskName: string,
  palette: readonly string[],
  signal?: AbortSignal
): Promise<AISuggestion> {
  const response = await fetch('/api/ai/categorize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskName, palette }),
    signal,
  })

  if (!response.ok) {
    throw new Error(`AI service error: ${response.status}`)
  }

  const data: unknown = await response.json()
  if (
    typeof data !== 'object' ||
    data === null ||
    !('category' in data) ||
    !('color' in data)
  ) {
    throw new Error('Invalid AI response format')
  }

  return data as AISuggestion
}
