import React, { useMemo } from 'react'
import {
  Search,
  CaseSensitive,
  WholeWord,
  Regex,
  ChevronRight,
  ChevronDown,
  FileText,
} from 'lucide-react'
import { useSearchStore } from '../../stores/searchStore'
import { useFileTreeStore } from '../../stores/fileTreeStore'
import { useEditorStore } from '../../stores/editorStore'
import type { SearchMatch } from '../../../shared/types'

export const SearchPanel: React.FC = () => {
  const {
    query,
    matchCase,
    isRegex,
    wholeWord,
    isSearching,
    results,
    setQuery,
    setMatchCase,
    setIsRegex,
    setWholeWord,
    performSearch,
    clearSearch,
  } = useSearchStore()

  const { rootPath } = useFileTreeStore()
  const { openFile, updateCursorPosition } = useEditorStore()

  // Group search results by file
  const groupedResults = useMemo(() => {
    const map = new Map<string, { relativePath: string; matches: SearchMatch[] }>()
    for (const match of results) {
      if (!map.has(match.filePath)) {
        map.set(match.filePath, { relativePath: match.relativeFilePath, matches: [] })
      }
      map.get(match.filePath)!.matches.push(match)
    }
    return Array.from(map.entries())
  }, [results])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && rootPath) {
      performSearch(rootPath)
    }
  }

  const handleMatchClick = async (match: SearchMatch) => {
    await openFile(match.filePath)
    updateCursorPosition(match.filePath, {
      lineNumber: match.lineNumber,
      column: match.matchIndex + 1,
    })
  }

  return (
    <div className="flex flex-col h-full bg-[#111118] text-[#E4E4E7] text-xs select-none">
      {/* Search Header */}
      <div className="p-3 border-b border-[#2A2A3A] space-y-2">
        <span className="font-semibold text-xs tracking-wider text-[#A1A1AA] uppercase">
          Search
        </span>

        <div className="relative flex items-center bg-[#16161E] border border-[#2A2A3A] rounded px-2 focus-within:border-[#8B5CF6]">
          <Search size={14} className="text-[#71717A] mr-2 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search in project..."
            className="w-full bg-transparent py-1.5 text-xs text-white placeholder-[#71717A] outline-none"
          />

          {/* Search modifier toggles */}
          <div className="flex items-center gap-1 shrink-0 ml-1">
            <button
              onClick={() => {
                setMatchCase(!matchCase)
                if (rootPath) performSearch(rootPath)
              }}
              className={`p-1 rounded ${matchCase ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}
              title="Match Case (Alt+C)"
            >
              <CaseSensitive size={13} />
            </button>
            <button
              onClick={() => {
                setWholeWord(!wholeWord)
                if (rootPath) performSearch(rootPath)
              }}
              className={`p-1 rounded ${wholeWord ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}
              title="Match Whole Word (Alt+W)"
            >
              <WholeWord size={13} />
            </button>
            <button
              onClick={() => {
                setIsRegex(!isRegex)
                if (rootPath) performSearch(rootPath)
              }}
              className={`p-1 rounded ${isRegex ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}
              title="Use Regular Expression (Alt+R)"
            >
              <Regex size={13} />
            </button>
          </div>
        </div>

        {/* Results count */}
        {query && (
          <div className="flex items-center justify-between text-[11px] text-[#71717A]">
            <span>
              {isSearching
                ? 'Searching...'
                : `${results.length} result${results.length === 1 ? '' : 's'} found`}
            </span>
            {results.length > 0 && (
              <button onClick={clearSearch} className="hover:text-white">
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results Tree List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {groupedResults.map(([filePath, group]) => (
          <div key={filePath} className="space-y-1">
            <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-[#E4E4E7] font-medium bg-[#16161E]/50 rounded">
              <FileText size={13} className="text-[#8B5CF6]" />
              <span className="truncate flex-1" title={filePath}>
                {group.relativePath}
              </span>
              <span className="text-[10px] text-[#71717A] bg-[#1E1E2A] px-1.5 py-0.5 rounded-full">
                {group.matches.length}
              </span>
            </div>

            <div className="pl-3 space-y-0.5">
              {group.matches.map((m, idx) => (
                <div
                  key={`${m.lineNumber}-${idx}`}
                  onClick={() => handleMatchClick(m)}
                  className="flex items-baseline gap-2 px-2 py-1 hover:bg-[#1E1E2A] rounded cursor-pointer transition-colors text-[11px]"
                >
                  <span className="text-[#71717A] font-mono shrink-0 w-6 text-right">
                    {m.lineNumber}
                  </span>
                  <span className="truncate text-[#A1A1AA] font-mono hover:text-white">
                    {m.lineContent}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
