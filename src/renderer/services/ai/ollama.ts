import type { AIProvider, ModelInfo, PullProgress } from './types'

export class OllamaClient implements AIProvider {
  id = 'ollama'
  name = 'Ollama (Local)'
  type = 'local' as const
  baseUrl = 'http://localhost:11434'

  /** Check if Ollama daemon is reachable */
  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000),
      })
      return res.ok
    } catch {
      return false
    }
  }

  /** List installed models on local Ollama */
  async listModels(): Promise<ModelInfo[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      })
      if (!res.ok) return []
      const data = await res.json()
      return (data.models || []).map((m: any) => ({
        name: m.name,
        size: m.size,
        modifiedAt: m.modified_at,
        parameterSize: m.details?.parameter_size,
        quantization: m.details?.quantization_level,
      }))
    } catch {
      return []
    }
  }

  /** Pull a model from Ollama library with streaming progress */
  async pullModel(
    modelName: string,
    onProgress: (progress: PullProgress) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName, stream: true }),
      signal,
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Failed to pull model: ${errText || res.statusText}`)
    }

    if (!res.body) throw new Error('No response body from Ollama stream')

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const json = JSON.parse(line)
          const percent =
            json.total && json.completed
              ? Math.round((json.completed / json.total) * 100)
              : undefined
          onProgress({
            status: json.status,
            digest: json.digest,
            total: json.total,
            completed: json.completed,
            percent,
          })
        } catch {}
      }
    }
  }

  /** Delete a local model */
  async deleteModel(modelName: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName }),
    })
    if (!res.ok) {
      throw new Error(`Failed to delete model: ${res.statusText}`)
    }
  }

  /** Stream chat completion with keep_alive to unload when idle */
  async chat(
    messages: { role: string; content: string }[],
    options?: {
      model?: string
      temperature?: number
      signal?: AbortSignal
      onChunk?: (chunk: string) => void
    }
  ): Promise<string> {
    const model = options?.model || 'qwen2.5-coder:3b'

    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        keep_alive: '5m', // Unload after 5 min idle to save RAM
        options: {
          temperature: options?.temperature ?? 0.3,
        },
      }),
      signal: options?.signal,
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Ollama chat failed: ${err || res.statusText}`)
    }

    if (!res.body) throw new Error('No response body from Ollama stream')

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let fullResponse = ''
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const json = JSON.parse(line)
          if (json.message?.content) {
            const chunk = json.message.content
            fullResponse += chunk
            options?.onChunk?.(chunk)
          }
        } catch {}
      }
    }

    return fullResponse
  }

  /** Fast autocomplete prompt with prefix and optional suffix */
  async complete(
    prompt: string,
    options?: {
      model?: string
      suffix?: string
      signal?: AbortSignal
    }
  ): Promise<string> {
    const model = options?.model || 'qwen2.5-coder:1.5b'

    const res = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        suffix: options?.suffix,
        stream: false,
        keep_alive: '5m',
        options: {
          temperature: 0.1,
          stop: ['\n\n', '```'],
        },
      }),
      signal: options?.signal,
    })

    if (!res.ok) return ''
    const data = await res.json()
    return data.response || ''
  }
}

export const ollamaClient = new OllamaClient()
