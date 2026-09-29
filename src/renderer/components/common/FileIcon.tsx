import React from 'react'
import {
  FileText,
  Folder,
  FolderOpen,
  Image,
  Archive,
  Database,
  Terminal,
  Settings,
  Lock,
  GitBranch,
  FileCode,
  File,
} from 'lucide-react'

interface FileIconProps {
  fileName?: string
  isDirectory?: boolean
  isOpen?: boolean
  size?: number
  className?: string
}

export const FileIcon: React.FC<FileIconProps> = ({
  fileName = '',
  isDirectory = false,
  isOpen = false,
  size = 14,
  className = '',
}) => {
  if (isDirectory) {
    return isOpen ? (
      <FolderOpen size={size} className={`text-[#8B5CF6] shrink-0 ${className}`} />
    ) : (
      <Folder size={size} className={`text-[#8B5CF6] shrink-0 ${className}`} />
    )
  }

  const name = fileName.toLowerCase().trim()
  const ext = name.includes('.') ? name.slice(name.lastIndexOf('.')) : ''

  // Exact file name matches
  if (name === '.gitignore' || name === '.gitattributes' || name === '.gitmodules') {
    return <GitBranch size={size} className={`text-[#F05032] shrink-0 ${className}`} />
  }

  if (name === 'package.json') {
    return (
      <span
        style={{ width: size, height: size, fontSize: size * 0.7 }}
        className={`inline-flex items-center justify-center font-bold text-[#CB3837] shrink-0 ${className}`}
        title="npm package"
      >
        <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor">
          <path d="M0 0v16h16V0H0zm13 13h-2V5h-2v8H3V3h10v10z" />
        </svg>
      </span>
    )
  }

  if (name.includes('lock') || name === 'cargo.lock') {
    return <Lock size={size} className={`text-[#F59E0B] shrink-0 ${className}`} />
  }

  if (name.startsWith('.env')) {
    return <Settings size={size} className={`text-[#EAB308] shrink-0 ${className}`} />
  }

  if (name === 'dockerfile' || name.startsWith('dockerfile.')) {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
        className={`text-[#2496ED] shrink-0 ${className}`}
      >
        <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.186.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.186.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.186.186.186m5.893 2.715h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.186.186 0 00-.186.185v1.888c0 .102.084.185.186.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186H8.1a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186H5.136a.186.186 0 00-.186.185v1.888c0 .102.084.185.186.185m-2.928 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186H2.208a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185M23.76 9.89a.88.88 0 00-.518-.328c-.46-.118-.94.02-1.37.288-.344.214-.64.512-.868.868-.21.328-.337.7-.37 1.085a4.27 4.27 0 01-1.393-.232l-.248-.094-.176.19a8.625 8.625 0 01-6.173 2.502c-3.14 0-5.967-1.468-7.795-3.834L4.62 10.05l-.328.214A5.5 5.5 0 011.37 11.2a.855.855 0 00-.638.358.82.82 0 00-.158.694c.31 1.488 1.156 2.793 2.378 3.673a11.144 11.144 0 006.772 2.29c6.643 0 12.185-4.485 13.79-10.74a.834.834 0 00-.246-.732" />
      </svg>
    )
  }

  // Python (.py, .pyw, .ipynb)
  if (ext === '.py' || ext === '.pyw' || ext === '.ipynb') {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        className={`shrink-0 ${className}`}
      >
        <path
          d="M11.922 2C6.914 2 7.228 4.17 7.228 4.17l.006 2.25h4.756v.678H5.22S2 6.726 2 11.758c0 5.032 2.806 4.862 2.806 4.862h1.674v-2.352s-.09-2.805 2.748-2.805h4.726s2.686.044 2.686-2.633V4.832S16.942 2 11.922 2zM9.384 3.738a.94.94 0 110 1.88.94.94 0 010-1.88z"
          fill="#3776AB"
        />
        <path
          d="M12.078 22c5.008 0 4.694-2.17 4.694-2.17l-.006-2.25H12.01v-.678h6.77s3.22.372 3.22-4.66c0-5.032-2.806-4.862-2.806-4.862h-1.674v2.352s.09 2.805-2.748 2.805H10.05s-2.686-.044-2.686 2.633v4.002S7.058 22 12.078 22zm2.538-1.738a.94.94 0 110-1.88.94.94 0 010 1.88z"
          fill="#FFD43B"
        />
      </svg>
    )
  }

  // C++ (.cpp, .cc, .cxx, .hpp, .hxx)
  if (['.cpp', '.cc', '.cxx', '.hpp', '.hxx'].includes(ext)) {
    return (
      <span
        style={{ width: size, height: size }}
        className={`inline-flex items-center justify-center font-bold text-[#00599C] shrink-0 select-none ${className}`}
        title="C++"
      >
        <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
          <path d="M11.5 3L2 8.5v11L11.5 25l9.5-5.5v-11L11.5 3zm0 2.2l7.5 4.3v8.6l-7.5 4.3-7.5-4.3V9.5l7.5-4.3z" fill="#00599C" />
          <text x="3" y="16" fontSize="9.5" fontWeight="900" fill="#00599C" fontFamily="sans-serif">C++</text>
        </svg>
      </span>
    )
  }

  // C (.c, .h)
  if (['.c', '.h'].includes(ext)) {
    return (
      <span
        style={{ width: size, height: size }}
        className={`inline-flex items-center justify-center font-bold text-[#659AD2] shrink-0 select-none ${className}`}
        title="C"
      >
        <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
          <circle cx="12" cy="12" r="10" fill="#283593" />
          <text x="7.5" y="16" fontSize="12" fontWeight="900" fill="#FFFFFF" fontFamily="sans-serif">C</text>
        </svg>
      </span>
    )
  }

  // TypeScript & TSX
  if (ext === '.ts' || ext === '.mts' || ext === '.cts') {
    return (
      <span
        style={{ width: size, height: size }}
        className={`inline-flex items-center justify-center rounded-[2px] bg-[#3178C6] text-white font-extrabold text-[8px] shrink-0 select-none leading-none ${className}`}
        title="TypeScript"
      >
        TS
      </span>
    )
  }

  if (ext === '.tsx') {
    return (
      <span
        style={{ width: size, height: size }}
        className={`inline-flex items-center justify-center rounded-[2px] bg-[#3178C6] text-[#61DAFB] font-extrabold text-[7.5px] shrink-0 select-none leading-none border border-[#61DAFB]/40 ${className}`}
        title="React TypeScript"
      >
        TSX
      </span>
    )
  }

  // JavaScript & JSX
  if (ext === '.js' || ext === '.mjs' || ext === '.cjs') {
    return (
      <span
        style={{ width: size, height: size }}
        className={`inline-flex items-center justify-center rounded-[2px] bg-[#F7DF1E] text-black font-extrabold text-[8px] shrink-0 select-none leading-none ${className}`}
        title="JavaScript"
      >
        JS
      </span>
    )
  }

  if (ext === '.jsx') {
    return (
      <span
        style={{ width: size, height: size }}
        className={`inline-flex items-center justify-center rounded-[2px] bg-[#20232A] text-[#61DAFB] font-extrabold text-[7.5px] shrink-0 select-none leading-none border border-[#61DAFB]/40 ${className}`}
        title="React JSX"
      >
        JSX
      </span>
    )
  }

  // HTML
  if (['.html', '.htm', '.xhtml'].includes(ext)) {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
        className={`text-[#E34F26] shrink-0 ${className}`}
      >
        <path d="M3 2l1.8 17.8L12 22l7.2-2.2L21 2H3zm14.8 5.7h-8l.2 2.3h7.6l-.6 6.3-4.8 1.4-4.8-1.4-.3-3.6h2.3l.2 1.8 2.6.7 2.6-.7.3-3H6.8L6.2 5.4h11.9l-.3 2.3z" />
      </svg>
    )
  }

  // CSS & SCSS
  if (ext === '.css') {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
        className={`text-[#1572B6] shrink-0 ${className}`}
      >
        <path d="M3 2l1.8 17.8L12 22l7.2-2.2L21 2H3zm14.8 5.7h-8l.2 2.3h7.6l-.6 6.3-4.8 1.4-4.8-1.4-.3-3.6h2.3l.2 1.8 2.6.7 2.6-.7.3-3H6.8L6.2 5.4h11.9l-.3 2.3z" />
      </svg>
    )
  }

  if (['.scss', '.sass', '.less'].includes(ext)) {
    return (
      <span
        style={{ width: size, height: size }}
        className={`inline-flex items-center justify-center rounded-[2px] bg-[#CD6799] text-white font-extrabold text-[8px] shrink-0 select-none leading-none ${className}`}
        title="Sass/SCSS"
      >
        S
      </span>
    )
  }

  // JSON
  if (ext === '.json') {
    return (
      <span
        style={{ width: size, height: size }}
        className={`inline-flex items-center justify-center font-bold text-[#F59E0B] text-[10px] shrink-0 select-none leading-none ${className}`}
        title="JSON"
      >
        &#123;&#125;
      </span>
    )
  }

  // Markdown
  if (['.md', '.markdown', '.mdown'].includes(ext)) {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
        className={`text-[#38BDF8] shrink-0 ${className}`}
      >
        <path d="M2.5 4v16h19V4h-19zm2 3h2.5l2 2.5 2-2.5h2.5v9h-2.5v-5l-2 2.5-2-2.5v5H4.5V7zm11 0h3v4.5h2L18 15l-2.5-3.5h2V7z" />
      </svg>
    )
  }

  // Rust (.rs)
  if (ext === '.rs') {
    return (
      <span
        style={{ width: size, height: size }}
        className={`inline-flex items-center justify-center rounded-[2px] bg-[#DEA584] text-black font-black text-[8px] shrink-0 select-none leading-none ${className}`}
        title="Rust"
      >
        RS
      </span>
    )
  }

  // Go (.go)
  if (ext === '.go') {
    return (
      <span
        style={{ width: size, height: size }}
        className={`inline-flex items-center justify-center rounded-[2px] bg-[#00ADD8] text-white font-black text-[8px] shrink-0 select-none leading-none ${className}`}
        title="Go"
      >
        GO
      </span>
    )
  }

  // Java (.java, .class, .jar)
  if (['.java', '.class', '.jar'].includes(ext)) {
    return (
      <span
        style={{ width: size, height: size }}
        className={`inline-flex items-center justify-center rounded-[2px] bg-[#EA2D2E] text-white font-black text-[9px] shrink-0 select-none leading-none ${className}`}
        title="Java"
      >
        ☕
      </span>
    )
  }

  // Shell scripts (.sh, .bash, .zsh)
  if (['.sh', '.bash', '.zsh'].includes(ext)) {
    return <Terminal size={size} className={`text-[#22C55E] shrink-0 ${className}`} />
  }

  // YAML (.yaml, .yml)
  if (['.yaml', '.yml'].includes(ext)) {
    return (
      <span
        style={{ width: size, height: size }}
        className={`inline-flex items-center justify-center rounded-[2px] bg-[#CB171E] text-white font-black text-[8px] shrink-0 select-none leading-none ${className}`}
        title="YAML"
      >
        Y
      </span>
    )
  }

  // SQL & DB
  if (['.sql', '.sqlite', '.db'].includes(ext)) {
    return <Database size={size} className={`text-[#0284C7] shrink-0 ${className}`} />
  }

  // Images
  if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.bmp'].includes(ext)) {
    return <Image size={size} className={`text-[#A855F7] shrink-0 ${className}`} />
  }

  // Archives
  if (['.zip', '.tar', '.gz', '.7z', '.rar', '.bz2'].includes(ext)) {
    return <Archive size={size} className={`text-[#EAB308] shrink-0 ${className}`} />
  }

  // Config files (.toml, .ini, .xml, .config)
  if (['.toml', '.ini', '.xml', '.config', '.conf'].includes(ext)) {
    return <Settings size={size} className={`text-[#94A3B8] shrink-0 ${className}`} />
  }

  // Text
  if (ext === '.txt' || ext === '.log') {
    return <FileText size={size} className={`text-[#A1A1AA] shrink-0 ${className}`} />
  }

  // Generic code file
  if (['.php', '.rb', '.lua', '.swift', '.kt', '.dart'].includes(ext)) {
    return <FileCode size={size} className={`text-[#8B5CF6] shrink-0 ${className}`} />
  }

  // Default File
  return <File size={size} className={`text-[#A1A1AA] shrink-0 ${className}`} />
}
