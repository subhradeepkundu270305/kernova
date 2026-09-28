import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import '@xterm/xterm/css/xterm.css'
import { Plus, X, Terminal as TerminalIcon, ChevronDown } from 'lucide-react'
import { useTerminalStore } from '../../stores/terminalStore'
import { useUIStore } from '../../stores/uiStore'
import { useFileTreeStore } from '../../stores/fileTreeStore'

export const TerminalPanel: React.FC = () => {
  const { terminals, activeTerminalId, createTerminal, closeTerminal, setActiveTerminal } =
    useTerminalStore()
  const { isTerminalOpen, terminalHeight, setTerminalHeight, toggleTerminal } = useUIStore()
  const { rootPath } = useFileTreeStore()

  const terminalContainerRef = useRef<HTMLDivElement>(null)
  const xtermInstances = useRef<Map<string, { term: Terminal; fitAddon: FitAddon }>>(new Map())
  const [isResizing, setIsResizing] = useState(false)

  // Ensure at least one terminal exists if panel is opened
  useEffect(() => {
    if (isTerminalOpen && terminals.length === 0) {
      createTerminal(rootPath || undefined)
    }
  }, [isTerminalOpen, terminals.length, rootPath, createTerminal])

  // Setup / mount xterm for active terminal
  useEffect(() => {
    if (!isTerminalOpen || !activeTerminalId || !terminalContainerRef.current) return

    let instance = xtermInstances.current.get(activeTerminalId)
    const container = terminalContainerRef.current

    if (!instance) {
      const term = new Terminal({
        theme: {
          background: '#0D0D12',
          foreground: '#E4E4E7',
          cursor: '#8B5CF6',
          cursorAccent: '#0D0D12',
          selectionBackground: 'rgba(139, 92, 246, 0.3)',
          black: '#16161E',
          red: '#EF4444',
          green: '#22C55E',
          yellow: '#EAB308',
          blue: '#3B82F6',
          magenta: '#8B5CF6',
          cyan: '#06B6D4',
          white: '#E4E4E7',
          brightBlack: '#71717A',
          brightRed: '#F87171',
          brightGreen: '#4ADE80',
          brightYellow: '#FDE047',
          brightBlue: '#60A5FA',
          brightMagenta: '#A78BFA',
          brightCyan: '#22D3EE',
          brightWhite: '#FFFFFF',
        },
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: 13,
        lineHeight: 1.3,
        cursorBlink: true,
        cursorStyle: 'bar',
        scrollback: 5000,
        allowTransparency: true,
      })

      const fitAddon = new FitAddon()
      const webLinksAddon = new WebLinksAddon()

      term.loadAddon(fitAddon)
      term.loadAddon(webLinksAddon)

      const termDiv = document.createElement('div')
      termDiv.id = `xterm-wrapper-${activeTerminalId}`
      termDiv.style.width = '100%'
      termDiv.style.height = '100%'
      container.appendChild(termDiv)

      term.open(termDiv)
      fitAddon.fit()

      // Relay keystrokes to IPC
      term.onData((data) => {
        window.kernova?.writeTerminal({ id: activeTerminalId, data })
      })

      // Inform main process of initial size
      window.kernova?.resizeTerminal({
        id: activeTerminalId,
        cols: term.cols,
        rows: term.rows,
      })

      instance = { term, fitAddon }
      xtermInstances.current.set(activeTerminalId, instance)
    }

    // Toggle visibility of xterm divs
    container.childNodes.forEach((child) => {
      const el = child as HTMLElement
      if (el.id === `xterm-wrapper-${activeTerminalId}`) {
        el.style.display = 'block'
      } else {
        el.style.display = 'none'
      }
    })

    setTimeout(() => {
      instance?.fitAddon.fit()
      instance?.term.focus()
    }, 50)
  }, [activeTerminalId, isTerminalOpen])

  // Listen for terminal output data from main process
  useEffect(() => {
    if (!window.kernova) return

    const unsubData = window.kernova.onTerminalData(({ id, data }) => {
      const instance = xtermInstances.current.get(id)
      if (instance) {
        instance.term.write(data)
      }
    })

    const unsubExit = window.kernova.onTerminalExit(({ id }) => {
      closeTerminal(id)
    })

    return () => {
      unsubData()
      unsubExit()
    }
  }, [closeTerminal])

  // Window resize handler to fit active terminal
  useEffect(() => {
    const handleResize = () => {
      if (activeTerminalId) {
        const instance = xtermInstances.current.get(activeTerminalId)
        if (instance) {
          instance.fitAddon.fit()
          window.kernova?.resizeTerminal({
            id: activeTerminalId,
            cols: instance.term.cols,
            rows: instance.term.rows,
          })
        }
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [activeTerminalId])

  // Drag to resize terminal panel height
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsResizing(true)

      const startY = e.clientY
      const startHeight = terminalHeight

      const onMouseMove = (moveEvent: MouseEvent) => {
        const newHeight = Math.max(120, Math.min(600, startHeight - (moveEvent.clientY - startY)))
        setTerminalHeight(newHeight)
        if (activeTerminalId) {
          const instance = xtermInstances.current.get(activeTerminalId)
          instance?.fitAddon.fit()
        }
      }

      const onMouseUp = () => {
        setIsResizing(false)
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
      }

      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
    },
    [terminalHeight, setTerminalHeight, activeTerminalId]
  )

  if (!isTerminalOpen) return null

  return (
    <div
      style={{ height: `${terminalHeight}px` }}
      className="flex flex-col bg-[#0D0D12] border-t border-[#2A2A3A] relative z-20 shrink-0"
    >
      {/* Top resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`absolute top-0 left-0 right-0 h-1 cursor-row-resize hover:bg-[#8B5CF6]/50 transition-colors ${
          isResizing ? 'bg-[#8B5CF6]' : 'bg-transparent'
        }`}
      />

      {/* Header bar */}
      <div className="h-8 flex items-center justify-between px-3 bg-[#111118] border-b border-[#2A2A3A] select-none text-xs">
        <div className="flex items-center gap-1 overflow-x-auto">
          <span className="flex items-center gap-1.5 text-[#A1A1AA] font-semibold mr-2">
            <TerminalIcon size={14} className="text-[#8B5CF6]" />
            TERMINAL
          </span>

          {terminals.map((t) => (
            <div
              key={t.id}
              onClick={() => setActiveTerminal(t.id)}
              className={`flex items-center gap-2 px-2.5 py-1 rounded cursor-pointer transition-colors ${
                t.id === activeTerminalId
                  ? 'bg-[#1E1E2A] text-white border-b-2 border-[#8B5CF6]'
                  : 'text-[#71717A] hover:text-[#A1A1AA] hover:bg-[#16161E]'
              }`}
            >
              <span>{t.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  closeTerminal(t.id)
                  const wrapper = document.getElementById(`xterm-wrapper-${t.id}`)
                  if (wrapper) wrapper.remove()
                  xtermInstances.current.delete(t.id)
                }}
                className="hover:text-red-400 p-0.5 rounded"
              >
                <X size={12} />
              </button>
            </div>
          ))}

          <button
            onClick={() => createTerminal(rootPath || undefined)}
            className="p-1 text-[#71717A] hover:text-white hover:bg-[#1E1E2A] rounded transition-colors"
            title="New Terminal"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTerminal}
            className="text-[#71717A] hover:text-white p-1 rounded hover:bg-[#1E1E2A] transition-colors"
            title="Close Panel"
          >
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* xterm canvas container */}
      <div ref={terminalContainerRef} className="flex-1 overflow-hidden p-2 bg-[#0D0D12]" />
    </div>
  )
}
