import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Download,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Trash2,
  ExternalLink,
  X,
  RefreshCw,
  HardDrive,
  ShieldCheck,
} from 'lucide-react'
import { useAIStore } from '../../stores/aiStore'
import { ollamaClient } from '../../services/ai/ollama'
import { RAM_MODEL_RECOMMENDATIONS, type PullProgress } from '../../services/ai/types'

export const OllamaWizard: React.FC = () => {
  const {
    isWizardOpen,
    closeWizard,
    isOllamaAvailable,
    checkOllama,
    refreshModels,
    installedModels,
    selectedChatModel,
    setSelectedChatModel,
  } = useAIStore()

  const [systemRamGB, setSystemRamGB] = useState<number>(8)
  const [selectedModelToPull, setSelectedModelToPull] = useState<string>('qwen2.5-coder:3b')
  const [pullProgress, setPullProgress] = useState<PullProgress | null>(null)
  const [isPulling, setIsPulling] = useState<boolean>(false)
  const [pullError, setPullError] = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1)

  // Detect RAM and check Ollama status on open
  useEffect(() => {
    if (isWizardOpen) {
      checkOllama()
      if (window.kernova) {
        window.kernova.getSystemRAM().then((ram) => {
          setSystemRamGB(ram.totalGB)

          // Auto-select recommended model based on RAM
          const rec = RAM_MODEL_RECOMMENDATIONS.find(
            (r) => ram.totalGB >= r.minRamGB && ram.totalGB <= r.maxRamGB
          )
          if (rec) {
            setSelectedModelToPull(rec.chatModel)
          }
        })
      }
    }
  }, [isWizardOpen, checkOllama])

  // Recommended model data for current RAM
  const recommendation =
    RAM_MODEL_RECOMMENDATIONS.find((r) => systemRamGB >= r.minRamGB && systemRamGB <= r.maxRamGB) ||
    RAM_MODEL_RECOMMENDATIONS[2] // default to 8 GB

  // Trigger one-click model download
  const handleStartDownload = async () => {
    setIsPulling(true)
    setPullError(null)
    setPullProgress({ status: 'Starting download...' })

    try {
      await ollamaClient.pullModel(selectedModelToPull, (prog) => {
        setPullProgress(prog)
      })
      await refreshModels()
      setSelectedChatModel(selectedModelToPull)
      setIsPulling(false)
      setActiveStep(3) // Success step
    } catch (err: any) {
      setIsPulling(false)
      setPullError(err.message || 'Failed to download model')
    }
  }

  // Delete an installed model
  const handleDeleteModel = async (name: string) => {
    try {
      await ollamaClient.deleteModel(name)
      await refreshModels()
    } catch (err: any) {
      alert(`Could not delete model: ${err.message}`)
    }
  }

  if (!isWizardOpen) return null

  return (
    <AnimatePresence>
      <div
        onClick={closeWizard}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-[#111118] border border-[#2A2A3A] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#2A2A3A] bg-[#16161E] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/50 flex items-center justify-center text-[#8B5CF6]">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">Set Up Offline AI</h2>
                <p className="text-xs text-[#71717A]">
                  100% private, runs entirely on your local hardware via Ollama
                </p>
              </div>
            </div>

            <button
              onClick={closeWizard}
              className="p-1.5 text-[#71717A] hover:text-white rounded-lg hover:bg-[#1E1E2A]"
            >
              <X size={18} />
            </button>
          </div>

          {/* Stepper Content */}
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Step 1: Detect Ollama Daemon */}
            <div className="bg-[#16161E] border border-[#2A2A3A] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#1E1E2A] text-xs font-semibold flex items-center justify-center text-[#8B5CF6]">
                    1
                  </span>
                  <span className="font-semibold text-sm text-white">Ollama Service Detection</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => checkOllama()}
                    className="p-1 text-[#71717A] hover:text-white rounded hover:bg-[#1E1E2A]"
                    title="Refresh Status"
                  >
                    <RefreshCw size={14} />
                  </button>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      isOllamaAvailable
                        ? 'bg-[#22C55E]/15 text-[#22C55E]'
                        : 'bg-[#EF4444]/15 text-[#EF4444]'
                    }`}
                  >
                    {isOllamaAvailable ? 'Running (localhost:11434)' : 'Not Detected'}
                  </span>
                </div>
              </div>

              {!isOllamaAvailable ? (
                <div className="mt-3 bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg p-3 text-xs space-y-2">
                  <p className="text-[#A1A1AA]">
                    Ollama is required to run local AI models. Install it in seconds:
                  </p>
                  <div className="bg-[#111118] p-2 rounded font-mono text-[11px] text-[#22D3EE] select-all border border-[#2A2A3A]">
                    curl -fsSL https://ollama.com/install.sh | sh
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[#71717A]">
                      After installing, start it via terminal with{' '}
                      <code className="text-[#A1A1AA]">ollama serve</code>
                    </span>
                    <a
                      href="https://ollama.com/download"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#8B5CF6] hover:underline flex items-center gap-1 shrink-0 font-medium"
                    >
                      Download Page <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#22C55E] flex items-center gap-1.5 mt-1">
                  <CheckCircle2 size={14} /> Local Ollama runtime is active and connected.
                </p>
              )}
            </div>

            {/* Step 2: System RAM & Model Recommendation */}
            <div className="bg-[#16161E] border border-[#2A2A3A] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#1E1E2A] text-xs font-semibold flex items-center justify-center text-[#8B5CF6]">
                    2
                  </span>
                  <span className="font-semibold text-sm text-white">
                    Hardware RAM & Model Recommendation
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#A1A1AA] bg-[#0A0A0F] px-2.5 py-1 rounded-lg border border-[#2A2A3A]">
                  <Cpu size={14} className="text-[#8B5CF6]" />
                  <span>Detected RAM: </span>
                  <strong className="text-white font-mono">{systemRamGB} GB</strong>
                </div>
              </div>

              {/* Model Choice Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                {RAM_MODEL_RECOMMENDATIONS.map((r) => {
                  const isRecommended = systemRamGB >= r.minRamGB && systemRamGB <= r.maxRamGB
                  const isSelected = selectedModelToPull === r.chatModel

                  return (
                    <div
                      key={r.chatModel}
                      onClick={() => setSelectedModelToPull(r.chatModel)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#8B5CF6]/15 border-[#8B5CF6]'
                          : 'bg-[#0A0A0F] border-[#2A2A3A] hover:border-[#3F3F5A]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white">{r.chatModel}</span>
                        {isRecommended && (
                          <span className="text-[10px] bg-[#8B5CF6] text-white px-2 py-0.5 rounded-full font-semibold">
                            Recommended
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-[#A1A1AA] mb-2">{r.description}</p>

                      <div className="flex items-center justify-between text-[10px] text-[#71717A] border-t border-[#2A2A3A]/60 pt-1.5">
                        <span className="flex items-center gap-1">
                          <ShieldCheck size={11} className="text-[#22C55E]" />
                          License: {r.license}
                        </span>
                        <span>Auto: {r.autocompleteModel}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* One-click download button & progress */}
              <div className="pt-2">
                {isPulling ? (
                  <div className="bg-[#0A0A0F] border border-[#2A2A3A] rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white font-medium flex items-center gap-2">
                        <RefreshCw size={14} className="animate-spin text-[#8B5CF6]" />
                        {pullProgress?.status || 'Downloading weights...'}
                      </span>
                      {pullProgress?.percent !== undefined && (
                        <span className="text-[#8B5CF6] font-mono font-bold">
                          {pullProgress.percent}%
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-[#1E1E2A] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] transition-all duration-300"
                        style={{ width: `${pullProgress?.percent || 5}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-[#71717A]">
                      This is a one-time download directly from the official Ollama library.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleStartDownload}
                    disabled={!isOllamaAvailable}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-95 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#8B5CF6]/20"
                  >
                    <Download size={15} />
                    Download {selectedModelToPull} (Offline AI)
                  </button>
                )}

                {pullError && (
                  <p className="text-xs text-red-400 mt-2 flex items-center gap-1.5">
                    <AlertCircle size={14} /> {pullError}
                  </p>
                )}
              </div>
            </div>

            {/* Step 3: Installed Models Manager */}
            {installedModels.length > 0 && (
              <div className="bg-[#16161E] border border-[#2A2A3A] rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-white flex items-center gap-2">
                    <HardDrive size={15} className="text-[#06B6D4]" />
                    Installed Local Models ({installedModels.length})
                  </span>
                </div>

                <div className="space-y-1.5">
                  {installedModels.map((m) => (
                    <div
                      key={m.name}
                      className="flex items-center justify-between p-2.5 bg-[#0A0A0F] border border-[#2A2A3A] rounded-lg text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-[#22C55E]" />
                        <span className="font-bold text-white">{m.name}</span>
                        {m.size && (
                          <span className="text-[11px] text-[#71717A]">
                            ({(m.size / (1024 * 1024 * 1024)).toFixed(1)} GB)
                          </span>
                        )}
                        {m.name === selectedChatModel && (
                          <span className="text-[10px] bg-[#8B5CF6]/20 text-[#8B5CF6] px-1.5 py-0.5 rounded font-medium">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {m.name !== selectedChatModel && (
                          <button
                            onClick={() => setSelectedChatModel(m.name)}
                            className="text-[11px] text-[#A1A1AA] hover:text-white px-2 py-0.5 rounded hover:bg-[#1E1E2A]"
                          >
                            Set Active
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteModel(m.name)}
                          className="p-1 text-[#71717A] hover:text-red-400 rounded"
                          title="Delete model"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-[#2A2A3A] bg-[#16161E] flex items-center justify-between">
            <span className="text-xs text-[#71717A]">
              Model weights are stored directly in your local Ollama directory.
            </span>
            <button
              onClick={closeWizard}
              className="px-4 py-1.5 rounded-lg bg-[#1E1E2A] hover:bg-[#2A2A3A] text-white text-xs font-medium transition-colors"
            >
              Done / Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
