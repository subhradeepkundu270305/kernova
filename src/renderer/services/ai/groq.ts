import type { AIProvider, ModelInfo } from './types'

export class GroqClient implements AIProvider {
  id = 'groq'
  name = 'Groq (Cloud)'
  type = 'cloud' as const

  private async getKey(): Promise<string | null> {
    return window.kernova ? await window.kernova.getSecretKey('groq') : null
  }

  async isAvailable(): Promise<boolean> {
    const key = await this.getKey()
    return !!key && navigator.onLine
  }

  async listModels(): Promise<ModelInfo[]> {
    return [
      {
        name: 'llama-3.3-70b-versatile',
        description: 'Meta Llama 3.3 70B (Fast & High Reasoning)',
      },
      { name: 'llama-3.1-8b-instant', description: 'Meta Llama 3.1 8B (Sub-second low latency)' },
    ]
  }

  async chat(
    messages: { role: string; content: string }[],
    options?: {
      model?: string
      temperature?: number
      signal?: AbortSignal
      onChunk?: (chunk: string) => void
    }
  ): Promise<string> {
    const apiKey = await this.getKey()
    if (!apiKey) throw new Error('Groq API key is not configured. Add it in AI Settings.')

    const model = options?.model || 'llama-3.3-70b-versatile'

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature ?? 0.3,
        stream: true,
      }),
      signal: options?.signal,
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Groq API Error: ${errText || res.statusText}`)
    }

    if (!res.body) throw new Error('No response body from Groq')

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
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim()
          if (!jsonStr || jsonStr === '[DONE]') continue
          try {
            const data = JSON.parse(jsonStr)
            const chunk = data.choices?.[0]?.delta?.content
            if (chunk) {
              fullResponse += chunk
              options?.onChunk?.(chunk)
            }
          } catch {}
        }
      }
    }

    return fullResponse
  }

  async complete(
    prompt: string,
    options?: {
      model?: string
      suffix?: string
      signal?: AbortSignal
    }
  ): Promise<string> {
    const apiKey = await this.getKey()
    if (!apiKey) return ''

    const model = options?.model || 'llama-3.1-8b-instant'

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 120,
      }),
      signal: options?.signal,
    })

    if (!res.ok) return ''
    const data = await res.json()
    return data.choices?.[0]?.message?.content || ''
  }
}

export const groqClient = new GroqClient()
