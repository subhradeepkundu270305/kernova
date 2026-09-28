import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import * as monaco from 'monaco-editor'
import { Titlebar } from './components/titlebar/Titlebar'
import { EditorArea } from './components/editor/EditorArea'
import { FileExplorer } from './components/sidebar/FileExplorer'
import { SearchPanel } from './components/search/SearchPanel'
import { TerminalPanel } from './components/terminal/TerminalPanel'
import { StatusBar } from './components/statusbar/StatusBar'
import { CommandPalette } from './components/command-palette/CommandPalette'
import { ChatPanel } from './components/ai/ChatPanel'
import { OllamaWizard } from './components/ai/OllamaWizard'
import { AISettingsModal } from './components/settings/AISettingsModal'
import { GeneralSettingsModal } from './components/settings/GeneralSettingsModal'
import { ScaffoldGeneratorModal } from './components/ai/ScaffoldGeneratorModal'
import { DiffPreviewModal } from './components/ai/DiffPreviewModal'

import { useUIStore } from './stores/uiStore'
import { useSessionRestore } from './hooks/useSessionRestore'
import { useFileWatcher } from './hooks/useFileWatcher'
import { useEditorStore } from './stores/editorStore'
import { useFileTreeStore } from './stores/fileTreeStore'
import { useAIStore } from './stores/aiStore'
import { useTerminalStore } from './stores/terminalStore'

import { Files, Search, Terminal as TerminalIcon, Sparkles } from 'lucide-react'
import { registerMonacoThemes } from './themes'
import { useSettingsStore } from './stores/settingsStore'

