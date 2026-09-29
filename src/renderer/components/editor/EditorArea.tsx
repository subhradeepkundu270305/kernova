import React from 'react'
import { MonacoEditor } from './MonacoEditor'
import { TabBar } from './TabBar'
import { useEditorStore } from '../../stores/editorStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useUIStore } from '../../stores/uiStore'
import { useAutoSave } from '../../hooks/useAutoSave'
import { FileCode2, Columns, X } from 'lucide-react'

// Internal wrapper to manage autosave per-tab
const ActiveEditor: React.FC<{ tabId: string }> = ({ tabId }) => {
  const { tabs, fileContents, updateFileContent, updateCursorPosition, updateScrollPosition } =
    useEditorStore()
  const { autoSave, autoSaveDelay } = useSettingsStore()

  const tab = tabs.find((t) => t.id === tabId)
  const content = fileContents[tabId] !== undefined ? fileContents[tabId] : ''

  useAutoSave(tab?.filePath || '', content, tab?.isDirty || false, autoSave, autoSaveDelay)

  if (!tab) return null

  return (
    <MonacoEditor
      key={tab.filePath}
      filePath={tab.filePath}
      content={content}
      language={tab.language}
      onChange={(newContent) => updateFileContent(tabId, newContent)}
      onCursorChange={(pos) => updateCursorPosition(tabId, pos)}
      onScrollChange={(pos) => updateScrollPosition(tabId, pos)}
    />
  )
}

import { WelcomeScreen } from '../welcome/WelcomeScreen'

export const EditorArea: React.FC = () => {
  const { tabs, activeTabId, splitActiveTabId, setSplitActiveTab } = useEditorStore()
  const { isSplitActive, toggleSplit } = useUIStore()

  if (tabs.length === 0) {
    return <WelcomeScreen />
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0A0A0F]">
      <TabBar />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Primary Editor Pane */}
        <div className="flex-1 relative overflow-hidden">
          {activeTabId && <ActiveEditor key={activeTabId} tabId={activeTabId} />}
        </div>

        {/* Split Editor Pane */}
        {isSplitActive && (
          <div className="flex-1 flex flex-col border-l border-[#2A2A3A] relative overflow-hidden bg-[#0A0A0F]">
            {/* Split pane header */}
            <div className="h-8 bg-[#111118] border-b border-[#2A2A3A] px-3 flex items-center justify-between select-none text-xs">
              <div className="flex items-center gap-2 overflow-x-auto">
                <Columns size={13} className="text-[#8B5CF6]" />
                <span className="text-[#A1A1AA] font-medium">Split View</span>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSplitActiveTab(tab.id)}
                    className={`px-2 py-0.5 rounded text-[11px] truncate max-w-[120px] ${
                      tab.id === splitActiveTabId
                        ? 'bg-[#1E1E2A] text-white border border-[#8B5CF6]/50'
                        : 'text-[#71717A] hover:text-[#A1A1AA]'
                    }`}
                  >
                    {tab.fileName}
                  </button>
                ))}
              </div>
              <button
                onClick={toggleSplit}
                className="p-1 text-[#71717A] hover:text-white rounded hover:bg-[#1E1E2A]"
                title="Close Split View"
              >
                <X size={13} />
              </button>
            </div>

            {/* Split active editor */}
            <div className="flex-1 relative overflow-hidden">
              {splitActiveTabId ? (
                <ActiveEditor key={`split-${splitActiveTabId}`} tabId={splitActiveTabId} />
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-[#71717A]">
                  Select a tab to view side-by-side
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
