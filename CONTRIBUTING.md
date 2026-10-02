# Contributing to KERNOVA

First off, thank you for considering contributing to **KERNOVA**! 🚀

KERNOVA is an open-source, 100% offline-first AI code editor designed to give developers, students, and engineers intelligent programming assistance without compromising source code privacy, demanding expensive subscriptions, or requiring cloud dependencies.

Whether you are fixing a bug, adding a new neon theme, enhancing local LLM integrations, improving documentation, or optimizing performance on resource-constrained devices, your contributions are warmly welcomed!

---

## 📑 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [How Can I Contribute?](#-how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features & Enhancements](#suggesting-features--enhancements)
  - [Submitting Pull Requests](#submitting-pull-requests)
  - [Improving Documentation](#improving-documentation)
- [Development Environment Setup](#-development-environment-setup)
  - [Prerequisites](#prerequisites)
  - [Cloning & Installing Dependencies](#cloning--installing-dependencies)
  - [Running the Development Server](#running-the-development-server)
  - [Compiling & Packaging Executables](#compiling--packaging-executables)
- [Architecture & Codebase Tour](#-architecture--codebase-tour)
  - [Repository Structure](#repository-structure)
  - [Key Systems & Design Patterns](#key-systems--design-patterns)
- [Contribution Guidelines & Best Practices](#-contribution-guidelines--best-practices)
  - [TypeScript & Code Quality](#typescript--code-quality)
  - [Offline-First & Memory Discipline](#offline-first--memory-discipline)
  - [Monaco Editor Integration](#monaco-editor-integration)
- [Git & Pull Request Workflow](#-git--pull-request-workflow)
  - [Branch Naming Conventions](#branch-naming-conventions)
  - [Commit Message Conventions](#commit-message-conventions)
  - [Pull Request Checklist](#pull-request-checklist)
- [Community & Recognition](#-community--recognition)
- [License](#-license)

---

## 📜 Code of Conduct

We are dedicated to providing a welcoming, inclusive, and harassment-free environment for everyone. Please treat fellow contributors and maintainers with respect, empathy, and constructive communication regardless of experience level, background, or identity.

---

## 💡 How Can I Contribute?

### Reporting Bugs

Before creating an issue, please verify that the bug hasn't already been reported in the [GitHub Issues](https://github.com/subhradeepkundu270305/kernova/issues) tracker.

When opening a bug report, please provide:
1. **Clear Summary**: A concise title and description of the unexpected behavior.
2. **Steps to Reproduce**: Sequential, detailed steps to reproduce the issue from a fresh launch.
3. **Expected vs. Actual Behavior**: What should have happened vs. what actually occurred.
4. **Environment Details**:
   - Operating System (e.g., Linux Zorin OS 17, Ubuntu 24.04, Windows 11)
   - KERNOVA Version (e.g., `v0.2.4`)
   - System Hardware (Total physical RAM, GPU model)
   - Ollama Version & Installed Models (if testing local AI features)
5. **Screenshots or Terminal Logs**: Relevant screenshots, error messages, or terminal console outputs.

### Suggesting Features & Enhancements

We welcome proposals for new capabilities! When suggesting enhancements:
- Clearly explain the **use case** and the **problem** this feature solves.
- Describe how it aligns with KERNOVA's **offline-first & privacy-centric** design philosophy.
- Outline any proposed UI/UX or architectural approaches.

### Submitting Pull Requests

Ready to submit code? We appreciate your effort!
- Keep pull requests focused: one logical feature or bugfix per PR.
- Ensure all builds pass cleanly without warnings (`pnpm build`).
- Ensure code conforms to Prettier formatting (`pnpm format`).

### Improving Documentation

Documentation is essential to great developer tools. You can help by:
- Clarifying setup or usage guides in `README.md`.
- Adding guides for configuring different local models in Ollama (e.g., DeepSeek-Coder, StarCoder2).
- Translating or refining walkthroughs and keyboard shortcut references.

---

## 🛠️ Development Environment Setup

### Prerequisites

Make sure the following tools are installed on your machine:

- **Node.js**: `v20.x` or later (LTS recommended)
- **pnpm**: `v9.x` or later (Recommended package manager)
  ```bash
  corepack enable && corepack prepare pnpm@latest --activate
  ```
- **Git**: For version control
- **Native C/C++ Build Tools** (required for `node-pty` compilation):
  - **Linux (Debian / Ubuntu / Zorin)**:
    ```bash
    sudo apt update && sudo apt install -y build-essential python3
    ```
  - **Windows**: Visual Studio C++ Build Tools or Windows SDK
- **Ollama** *(Optional, for testing local offline AI)*:
  - Download from [ollama.com](https://ollama.com/)
  - Pull a recommended coding model:
    ```bash
    ollama pull qwen2.5-coder:1.5b
    ```

### Cloning & Installing Dependencies

```bash
# 1. Clone the repository
git clone https://github.com/subhradeepkundu270305/kernova.git
cd kernova

# 2. Install dependencies via pnpm
pnpm install
```

### Running the Development Server

Launch the Electron main process and Vite renderer with live Hot Module Replacement (HMR):

```bash
pnpm dev
```

### Compiling & Packaging Executables

Verify production builds and package standalone distributions:

```bash
# Typecheck and compile renderer, preload, and main bundles
pnpm build

# Preview built application
pnpm preview

# Package Linux binaries (Universal AppImage & Debian .deb)
pnpm package:linux

# Package Windows binaries (portable zip / NSIS installer)
pnpm package:win
```

---

## 🏗️ Architecture & Codebase Tour

KERNOVA leverages **Electron 33**, **Vite**, **React 18**, **TypeScript**, and **Tailwind CSS**, orchestrated with a strict boundary between main process operations and UI state.

### Repository Structure

```text
kernova/
├── assets/                  # Application icons, logos, and promotional graphics
├── dist/                    # Compiled installers, AppImages, and packaged binaries
├── out/                     # Bundled main, preload, and renderer build output
├── src/
│   ├── main/                # Electron Main Process (Node.js runtime)
│   │   ├── index.ts         # Window lifecycle, menubar & native integration
│   │   ├── ipc/             # Strongly typed IPC event handlers
│   │   │   ├── dialog.ts    # File picker & directory dialogs
│   │   │   ├── filesystem.ts# Low-level fs CRUD operations & atomic file writes
│   │   │   ├── search.ts    # Ripgrep / regex project-wide search
│   │   │   ├── secrets.ts   # SafeStorage OS keychain encryption for BYOK keys
│   │   │   ├── system.ts    # OS memory detection & DNS socket health check
│   │   │   └── terminal.ts  # node-pty pseudo-terminal session manager
│   │   └── services/        # Chokidar filesystem watchers & state persistence
│   ├── preload/             # Electron Preload Bridge (contextBridge)
│   │   ├── index.ts         # Secure type-safe window.kernova API surface
│   │   └── index.d.ts       # Global TypeScript declaration augmentations
│   ├── renderer/            # React 18 UI (Vite-bundled)
│   │   ├── App.tsx          # Master layout container & shortcut dispatcher
│   │   ├── main.tsx         # Root mount, offline Monaco web-workers & styles
│   │   ├── components/      # Modular UI components
│   │   │   ├── ai/          # AI Chat sidebar, Selection toolbar, Diff modal
│   │   │   ├── common/      # FileIcon, Modal, Button primitives
│   │   │   ├── editor/      # MonacoEditor, TabBar, Breadcrumbs, Inline completion
│   │   │   ├── explorer/    # File tree, inline file/folder naming, context menus
│   │   │   ├── search/      # Project-wide search & replace panel
│   │   │   ├── settings/    # General settings, theme switcher, font manager
│   │   │   ├── statusbar/   # Status bar, cursor tracking, branch, network monitor
│   │   │   ├── terminal/    # xterm.js integration, multi-terminal tabs
│   │   │   └── welcome/     # Three.js 3D ambient particle background & quickstart
│   │   ├── services/ai/     # Multi-provider AI abstraction layer
│   │   │   ├── ollama.ts    # Direct loopback REST client (127.0.0.1:11434)
│   │   │   ├── context.ts   # Active file context & strict language directive builder
│   │   │   ├── router.ts    # Smart routing (Cloud when online, Ollama fallback)
│   │   │   └── gemini.ts    # Google Gemini 2.0 Flash BYOK integration
│   │   ├── stores/          # Zustand reactive state stores
│   │   │   ├── aiStore.ts        # AI conversation history, installed models
│   │   │   ├── editorStore.ts    # Open tabs, active file buffer, autosave status
│   │   │   ├── fileTreeStore.ts  # Workspace root, expanded directories
│   │   │   ├── settingsStore.ts  # User preferences, editor font, active theme
│   │   │   ├── terminalStore.ts  # PTY session IDs, active terminal tabs
│   │   │   └── uiStore.ts        # Sidebar visibility, modals, diff view states
│   │   ├── styles/          # Tailwind directives, Monaco CSS overrides, glassmorphism
│   │   └── themes/          # Midnight, Aurora, Ember, Cyberpunk, Solaris, Abyss
│   └── shared/              # Shared TypeScript contracts and constants
├── electron.vite.config.ts  # Multi-target Vite compilation configuration
├── package.json             # Build scripts, metadata, and dependencies
└── tsconfig.json            # Base TypeScript configuration
```

### Key Systems & Design Patterns

1. **Strict Context Isolation**: The renderer process NEVER invokes Node.js APIs directly. All filesystem access, process management, and OS calls occur through typed IPC handlers exposed via `window.kernova`.
2. **Offline-First AI Architecture**: The AI subsystem treats local Ollama on loopback (`http://127.0.0.1:11434`) as the primary brain. Context builders strictly inject the active file's language so models don't generate mismatched languages.
3. **Isolated Editor Lifecycle**: Editor tabs utilize unique keys (`key={activeTabId}`) to prevent Monaco model bleed and ensure instant autosave flushing on tab transitions.

---

## 📐 Contribution Guidelines & Best Practices

### TypeScript & Code Quality

- **Strict Typing**: Avoid `any`. Use proper interfaces, discriminated unions, and types defined in `src/shared/types.ts` or local modules.
- **Prettier & Linter**: Ensure all code passes formatting before committing:
  ```bash
  pnpm lint       # Check formatting
  pnpm format     # Automatically fix code formatting
  ```
- **Component Design**: Keep UI components modular, accessible, and reactive. Prefer Zustand store hooks over deeply nested prop drilling.

### Offline-First & Memory Discipline

- **Target 8 GB RAM Compatibility**: KERNOVA is engineered to run fluidly on low-to-mid tier machines. Keep base idle RAM under 400 MB.
- **Zero Involuntary Cloud Traffic**: Never introduce mandatory telemetry, external font CDNs, or remote API calls. All fonts, icons, Monaco grammar workers, and assets must be pre-bundled locally.

### Monaco Editor Integration

- When modifying editor behaviors, always ensure listeners and models are properly cleaned up (`dispose()`) to prevent memory leaks.
- Always preserve editor view states (`saveViewState()` / `restoreViewState()`) when synchronizing external file changes.

---

## 🌿 Git & Pull Request Workflow

### Branch Naming Conventions

Use clear, descriptive branch names prefixed with the purpose:
- `feat/inline-file-rename` (New features)
- `fix/tab-desync-issue` (Bug fixes)
- `docs/add-contributing-guide` (Documentation changes)
- `perf/optimize-three-particles` (Performance improvements)
- `style/cyberpunk-theme-refine` (Cosmetic or theme tweaks)

### Commit Message Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>(<scope>): <short summary>

[optional body explaining context or rationale]
```

**Common Types**:
- `feat`: A new user-facing feature or capability
- `fix`: A bug fix
- `docs`: Documentation updates or additions
- `perf`: Code changes that improve performance or reduce memory usage
- `refactor`: Code reorganization with no behavioral change
- `style`: Formatting, whitespace, or CSS polish
- `test`: Adding or updating test suites
- `chore`: Maintenance tasks, dependency bumps, or build script tweaks

**Example**:
```text
feat(ai): enforce active file language directive in context builder
fix(editor): bundle core monaco styles to resolve blank suggestion widget
docs: add comprehensive CONTRIBUTING.md guide
```

### Pull Request Checklist

Before opening your pull request, please verify:
- [ ] My code builds cleanly without errors (`pnpm build`).
- [ ] Code is properly formatted with Prettier (`pnpm format`).
- [ ] No regression or memory leaks introduced in editor or terminal panels.
- [ ] Relevant documentation (like `README.md` or comments) has been updated.
- [ ] The PR title follows Conventional Commits format.
- [ ] The PR description clearly explains what changed and why.

---

## 🤝 Community & Recognition

Contributors are the lifeblood of open-source software. Every merged pull request, bug report, or documentation improvement helps build a better, truly private code editor for developers worldwide.

If you enjoy KERNOVA, please consider giving the repository a ⭐ on GitHub and sharing it with your fellow developers!

---

## 📄 License

By contributing to KERNOVA, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
