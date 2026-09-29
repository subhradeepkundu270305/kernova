import { useEditorStore } from '../../stores/editorStore'
import { useFileTreeStore } from '../../stores/fileTreeStore'

export interface PromptContextOptions {
  includeActiveFile?: boolean
  includeOpenTabs?: boolean
  customInstructions?: string
}

export interface ActiveFileInfo {
  fileName: string
  language: string
  filePath?: string
}

export function buildSystemPrompt(activeFile?: ActiveFileInfo | null): string {
  let prompt = `You are KERNOVA AI, an intelligent offline-first programming assistant embedded inside the KERNOVA Code Editor.
Your goal is to provide concise, accurate, and production-grade code, debugging explanations, and refactoring assistance.
Always format code snippets using markdown code blocks with the appropriate language identifier.
When modifying or suggesting code replacements, provide clear diffs or complete replacement functions.`

  if (activeFile && activeFile.language && activeFile.language !== 'plaintext') {
    prompt += `\n\n[CRITICAL PROGRAMMING LANGUAGE DIRECTIVE]:
- The user is currently working on the active file: "${activeFile.fileName}" (Language: ${activeFile.language.toUpperCase()}).
- Unless the user EXPLICITLY specifies another programming language by name in their message (e.g. "write this in Go", "in Python", "convert to C++"), you MUST ALWAYS generate, complete, refactor, and explain code strictly in ${activeFile.language}.
- NEVER generate code in a random or different programming language (e.g. Go, Python, C++, Rust, etc.) when the active file is ${activeFile.fileName} (${activeFile.language}).
- Every code block you output must use the markdown code fence with \`\`\`${activeFile.language}\`\`\` so the user can easily copy or apply the code directly into "${activeFile.fileName}".`
  }

  return prompt
}

export function buildProjectContext(options: PromptContextOptions = {}): {
  contextPrompt: string
  contextFiles: string[]
  activeFileInfo: ActiveFileInfo | null
} {
  const { tabs, activeTabId, fileContents } = useEditorStore.getState()
  const { rootPath } = useFileTreeStore.getState()

  const contextFiles: string[] = []
  let contextParts: string[] = []
  let activeFileInfo: ActiveFileInfo | null = null

  // Active file context
  if (options.includeActiveFile !== false && activeTabId) {
    const activeTab = tabs.find((t) => t.id === activeTabId)
    if (activeTab) {
      activeFileInfo = {
        fileName: activeTab.fileName,
        language: activeTab.language,
        filePath: activeTab.filePath,
      }
      const content = fileContents[activeTab.id] || ''
      // Cap at 10,000 characters to keep small 3B/1.5B models responsive
      const trimmedContent =
        content.length > 10000
          ? content.slice(0, 10000) + '\n... [truncated for context limit]'
          : content

      contextFiles.push(activeTab.fileName)

      const header = `--- ACTIVE EDITOR FILE ---
File Name: ${activeTab.fileName}
File Language: ${activeTab.language}
Target Programming Language: All code generated must be in ${activeTab.language} to match "${activeTab.fileName}" unless the user explicitly requested a different language.`

      const body = trimmedContent.trim()
        ? `Current Content:\n\`\`\`${activeTab.language}\n${trimmedContent}\n\`\`\``
        : `[Note: File "${activeTab.fileName}" is newly created or empty. Generate ${activeTab.language} code for this file]`

      contextParts.push(`${header}\n\n${body}`)
    }
  }

  // Open tabs context
  if (options.includeOpenTabs && tabs.length > 1) {
    const openFilesList = tabs.map((t) => `${t.fileName} (${t.language})`).join(', ')
    contextParts.push(`Currently open files in editor: ${openFilesList}`)
  }

  return {
    contextPrompt: contextParts.join('\n\n'),
    contextFiles,
    activeFileInfo,
  }
}
