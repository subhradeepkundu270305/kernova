import type { editor } from 'monaco-editor'

export const themeName = 'solaris'

export const themeData: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '78716C', fontStyle: 'italic' },
    { token: 'string', foreground: 'F43F5E' }, // Sunset Coral
    { token: 'keyword', foreground: 'EAB308', fontStyle: 'bold' }, // Solar Gold
    { token: 'number', foreground: '10B981' }, // Emerald
    { token: 'type', foreground: '38BDF8' }, // Sky Blue
    { token: 'class.name', foreground: '38BDF8', fontStyle: 'bold' },
    { token: 'function', foreground: '8B5CF6' }, // Nebula Violet
    { token: 'variable', foreground: 'FAFAF9' },
    { token: 'operator', foreground: 'FB923C' }, // Warm Orange
    { token: 'constant', foreground: '10B981' },
    { token: 'tag', foreground: 'EAB308' },
    { token: 'attribute.name', foreground: 'F43F5E' },
    { token: 'punctuation', foreground: 'A8A29E' },
    { token: 'regexp', foreground: 'F59E0B' },
  ],
  colors: {
    'editor.background': '#0C0A07',
    'editor.foreground': '#FAFAF9',
    'editor.lineHighlightBackground': '#1A150D',
    'editor.selectionBackground': '#EAB30835',
    'editorCursor.foreground': '#EAB308',
    'editorLineNumber.foreground': '#57534E',
    'editorLineNumber.activeForeground': '#EAB308',
    'editorIndentGuide.background': '#211B12',
    'editorIndentGuide.activeBackground': '#3D3222',
    'editorBracketMatch.background': '#EAB30830',
    'editorBracketMatch.border': '#EAB308',
    'editor.findMatchBackground': '#F43F5E45',
    'editor.findMatchHighlightBackground': '#EAB30825',
    'editorWidget.background': '#14100B',
    'editorWidget.border': '#332918',
    'editorSuggestWidget.background': '#14100B',
    'editorSuggestWidget.border': '#332918',
    'editorSuggestWidget.foreground': '#FEFCE8',
    'editorSuggestWidget.selectedBackground': '#EAB30830',
    'editorSuggestWidget.selectedForeground': '#FFFFFF',
    'editorSuggestWidget.highlightForeground': '#EAB308',
    'editorSuggestWidget.focusHighlightForeground': '#F43F5E',
    'scrollbarSlider.background': '#33291880',
    'scrollbarSlider.hoverBackground': '#4D3E24',
    'scrollbarSlider.activeBackground': '#EAB30880',
    'editorOverviewRuler.border': '#00000000',
    'minimap.background': '#0C0A07',
  },
}
