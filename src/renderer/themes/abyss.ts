import type { editor } from 'monaco-editor'

export const themeName = 'abyss'

export const themeData: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '475569', fontStyle: 'italic' },
    { token: 'string', foreground: '34D399' }, // Mint Seafoam
    { token: 'keyword', foreground: '38BDF8', fontStyle: 'bold' }, // Ice Blue
    { token: 'number', foreground: 'C084FC' }, // Radiant Orchid
    { token: 'type', foreground: '00F2FE' }, // Electric Aqua
    { token: 'class.name', foreground: '00F2FE', fontStyle: 'bold' },
    { token: 'function', foreground: '60A5FA' }, // Deep Azure
    { token: 'variable', foreground: 'F0F9FF' },
    { token: 'operator', foreground: '818CF8' }, // Indigo
    { token: 'constant', foreground: 'A78BFA' },
    { token: 'tag', foreground: '38BDF8' },
    { token: 'attribute.name', foreground: '34D399' },
    { token: 'punctuation', foreground: '94A3B8' },
    { token: 'regexp', foreground: 'F472B6' },
  ],
  colors: {
    'editor.background': '#040914',
    'editor.foreground': '#F0F9FF',
    'editor.lineHighlightBackground': '#0B172E',
    'editor.selectionBackground': '#00F2FE30',
    'editorCursor.foreground': '#00F2FE',
    'editorLineNumber.foreground': '#334155',
    'editorLineNumber.activeForeground': '#00F2FE',
    'editorIndentGuide.background': '#0E213D',
    'editorIndentGuide.activeBackground': '#183866',
    'editorBracketMatch.background': '#00F2FE25',
    'editorBracketMatch.border': '#00F2FE',
    'editor.findMatchBackground': '#3B82F650',
    'editor.findMatchHighlightBackground': '#00F2FE30',
    'editorWidget.background': '#071224',
    'editorWidget.border': '#132C52',
    'editorSuggestWidget.background': '#071224',
    'editorSuggestWidget.border': '#132C52',
    'editorSuggestWidget.selectedBackground': '#00F2FE25',
    'scrollbarSlider.background': '#132C5280',
    'scrollbarSlider.hoverBackground': '#1E437C',
    'scrollbarSlider.activeBackground': '#00F2FE80',
    'editorOverviewRuler.border': '#00000000',
    'minimap.background': '#040914',
  },
}
