import React, { useState, useRef, useEffect } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { FileTreeNode } from '../../../shared/types'
import { useFileTreeStore } from '../../stores/fileTreeStore'
import { useEditorStore } from '../../stores/editorStore'
import { ContextMenu, ContextMenuItem } from './ContextMenu'
import { FileIcon } from '../common/FileIcon'
import { motion } from 'framer-motion'

interface FileTreeItemProps {
  node: FileTreeNode
  level: number
}

const getParentPath = (path: string) => {
  const parts = path.split(/[/\\]/)
  parts.pop()
  return parts.join('/')
}

export const FileTreeItem: React.FC<FileTreeItemProps> = ({ node, level }) => {
  const {
    rootPath,
    toggleExpand,
    selectNode,
    selectedPath,
    deleteItem,
    renameItem,
    createFile,
    createFolder,
    creationTarget,
    startCreation,
    cancelCreation,
  } = useFileTreeStore()
  const { openFile } = useEditorStore()

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(node.name)
  const [newItemValue, setNewItemValue] = useState('')

  const renameInputRef = useRef<HTMLInputElement>(null)
  const newItemInputRef = useRef<HTMLInputElement>(null)

  const isSelected = selectedPath === node.path
  const isCreatingHere = Boolean(creationTarget && creationTarget.parentPath === node.path)

  // Focus and select basename on rename
  useEffect(() => {
    if (isRenaming) {
      setRenameValue(node.name)
      setTimeout(() => {
        if (renameInputRef.current) {
          renameInputRef.current.focus()
          const dotIdx = node.name.lastIndexOf('.')
          if (dotIdx > 0 && node.type !== 'directory') {
            renameInputRef.current.setSelectionRange(0, dotIdx)
          } else {
            renameInputRef.current.select()
          }
        }
      }, 50)
    }
  }, [isRenaming, node.name, node.type])

  // Focus on new item input
  useEffect(() => {
    if (isCreatingHere) {
      setNewItemValue('')
      setTimeout(() => {
        newItemInputRef.current?.focus()
      }, 50)
    }
  }, [isCreatingHere, creationTarget?.type])

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'F2') {
      e.stopPropagation()
      setIsRenaming(true)
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    selectNode(node.path)
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const handleRenameSubmit = async (e?: React.KeyboardEvent | React.FocusEvent) => {
    if (e && 'key' in e && e.key === 'Escape') {
      setIsRenaming(false)
      setRenameValue(node.name)
      return
    }

    setIsRenaming(false)
    const trimmed = renameValue.trim()
    if (trimmed && trimmed !== node.name) {
      try {
        await renameItem(node.path, trimmed)
      } catch (err) {
        console.error('Rename failed:', err)
      }
    } else {
      setRenameValue(node.name)
    }
  }

  const handleNewItemSubmit = async (e?: React.KeyboardEvent | React.FocusEvent) => {
    if (e && 'key' in e && e.key === 'Escape') {
      cancelCreation()
      setNewItemValue('')
      return
    }

    const trimmed = newItemValue.trim()
    if (trimmed && creationTarget) {
      const type = creationTarget.type
      try {
        if (type === 'file') {
          await createFile(node.path, trimmed)
        } else {
          await createFolder(node.path, trimmed)
        }
      } catch (err) {
        console.error('Failed to create item in folder:', err)
      }
    } else {
      cancelCreation()
    }
    setNewItemValue('')
  }

  const handleDuplicate = async () => {
    if (node.type === 'directory') return
    try {
      const dotIdx = node.name.lastIndexOf('.')
      let newName = ''
      if (dotIdx > 0) {
        const base = node.name.slice(0, dotIdx)
        const ext = node.name.slice(dotIdx)
        newName = `${base}_copy${ext}`
      } else {
        newName = `${node.name}_copy`
      }
      const parent = getParentPath(node.path)
      const content = await window.kernova.readFile(node.path)
      const sep = parent.includes('\\') ? '\\' : '/'
      const newPath = `${parent}${sep}${newName}`
      await window.kernova.createFile(newPath, content)
      await useFileTreeStore.getState().refreshTree()
      await openFile(newPath)
    } catch (err) {
      console.error('Duplicate failed:', err)
    }
  }

  const menuItems: ContextMenuItem[] = []

  if (node.type === 'directory') {
    menuItems.push(
      {
        label: 'New File...',
        onClick: () => {
          startCreation(node.path, 'file')
        },
      },
      {
        label: 'New Folder...',
        onClick: () => {
          startCreation(node.path, 'folder')
        },
      }
    )
  } else {
    const parent = getParentPath(node.path)
    menuItems.push(
      {
        label: 'New File...',
        onClick: () => {
          startCreation(parent, 'file')
        },
      },
      {
        label: 'New Folder...',
        onClick: () => {
          startCreation(parent, 'folder')
        },
      }
    )
  }

  menuItems.push(
    {
      label: 'Rename',
      onClick: () => setIsRenaming(true),
    }
  )

  if (node.type !== 'directory') {
    menuItems.push({
      label: 'Duplicate',
      onClick: handleDuplicate,
    })
  }

  menuItems.push(
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
    {
      label: 'Copy Path',
      onClick: () => navigator.clipboard.writeText(node.path),
    },
    {
      label: 'Copy Relative Path',
      onClick: () => {
        if (!rootPath) return
        const rel = node.path.replace(rootPath, '').replace(/^[/\\]/, '')
        navigator.clipboard.writeText(rel)
      },
    }
  )

  return (
    <div>
      <div
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={`flex items-center py-1 cursor-pointer select-none group outline-none ${
          isSelected
            ? 'bg-[#8B5CF6]/15 text-white'
            : 'text-zinc-300 hover:bg-white/5 hover:text-white'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      >
        {/* Directory chevron or file indent */}
        <div className="flex items-center justify-center w-4 h-4 mr-1 opacity-70 shrink-0">
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
            <span className="w-4 h-4" />
          )}
        </div>

        {/* Dedicated File Extension / Folder Icon */}
        <div className="mr-1.5 flex items-center justify-center shrink-0">
          <FileIcon
            fileName={node.name}
            isDirectory={node.type === 'directory'}
            isOpen={node.isExpanded}
            size={14}
          />
        </div>

        {/* Name or Inline Rename Input */}
        {isRenaming ? (
          <input
            ref={renameInputRef}
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit(e)
              if (e.key === 'Escape') handleRenameSubmit(e)
            }}
            onBlur={handleRenameSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1A1A24] text-white border border-[#8B5CF6] rounded-sm outline-none text-xs px-1.5 py-0.5 w-full font-mono shadow-sm"
          />
        ) : (
          <span className="text-xs truncate font-mono text-zinc-200 group-hover:text-white">
            {node.name}
          </span>
        )}
      </div>

      {/* Directory Children & Inline New Item Input */}
      {node.type === 'directory' && node.isExpanded && (
        <div>
          {/* Inline Input when creating inside this directory */}
          {isCreatingHere && (
            <div
              className="flex items-center py-1 bg-[#8B5CF6]/10 border-l-2 border-[#8B5CF6]"
              style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-4 h-4 mr-1 flex items-center justify-center shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
              </div>
              <div className="mr-1.5 flex items-center justify-center shrink-0">
                <FileIcon
                  fileName={newItemValue}
                  isDirectory={creationTarget?.type === 'folder'}
                  isOpen={false}
                  size={14}
                />
              </div>
              <input
                ref={newItemInputRef}
                type="text"
                value={newItemValue}
                onChange={(e) => setNewItemValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNewItemSubmit(e)
                  if (e.key === 'Escape') handleNewItemSubmit(e)
                }}
                onBlur={handleNewItemSubmit}
                placeholder={
                  creationTarget?.type === 'file'
                    ? 'file name (e.g. script.py)'
                    : 'folder name'
                }
                className="bg-[#1A1A24] text-white border border-[#8B5CF6] rounded-sm outline-none text-xs px-1.5 py-0.5 w-full font-mono placeholder:text-zinc-500 shadow-sm"
              />
            </div>
          )}

          {node.children?.map((child) => (
            <FileTreeItem key={child.path} node={child} level={level + 1} />
          ))}
        </div>
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
