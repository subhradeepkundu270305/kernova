import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderTree, FilePlus, Check, X, RefreshCw, AlertCircle } from 'lucide-react'
import { useFileTreeStore } from '../../stores/fileTreeStore'
import { smartRouter } from '../../services/ai/router'

interface PlannedFile {
  path: string
  content: string
  selected: boolean
}

interface ScaffoldGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ScaffoldGeneratorModal: React.FC<ScaffoldGeneratorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { rootPath, refreshTree } = useFileTreeStore()
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [plannedFiles, setPlannedFiles] = useState<PlannedFile[]>([])
  const [selectedPreviewFile, setSelectedPreviewFile] = useState<PlannedFile | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGeneratePlan = async () => {
    if (!prompt.trim() || isGenerating) return
    setIsGenerating(true)
    setError(null)
    setPlannedFiles([])
    setSelectedPreviewFile(null)

    const systemPrompt = `You are a project scaffolding generator. The user will ask for a file or folder structure.
Return a valid JSON array of objects with the structure:
[
  { "path": "relative/path/to/file.ext", "content": "file content here" }
]
Only return pure JSON, no markdown code blocks, no explanations.`

    try {
      const response = await smartRouter.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ])

      let cleanJson = response.trim()
      if (cleanJson.startsWith('```json')) cleanJson = cleanJson.slice(7)
      if (cleanJson.startsWith('```')) cleanJson = cleanJson.slice(3)
      if (cleanJson.endsWith('```')) cleanJson = cleanJson.slice(0, -3)

      const parsed: { path: string; content: string }[] = JSON.parse(cleanJson.trim())
      const mapped = parsed.map((item) => ({ ...item, selected: true }))
      setPlannedFiles(mapped)
      if (mapped.length > 0) setSelectedPreviewFile(mapped[0])
    } catch (err: any) {
      setError(`Failed to generate scaffolding plan: ${err.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleApplyToDisk = async () => {
    if (!rootPath || !window.kernova) return

    try {
      for (const item of plannedFiles) {
        if (!item.selected) continue
        const fullPath = `${rootPath}/${item.path}`
        await window.kernova.createFile(fullPath, item.content)
      }
      await refreshTree()
      onClose()
    } catch (err: any) {
      setError(`Failed to write files to disk: ${err.message}`)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-6"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-3xl bg-[#111118] border border-[#2A2A3A] rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-[#16161E] border-b border-[#2A2A3A] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderTree size={18} className="text-[#8B5CF6]" />
              <h2 className="text-sm font-bold text-white">AI File & Folder Generator</h2>
            </div>
            <button onClick={onClose} className="p-1 text-[#71717A] hover:text-white rounded">
              <X size={16} />
            </button>
          </div>

          <div className="p-6 space-y-4 overflow-y-auto">
            {/* Input Prompt */}
            <div className="space-y-2">
              <label className="text-xs text-[#A1A1AA]">
                Describe the files or structure you want to scaffold:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGeneratePlan()}
                  placeholder="e.g. Create a C++ Binary Search Tree with bst.h, bst.cpp, and main.cpp"
                  className="flex-1 bg-[#0A0A0F] border border-[#2A2A3A] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#71717A] outline-none focus:border-[#8B5CF6]"
                />
                <button
                  onClick={handleGeneratePlan}
                  disabled={!prompt.trim() || isGenerating}
                  className="px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white text-xs font-semibold rounded-xl flex items-center gap-2 hover:opacity-95 disabled:opacity-40"
                >
                  {isGenerating ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <FilePlus size={14} />
                  )}
                  Generate
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            {/* Generated Plan confirmation */}
            {plannedFiles.length > 0 && (
              <div className="border border-[#2A2A3A] rounded-xl bg-[#0A0A0F] overflow-hidden flex h-64 text-xs">
                {/* Files check list */}
                <div className="w-1/3 border-r border-[#2A2A3A] p-2 space-y-1 overflow-y-auto">
                  <span className="text-[10px] text-[#71717A] font-semibold uppercase px-2">
                    Proposed Files ({plannedFiles.length})
                  </span>
                  {plannedFiles.map((file, idx) => (
                    <div
                      key={file.path}
                      onClick={() => setSelectedPreviewFile(file)}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${
                        selectedPreviewFile?.path === file.path
                          ? 'bg-[#1E1E2A] text-white'
                          : 'text-[#A1A1AA] hover:bg-[#16161E]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={file.selected}
                        onChange={(e) => {
                          const updated = [...plannedFiles]
                          updated[idx].selected = e.target.checked
                          setPlannedFiles(updated)
                        }}
                        className="accent-[#8B5CF6]"
                      />
                      <span className="truncate">{file.path}</span>
                    </div>
                  ))}
                </div>

                {/* File content preview */}
                <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] text-[#A1A1AA] bg-[#0D0D12]">
                  {selectedPreviewFile ? (
                    <pre className="whitespace-pre-wrap">{selectedPreviewFile.content}</pre>
                  ) : (
                    <div className="h-full flex items-center justify-center text-[#71717A]">
                      Select a file to preview contents
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          {plannedFiles.length > 0 && (
            <div className="px-6 py-3 bg-[#16161E] border-t border-[#2A2A3A] flex items-center justify-between">
              <span className="text-xs text-[#71717A]">
                Files will be created inside your active project directory.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-3.5 py-1.5 text-xs text-[#A1A1AA] hover:text-white rounded-lg hover:bg-[#1E1E2A]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyToDisk}
                  className="px-4 py-1.5 bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:opacity-95"
                >
                  <Check size={14} /> Confirm & Write to Disk
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
