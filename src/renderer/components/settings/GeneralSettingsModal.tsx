import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Palette, Type, Save, Eye, Sliders, X, Check, Zap } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import type { EditorThemeName, FontFamily } from '../../../shared/types'

interface GeneralSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const GeneralSettingsModal: React.FC<GeneralSettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    editorTheme,
    fontFamily,
    fontSize,
    fontLigatures,
    autoSave,
    autoSaveDelay,
    minimap,
    wordWrap,
    reduceEffects,
    updateSetting,
  } = useSettingsStore()

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 text-xs select-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-[#111118] border border-[#2A2A3A] rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-[#16161E] border-b border-[#2A2A3A] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings size={18} className="text-[#8B5CF6]" />
              <h2 className="text-sm font-bold text-white">Editor Preferences</h2>
            </div>
            <button onClick={onClose} className="p-1 text-[#71717A] hover:text-white rounded">
              <X size={16} />
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Color Themes */}
            <div className="space-y-3">
              <span className="font-semibold text-white flex items-center gap-2 text-xs">
                <Palette size={14} className="text-[#8B5CF6]" />
                Color Theme
              </span>

              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    id: 'midnight',
                    label: 'Midnight (Default)',
                    bg: '#0A0A0F',
                    accent: '#8B5CF6',
                    text: 'Violet & Cyan Neon',
                  },
                  {
                    id: 'aurora',
                    label: 'Aurora',
                    bg: '#081414',
                    accent: '#22C55E',
                    text: 'Emerald Glow',
                  },
                  {
                    id: 'ember',
                    label: 'Ember',
                    bg: '#140A0A',
                    accent: '#F97316',
                    text: 'Warm Red-Orange',
                  },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => updateSetting('editorTheme', th.id as EditorThemeName)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between h-24 transition-all relative overflow-hidden ${
                      editorTheme === th.id
                        ? 'border-[#8B5CF6] ring-1 ring-[#8B5CF6]'
                        : 'border-[#2A2A3A] hover:border-[#3F3F5A]'
                    }`}
                    style={{ backgroundColor: th.bg }}
                  >
                    <div>
                      <div className="font-bold text-white text-xs">{th.label}</div>
                      <div className="text-[10px] text-[#71717A] mt-0.5">{th.text}</div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: th.accent }}
                      />
                      <span className="w-3 h-3 rounded-full bg-white/20" />
                    </div>

                    {editorTheme === th.id && (
                      <span className="absolute top-2 right-2 p-1 rounded-full bg-[#8B5CF6] text-white">
                        <Check size={10} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-3 pt-2 border-t border-[#2A2A3A]">
              <span className="font-semibold text-white flex items-center gap-2 text-xs">
                <Type size={14} className="text-[#06B6D4]" />
                Typography & Font
              </span>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] text-[#A1A1AA]">Font Family</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => updateSetting('fontFamily', e.target.value as FontFamily)}
                    className="w-full bg-[#16161E] border border-[#2A2A3A] rounded-xl px-3 py-1.5 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="JetBrains Mono">JetBrains Mono</option>
                    <option value="Fira Code">Fira Code</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-[#A1A1AA]">
                    <span>Font Size</span>
                    <span className="font-mono text-white">{fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={12}
                    max={22}
                    value={fontSize}
                    onChange={(e) => updateSetting('fontSize', Number(e.target.value))}
                    className="w-full accent-[#8B5CF6] cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[#A1A1AA]">
                  Enable Font Ligatures (&apos;=&gt;&apos; as &apos;⇒&apos;)
                </span>
                <input
                  type="checkbox"
                  checked={fontLigatures}
                  onChange={(e) => updateSetting('fontLigatures', e.target.checked)}
                  className="w-4 h-4 accent-[#8B5CF6] cursor-pointer"
                />
              </div>
            </div>

            {/* Editor Behavior */}
            <div className="space-y-3 pt-2 border-t border-[#2A2A3A]">
              <span className="font-semibold text-white flex items-center gap-2 text-xs">
                <Sliders size={14} className="text-[#F59E0B]" />
                Editor Behavior
              </span>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Autosave (Default ON)</div>
                    <div className="text-[11px] text-[#71717A]">
                      Automatically write modified files to disk after delay
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoSave}
                    onChange={(e) => updateSetting('autoSave', e.target.checked)}
                    className="w-4 h-4 accent-[#8B5CF6] cursor-pointer"
                  />
                </div>

                {autoSave && (
                  <div className="flex items-center justify-between pl-4 text-[11px]">
                    <span className="text-[#A1A1AA]">Autosave Debounce Delay</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={300}
                        max={5000}
                        step={100}
                        value={autoSaveDelay}
                        onChange={(e) => updateSetting('autoSaveDelay', Number(e.target.value))}
                        className="w-16 bg-[#16161E] border border-[#2A2A3A] rounded px-2 py-0.5 text-center text-white font-mono"
                      />
                      <span className="text-[#71717A]">ms</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Minimap</div>
                    <div className="text-[11px] text-[#71717A]">
                      Display code overview on right edge
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={minimap}
                    onChange={(e) => updateSetting('minimap', e.target.checked)}
                    className="w-4 h-4 accent-[#8B5CF6] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Word Wrap</div>
                    <div className="text-[11px] text-[#71717A]">Wrap long lines automatically</div>
                  </div>
                  <select
                    value={wordWrap}
                    onChange={(e) => updateSetting('wordWrap', e.target.value as any)}
                    className="bg-[#16161E] border border-[#2A2A3A] rounded-lg px-2.5 py-1 text-white outline-none cursor-pointer"
                  >
                    <option value="off">Off</option>
                    <option value="on">On</option>
                    <option value="wordWrapColumn">At Column</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Performance & Visual Effects */}
            <div className="space-y-3 pt-2 border-t border-[#2A2A3A]">
              <span className="font-semibold text-white flex items-center gap-2 text-xs">
                <Zap size={14} className="text-[#10B981]" />
                Performance & Visuals
              </span>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Reduce Visual Effects</div>
                  <div className="text-[11px] text-[#71717A]">
                    Disables 3D particles and animations for maximum battery & RAM efficiency
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={reduceEffects}
                  onChange={(e) => updateSetting('reduceEffects', e.target.checked)}
                  className="w-4 h-4 accent-[#8B5CF6] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
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
