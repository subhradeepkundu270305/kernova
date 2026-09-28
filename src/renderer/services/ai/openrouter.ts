import type { AIProvider, ModelInfo } from './types'

export class OpenRouterClient implements AIProvider {
  id = 'openrouter'
  name = 'OpenRouter (Free & Open Models)'
  type = 'cloud' as const

  private async getKey(): Promise<string | null> {
    return window.kernova ? await window.kernova.getSecretKey('openrouter') : null
  }

  async isAvailable(): Promise<boolean> {
    const key = await this.getKey()
    return !!key && navigator.onLine
  }

  async listModels(): Promise<ModelInfo[]> {
    return [
      {
        name: 'meta-llama/llama-3.2-3b-instruct:free',
        description: 'Llama 3.2 3B Instruct (Free)',
      },
      { name: 'qwen/qwen-2.5-coder-32b-instruct:free', description: 'Qwen 2.5 Coder 32B (Free)' },
      { name: 'deepseek/deepseek-r1:free', description: 'DeepSeek R1 Reasoning (Free)' },
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
    if (!apiKey) throw new Error('OpenRouter API key is not configured. Add it in AI Settings.')

    const model = options?.model || 'qwen/qwen-2.5-coder-32b-instruct:free'

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://github.com/subhradeep/kernova',
        'X-Title': 'KERNOVA Offline AI Editor',
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
      throw new Error(`OpenRouter API Error: ${errText || res.statusText}`)
    }

    if (!res.body) throw new Error('No response body from OpenRouter')

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

    const model = options?.model || 'meta-llama/llama-3.2-3b-instruct:free'

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://github.com/subhradeep/kernova',
        'X-Title': 'KERNOVA Offline AI Editor',
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

export const openRouterClient = new OpenRouterClient()