const App: React.FC = () => {
  const { isRestoring } = useSessionRestore()
  useFileWatcher()

  const {
    isSidebarOpen,
    sidebarTab,
    setSidebarTab,
    sidebarWidth,
    setSidebarWidth,
    toggleSidebar,
    toggleTerminal,
    toggleSplit,
    toggleFocusMode,
    toggleAIChat,
    openCommandPalette,
    isFocusMode,
    isAISettingsOpen,
    closeAISettings,
    isGeneralSettingsOpen,
    closeGeneralSettings,
    isScaffoldModalOpen,
    closeScaffoldModal,
    diffModalData,
    closeDiffModal,
  } = useUIStore()

  const { activeTabId, tabs, markSaved } = useEditorStore()
  const { rootPath } = useFileTreeStore()
  const { checkOllama } = useAIStore()

  const { loadSettings, editorTheme } = useSettingsStore()
  const [isDragging, setIsDragging] = useState(false)

  // Register Monaco themes and load persisted preferences on mount
  useEffect(() => {
    registerMonacoThemes(monaco)
    loadSettings()
    checkOllama()
  }, [checkOllama, loadSettings])

  // Sync Monaco editor theme whenever it changes
  useEffect(() => {
    try {
      monaco.editor.setTheme(editorTheme)
    } catch {
      // Ignore if editor not ready
    }
  }, [editorTheme])

  // Global keybindings
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Ctrl+Shift+P -> Command Palette
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault()
        openCommandPalette('commands')
        return
      }

      // Ctrl+P -> Quick File Open
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault()
        openCommandPalette('files')
        return
      }

      // Ctrl+` -> Toggle Terminal
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault()
        toggleTerminal()
        return
      }

      // Ctrl+\ -> Toggle Split Editor
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault()
        toggleSplit()
        return
      }

      // Ctrl+B -> Toggle Sidebar
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'B' || e.key === 'b')) {
        e.preventDefault()
        toggleSidebar()
        return
      }

      // Ctrl+Shift+F -> Find in Project
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
        e.preventDefault()
        setSidebarTab('search')
        return
      }

      // Ctrl+Shift+I -> Toggle AI Chat
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault()
        toggleAIChat()
        return
      }

      // Ctrl+Shift+F11 -> Toggle Focus Mode
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F11') {
        e.preventDefault()
        toggleFocusMode()
        return
      }

      // F5 -> Run Active File in Terminal
      if (e.key === 'F5') {
        e.preventDefault()
        if (activeTabId && window.kernova) {
          const tab = tabs.find((t) => t.id === activeTabId)
          if (tab) {
            if (tab.isDirty) {
              const content = useEditorStore.getState().fileContents[tab.id] || ''
              await window.kernova.writeFile(tab.filePath, content)
              markSaved(tab.id)
            }
            if (!useUIStore.getState().isTerminalOpen) {
              toggleTerminal()
            }
            let termId = useTerminalStore.getState().activeTerminalId
            if (!termId || useTerminalStore.getState().terminals.length === 0) {
              termId = await useTerminalStore
                .getState()
                .createTerminal(useFileTreeStore.getState().rootPath || undefined)
            }
            const ext = tab.fileName.split('.').pop()?.toLowerCase() || ''
            const quotedPath = `"${tab.filePath}"`
            let cmd = ''
            switch (ext) {
              case 'py':
                cmd = `python3 ${quotedPath}`
                break
              case 'js':
              case 'mjs':
                cmd = `node ${quotedPath}`
                break
              case 'ts':
                cmd = `npx tsx ${quotedPath}`
                break
              case 'sh':
              case 'bash':
                cmd = `bash ${quotedPath}`
                break
              case 'cpp':
              case 'cc':
                cmd = `g++ ${quotedPath} -o /tmp/kernova_bin && /tmp/kernova_bin`
                break
              case 'c':
                cmd = `gcc ${quotedPath} -o /tmp/kernova_bin && /tmp/kernova_bin`
                break
              case 'go':
                cmd = `go run ${quotedPath}`
                break
              case 'rs':
                cmd = `rustc ${quotedPath} -o /tmp/kernova_bin && /tmp/kernova_bin`
                break
              case 'java':
                cmd = `java ${quotedPath}`
                break
              default:
                cmd = `cat ${quotedPath}`
            }
            setTimeout(() => {
              const activeId = useTerminalStore.getState().activeTerminalId || termId
              if (activeId && window.kernova) {
                window.kernova.writeTerminal({ id: activeId, data: `${cmd}\r` })
              }
            }, 250)
          }
        }
        return
      }

      // Ctrl+S -> Manual Save Active File
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault()
        if (activeTabId && window.kernova) {
          const tab = tabs.find((t) => t.id === activeTabId)
          if (tab) {
            const content = useEditorStore.getState().fileContents[tab.id] || ''
            await window.kernova.writeFile(tab.filePath, content)
            markSaved(tab.id)
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    openCommandPalette,
    toggleTerminal,
    toggleSplit,
    toggleSidebar,
    setSidebarTab,
    toggleAIChat,
    toggleFocusMode,
    activeTabId,
    tabs,
    markSaved,
  ])

  // Save session state on exit
  useEffect(() => {
    const handleBeforeUnload = () => {
      window.kernova?.setSession({
        openFolderPath: useFileTreeStore.getState().rootPath,
        openTabs: useEditorStore.getState().tabs,
        activeTabId: useEditorStore.getState().activeTabId,
        sidebarWidth: useUIStore.getState().sidebarWidth,
        sidebarOpen: useUIStore.getState().isSidebarOpen,
        splitActive: useUIStore.getState().isSplitActive,
        splitActiveTabId: useEditorStore.getState().splitActiveTabId,
        terminalOpen: useUIStore.getState().isTerminalOpen,
        terminalHeight: useUIStore.getState().terminalHeight,
      })
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // Drag resize handler for sidebar
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    e.preventDefault()
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(180, Math.min(e.clientX - 44, 520))
      setSidebarWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, setSidebarWidth])

  if (isRestoring) {
    return (
      <div className="h-screen w-full bg-[#0A0A0F] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-8 h-8 rounded-full border-2 border-[#2A2A3A] border-t-[#8B5CF6]"
        />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col h-screen w-full bg-[#0A0A0F] text-[#E4E4E7] overflow-hidden select-none"
    >
      {/* Titlebar */}
      <Titlebar />

      {/* Main workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Activity Bar */}
        {!isFocusMode && (
          <aside className="w-11 bg-[#111118] border-r border-[#2A2A3A] flex flex-col items-center py-2 gap-2 shrink-0 z-20">
            <button
              onClick={() => {
                if (isSidebarOpen && sidebarTab === 'files') {
                  toggleSidebar()
                } else {
                  setSidebarTab('files')
                }
              }}
              className={`p-2 rounded-lg transition-colors ${
                isSidebarOpen && sidebarTab === 'files'
                  ? 'text-white'
                  : 'text-[#71717A] hover:text-[#A1A1AA] hover:bg-[#1E1E2A]'
              }`}
              style={
                isSidebarOpen && sidebarTab === 'files'
                  ? { color: 'var(--color-primary)', backgroundColor: 'var(--color-primary-glow)' }
                  : undefined
              }
              title="Explorer (Ctrl+B)"
            >
              <Files size={18} />
            </button>

            <button
              onClick={() => {
                if (isSidebarOpen && sidebarTab === 'search') {
                  toggleSidebar()
                } else {
                  setSidebarTab('search')
                }
              }}
              className={`p-2 rounded-lg transition-colors ${
                isSidebarOpen && sidebarTab === 'search'
                  ? 'text-white'
                  : 'text-[#71717A] hover:text-[#A1A1AA] hover:bg-[#1E1E2A]'
              }`}
              style={
                isSidebarOpen && sidebarTab === 'search'
                  ? { color: 'var(--color-primary)', backgroundColor: 'var(--color-primary-glow)' }
                  : undefined
              }
              title="Search (Ctrl+Shift+F)"
            >
              <Search size={18} />
            </button>

            <div className="flex-1" />

            <button
              onClick={toggleAIChat}
              className="p-2 hover:opacity-90 rounded-lg transition-colors"
              style={{ color: 'var(--color-primary)' }}
              title="AI Assistant (Ctrl+Shift+I)"
            >
              <Sparkles size={18} />
            </button>

            <button
              onClick={toggleTerminal}
              className="p-2 text-[#71717A] hover:text-[#A1A1AA] hover:bg-[#1E1E2A] rounded-lg transition-colors"
              title="Terminal (Ctrl+`)"
            >
              <TerminalIcon size={18} />
            </button>
          </aside>
        )}

        {/* Sidebar (Explorer or Search) */}
        {!isFocusMode && isSidebarOpen && (
          <div
            style={{ width: sidebarWidth }}
            className="flex-shrink-0 relative overflow-hidden flex flex-col"
          >
            {sidebarTab === 'files' ? <FileExplorer /> : <SearchPanel />}

            {/* Drag resize handle */}
            <div
              className="absolute top-0 right-0 w-[4px] h-full cursor-col-resize z-20 transition-colors hover:opacity-80"
              style={{ backgroundColor: isDragging ? 'var(--color-primary)' : undefined }}
              onMouseDown={handleMouseDown}
            >
              {isDragging && (
                <div
                  className="absolute top-0 left-0 w-full h-full"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />
              )}
            </div>
          </div>
        )}

        {/* Center column: Editor on top, Terminal on bottom */}
        <main className="flex-1 overflow-hidden flex flex-col relative">
          <div className="flex-1 overflow-hidden flex flex-col">
            <EditorArea />
          </div>

          <TerminalPanel />
        </main>

        {/* AI Assistant Chat Panel */}
        {!isFocusMode && <ChatPanel />}
      </div>

      {/* Status Bar */}
      {!isFocusMode && <StatusBar />}

      {/* Command Palette Overlay */}
      <CommandPalette />

      {/* Offline AI Setup Wizard Modal */}
      <OllamaWizard />

      {/* AI Settings Modal */}
      <AISettingsModal isOpen={isAISettingsOpen} onClose={closeAISettings} />

      {/* General Preferences Modal */}
      <GeneralSettingsModal isOpen={isGeneralSettingsOpen} onClose={closeGeneralSettings} />

      {/* Scaffold Generator Modal */}
      <ScaffoldGeneratorModal isOpen={isScaffoldModalOpen} onClose={closeScaffoldModal} />

      {/* Diff Preview Modal */}
      {diffModalData && (
        <DiffPreviewModal
          isOpen={!!diffModalData}
          originalCode={diffModalData.originalCode}
          modifiedCode={diffModalData.modifiedCode}
          fileName={diffModalData.fileName}
          language={diffModalData.language}
          onAccept={diffModalData.onAccept}
          onReject={closeDiffModal}
        />
      )}
    </motion.div>
  )
}

export default App
