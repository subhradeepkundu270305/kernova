import type { AIProvider } from './types'
import { ollamaClient } from './ollama'
import { geminiClient } from './gemini'
import { groqClient } from './groq'
import { openRouterClient } from './openrouter'
import { useAIStore } from '../../stores/aiStore'

export interface RoutingDecision {
  provider: AIProvider
  reason: string
}

export class SmartRouter {
  /** Resolve the active AI provider based on settings, privacy mode, and online status */
  async resolveProvider(): Promise<RoutingDecision> {
    const { activeProviderId, isLocalOnly } = useAIStore.getState()

    // 1. Strict Privacy Toggle ("Local AI only")
    if (isLocalOnly) {
      return {
        provider: ollamaClient,
        reason: 'Privacy mode active (Local Ollama only)',
      }
    }

    // 2. Explicit provider selection
    if (activeProviderId === 'ollama') {
      return { provider: ollamaClient, reason: 'Selected Local Ollama' }
    }
    if (activeProviderId === 'gemini') {
      const ok = await geminiClient.isAvailable()
      if (ok) return { provider: geminiClient, reason: 'Selected Google Gemini' }
      return { provider: ollamaClient, reason: 'Gemini unavailable, falling back to Local Ollama' }
    }
    if (activeProviderId === 'groq') {
      const ok = await groqClient.isAvailable()
      if (ok) return { provider: groqClient, reason: 'Selected Groq' }
      return { provider: ollamaClient, reason: 'Groq unavailable, falling back to Local Ollama' }
    }
    if (activeProviderId === 'openrouter') {
      const ok = await openRouterClient.isAvailable()
      if (ok) return { provider: openRouterClient, reason: 'Selected OpenRouter' }
      return {
        provider: ollamaClient,
        reason: 'OpenRouter unavailable, falling back to Local Ollama',
      }
    }

    // 3. "Auto" Smart Routing: Try Cloud first when online, fallback to Local Ollama
    const online = navigator.onLine && (window.kernova ? await window.kernova.checkOnline() : true)

    if (online) {
      if (await geminiClient.isAvailable()) {
        return { provider: geminiClient, reason: 'Auto: Online with Gemini active' }
      }
      if (await groqClient.isAvailable()) {
        return { provider: groqClient, reason: 'Auto: Online with Groq active' }
      }
      if (await openRouterClient.isAvailable()) {
        return { provider: openRouterClient, reason: 'Auto: Online with OpenRouter active' }
      }
    }

    // Default to Local Ollama
    return {
      provider: ollamaClient,
      reason: online
        ? 'Auto: Local Ollama (no cloud keys configured)'
        : 'Auto: Offline mode (Local Ollama)',
    }
  }

  async chat(
    messages: { role: string; content: string }[],
    options?: {
      temperature?: number
      signal?: AbortSignal
      onChunk?: (chunk: string) => void
    }
  ): Promise<string> {
    const { provider } = await this.resolveProvider()
    return provider.chat(messages, options)
  }

  async complete(
    prompt: string,
    options?: {
      suffix?: string
      signal?: AbortSignal
    }
  ): Promise<string> {
    const { provider } = await this.resolveProvider()
    return provider.complete(prompt, options)
  }
}

export const smartRouter = new SmartRouter()
