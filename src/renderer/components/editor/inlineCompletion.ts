import * as monaco from 'monaco-editor'
import { smartRouter } from '../../services/ai/router'
import { useAIStore } from '../../stores/aiStore'

let currentAbortController: AbortController | null = null
let debounceTimer: NodeJS.Timeout | null = null

export function registerInlineCompletionProvider(): monaco.IDisposable {
  return monaco.languages.registerInlineCompletionsProvider('*', {
    provideInlineCompletions: async (model, position, context, token) => {
      // Check if autocomplete is enabled
      const { selectedCompletionModel } = useAIStore.getState()
      if (selectedCompletionModel === 'none') {
        return { items: [] }
      }

      // Abort previous in-flight request
      if (currentAbortController) {
        currentAbortController.abort()
        currentAbortController = null
      }

      // Wait 500ms debounce before invoking AI model
      await new Promise<void>((resolve) => {
        if (debounceTimer) clearTimeout(debounceTimer)
        debounceTimer = setTimeout(resolve, 500)
      })

      if (token.isCancellationRequested) {
        return { items: [] }
      }

      currentAbortController = new AbortController()

      try {
        // Extract prefix (up to 2000 chars before cursor)
        const offset = model.getOffsetAt(position)
        const text = model.getValue()
        const prefix = text.slice(Math.max(0, offset - 2000), offset)
        const suffix = text.slice(offset, Math.min(text.length, offset + 500))

        if (!prefix.trim()) return { items: [] }

        const completion = await smartRouter.complete(prefix, {
          suffix,
          signal: currentAbortController.signal,
        })

        if (!completion || token.isCancellationRequested) {
          return { items: [] }
        }

        return {
          items: [
            {
              insertText: completion,
              range: new monaco.Range(
                position.lineNumber,
                position.column,
                position.lineNumber,
                position.column
              ),
            },
          ],
        }
      } catch (err: any) {
        return { items: [] }
      } finally {
        currentAbortController = null
      }
    },
    freeInlineCompletions: () => {},
  })
}
