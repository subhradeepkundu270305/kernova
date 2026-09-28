import React, { useState } from 'react'
import { FolderOpen, RefreshCw } from 'lucide-react'
import { useFileTreeStore } from '../../stores/fileTreeStore'
import { FileTreeItem } from './FileTreeItem'
import { ContextMenu, ContextMenuItem } from './ContextMenu'

export const FileExplorer: React.FC = () => {
  const { rootPath, rootName, tree, openFolder, refreshTree, createFile, createFolder } =
    useFileTreeStore()
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

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

  const menuItems: ContextMenuItem[] = [
    {
      label: 'New File',
      onClick: async () => {
        const name = 'new_file.txt' // In a real app we might want to prompt, or do what VSCode does
        if (rootPath) await createFile(rootPath, name)
      },
    },
    {
      label: 'New Folder',
      onClick: async () => {
        const name = 'new_folder'
        if (rootPath) await createFolder(rootPath, name)
      },
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
            className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm rounded transition-colors"
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
    >
      <div className="flex items-center justify-between p-3 border-b border-[#2A2A3A]">
        <span
          className="uppercase text-xs font-semibold text-muted tracking-wider truncate"
          title={rootPath}
        >
          {rootName}
        </span>
        <div className="flex space-x-1">
          <button
            onClick={refreshTree}
            className="p-1 hover:bg-white/10 rounded text-muted hover:text-primary transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={handleOpenFolder}
            className="p-1 hover:bg-white/10 rounded text-muted hover:text-primary transition-colors"
            title="Open Folder"
          >
            <FolderOpen size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="py-2">
          {tree.map((node) => (
            <FileTreeItem key={node.path} node={node} level={0} />
          ))}
          {tree.length === 0 && (
            <div className="px-4 py-2 text-muted text-sm italic">Folder is empty</div>
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
