import { create } from 'zustand'
import type { ChatMessage, ModelInfo } from '../services/ai/types'
import { ollamaClient } from '../services/ai/ollama'
import { buildSystemPrompt, buildProjectContext } from '../services/ai/context'

interface AIState {
  activeProviderId: 'ollama' | 'gemini' | 'groq' | 'openrouter' | 'auto'
  isLocalOnly: boolean
  isOllamaAvailable: boolean
  selectedChatModel: string
  selectedCompletionModel: string
  installedModels: ModelInfo[]
  messages: ChatMessage[]
  isStreaming: boolean
  isWizardOpen: boolean
  includeActiveFile: boolean

  setProvider: (id: 'ollama' | 'gemini' | 'groq' | 'openrouter' | 'auto') => void
  setLocalOnly: (val: boolean) => void
  setSelectedChatModel: (model: string) => void
  setSelectedCompletionModel: (model: string) => void
  openWizard: () => void
  closeWizard: () => void
  setIncludeActiveFile: (val: boolean) => void

  checkOllama: () => Promise<boolean>
  refreshModels: () => Promise<void>
  sendMessage: (userText: string) => Promise<void>
  stopStreaming: () => void
  clearMessages: () => void
}

let abortController: AbortController | null = null

export const useAIStore = create<AIState>((set, get) => ({
  activeProviderId: 'ollama',
  isLocalOnly: true,
  isOllamaAvailable: false,
  selectedChatModel: 'qwen2.5-coder:3b',
  selectedCompletionModel: 'qwen2.5-coder:1.5b',
  installedModels: [],
  messages: [],
  isStreaming: false,
  isWizardOpen: false,
  includeActiveFile: true,

  setProvider: (id) => set({ activeProviderId: id }),
  setLocalOnly: (val) => set({ isLocalOnly: val }),
  setSelectedChatModel: (model) => set({ selectedChatModel: model }),
  setSelectedCompletionModel: (model) => set({ selectedCompletionModel: model }),
  openWizard: () => set({ isWizardOpen: true }),
  closeWizard: () => set({ isWizardOpen: false }),
  setIncludeActiveFile: (val) => set({ includeActiveFile: val }),

  checkOllama: async () => {
    const ok = await ollamaClient.isAvailable()
    set({ isOllamaAvailable: ok })
    if (ok) {
      await get().refreshModels()
    }
    return ok
  },

  refreshModels: async () => {
    const models = await ollamaClient.listModels()
    set({ installedModels: models })

    // Auto-select first matching model if current model isn't downloaded yet
    const { selectedChatModel } = get()
    if (models.length > 0 && !models.some((m) => m.name === selectedChatModel)) {
      set({ selectedChatModel: models[0].name })
    }
  },

  sendMessage: async (userText: string) => {
    if (!userText.trim() || get().isStreaming) return

    let { messages, selectedChatModel, includeActiveFile, installedModels } = get()

    // If installed models list is empty, refresh now
    if (installedModels.length === 0) {
      try {
        await get().refreshModels()
        installedModels = get().installedModels
      } catch {
        // ignore
      }
    }

    // Auto-select valid model if current selection isn't present
    if (installedModels.length > 0 && !installedModels.some((m) => m.name === selectedChatModel)) {
      selectedChatModel = installedModels[0].name
      set({ selectedChatModel })
    }

    const { contextPrompt, contextFiles } = buildProjectContext({ includeActiveFile })

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: userText,
      timestamp: Date.now(),
      contextFiles,
    }

    const assistantMessageId = `msg-${Date.now()}-assistant`
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    }

    set({
      messages: [...messages, userMessage, assistantMessage],
      isStreaming: true,
    })

    abortController = new AbortController()

    try {
      // Build messages array including system prompt and context
      const apiMessages: { role: string; content: string }[] = [
        { role: 'system', content: buildSystemPrompt() },
      ]

      if (contextPrompt) {
        apiMessages.push({
          role: 'system',
          content: `Here is the current workspace context:\n${contextPrompt}`,
        })
      }

      // Append prior conversation (last 6 messages)
      for (const m of messages.slice(-6)) {
        apiMessages.push({ role: m.role, content: m.content })
      }

      // Append current user prompt
      apiMessages.push({ role: 'user', content: userText })

      await ollamaClient.chat(apiMessages, {
        model: selectedChatModel,
        signal: abortController.signal,
        onChunk: (chunk) => {
          set((state) => ({
            messages: state.messages.map((m) =>
              m.id === assistantMessageId ? { ...m, content: m.content + chunk } : m
            ),
          }))
        },
      })
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const errorNote =
          `\n\n*[Notice: Error connecting to local AI (${err.message || err}). ` +
          `Make sure Ollama is running (` +
          '`ollama serve`' +
          `) and model ` +
          `\`${selectedChatModel}\`` +
          ` is available.]*`

        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === assistantMessageId
              ? { ...m, content: (m.content || 'Unable to generate response.') + errorNote }
              : m
          ),
        }))
      }
    } finally {
      set({ isStreaming: false })
      abortController = null
    }
  },

  stopStreaming: () => {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
    set({ isStreaming: false })
  },

  clearMessages: () => set({ messages: [] }),
}))
