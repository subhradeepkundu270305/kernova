import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings,
  Shield,
  Key,
  X,
  Check,
  AlertTriangle,
  ExternalLink,
  Cpu,
  Cloud,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { useAIStore } from '../../stores/aiStore'
import { geminiClient } from '../../services/ai/gemini'
import { groqClient } from '../../services/ai/groq'
import { openRouterClient } from '../../services/ai/openrouter'

interface AISettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({ isOpen, onClose }) => {
  const { activeProviderId, setProvider, isLocalOnly, setLocalOnly } = useAIStore()

  const [geminiKey, setGeminiKey] = useState('')
  const [groqKey, setGroqKey] = useState('')
  const [openRouterKey, setOpenRouterKey] = useState('')

  const [hasGeminiKey, setHasGeminiKey] = useState(false)
  const [hasGroqKey, setHasGroqKey] = useState(false)
  const [hasOpenRouterKey, setHasOpenRouterKey] = useState(false)

  const [testResult, setTestResult] = useState<{
    provider: string
    ok: boolean
    msg: string
  } | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Load configured keys on open
  useEffect(() => {
    if (isOpen && window.kernova) {
      window.kernova.hasSecretKey('gemini').then(setHasGeminiKey)
      window.kernova.hasSecretKey('groq').then(setHasGroqKey)
      window.kernova.hasSecretKey('openrouter').then(setHasOpenRouterKey)
    }
  }, [isOpen])

  const handleSaveKey = async (provider: string, key: string) => {
    if (!key.trim() || !window.kernova) return
    setIsSaving(true)
    await window.kernova.setSecretKey(provider, key.trim())
    if (provider === 'gemini') {
      setHasGeminiKey(true)
      setGeminiKey('')
    }
    if (provider === 'groq') {
      setHasGroqKey(true)
      setGroqKey('')
    }
    if (provider === 'openrouter') {
      setHasOpenRouterKey(true)
      setOpenRouterKey('')
    }
    setIsSaving(false)
    setTestResult({ provider, ok: true, msg: 'Key encrypted & saved safely in OS Keychain!' })
  }

  const handleDeleteKey = async (provider: string) => {
    if (!window.kernova) return
    await window.kernova.deleteSecretKey(provider)
    if (provider === 'gemini') setHasGeminiKey(false)
    if (provider === 'groq') setHasGroqKey(false)
    if (provider === 'openrouter') setHasOpenRouterKey(false)
    setTestResult(null)
  }

