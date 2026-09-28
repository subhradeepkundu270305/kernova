import type { AIProvider, ModelInfo } from './types'

export class GeminiClient implements AIProvider {
  id = 'gemini'
  name = 'Google Gemini (Cloud)'
  type = 'cloud' as const

  private async getKey(): Promise<string | null> {
    return window.kernova ? await window.kernova.getSecretKey('gemini') : null
  }

  async isAvailable(): Promise<boolean> {
    const key = await this.getKey()
    return !!key && navigator.onLine
  }

  async listModels(): Promise<ModelInfo[]> {
    return [
      {
        name: 'gemini-2.0-flash',
        description: 'Google Gemini 2.0 Flash (Fast & Capable Free Tier)',
      },
      {
        name: 'gemini-1.5-pro',
        description: 'Google Gemini 1.5 Pro (Deep Reasoning & Large Context)',
      },
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
    if (!apiKey) throw new Error('Gemini API key is not configured. Add it in AI Settings.')

    const model = options?.model || 'gemini-2.0-flash'
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`

    // Format messages for Gemini API
    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))

    const systemInstruction = messages.find((m) => m.role === 'system')

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        ...(systemInstruction
          ? { system_instruction: { parts: [{ text: systemInstruction.content }] } }
          : {}),
        generationConfig: {
          temperature: options?.temperature ?? 0.3,
        },
      }),
      signal: options?.signal,
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Gemini API Error: ${errText || res.statusText}`)
    }

    if (!res.body) throw new Error('No response body from Gemini')

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
          if (!jsonStr) continue
          try {
            const data = JSON.parse(jsonStr)
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text
            if (text) {
              fullResponse += text
              options?.onChunk?.(text)
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

    const model = options?.model || 'gemini-2.0-flash'
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 120,
        },
      }),
      signal: options?.signal,
    })

    if (!res.ok) return ''
    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  }
}

export const geminiClient = new GeminiClient()
