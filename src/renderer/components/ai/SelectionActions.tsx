import React from 'react'
import {
  HelpCircle,
  Bug,
  Sparkles,
  MessageSquareCode,
  FlaskConical,
  Zap,
  X,
} from 'lucide-react'
import { useEditorStore } from '../../stores/editorStore'
import { useUIStore } from '../../stores/uiStore'
import { useAIStore } from '../../stores/aiStore'

export interface SelectionActionItem {
  id: string
  label: string
  shortLabel: string
  icon: React.ReactNode
  buildPrompt: (code: string, language: string) => string
}

export const SELECTION_ACTIONS: SelectionActionItem[] = [
  {
    id: 'explain',
    label: 'Explain this code',
    shortLabel: 'Explain',
    icon: <HelpCircle size={13} className="text-[#38BDF8]" />,
    buildPrompt: (code, lang) =>
      `Please explain the following ${lang} code clearly, breaking down the logic, edge cases, and purpose:\n\`\`\`${lang}\n${code}\n\`\`\``,
  },
  {
    id: 'fix-bug',
    label: 'Find & fix bugs',
    shortLabel: 'Fix Bugs',
    icon: <Bug size={13} className="text-[#F87171]" />,
    buildPrompt: (code, lang) =>
      `Inspect this ${lang} snippet for bugs, logic errors, or potential runtime panics, and provide the fixed code:\n\`\`\`${lang}\n${code}\n\`\`\``,
  },
  {
    id: 'refactor',
    label: 'Refactor cleanly',
    shortLabel: 'Refactor',
    icon: <Sparkles size={13} className="text-[#C084FC]" />,
    buildPrompt: (code, lang) =>
      `Refactor this ${lang} code for better readability, idiomatic conventions, and modularity without changing its behavior:\n\`\`\`${lang}\n${code}\n\`\`\``,
  },
  {
    id: 'add-comments',
    label: 'Add detailed comments',
    shortLabel: 'Comments',
    icon: <MessageSquareCode size={13} className="text-[#34D399]" />,
    buildPrompt: (code, lang) =>
      `Add helpful docstrings and inline comments explaining each step of this ${lang} snippet:\n\`\`\`${lang}\n${code}\n\`\`\``,
  },
  {
    id: 'write-tests',
    label: 'Write unit tests',
    shortLabel: 'Unit Tests',
    icon: <FlaskConical size={13} className="text-[#FBBF24]" />,
    buildPrompt: (code, lang) =>
      `Write comprehensive unit tests covering standard cases and edge cases for this ${lang} code:\n\`\`\`${lang}\n${code}\n\`\`\``,
  },
  {
    id: 'optimize',
    label: 'Optimize complexity (DSA)',
    shortLabel: 'Optimize',
    icon: <Zap size={13} className="text-[#FB923C]" />,
    buildPrompt: (code, lang) =>
      `Analyze the time and space complexity of this ${lang} algorithm, then optimize it with lower Big-O complexity (ideal for DSA practice):\n\`\`\`${lang}\n${code}\n\`\`\``,
  },
]

export function triggerSelectionAction(actionId: string, selectedCode: string): void {
  const { activeTabId, tabs } = useEditorStore.getState()
  const { openAIChat } = useUIStore.getState()
  const { sendMessage } = useAIStore.getState()

  const tab = tabs.find((t) => t.id === activeTabId)
  const language = tab?.language || 'plaintext'
  const action = SELECTION_ACTIONS.find((a) => a.id === actionId)
  if (!action || !selectedCode.trim()) return

  // Always ensure chat panel is opened
  openAIChat()

  const prompt = action.buildPrompt(selectedCode, language)
  sendMessage(prompt)
}

export interface SelectionToolbarProps {
  visible: boolean
  top: number
  left: number
  selectedText: string
  onClose: () => void
}

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  visible,
  top,
  left,
  selectedText,
  onClose,
}) => {
  if (!visible || !selectedText.trim()) return null

  return (
    <div
      onMouseDown={(e) => {
        // Prevent clearing editor selection on click
        e.stopPropagation()
      }}
      style={{
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 50,
      }}
      className="flex items-center gap-1 p-1 bg-[#13121F]/95 backdrop-blur-md rounded-xl border border-[#3A2D58] shadow-[0_12px_36px_rgba(0,0,0,0.7)] select-none animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold text-[#C084FC] border-r border-[#2C2146] mr-0.5">
        <Sparkles size={12} className="text-[#8B5CF6]" />
        <span className="text-[11px] tracking-wide">AI</span>
      </div>

      <div className="flex items-center gap-0.5">
        {SELECTION_ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={(e) => {
              e.stopPropagation()
              triggerSelectionAction(action.id, selectedText)
              onClose()
            }}
            className="flex items-center gap-1 px-2 py-1 text-xs text-[#E4E4E7] hover:text-white rounded-lg hover:bg-[#251C3C] transition-all hover:scale-105 active:scale-95"
            title={action.label}
          >
            {action.icon}
            <span className="font-medium text-[11px] whitespace-nowrap">{action.shortLabel}</span>
          </button>
        ))}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className="p-1 text-[#71717A] hover:text-[#E4E4E7] hover:bg-[#251C3C] rounded-md transition-colors ml-0.5"
        title="Dismiss (Esc)"
      >
        <X size={12} />
      </button>
    </div>
  )
}