  const handleTestKey = async (provider: string) => {
    setTestResult(null)
    try {
      if (provider === 'gemini') {
        const ok = await geminiClient.isAvailable()
        setTestResult({
          provider,
          ok,
          msg: ok ? 'Connection verified!' : 'Connection test failed. Check key.',
        })
      } else if (provider === 'groq') {
        const ok = await groqClient.isAvailable()
        setTestResult({
          provider,
          ok,
          msg: ok ? 'Connection verified!' : 'Connection test failed. Check key.',
        })
      } else if (provider === 'openrouter') {
        const ok = await openRouterClient.isAvailable()
        setTestResult({
          provider,
          ok,
          msg: ok ? 'Connection verified!' : 'Connection test failed. Check key.',
        })
      }
    } catch (err: any) {
      setTestResult({ provider, ok: false, msg: err.message })
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 text-xs"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-xl bg-[#111118] border border-[#2A2A3A] rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-[#16161E] border-b border-[#2A2A3A] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings size={16} className="text-[#8B5CF6]" />
              <h2 className="text-sm font-bold text-white">AI Provider Settings</h2>
            </div>
            <button onClick={onClose} className="p-1 text-[#71717A] hover:text-white rounded">
              <X size={16} />
            </button>
          </div>

          <div className="p-6 space-y-5 overflow-y-auto">
            {/* Privacy Mode Switch */}
            <div className="p-4 rounded-xl border border-[#2A2A3A] bg-[#16161E] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-[#22C55E]" />
                  <span className="font-bold text-white">Local AI Only (Privacy Mode)</span>
                </div>
                <input
                  type="checkbox"
                  checked={isLocalOnly}
                  onChange={(e) => setLocalOnly(e.target.checked)}
                  className="w-4 h-4 accent-[#22C55E] cursor-pointer"
                />
              </div>
              <p className="text-[#71717A] text-[11px]">
                When enabled, KERNOVA guarantees that your code never touches cloud APIs or
                third-party servers. All AI operations run strictly via local Ollama.
              </p>
            </div>

            {/* Provider Selection */}
            <div className="space-y-2">
              <label className="font-semibold text-white">Active Provider Routing</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'auto', label: 'Smart Auto', desc: 'Cloud when online, Ollama fallback' },
                  { id: 'ollama', label: 'Local Ollama', desc: 'Always use local model' },
                  { id: 'gemini', label: 'Google Gemini', desc: 'Free API tier (online)' },
                  { id: 'groq', label: 'Groq', desc: 'Ultrafast free inference (online)' },
                  { id: 'openrouter', label: 'OpenRouter', desc: 'Free & open models' },
                ].map((p) => (
                  <button
                    key={p.id}
                    disabled={isLocalOnly && p.id !== 'ollama'}
                    onClick={() => setProvider(p.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      activeProviderId === p.id
                        ? 'border-[#8B5CF6] bg-[#8B5CF6]/15'
                        : 'border-[#2A2A3A] bg-[#0A0A0F] hover:border-[#3F3F5A]'
                    } ${isLocalOnly && p.id !== 'ollama' ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    <div className="font-bold text-white text-xs">{p.label}</div>
                    <div className="text-[10px] text-[#71717A] mt-0.5">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cloud API Keys (BYOK - Bring Your Own Key) */}
            {!isLocalOnly && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Key size={14} className="text-[#F59E0B]" />
                    Bring Your Own Free Cloud Keys (Optional)
                  </span>
                </div>

                {/* Google Gemini */}
                <div className="p-3 bg-[#0A0A0F] border border-[#2A2A3A] rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Google Gemini API</span>
                    {hasGeminiKey ? (
                      <span className="text-[10px] text-[#22C55E] flex items-center gap-1 font-medium">
                        <CheckCircle2 size={12} /> Configured
                      </span>
                    ) : (
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-[#8B5CF6] hover:underline flex items-center gap-1"
                      >
                        Get Free Key <ExternalLink size={10} />
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder={
                        hasGeminiKey ? '•••••••••••••••• (Encrypted)' : 'Paste Gemini API Key...'
                      }
                      className="flex-1 bg-[#16161E] border border-[#2A2A3A] rounded-lg px-2.5 py-1 text-xs text-white placeholder-[#71717A] outline-none"
                    />
                    <button
                      onClick={() => handleSaveKey('gemini', geminiKey)}
                      disabled={!geminiKey.trim()}
                      className="px-3 py-1 bg-[#8B5CF6] text-white rounded-lg disabled:opacity-40 font-medium"
                    >
                      Save
                    </button>
                    {hasGeminiKey && (
                      <button
                        onClick={() => handleDeleteKey('gemini')}
                        className="px-2 py-1 text-[#71717A] hover:text-red-400 rounded"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Groq */}
                <div className="p-3 bg-[#0A0A0F] border border-[#2A2A3A] rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Groq API</span>
                    {hasGroqKey ? (
                      <span className="text-[10px] text-[#22C55E] flex items-center gap-1 font-medium">
                        <CheckCircle2 size={12} /> Configured
                      </span>
                    ) : (
                      <a
                        href="https://console.groq.com/keys"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-[#8B5CF6] hover:underline flex items-center gap-1"
                      >
                        Get Free Key <ExternalLink size={10} />
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={groqKey}
                      onChange={(e) => setGroqKey(e.target.value)}
                      placeholder={
                        hasGroqKey ? '•••••••••••••••• (Encrypted)' : 'Paste Groq API Key...'
                      }
                      className="flex-1 bg-[#16161E] border border-[#2A2A3A] rounded-lg px-2.5 py-1 text-xs text-white placeholder-[#71717A] outline-none"
                    />
                    <button
                      onClick={() => handleSaveKey('groq', groqKey)}
                      disabled={!groqKey.trim()}
                      className="px-3 py-1 bg-[#8B5CF6] text-white rounded-lg disabled:opacity-40 font-medium"
                    >
                      Save
                    </button>
                    {hasGroqKey && (
                      <button
                        onClick={() => handleDeleteKey('groq')}
                        className="px-2 py-1 text-[#71717A] hover:text-red-400 rounded"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* OpenRouter */}
                <div className="p-3 bg-[#0A0A0F] border border-[#2A2A3A] rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">OpenRouter API</span>
                    {hasOpenRouterKey ? (
                      <span className="text-[10px] text-[#22C55E] flex items-center gap-1 font-medium">
                        <CheckCircle2 size={12} /> Configured
                      </span>
                    ) : (
                      <a
                        href="https://openrouter.ai/keys"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-[#8B5CF6] hover:underline flex items-center gap-1"
                      >
                        Get Free Key <ExternalLink size={10} />
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={openRouterKey}
                      onChange={(e) => setOpenRouterKey(e.target.value)}
                      placeholder={
                        hasOpenRouterKey
                          ? '•••••••••••••••• (Encrypted)'
                          : 'Paste OpenRouter API Key...'
                      }
                      className="flex-1 bg-[#16161E] border border-[#2A2A3A] rounded-lg px-2.5 py-1 text-xs text-white placeholder-[#71717A] outline-none"
                    />
                    <button
                      onClick={() => handleSaveKey('openrouter', openRouterKey)}
                      disabled={!openRouterKey.trim()}
                      className="px-3 py-1 bg-[#8B5CF6] text-white rounded-lg disabled:opacity-40 font-medium"
                    >
                      Save
                    </button>
                    {hasOpenRouterKey && (
                      <button
                        onClick={() => handleDeleteKey('openrouter')}
                        className="px-2 py-1 text-[#71717A] hover:text-red-400 rounded"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Data use warning */}
                <div className="p-3 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl flex items-start gap-2.5 text-[11px] text-[#FDE68A]">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5 text-[#F59E0B]" />
                  <span>
                    When using cloud providers, your queries and selected snippets are sent to
                    external APIs subject to their respective terms. For 100% airgapped privacy,
                    enable Local AI Only.
                  </span>
                </div>
              </div>
            )}

            {testResult && (
              <div
                className={`p-2.5 rounded-lg flex items-center gap-2 text-xs ${
                  testResult.ok ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                }`}
              >
                {testResult.ok ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                <span>{testResult.msg}</span>
              </div>
            )}
          </div>

          <div className="px-6 py-3 bg-[#16161E] border-t border-[#2A2A3A] flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#8B5CF6] text-white font-medium hover:opacity-90"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
