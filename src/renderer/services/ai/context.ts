import { useEditorStore } from '../../stores/editorStore'
import { useFileTreeStore } from '../../stores/fileTreeStore'

export interface PromptContextOptions {
  includeActiveFile?: boolean
  includeOpenTabs?: boolean
  customInstructions?: string
}

export function buildSystemPrompt(): string {
  return `You are KERNOVA AI, an intelligent offline-first programming assistant embedded inside the KERNOVA Code Editor.
Your goal is to provide concise, accurate, and production-grade code, debugging explanations, and refactoring assistance.
Always format code snippets using markdown code blocks with the appropriate language identifier.
When modifying or suggesting code replacements, provide clear diffs or complete replacement functions.`
}

export function buildProjectContext(options: PromptContextOptions = {}): {
  contextPrompt: string
  contextFiles: string[]
} {
  const { tabs, activeTabId, fileContents } = useEditorStore.getState()
  const { rootPath } = useFileTreeStore.getState()

  const contextFiles: string[] = []
  let contextParts: string[] = []

  // Active file context
  if (options.includeActiveFile !== false && activeTabId) {
    const activeTab = tabs.find((t) => t.id === activeTabId)
    if (activeTab) {
      const content = fileContents[activeTab.id] || ''
      // Cap at 10,000 characters to keep small 3B/1.5B models responsive
      const trimmedContent =
        content.length > 10000
          ? content.slice(0, 10000) + '\n... [truncated for context limit]'
          : content

      contextFiles.push(activeTab.fileName)
      contextParts.push(
        `--- Current Active File: ${activeTab.fileName} (${activeTab.language}) ---\n\`\`\`${activeTab.language}\n${trimmedContent}\n\`\`\``
      )
    }
  }

  // Open tabs context
  if (options.includeOpenTabs && tabs.length > 1) {
    const openFilesList = tabs.map((t) => t.fileName).join(', ')
    contextParts.push(`Currently open files in editor: ${openFilesList}`)
  }

  return {
    contextPrompt: contextParts.join('\n\n'),
    contextFiles,
  }
}
