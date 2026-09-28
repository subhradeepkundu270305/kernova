import React, { useState, useEffect } from 'react'
import { Minus, Square, Maximize2, X, Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { useUIStore } from '../../stores/uiStore'
import appLogo from '../../assets/logo.png'

export const Titlebar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false)
  const { openGeneralSettings } = useUIStore()

  useEffect(() => {
    if (window.kernova) {
      window.kernova.isMaximized().then(setIsMaximized)
      const cleanup = window.kernova.onMaximizeChange((maximized) => {
        setIsMaximized(maximized)
      })
      return cleanup
    }
  }, [])

  const handleMinimize = () => window.kernova?.minimize()
  const handleMaximize = () => window.kernova?.maximize()
  const handleClose = () => window.kernova?.close()

  return (
    <div
      className={cn(
        'h-[38px] flex items-center justify-between shrink-0',
        'glassmorphism border-b border-[#2A2A3A]',
        'select-none'
      )}
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left side: Logo & Title */}
      <div className="flex items-center px-4 gap-2.5 h-full">
        <img src={appLogo} alt="KERNOVA" className="w-5 h-5 rounded-md object-contain shadow-sm" />
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-sm tracking-wide text-gradient">KERNOVA</span>
          <span className="text-xs text-[#71717A]">Offline AI Code Editor</span>
        </div>
      </div>

      {/* Right side: Window Controls & Settings */}
      <div
        className="flex h-full items-center"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={openGeneralSettings}
          className="h-full px-3 text-[#71717A] hover:text-white hover:bg-[#1E1E2A] transition-colors flex items-center justify-center focus:outline-none"
          title="Settings (Preferences)"
        >
          <Settings size={15} />
        </button>
        <motion.button
          whileHover={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' }}
          onClick={handleMinimize}
          className="h-full px-4 text-[#A1A1AA] transition-colors flex items-center justify-center focus:outline-none"
          title="Minimize"
        >
          <Minus size={16} />
        </motion.button>
        <motion.button
          whileHover={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#EAB308' }}
          onClick={handleMaximize}
          className="h-full px-4 text-[#A1A1AA] transition-colors flex items-center justify-center focus:outline-none"
          title={isMaximized ? 'Restore Down' : 'Maximize'}
        >
          {isMaximized ? <Square size={14} /> : <Maximize2 size={14} />}
        </motion.button>
        <motion.button
          whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.9)', color: '#FFFFFF' }}
          onClick={handleClose}
          className="h-full px-4 text-[#A1A1AA] transition-colors flex items-center justify-center focus:outline-none"
          title="Close"
        >
          <X size={16} />
        </motion.button>
      </div>
    </div>
  )
}
