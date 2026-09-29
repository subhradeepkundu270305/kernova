import React from 'react'
import { X, Circle, Play, Columns } from 'lucide-react'
import { FileIcon } from '../common/FileIcon'
import { useEditorStore } from '../../stores/editorStore'
import { useUIStore } from '../../stores/uiStore'
import { useTerminalStore } from '../../stores/terminalStore'
import { useFileTreeStore } from '../../stores/fileTreeStore'

export const TabBar: React.FC = () => {
  const { tabs, activeTabId, setActiveTab, closeTab, reorderTabs } = useEditorStore()
  const { isSplitActive, toggleSplit, isTerminalOpen, toggleTerminal } = useUIStore()
  const { terminals, activeTerminalId, createTerminal } = useTerminalStore()
  const { rootPath } = useFileTreeStore()

  if (tabs.length === 0) return null

  const handleTabClose = async (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation()
    const tab = tabs.find((t) => t.id === tabId)
    if (!tab) return

    if (tab.isDirty) {
      const result = await window.kernova?.showMessageBox({
        type: 'warning',
        title: 'Unsaved Changes',
        message: `Do you want to save the changes you made to ${tab.fileName}?`,
        buttons: ['Save', 'Cancel', "Don't Save"],
      })

      if (result === 0) {
        const content = useEditorStore.getState().fileContents[tab.id] || ''
        await window.kernova?.writeFile(tab.filePath, content)
        useEditorStore.getState().markSaved(tab.id)
      } else if (result === 1) {
        return // Cancel
      }
    }

    closeTab(tabId)
  }

  const handleMiddleClick = (e: React.MouseEvent, tabId: string) => {
    if (e.button === 1) {
      e.preventDefault()
      handleTabClose(e, tabId)
    }
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('tabIndex', index.toString())
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    const dragIndex = parseInt(e.dataTransfer.getData('tabIndex'), 10)
    if (dragIndex !== dropIndex) {
      reorderTabs(dragIndex, dropIndex)
    }
  }

  const handleRunActiveFile = async () => {
    const activeTab = tabs.find((t) => t.id === activeTabId)
    if (!activeTab || !window.kernova) return

    // Save if dirty
    if (activeTab.isDirty) {
      const content = useEditorStore.getState().fileContents[activeTab.id] || ''
      await window.kernova.writeFile(activeTab.filePath, content)
      useEditorStore.getState().markSaved(activeTab.id)
    }

    // Open terminal if not already visible
    if (!isTerminalOpen) {
      toggleTerminal()
    }

    // Ensure at least one terminal exists
    let termId = activeTerminalId
    if (!termId || terminals.length === 0) {
      termId = await createTerminal(rootPath || undefined)
    }

    // Determine execution command based on extension
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
  }

  return (
    <div className="flex h-[35px] bg-[#0A0A0F] border-b border-[#2A2A3A] select-none glassmorphism items-center justify-between">
      {/* Tab strip */}
      <div className="flex-1 flex overflow-x-auto custom-scrollbar h-full">
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTabId
          return (
            <div
              key={tab.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, index)}
              onClick={() => setActiveTab(tab.id)}
              onAuxClick={(e) => handleMiddleClick(e, tab.id)}
              className={`flex items-center justify-between px-3 min-w-[120px] max-w-[200px] border-r border-[#2A2A3A] cursor-pointer group transition-colors ${
                isActive
                  ? 'bg-surface-2 border-b-2'
                  : 'bg-surface-1 hover:bg-surface-2 text-secondary hover:text-primary border-b-2 border-b-transparent'
              }`}
              style={isActive ? { borderBottomColor: 'var(--color-primary)' } : undefined}
            >
              <div className="flex items-center overflow-hidden mr-2">
                <FileIcon fileName={tab.fileName} size={14} className="mr-2 shrink-0" />
                <span className={`text-sm truncate ${isActive ? 'text-primary' : ''}`}>
                  {tab.fileName}
                </span>
              </div>

              <div className="flex items-center">
                {tab.isDirty && !isActive ? (
                  <Circle size={10} fill="#E4E4E7" className="text-primary mr-1" />
                ) : (
                  <button
                    onClick={(e) => handleTabClose(e, tab.id)}
                    className={`p-0.5 rounded-sm opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all ${
                      tab.isDirty ? 'opacity-100' : ''
                    }`}
                  >
                    {tab.isDirty ? (
                      <div className="w-3 h-3 flex items-center justify-center group-hover:hidden">
                        <Circle size={10} fill="#E4E4E7" className="text-primary" />
                      </div>
                    ) : null}
                    <X size={14} className={tab.isDirty ? 'hidden group-hover:block' : ''} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Editor top-right actions */}
      <div className="flex items-center px-2 gap-1 border-l border-[#2A2A3A] shrink-0 h-full bg-[#0E0E15]">
        <button
          onClick={handleRunActiveFile}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded transition-colors"
          title="Run Active File in Terminal"
        >
          <Play size={13} fill="currentColor" />
          <span>Run</span>
        </button>
        <button
          onClick={toggleSplit}
          className={`p-1.5 rounded transition-colors ${
            isSplitActive
              ? 'text-white'
              : 'text-[#71717A] hover:text-[#E4E4E7] hover:bg-[#1E1E2A]'
          }`}
          style={isSplitActive ? { color: 'var(--color-primary)' } : undefined}
          title="Toggle Split View (Ctrl+\)"
        >
          <Columns size={14} />
        </button>
      </div>
    </div>
  )
}
