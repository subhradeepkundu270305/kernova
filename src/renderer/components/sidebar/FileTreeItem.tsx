import React, { useState } from 'react'
import { File, Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react'
import { FileTreeNode } from '../../../shared/types'
import { useFileTreeStore } from '../../stores/fileTreeStore'
import { useEditorStore } from '../../stores/editorStore'
import { ContextMenu, ContextMenuItem } from './ContextMenu'
import { motion } from 'framer-motion'

interface FileTreeItemProps {
  node: FileTreeNode
  level: number
}

export const FileTreeItem: React.FC<FileTreeItemProps> = ({ node, level }) => {
  const {
    toggleExpand,
    selectNode,
    selectedPath,
    deleteItem,
    renameItem,
    createFile,
    createFolder,
  } = useFileTreeStore()
  const { openFile } = useEditorStore()

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(node.name)
  const [newItemType, setNewItemType] = useState<'file' | 'folder' | null>(null)
  const [newItemValue, setNewItemValue] = useState('')

  const isSelected = selectedPath === node.path

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    selectNode(node.path)
    if (node.type === 'directory') {
      toggleExpand(node.path)
    } else {
      openFile(node.path)
    }
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsRenaming(true)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    selectNode(node.path)
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const handleRenameSubmit = async (e: React.KeyboardEvent | React.FocusEvent) => {
    if ('key' in e && e.key === 'Escape') {
      setIsRenaming(false)
      setRenameValue(node.name)
      return
    }

    if (('key' in e && e.key === 'Enter') || e.type === 'blur') {
      setIsRenaming(false)
      if (renameValue.trim() && renameValue !== node.name) {
        await renameItem(node.path, renameValue.trim())
      } else {
        setRenameValue(node.name)
      }
    }
  }

  const handleNewItemSubmit = async (e: React.KeyboardEvent | React.FocusEvent) => {
    if ('key' in e && e.key === 'Escape') {
      setNewItemType(null)
      setNewItemValue('')
      return
    }

    if (('key' in e && e.key === 'Enter') || e.type === 'blur') {
      if (newItemValue.trim()) {
        if (newItemType === 'file') {
          await createFile(node.path, newItemValue.trim())
        } else {
          await createFolder(node.path, newItemValue.trim())
        }
      }
      setNewItemType(null)
      setNewItemValue('')
    }
  }

  const menuItems: ContextMenuItem[] = []

  if (node.type === 'directory') {
    menuItems.push(
      {
        label: 'New File',
        onClick: () => {
          if (!node.isExpanded) toggleExpand(node.path)
          setNewItemType('file')
        },
      },
      {
        label: 'New Folder',
        onClick: () => {
          if (!node.isExpanded) toggleExpand(node.path)
          setNewItemType('folder')
        },
      }
    )
  }

  menuItems.push(
    { label: 'Rename', onClick: () => setIsRenaming(true) },
    {
      label: 'Delete',
      danger: true,
      onClick: async () => {
        const confirm = await window.kernova.showMessageBox({
          type: 'warning',
          title: 'Confirm Delete',
          message: `Are you sure you want to delete '${node.name}'?`,
          buttons: ['Cancel', 'Delete'],
        })
        if (confirm === 1) await deleteItem(node.path)
      },
    },
    { label: 'Copy Path', onClick: () => navigator.clipboard.writeText(node.path) }
  )

  return (
    <div>
      <div
        className={`flex items-center py-1 cursor-pointer select-none group ${
          isSelected
            ? 'bg-[#8B5CF6]/10 text-primary'
            : 'text-secondary hover:bg-white/5 hover:text-primary'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      >
        <div className="flex items-center justify-center w-4 h-4 mr-1 opacity-70">
          {node.type === 'directory' ? (
            node.isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-3 h-3 rounded-full border border-t-violet-500"
              />
            ) : node.isExpanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )
          ) : (
            <span className="w-4 h-4" /> // Spacing for files
          )}
        </div>

        <div className="mr-1.5 flex items-center justify-center">
          {node.type === 'directory' ? (
            node.isExpanded ? (
              <FolderOpen size={14} color="#8B5CF6" />
            ) : (
              <Folder size={14} color="#8B5CF6" />
            )
          ) : (
            <File size={14} color="#A1A1AA" />
          )}
        </div>

        {isRenaming ? (
          <input
            autoFocus
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={handleRenameSubmit}
            onBlur={handleRenameSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-3 text-primary border border-[#8B5CF6] outline-none text-sm px-1 py-0 w-full"
          />
        ) : (
          <span className="text-sm truncate">{node.name}</span>
        )}
      </div>

      {node.type === 'directory' && node.isExpanded && (
        <>
          {newItemType && (
            <div
              className="flex items-center py-1"
              style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}
            >
              <div className="w-4 h-4 mr-1" />
              <div className="mr-1.5 flex items-center justify-center">
                {newItemType === 'folder' ? (
                  <Folder size={14} color="#8B5CF6" />
                ) : (
                  <File size={14} color="#A1A1AA" />
                )}
              </div>
              <input
                autoFocus
                type="text"
                value={newItemValue}
                onChange={(e) => setNewItemValue(e.target.value)}
                onKeyDown={handleNewItemSubmit}
                onBlur={handleNewItemSubmit}
                className="bg-surface-3 text-primary border border-[#8B5CF6] outline-none text-sm px-1 py-0 w-full"
              />
            </div>
          )}
          {node.children?.map((child) => (
            <FileTreeItem key={child.path} node={child} level={level + 1} />
          ))}
        </>
      )}

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
