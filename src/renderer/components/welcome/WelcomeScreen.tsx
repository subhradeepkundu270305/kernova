import React from 'react'
import { motion } from 'framer-motion'
import {
  FolderOpen,
  FilePlus,
  Sparkles,
  FolderTree,
  Terminal,
  Columns,
  Search,
  Command,
  HelpCircle,
} from 'lucide-react'
import { ThreeBackground } from './ThreeBackground'
import { useFileTreeStore } from '../../stores/fileTreeStore'
import { useEditorStore } from '../../stores/editorStore'
import { useUIStore } from '../../stores/uiStore'
import appLogo from '../../assets/logo.png'

export const WelcomeScreen: React.FC = () => {
  const { openFolder, rootPath } = useFileTreeStore()
  const { openFile } = useEditorStore()
  const { openWizard, openScaffoldModal, openCommandPalette, toggleTerminal, toggleSplit } =
    useUIStore()

  const handleOpenFolder = async () => {
    if (window.kernova) {
      const folder = await window.kernova.showOpenFolderDialog()
      if (folder) openFolder(folder)
    }
  }

  const handleNewFile = async () => {
    if (rootPath && window.kernova) {
      const filePath = `${rootPath}/untitled-${Date.now().toString().slice(-4)}.ts`
      await window.kernova.createFile(filePath, '// New file in KERNOVA\n')
      await openFile(filePath)
    } else {
      openCommandPalette('commands')
    }
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[#0A0A0F] text-[#E4E4E7] select-none p-6">
      {/* 3D Particle Canvas Background */}
      <ThreeBackground />

      {/* Foreground Content Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-3xl flex flex-col items-center text-center space-y-8"
      >
        {/* Logo and Brand */}
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-[#16161E]/80 border border-[#2A2A3A] shadow-xl backdrop-blur-md">
            <img
              src={appLogo}
              alt="KERNOVA"
              className="w-14 h-14 rounded-xl object-contain shadow-lg"
            />
          </div>

          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gradient">KERNOVA</h1>
            <p className="text-sm font-semibold text-[#A1A1AA] tracking-wide mt-1">
              Offline AI Code Editor
            </p>
            <p className="text-xs text-[#71717A] italic mt-0.5">
              &ldquo;Code locally. Think intelligently.&rdquo;
            </p>
          </div>
        </div>

        {/* Quick Action Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
          <button
            onClick={handleOpenFolder}
            className="flex flex-col items-center p-4 rounded-2xl bg-[#111118]/80 hover:bg-[#16161E] border border-[#2A2A3A] hover:border-[#8B5CF6]/50 transition-all group backdrop-blur-md"
          >
            <div className="p-2.5 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] group-hover:scale-110 transition-transform mb-2">
              <FolderOpen size={20} />
            </div>
            <span className="text-xs font-bold text-white">Open Folder</span>
            <span className="text-[10px] text-[#71717A] mt-0.5">Browse workspace</span>
          </button>

          <button
            onClick={handleNewFile}
            className="flex flex-col items-center p-4 rounded-2xl bg-[#111118]/80 hover:bg-[#16161E] border border-[#2A2A3A] hover:border-[#06B6D4]/50 transition-all group backdrop-blur-md"
          >
            <div className="p-2.5 rounded-xl bg-[#06B6D4]/10 text-[#06B6D4] group-hover:scale-110 transition-transform mb-2">
              <FilePlus size={20} />
            </div>
            <span className="text-xs font-bold text-white">New File</span>
            <span className="text-[10px] text-[#71717A] mt-0.5">Start coding</span>
          </button>

          <button
            onClick={openWizard}
            className="flex flex-col items-center p-4 rounded-2xl bg-[#111118]/80 hover:bg-[#16161E] border border-[#2A2A3A] hover:border-[#8B5CF6]/50 transition-all group backdrop-blur-md"
          >
            <div className="p-2.5 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] group-hover:scale-110 transition-transform mb-2">
              <Sparkles size={20} />
            </div>
            <span className="text-xs font-bold text-white">Setup Offline AI</span>
            <span className="text-[10px] text-[#71717A] mt-0.5">Ollama & Qwen 2.5</span>
          </button>

          <button
            onClick={openScaffoldModal}
            className="flex flex-col items-center p-4 rounded-2xl bg-[#111118]/80 hover:bg-[#16161E] border border-[#2A2A3A] hover:border-[#10B981]/50 transition-all group backdrop-blur-md"
          >
            <div className="p-2.5 rounded-xl bg-[#10B981]/10 text-[#10B981] group-hover:scale-110 transition-transform mb-2">
              <FolderTree size={20} />
            </div>
            <span className="text-xs font-bold text-white">AI Scaffolding</span>
            <span className="text-[10px] text-[#71717A] mt-0.5">Generate structures</span>
          </button>
        </div>

        {/* Shortcuts Cheat Sheet */}
        <div className="w-full bg-[#111118]/60 border border-[#2A2A3A] rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3 text-xs text-[#A1A1AA] font-semibold border-b border-[#2A2A3A]/60 pb-2">
            <span className="flex items-center gap-1.5">
              <Command size={14} className="text-[#8B5CF6]" /> Keyboard Shortcuts
            </span>
            <span className="text-[10px] text-[#71717A]">Quick reference</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 text-xs text-left">
            <div className="flex items-center justify-between">
              <span className="text-[#A1A1AA]">Command Palette</span>
              <kbd className="font-mono text-[10px] bg-[#1E1E2A] text-[#71717A] px-1.5 py-0.5 rounded border border-[#2A2A3A]">
                Ctrl+Shift+P
              </kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A1A1AA]">Quick File Open</span>
              <kbd className="font-mono text-[10px] bg-[#1E1E2A] text-[#71717A] px-1.5 py-0.5 rounded border border-[#2A2A3A]">
                Ctrl+P
              </kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A1A1AA]">Toggle Terminal</span>
              <kbd className="font-mono text-[10px] bg-[#1E1E2A] text-[#71717A] px-1.5 py-0.5 rounded border border-[#2A2A3A]">
                Ctrl+`
              </kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A1A1AA]">Split Editor</span>
              <kbd className="font-mono text-[10px] bg-[#1E1E2A] text-[#71717A] px-1.5 py-0.5 rounded border border-[#2A2A3A]">
                Ctrl+\
              </kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A1A1AA]">Toggle AI Chat</span>
              <kbd className="font-mono text-[10px] bg-[#1E1E2A] text-[#71717A] px-1.5 py-0.5 rounded border border-[#2A2A3A]">
                Ctrl+Shift+I
              </kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A1A1AA]">Run Code</span>
              <kbd className="font-mono text-[10px] bg-[#1E1E2A] text-emerald-400 px-1.5 py-0.5 rounded border border-[#2A2A3A]">
                F5
              </kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A1A1AA]">Focus Mode</span>
              <kbd className="font-mono text-[10px] bg-[#1E1E2A] text-[#71717A] px-1.5 py-0.5 rounded border border-[#2A2A3A]">
                Ctrl+Shift+F11
              </kbd>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
