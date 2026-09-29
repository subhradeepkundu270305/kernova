import React, { useRef, useEffect } from 'react'
import { DiffEditor } from '@monaco-editor/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, GitCompare } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import { registerMonacoThemes } from '../../themes'

interface DiffPreviewModalProps {
  isOpen: boolean
  originalCode: string
  modifiedCode: string
  fileName: string
  language: string
  onAccept: () => void
  onReject: () => void
}

export const DiffPreviewModal: React.FC<DiffPreviewModalProps> = ({
  isOpen,
  originalCode,
  modifiedCode,
  fileName,
  language,
  onAccept,
  onReject,
}) => {
  const { editorTheme, fontSize, fontFamily } = useSettingsStore()

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div
        onClick={onReject}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-6"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-5xl h-[80vh] bg-[#111118] border border-[#2A2A3A] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="h-12 bg-[#16161E] border-b border-[#2A2A3A] px-5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <GitCompare size={16} className="text-[#8B5CF6]" />
              <span className="font-semibold text-sm text-white">Diff Preview</span>
              <span className="text-xs text-[#71717A]">({fileName})</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onReject}
                className="px-3 py-1.5 rounded-lg border border-[#2A2A3A] text-xs font-medium text-[#A1A1AA] hover:text-white hover:bg-[#1E1E2A] transition-colors flex items-center gap-1.5"
              >
                <X size={14} /> Reject
              </button>
              <button
                onClick={onAccept}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-xs font-semibold text-white hover:opacity-95 transition-opacity flex items-center gap-1.5 shadow-lg shadow-[#8B5CF6]/20"
              >
                <Check size={14} /> Accept & Replace
              </button>
            </div>
          </div>

          {/* Monaco DiffEditor */}
          <div className="flex-1 relative overflow-hidden bg-[#0D0D12]">
            <DiffEditor
              original={originalCode}
              modified={modifiedCode}
              language={language}
              theme={editorTheme}
              beforeMount={registerMonacoThemes}
              options={{
                fontSize,
                fontFamily: `'${fontFamily}', 'JetBrains Mono', 'Fira Code', 'Courier New', monospace`,
                renderSideBySide: true,
                readOnly: true,
                smoothScrolling: true,
                padding: { top: 12 },
              }}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
