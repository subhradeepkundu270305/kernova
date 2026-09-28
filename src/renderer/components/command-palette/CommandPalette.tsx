import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Command,
  FileCode,
  FolderOpen,
  Terminal,
  Columns,
  Palette,
  Eye,
  Sparkles,
  Save,
  Sidebar,
  Settings,
  FolderPlus,
  Play,
} from 'lucide-react'
import { useUIStore } from '../../stores/uiStore'
import { useFileTreeStore } from '../../stores/fileTreeStore'
import { useEditorStore } from '../../stores/editorStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useTerminalStore } from '../../stores/terminalStore'
import type { FileTreeNode } from '../../../shared/types'

interface PaletteCommand {
  id: string
  title: string
  category: string
  shortcut?: string
  icon: React.ReactNode
  action: () => void
}

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    commandPaletteMode,
    closeCommandPalette,
    toggleTerminal,
    toggleSplit,
    toggleSidebar,
    toggleFocusMode,
    toggleAIChat,
    setSidebarTab,
  } = useUIStore()

  const { rootPath, tree, openFolder } = useFileTreeStore()
  const { openFile, activeTabId, tabs, markSaved } = useEditorStore()
  const { updateSetting } = useSettingsStore()

  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when opened
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isCommandPaletteOpen])

  // Flatten file tree for Quick Open (Ctrl+P)
  const allProjectFiles = useMemo(() => {
    const files: { name: string; path: string }[] = []
    const traverse = (nodes: FileTreeNode[]) => {
      for (const node of nodes) {
        if (node.type === 'file') {
          files.push({ name: node.name, path: node.path })
        }
        if (node.children) {
          traverse(node.children)
        }
      }
    }
    traverse(tree)
    return files
  }, [tree])

  // Built-in commands list for Ctrl+Shift+P
  const commands: PaletteCommand[] = useMemo(
    () => [
      {
        id: 'file:open-folder',
        title: 'Open Folder...',
        category: 'File',
        shortcut: 'Ctrl+O',
        icon: <FolderOpen size={14} className="text-[#8B5CF6]" />,
        action: async () => {
          const folder = await window.kernova?.showOpenFolderDialog()
          if (folder) openFolder(folder)
        },
      },
      {
        id: 'file:save',
        title: 'Save Current File',
        category: 'File',
        shortcut: 'Ctrl+S',
        icon: <Save size={14} className="text-[#22D3EE]" />,
        action: async () => {
          if (!activeTabId || !window.kernova) return
          const tab = tabs.find((t) => t.id === activeTabId)
          if (tab) {
            const content = useEditorStore.getState().fileContents[tab.filePath] || ''
            await window.kernova.writeFile(tab.filePath, content)
            markSaved(tab.id)
          }
        },
      },
      {
        id: 'terminal:run-active-file',
        title: 'Run Active File in Terminal',
        category: 'Terminal',
        shortcut: 'F5',
        icon: <Play size={14} className="text-[#10B981]" />,
        action: async () => {
          const activeTab = tabs.find((t) => t.id === activeTabId)
          if (!activeTab || !window.kernova) return

          if (activeTab.isDirty) {
            const content = useEditorStore.getState().fileContents[activeTab.id] || ''
            await window.kernova.writeFile(activeTab.filePath, content)
            markSaved(activeTab.id)
          }

          const uiStore = useUIStore.getState()
          if (!uiStore.isTerminalOpen) {
            uiStore.toggleTerminal()
          }

          const terminalStore = useTerminalStore.getState()
          let termId = terminalStore.activeTerminalId
          if (!termId || terminalStore.terminals.length === 0) {
            termId = await terminalStore.createTerminal(rootPath || undefined)
          }

          const ext = activeTab.fileName.split('.').pop()?.toLowerCase() || ''
          const quotedPath = `"${activeTab.filePath}"`
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
            const targetTermId = useTerminalStore.getState().activeTerminalId || termId
            if (targetTermId && window.kernova) {
              window.kernova.writeTerminal({ id: targetTermId, data: `${cmd}\r` })
            }
          }, 250)
        },
      },
      {
        id: 'view:toggle-terminal',
        title: 'Toggle Integrated Terminal',
        category: 'View',
        shortcut: 'Ctrl+`',
        icon: <Terminal size={14} className="text-[#F59E0B]" />,
        action: toggleTerminal,
      },
      {
        id: 'view:toggle-split',
        title: 'Toggle Split Editor View',
        category: 'View',
        shortcut: 'Ctrl+\\',
        icon: <Columns size={14} className="text-[#8B5CF6]" />,
        action: toggleSplit,
      },
      {
        id: 'view:toggle-sidebar',
        title: 'Toggle Sidebar Explorer',
        category: 'View',
        shortcut: 'Ctrl+B',
        icon: <Sidebar size={14} className="text-[#A1A1AA]" />,
        action: toggleSidebar,
      },
      {
        id: 'view:search-project',
        title: 'Find Across Project',
        category: 'View',
        shortcut: 'Ctrl+Shift+F',
        icon: <Search size={14} className="text-[#06B6D4]" />,
        action: () => setSidebarTab('search'),
      },
      {
        id: 'view:toggle-focus',
        title: 'Toggle Focus Mode',
        category: 'View',
        shortcut: 'Ctrl+Shift+F11',
        icon: <Eye size={14} className="text-[#EC4899]" />,
        action: toggleFocusMode,
      },
      {
        id: 'ai:toggle-chat',
        title: 'Toggle AI Assistant Chat',
        category: 'AI',
        shortcut: 'Ctrl+Shift+I',
        icon: <Sparkles size={14} className="text-[#8B5CF6]" />,
        action: toggleAIChat,
      },
      {
        id: 'ai:settings',
        title: 'AI: Configure Providers & Cloud Keys (BYOK)',
        category: 'AI',
        icon: <Settings size={14} className="text-[#06B6D4]" />,
        action: () => useUIStore.getState().openAISettings(),
      },
      {
        id: 'ai:scaffold',
        title: 'AI: Generate Project Scaffolding (Files & Folders)',
        category: 'AI',
        icon: <FolderPlus size={14} className="text-[#10B981]" />,
        action: () => useUIStore.getState().openScaffoldModal(),
      },
      {
        id: 'theme:midnight',
        title: 'Preferences: Color Theme - Midnight (Default)',
        category: 'Preferences',
        icon: <Palette size={14} className="text-[#8B5CF6]" />,
        action: () => updateSetting('editorTheme', 'midnight'),
      },
      {
        id: 'theme:aurora',
        title: 'Preferences: Color Theme - Aurora (Emerald)',
        category: 'Preferences',
        icon: <Palette size={14} className="text-[#34D399]" />,
        action: () => updateSetting('editorTheme', 'aurora'),
      },
      {
        id: 'theme:ember',
        title: 'Preferences: Color Theme - Ember (Warm Dark)',
        category: 'Preferences',
        icon: <Palette size={14} className="text-[#FB923C]" />,
        action: () => updateSetting('editorTheme', 'ember'),
      },
    ],
    [
      activeTabId,
      tabs,
      openFolder,
      toggleTerminal,
      toggleSplit,
      toggleSidebar,
      toggleFocusMode,
      toggleAIChat,
      setSidebarTab,
      updateSetting,
      markSaved,
    ]
  )

  // Filter items according to mode
  const filteredItems = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (commandPaletteMode === 'files') {
      if (!q) return allProjectFiles.slice(0, 20)
      return allProjectFiles
        .filter((f) => f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q))
        .slice(0, 20)
    } else {
      if (!q) return commands
      return commands.filter(
        (c) => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
      )
    }
  }, [commandPaletteMode, query, allProjectFiles, commands])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeCommandPalette()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(
        (prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length)
      )
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredItems.length === 0) return

      const item = filteredItems[selectedIndex]
      if (commandPaletteMode === 'files') {
        const file = item as { name: string; path: string }
        openFile(file.path)
      } else {
        const cmd = item as PaletteCommand
        cmd.action()
      }
      closeCommandPalette()
    }
  }

  if (!isCommandPaletteOpen) return null

  return (
    <AnimatePresence>
      <div
        onClick={closeCommandPalette}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-24"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-xl bg-[#16161E] border border-[#2A2A3A] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Input header */}
          <div className="flex items-center px-4 py-3 border-b border-[#2A2A3A] bg-[#111118]">
            {commandPaletteMode === 'files' ? (
              <FileCode size={18} className="text-[#8B5CF6] mr-3" />
            ) : (
              <Command size={18} className="text-[#8B5CF6] mr-3" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSelectedIndex(0)
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                commandPaletteMode === 'files'
                  ? 'Type the name of a file to open...'
                  : 'Type a command or search...'
              }
              className="flex-1 bg-transparent text-sm text-white placeholder-[#71717A] outline-none"
            />
            <span className="text-[10px] text-[#71717A] bg-[#1E1E2A] px-2 py-0.5 rounded border border-[#2A2A3A]">
              ESC to close
            </span>
          </div>

          {/* Results list */}
          <div className="max-h-80 overflow-y-auto p-1.5 space-y-0.5">
            {filteredItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#71717A]">No results found</div>
            ) : (
              filteredItems.map((item, index) => {
                const isSelected = index === selectedIndex

                if (commandPaletteMode === 'files') {
                  const file = item as { name: string; path: string }
                  return (
                    <div
                      key={file.path}
                      onClick={() => {
                        openFile(file.path)
                        closeCommandPalette()
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs transition-colors ${
                        isSelected
                          ? 'bg-[#8B5CF6]/15 text-white border-l-2 border-[#8B5CF6]'
                          : 'text-[#A1A1AA] hover:bg-[#1E1E2A] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <FileCode size={14} className="text-[#8B5CF6] shrink-0" />
                        <span className="font-medium text-white truncate">{file.name}</span>
                        <span className="text-[11px] text-[#71717A] truncate">{file.path}</span>
                      </div>
                    </div>
                  )
                }

                const cmd = item as PaletteCommand
                return (
                  <div
                    key={cmd.id}
                    onClick={() => {
                      cmd.action()
                      closeCommandPalette()
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs transition-colors ${
                      isSelected
                        ? 'bg-[#8B5CF6]/15 text-white border-l-2 border-[#8B5CF6]'
                        : 'text-[#A1A1AA] hover:bg-[#1E1E2A] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {cmd.icon}
                      <span className="text-[#71717A] font-semibold">{cmd.category}:</span>
                      <span className="font-medium text-white">{cmd.title}</span>
                    </div>

                    {cmd.shortcut && (
                      <kbd className="text-[10px] font-mono text-[#71717A] bg-[#1E1E2A] px-1.5 py-0.5 rounded border border-[#2A2A3A]">
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
