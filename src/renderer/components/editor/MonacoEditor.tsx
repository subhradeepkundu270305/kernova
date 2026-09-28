import React, { useRef, useEffect } from 'react'
import Editor, { OnMount } from '@monaco-editor/react'
import { motion } from 'framer-motion'
import * as monaco from 'monaco-editor'
import { useSettingsStore } from '../../stores/settingsStore'
import { registerInlineCompletionProvider } from './inlineCompletion'
import { SELECTION_ACTIONS, triggerSelectionAction } from '../ai/SelectionActions'

interface MonacoEditorProps {
  filePath: string
  content: string
  language: string
  onChange?: (content: string) => void
  onCursorChange?: (position: { lineNumber: number; column: number }) => void
  onScrollChange?: (position: { top: number; left: number }) => void
}

let inlineProviderRegistered = false

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  filePath,
  content,
  language,
  onChange,
  onCursorChange,
  onScrollChange,
}) => {
  const { editorTheme, fontSize, fontFamily, fontLigatures, minimap, wordWrap } = useSettingsStore()
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  useEffect(() => {
    if (!inlineProviderRegistered) {
      registerInlineCompletionProvider()
      inlineProviderRegistered = true
    }
  }, [])

  const handleEditorMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor

    editor.onDidChangeModelContent(() => {
      onChange?.(editor.getValue())
    })

    editor.onDidChangeCursorPosition((e) => {
      onCursorChange?.({ lineNumber: e.position.lineNumber, column: e.position.column })
    })

    editor.onDidScrollChange((e) => {
      onScrollChange?.({ top: e.scrollTop, left: e.scrollLeft })
    })

    // Register selection actions into Monaco's right-click context menu
    for (const action of SELECTION_ACTIONS) {
      editor.addAction({
        id: `kernova-action-${action.id}`,
        label: `AI: ${action.label}`,
        contextMenuGroupId: '1_modification',
        contextMenuOrder: 1,
        precondition: 'editorHasSelection',
        run: (ed) => {
          const selection = ed.getSelection()
          if (selection) {
            const selectedText = ed.getModel()?.getValueInRange(selection)
            if (selectedText) {
              triggerSelectionAction(action.id, selectedText)
            }
          }
        },
      })
    }
  }

  // Update content if changed externally
  useEffect(() => {
    if (editorRef.current) {
      const currentValue = editorRef.current.getValue()
      if (currentValue !== content) {
        editorRef.current.setValue(content)
      }
    }
  }, [content])

  return (
    <div className="w-full h-full relative">
      <Editor
        height="100%"
        width="100%"
        language={language}
        theme={editorTheme}
        value={content}
        path={filePath}
        onMount={handleEditorMount}
        loading={
          <div className="absolute inset-0 flex items-center justify-center bg-transparent">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-8 h-8 rounded-full border-2 border-[#2A2A3A] border-t-[#8B5CF6]"
            />
          </div>
        }
        options={{
          fontSize,
          fontFamily,
          fontLigatures,
          minimap: { enabled: minimap },
          wordWrap,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          padding: { top: 16 },
          bracketPairColorization: { enabled: true },
          guides: { bracketPairs: true },
          renderLineHighlight: 'all',
          scrollBeyondLastLine: false,
          tabSize: 2,
          insertSpaces: true,
          formatOnPaste: true,
          formatOnType: true,
          inlineSuggest: {
            enabled: true,
            mode: 'subsequent',
          },
        }}
      />
    </div>
  )
}
