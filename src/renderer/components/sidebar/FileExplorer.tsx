import React, { useState, useRef, useEffect } from 'react'
import {
  FolderOpen,
  RefreshCw,
  FilePlus,
  FolderPlus,
  ChevronsDownUp,
} from 'lucide-react'
import { useFileTreeStore } from '../../stores/fileTreeStore'
import { FileTreeItem } from './FileTreeItem'
import { ContextMenu, ContextMenuItem } from './ContextMenu'
import { FileIcon } from '../common/FileIcon'

export const FileExplorer: React.FC = () => {
  const {
    rootPath,
    rootName,
    tree,
    openFolder,
    refreshTree,
    collapseAll,
    selectNode,
    creationTarget,
    startCreation,
    cancelCreation,
    createFile,
    createFolder,
  } = useFileTreeStore()

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [rootNewItemValue, setRootNewItemValue] = useState('')
  const rootInputRef = useRef<HTMLInputElement>(null)

  const isCreatingAtRoot = Boolean(creationTarget && creationTarget.parentPath === rootPath)

  useEffect(() => {
    if (isCreatingAtRoot) {
      setRootNewItemValue('')
      setTimeout(() => {
        rootInputRef.current?.focus()
      }, 50)
    }
  }, [isCreatingAtRoot, creationTarget?.type])

  const handleOpenFolder = async () => {
    const folderPath = await window.kernova.showOpenFolderDialog()
    if (folderPath) {
      await openFolder(folderPath)
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!rootPath) return
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const handleRootSubmit = async (e?: React.KeyboardEvent | React.FocusEvent) => {
    if (e && 'key' in e && e.key === 'Escape') {
      cancelCreation()
      setRootNewItemValue('')
      return
    }

    const trimmed = rootNewItemValue.trim()
    if (trimmed && rootPath && creationTarget) {
      const type = creationTarget.type
      try {
        if (type === 'file') {
          await createFile(rootPath, trimmed)
        } else {
          await createFolder(rootPath, trimmed)
        }
      } catch (err) {
        console.error('Failed to create item at root:', err)
      }
    } else {
      cancelCreation()
    }
    setRootNewItemValue('')
  }

  const menuItems: ContextMenuItem[] = [
    {
      label: 'New File...',
      onClick: () => {
        startCreation(rootPath || undefined, 'file')
      },
    },
    {
      label: 'New Folder...',
      onClick: () => {
        startCreation(rootPath || undefined, 'folder')
      },
    },
    {
      label: 'Refresh Explorer',
      onClick: refreshTree,
    },
    {
      label: 'Collapse All Folders',
      onClick: collapseAll,
    },
    {
      label: 'Open Another Folder...',
      onClick: handleOpenFolder,
    },
  ]

  if (!rootPath) {
    return (
      <div className="h-full w-full flex flex-col glassmorphism bg-surface-1">
        <div className="p-4 uppercase text-xs font-semibold text-muted tracking-wider">
          Explorer
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <FolderOpen size={48} className="text-muted mb-4 opacity-50" />
          <p className="text-secondary text-sm mb-4">No folder opened</p>
          <button
            onClick={handleOpenFolder}
            className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm rounded transition-colors shadow-lg shadow-[#8B5CF6]/20"
          >
            Open Folder
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="h-full w-full flex flex-col glassmorphism bg-surface-1 select-none"
      onContextMenu={handleContextMenu}
      onClick={() => selectNode(null)}
    >
      {/* Explorer Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2A2A3A] bg-[#0E0E14]/60">
        <span
          className="uppercase text-[11px] font-bold text-muted tracking-wider truncate mr-2"
          title={rootPath}
        >
          {rootName}
        </span>
        <div className="flex items-center space-x-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation()
              startCreation(undefined, 'file')
            }}
            className="p-1 hover:bg-white/10 rounded text-muted hover:text-white transition-colors"
            title="New File"
          >
            <FilePlus size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              startCreation(undefined, 'folder')
            }}
            className="p-1 hover:bg-white/10 rounded text-muted hover:text-white transition-colors"
            title="New Folder"
          >
            <FolderPlus size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              refreshTree()
            }}
            className="p-1 hover:bg-white/10 rounded text-muted hover:text-white transition-colors"
            title="Refresh Explorer"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              collapseAll()
            }}
            className="p-1 hover:bg-white/10 rounded text-muted hover:text-white transition-colors"
            title="Collapse All Folders"
          >
            <ChevronsDownUp size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleOpenFolder()
            }}
            className="p-1 hover:bg-white/10 rounded text-muted hover:text-white transition-colors"
            title="Open Folder"
          >
            <FolderOpen size={14} />
          </button>
        </div>
      </div>

      {/* Explorer Tree List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="py-1">
          {/* Root-level Inline New File/Folder Input */}
          {isCreatingAtRoot && (
            <div
              className="flex items-center py-1 px-2 bg-[#8B5CF6]/10 border-l-2 border-[#8B5CF6]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-4 h-4 mr-1 flex items-center justify-center shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
              </div>
              <div className="mr-2 flex items-center justify-center shrink-0">
                <FileIcon
                  fileName={rootNewItemValue}
                  isDirectory={creationTarget?.type === 'folder'}
                  isOpen={false}
                  size={14}
                />
              </div>
              <input
                ref={rootInputRef}
                type="text"
                value={rootNewItemValue}
                onChange={(e) => setRootNewItemValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRootSubmit(e)
                  if (e.key === 'Escape') handleRootSubmit(e)
                }}
                onBlur={handleRootSubmit}
                placeholder={
                  creationTarget?.type === 'file'
                    ? 'file name (e.g. main.py)'
                    : 'folder name'
                }
                className="bg-[#1A1A24] text-white border border-[#8B5CF6] rounded-sm outline-none text-xs px-1.5 py-0.5 w-full font-mono placeholder:text-zinc-500 shadow-sm"
              />
            </div>
          )}

          {tree.map((node) => (
            <FileTreeItem key={node.path} node={node} level={0} />
          ))}

          {tree.length === 0 && !isCreatingAtRoot && (
            <div className="px-4 py-3 text-muted text-xs italic">
              Folder is empty. Click <span className="text-primary font-medium">+ File</span> or{' '}
              <span className="text-primary font-medium">+ Folder</span> above to start.
            </div>
          )}
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={menuItems}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  )
}

