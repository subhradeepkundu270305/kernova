import type { editor } from 'monaco-editor'

export const themeName = 'cyberpunk'

export const themeData: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '64748B', fontStyle: 'italic' },
    { token: 'string', foreground: 'FACC15' }, // Neon Yellow
    { token: 'keyword', foreground: 'EC4899', fontStyle: 'bold' }, // Hot Pink
    { token: 'number', foreground: 'F97316' }, // Neon Orange
    { token: 'type', foreground: 'A855F7' }, // Electric Purple
    { token: 'class.name', foreground: 'A855F7', fontStyle: 'bold' },
    { token: 'function', foreground: '06B6D4' }, // Laser Cyan
    { token: 'variable', foreground: 'F1F5F9' },
    { token: 'operator', foreground: '22D3EE' },
    { token: 'constant', foreground: '22C55E' }, // Toxic Lime
    { token: 'tag', foreground: 'EC4899' },
    { token: 'attribute.name', foreground: 'FACC15' },
    { token: 'punctuation', foreground: '94A3B8' },
    { token: 'regexp', foreground: 'F43F5E' },
  ],
  colors: {
    'editor.background': '#0B0819',
    'editor.foreground': '#F1F5F9',
    'editor.lineHighlightBackground': '#16102E',
    'editor.selectionBackground': '#EC489940',
    'editorCursor.foreground': '#EC4899',
    'editorLineNumber.foreground': '#475569',
    'editorLineNumber.activeForeground': '#EC4899',
    'editorIndentGuide.background': '#1E1638',
    'editorIndentGuide.activeBackground': '#3B2968',
    'editorBracketMatch.background': '#EC489930',
    'editorBracketMatch.border': '#EC4899',
    'editor.findMatchBackground': '#06B6D450',
    'editor.findMatchHighlightBackground': '#FACC1530',
    'editorWidget.background': '#120D24',
    'editorWidget.border': '#331F58',
    'editorSuggestWidget.background': '#120D24',
    'editorSuggestWidget.border': '#331F58',
    'editorSuggestWidget.foreground': '#FDF2F8',
    'editorSuggestWidget.selectedBackground': '#EC489935',
    'editorSuggestWidget.selectedForeground': '#FFFFFF',
    'editorSuggestWidget.highlightForeground': '#EC4899',
    'editorSuggestWidget.focusHighlightForeground': '#06B6D4',
    'scrollbarSlider.background': '#331F5880',
    'scrollbarSlider.hoverBackground': '#4D2F82',
    'scrollbarSlider.activeBackground': '#EC489980',
    'editorOverviewRuler.border': '#00000000',
    'minimap.background': '#0B0819',
  },
}
