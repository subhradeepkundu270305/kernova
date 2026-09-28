import React, { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Sparkles,
  Send,
  Square,
  FileCode,
  Copy,
  Check,
  ArrowDownToLine,
  Trash2,
  X,
  Settings2,
  ChevronDown,
} from 'lucide-react'
import { useAIStore } from '../../stores/aiStore'
import { useUIStore } from '../../stores/uiStore'
import { useEditorStore } from '../../stores/editorStore'

export const ChatPanel: React.FC = () => {
  const { isAIChatOpen, aiChatWidth, setAIChatWidth, toggleAIChat } = useUIStore()

  const {
    messages,
    isStreaming,
    selectedChatModel,
    installedModels,
    setSelectedChatModel,
    openWizard,
    sendMessage,
    stopStreaming,
    clearMessages,
    includeActiveFile,
    setIncludeActiveFile,
    isOllamaAvailable,
  } = useAIStore()

  const { activeTabId, tabs, updateFileContent } = useEditorStore()
  const [inputText, setInputText] = useState('')
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null)
  const [isResizing, setIsResizing] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Scroll to bottom on new chunks
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  // Focus input when chat opens
  useEffect(() => {
    if (isAIChatOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isAIChatOpen])

  const activeTab = tabs.find((t) => t.id === activeTabId)

  const handleSend = () => {
    if (!inputText.trim() || isStreaming) return
    const text = inputText
    setInputText('')
    sendMessage(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCodeId(id)
    setTimeout(() => setCopiedCodeId(null), 2000)
  }

  const applyToEditor = (code: string) => {
    if (activeTabId && activeTab) {
      const original = useEditorStore.getState().fileContents[activeTabId] || ''
      useUIStore.getState().openDiffModal({
        originalCode: original,
        modifiedCode: code,
        fileName: activeTab.fileName,
        language: activeTab.language,
        onAccept: () => {
          updateFileContent(activeTabId, code)
          useUIStore.getState().closeDiffModal()
        },
      })
    }
  }

  // Drag to resize width
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)

    const startX = e.clientX
    const startWidth = aiChatWidth

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(280, Math.min(600, startWidth - (moveEvent.clientX - startX)))
      setAIChatWidth(newWidth)
    }

    const onMouseUp = () => {
      setIsResizing(false)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  if (!isAIChatOpen) return null

  return (
    <div
      style={{ width: `${aiChatWidth}px` }}
      className="flex flex-col bg-[#111118] border-l border-[#2A2A3A] relative z-20 shrink-0 h-full text-xs select-none"
    >
      {/* Left resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`absolute top-0 left-0 bottom-0 w-1 cursor-col-resize hover:bg-[#8B5CF6]/50 transition-colors z-30 ${
          isResizing ? 'bg-[#8B5CF6]' : 'bg-transparent'
        }`}
      />

      {/* Header */}
      <div className="h-10 bg-[#16161E] border-b border-[#2A2A3A] px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-[#8B5CF6]" />
          <span className="font-semibold text-white">AI Assistant</span>

          {/* Model picker */}
          {installedModels.length > 0 ? (
            <div className="relative group ml-1">
              <select
                value={selectedChatModel}
                onChange={(e) => setSelectedChatModel(e.target.value)}
                className="bg-[#0A0A0F] text-white border border-[#2A2A3A] rounded px-2 py-0.5 text-[11px] outline-none cursor-pointer pr-5"
              >
                {installedModels.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <button
              onClick={openWizard}
              className="text-[10px] text-[#8B5CF6] hover:underline flex items-center gap-1 ml-1"
            >
              Set up offline AI
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={openWizard}
            className="p-1 text-[#71717A] hover:text-white rounded hover:bg-[#1E1E2A]"
            title="AI Setup Wizard"
          >
            <Settings2 size={14} />
          </button>
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="p-1 text-[#71717A] hover:text-red-400 rounded hover:bg-[#1E1E2A]"
              title="Clear Chat History"
            >
              <Trash2 size={14} />
            </button>
          )}
          <button
            onClick={toggleAIChat}
            className="p-1 text-[#71717A] hover:text-white rounded hover:bg-[#1E1E2A]"
            title="Close Assistant"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Offline AI Assistant</h3>
              <p className="text-[11px] text-[#71717A] mt-1 max-w-[240px]">
                Ask questions about your code, request refactoring, bug fixes, or DSA optimizations.
              </p>
            </div>

            {(!isOllamaAvailable || installedModels.length === 0) && (
              <button
                onClick={openWizard}
                className="mt-2 py-2 px-3 bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white font-medium rounded-lg text-xs flex items-center gap-1.5 shadow-lg shadow-[#8B5CF6]/20 hover:opacity-95 transition-opacity"
              >
                <Sparkles size={13} /> Set up offline AI
              </button>
            )}
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              {/* Context Pill */}
              {msg.contextFiles && msg.contextFiles.length > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-[#71717A] mb-1">
                  <FileCode size={11} className="text-[#06B6D4]" />
                  <span>With {msg.contextFiles.join(', ')}</span>
                </div>
              )}

              <div
                className={`max-w-[95%] p-3 rounded-xl select-text leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#8B5CF6] text-white rounded-br-none'
                    : 'bg-[#16161E] border border-[#2A2A3A] text-[#E4E4E7] rounded-bl-none'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '')
                        const isInline = !match && !String(children).includes('\n')
                        const codeString = String(children).replace(/\n$/, '')
                        const codeId = `code-${Math.random()}`

                        if (isInline) {
                          return (
                            <code className="bg-[#0A0A0F] text-[#22D3EE] px-1 py-0.5 rounded font-mono text-[11px]">
                              {children}
                            </code>
                          )
                        }

                        return (
                          <div className="relative my-2 rounded-lg overflow-hidden border border-[#2A2A3A] bg-[#0A0A0F]">
                            {/* Code header bar */}
                            <div className="flex items-center justify-between px-3 py-1 bg-[#111118] border-b border-[#2A2A3A] text-[10px] text-[#71717A]">
                              <span className="font-mono uppercase">
                                {match ? match[1] : 'code'}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => copyToClipboard(codeString, codeId)}
                                  className="flex items-center gap-1 hover:text-white px-1.5 py-0.5 rounded hover:bg-[#1E1E2A]"
                                  title="Copy snippet"
                                >
                                  {copiedCodeId === codeId ? (
                                    <>
                                      <Check size={11} className="text-[#22C55E]" />
                                      <span className="text-[#22C55E]">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={11} />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                                {activeTabId && (
                                  <button
                                    onClick={() => applyToEditor(codeString)}
                                    className="flex items-center gap-1 text-[#8B5CF6] hover:text-[#A78BFA] px-1.5 py-0.5 rounded hover:bg-[#8B5CF6]/15"
                                    title="Replace active file with this code"
                                  >
                                    <ArrowDownToLine size={11} />
                                    <span>Apply</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            <pre className="p-3 text-[11px] font-mono overflow-x-auto text-[#E4E4E7]">
                              <code>{children}</code>
                            </pre>
                          </div>
                        )
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="p-3 border-t border-[#2A2A3A] bg-[#16161E] space-y-2 shrink-0">
        {/* Context options */}
        {activeTab && (
          <div className="flex items-center justify-between text-[11px] text-[#71717A]">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#A1A1AA]">
              <input
                type="checkbox"
                checked={includeActiveFile}
                onChange={(e) => setIncludeActiveFile(e.target.checked)}
                className="accent-[#8B5CF6] rounded"
              />
              <span className="truncate">Include {activeTab.fileName} context</span>
            </label>
          </div>
        )}

        <div className="relative flex items-end bg-[#0A0A0F] border border-[#2A2A3A] rounded-xl p-2 focus-within:border-[#8B5CF6]">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isStreaming
                ? 'AI is generating...'
                : 'Ask AI or type a code instruction... (Enter to send)'
            }
            rows={2}
            className="w-full bg-transparent resize-none text-xs text-white placeholder-[#71717A] outline-none max-h-28"
          />

          <div className="flex items-center gap-1 ml-2 shrink-0">
            {isStreaming ? (
              <button
                onClick={stopStreaming}
                className="p-1.5 bg-[#EF4444] text-white rounded-lg hover:opacity-90 transition-opacity"
                title="Stop generation"
              >
                <Square size={13} />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="p-1.5 bg-[#8B5CF6] text-white rounded-lg disabled:opacity-30 hover:opacity-90 transition-opacity"
                title="Send message"
              >
                <Send size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
