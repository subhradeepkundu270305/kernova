import React from 'react'
import {
  HelpCircle,
  Bug,
  Sparkles,
  MessageSquareCode,
  FlaskConical,
  Zap,
  ArrowRightLeft,
} from 'lucide-react'
import { useEditorStore } from '../../stores/editorStore'
import { useUIStore } from '../../stores/uiStore'
import { useAIStore } from '../../stores/aiStore'

export interface SelectionActionItem {
  id: string
  label: string
  icon: React.ReactNode
  buildPrompt: (code: string, language: string) => string
}

export const SELECTION_ACTIONS: SelectionActionItem[] = [
  {
    id: 'explain',
    label: 'Explain this code',
    icon: <HelpCircle size={14} className="text-[#38BDF8]" />,
    buildPrompt: (code, lang) =>
      `Please explain the following ${lang} code clearly, breaking down the logic, edge cases, and purpose:\n\`\`\`${lang}\n${code}\n\`\`\``,
  },
  {
    id: 'fix-bug',
    label: 'Find & fix bugs',
    icon: <Bug size={14} className="text-[#F87171]" />,
    buildPrompt: (code, lang) =>
      `Inspect this ${lang} snippet for bugs, logic errors, or potential runtime panics, and provide the fixed code:\n\`\`\`${lang}\n${code}\n\`\`\``,
  },
  {
    id: 'refactor',
    label: 'Refactor cleanly',
    icon: <Sparkles size={14} className="text-[#C084FC]" />,
    buildPrompt: (code, lang) =>
      `Refactor this ${lang} code for better readability, idiomatic conventions, and modularity without changing its behavior:\n\`\`\`${lang}\n${code}\n\`\`\``,
  },
  {
    id: 'add-comments',
    label: 'Add detailed comments',
    icon: <MessageSquareCode size={14} className="text-[#34D399]" />,
    buildPrompt: (code, lang) =>
      `Add helpful docstrings and inline comments explaining each step of this ${lang} snippet:\n\`\`\`${lang}\n${code}\n\`\`\``,
  },
  {
    id: 'write-tests',
    label: 'Write unit tests',
    icon: <FlaskConical size={14} className="text-[#FBBF24]" />,
    buildPrompt: (code, lang) =>
      `Write comprehensive unit tests covering standard cases and edge cases for this ${lang} code:\n\`\`\`${lang}\n${code}\n\`\`\``,
  },
  {
    id: 'optimize',
    label: 'Optimize time & space complexity',
    icon: <Zap size={14} className="text-[#FB923C]" />,
    buildPrompt: (code, lang) =>
      `Analyze the time and space complexity of this ${lang} algorithm, then optimize it with lower Big-O complexity (ideal for DSA practice):\n\`\`\`${lang}\n${code}\n\`\`\``,
  },
]

export function triggerSelectionAction(actionId: string, selectedCode: string): void {
  const { activeTabId, tabs } = useEditorStore.getState()
  const { toggleAIChat, isAIChatOpen } = useUIStore.getState()
  const { sendMessage } = useAIStore.getState()

  const tab = tabs.find((t) => t.id === activeTabId)
  const language = tab?.language || 'plaintext'
  const action = SELECTION_ACTIONS.find((a) => a.id === actionId)
  if (!action || !selectedCode.trim()) return

  // Open AI chat if closed
  if (!isAIChatOpen) {
    toggleAIChat()
  }

  const prompt = action.buildPrompt(selectedCode, language)
  sendMessage(prompt)
}
