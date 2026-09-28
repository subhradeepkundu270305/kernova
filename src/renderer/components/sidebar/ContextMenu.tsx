import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

export interface ContextMenuItem {
  label: string
  shortcut?: string
  onClick: () => void
  danger?: boolean
}

export interface ContextMenuProps {
  x: number
  y: number
  items: ContextMenuItem[]
  onClose: () => void
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  // Ensure menu doesn't go off screen
  let adjustedX = x
  let adjustedY = y

  if (menuRef.current) {
    const rect = menuRef.current.getBoundingClientRect()
    if (x + rect.width > window.innerWidth) adjustedX = window.innerWidth - rect.width
    if (y + rect.height > window.innerHeight) adjustedY = window.innerHeight - rect.height
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        style={{ left: adjustedX, top: adjustedY }}
        className="fixed z-50 min-w-[200px] bg-surface-2 border border-[#2A2A3A] shadow-xl rounded-md py-1 glassmorphism"
        onContextMenu={(e) => e.preventDefault()}
      >
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              item.onClick()
              onClose()
            }}
            className={`w-full text-left px-3 py-1.5 text-sm flex justify-between items-center hover:bg-white/5 ${
              item.danger ? 'text-red-400 hover:text-red-300' : 'text-primary'
            }`}
          >
            <span>{item.label}</span>
            {item.shortcut && <span className="text-muted text-xs">{item.shortcut}</span>}
          </button>
        ))}
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
