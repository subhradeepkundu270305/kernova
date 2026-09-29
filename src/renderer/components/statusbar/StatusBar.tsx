import React, { useEffect, useState } from 'react'
import {
  GitBranch,
  Wifi,
  WifiOff,
  Cpu,
  Terminal,
  CircleAlert,
  FileCode,
  Sparkles,
} from 'lucide-react'
import { useEditorStore } from '../../stores/editorStore'
import { useFileTreeStore } from '../../stores/fileTreeStore'
import { useUIStore } from '../../stores/uiStore'
import type { GitStatusResult } from '../../../shared/types'

export const StatusBar: React.FC = () => {
  const { activeTabId, tabs } = useEditorStore()
  const { rootPath } = useFileTreeStore()
  const { toggleTerminal, isTerminalOpen, toggleAIChat } = useUIStore()

  const [gitStatus, setGitStatus] = useState<GitStatusResult | null>(null)
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 })

  // Find active tab
  const activeTab = tabs.find((t) => t.id === activeTabId)

  // Track cursor position of active tab
  useEffect(() => {
    if (activeTab?.cursorPosition) {
      setCursorPos({
        line: activeTab.cursorPosition.lineNumber,
        col: activeTab.cursorPosition.column,
      })
    }
  }, [activeTab?.cursorPosition])

  // Periodic Git status refresh when folder is open
  useEffect(() => {
    if (!rootPath || !window.kernova) {
      setGitStatus(null)
      return
    }

    const checkGit = async () => {
      try {
        const res = await window.kernova.getGitStatus(rootPath)
        setGitStatus(res)
      } catch {
        setGitStatus(null)
      }
    }

    checkGit()
    const interval = setInterval(checkGit, 5000)
    return () => clearInterval(interval)
  }, [rootPath])

  // Periodic Online / Offline check
  useEffect(() => {
    const checkNetwork = async () => {
      // If browser/OS indicates offline (Airplane mode, no default route), reflect immediately
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setIsOnline(false)
        return
      }

      if (window.kernova) {
        try {
          const online = await window.kernova.checkOnline()
          setIsOnline(online)
        } catch {
          setIsOnline(false)
        }
      } else {
        setIsOnline(Boolean(navigator.onLine))
      }
    }

    const handleOnline = () => {
      checkNetwork()
    }
    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    checkNetwork()
    const interval = setInterval(checkNetwork, 10000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  return (
    <footer className="h-6 bg-[#0D0D12] border-t border-[#2A2A3A] px-3 flex items-center justify-between text-[11px] text-[#71717A] select-none z-30 shrink-0">
      {/* Left segment */}
      <div className="flex items-center gap-3">
        {/* Git branch */}
        {gitStatus?.isRepo ? (
          <div
            className="flex items-center gap-1.5 text-[#A1A1AA] hover:text-white cursor-pointer transition-colors"
            title={`Branch: ${gitStatus.branch}`}
          >
            <GitBranch size={13} className="text-[#8B5CF6]" />
            <span className="font-medium">{gitStatus.branch}</span>
            {!gitStatus.isClean && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308]" title="Uncommitted changes" />
            )}
          </div>
        ) : null}

        {/* Current active file */}
        {activeTab && (
          <div
            className="flex items-center gap-1 text-[#A1A1AA] truncate max-w-[200px]"
            title={activeTab.filePath}
          >
            <FileCode size={12} className="text-[#06B6D4]" />
            <span className="truncate">{activeTab.fileName}</span>
          </div>
        )}

        {/* Terminal toggle indicator */}
        <button
          onClick={toggleTerminal}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#1E1E2A] transition-colors ${
            isTerminalOpen ? 'text-[#8B5CF6]' : 'text-[#71717A] hover:text-[#A1A1AA]'
          }`}
          title="Toggle Terminal (Ctrl+`)"
        >
          <Terminal size={12} />
          <span>Terminal</span>
        </button>
      </div>

      {/* Right segment */}
      <div className="flex items-center gap-4">
        {/* Cursor position */}
        {activeTab && (
          <span className="font-mono text-[#A1A1AA]">
            Ln {cursorPos.line}, Col {cursorPos.col}
          </span>
        )}

        {/* Encoding */}
        <span className="text-[#71717A]">UTF-8</span>

        {/* Language */}
        {activeTab && (
          <span className="capitalize text-[#A1A1AA] font-medium hover:text-white cursor-pointer">
            {activeTab.language}
          </span>
        )}

        {/* Active AI Status */}
        <button
          onClick={toggleAIChat}
          className="flex items-center gap-1.5 text-[#8B5CF6] hover:text-[#A78BFA] transition-colors"
          title="AI Assistant (Ollama default)"
        >
          <Sparkles size={12} className="animate-pulse" />
          <span>AI: Local (Ollama)</span>
        </button>

        {/* Online / Offline status indicator */}
        <div
          className={`flex items-center gap-1 font-semibold text-[10px] tracking-wide px-1.5 py-0.5 rounded ${
            isOnline ? 'text-[#22C55E] bg-[#22C55E]/10' : 'text-[#EAB308] bg-[#EAB308]/10'
          }`}
          title={isOnline ? 'Internet connection active' : 'Offline Mode (Local AI ready)'}
        >
          {isOnline ? <Wifi size={11} /> : <WifiOff size={11} />}
          <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
      </div>
    </footer>
  )
}
